import {
    GqlFunctionTypeDefinition,
    GqlFunctionType, GqlEnumTypeDefinition, GqlAliasDefinition,
    GqlObjectTypeDefinition,
    GqlObjectTypeProperty,
    KnownGqlTypes,
    GqlFunctionParameterDefinition
} from './definitions';

import {TextfileContent} from './utils/textfile-content';
import {TransformExtensionClass} from './tranform-extensions/definitions';


enum DescriberList {
    INPUTS = 'input',
    QUERYS = 'Query',
    ENUMS = 'enum',
    MUTATIONS = 'Mutation',
    TYPES = 'type',
    SCALARS = 'scalar',
    SCHEMA = 'schema'
}

let anyDescriber = '';
for (const key in DescriberList) {
    anyDescriber += `|(${DescriberList[key]})`;
}

anyDescriber = anyDescriber.substr(1, anyDescriber.length);

enum RegexHelper {
    UnknownContent = '((.|\n)*?)' as any,
    AnyDescriber = anyDescriber as any,
}


export class GqlSchemaTransformer {

    schemaContent: TextfileContent;


    constructor(private gqlSchemaPath: string, private knownGqlTypes: KnownGqlTypes, private isStringEnum: boolean = true) {
        this.schemaContent = new TextfileContent(gqlSchemaPath);
    }

    private anysWritten = 0;
    private typesWritten = 0;
    private describerValueSeperator = '=';
    private debug = false;

    private gqlTypes: GqlObjectTypeDefinition[] = [];
    private gqlQuerys: GqlFunctionTypeDefinition[] = [];
    private gqlMutations: GqlFunctionTypeDefinition[] = [];
    private gqlInputs: GqlObjectTypeDefinition[] = [];
    private gqlEnums: GqlEnumTypeDefinition[] = [];
    private gqlScalars: string[] = [];
    private gqlAliasDefinitions: GqlAliasDefinition[] = [];
    private availableGqlTypeNames: string[] = [];

    private typeStringList: string[] = [];
    private queryStringList: string[] = [];
    private mutationStringList: string[] = [];

    private commentStringList: string[] = [];

    private customGqlTypes: string[] = [];
    private customGqlEnums: string[] = [];
    private fileParsed: boolean = false;
    public succeeded = (): boolean => this.fileParsed;

    public parse() {
        try {
            this.removeComments();
            this.cleanSchema();
            this.extractSchema();
            // fs.writeFileSync(generatorConfig.gqlFormatedSchemmaLocation, this.gqlSchema, 'utf8');

            this.extractScalarList();
            this.extractAllKindOfTypeBlocksAndParse();
            this.parseInputList();
            this.parseEnumList();
            this.guessTypes();
            this.fileParsed = true;
        } catch (e) {
            console.log(`PARSING FAILED!!`);
            console.log(e);
            this.fileParsed = false;
        }

    }

    public transformUsingExtension(extension: TransformExtensionClass & any, exportPath?: string): void {

        const extensionInstance: typeof extension = new extension();

        extensionInstance.export({
            gqlEnums: this.gqlEnums,
            gqlInputs: this.gqlInputs,
            gqlMutations: this.gqlMutations,
            gqlQuerys: this.gqlQuerys,
            gqlTypes: this.gqlTypes,
            gqlScalars: this.gqlScalars,
            gqlAliasDefinitions: this.gqlAliasDefinitions
        }, exportPath ? exportPath : '');

    }


    private guessTypes() {
        // guessing typescript types on gql type properties..
        this.gqlTypes.map(t => {
                t.propertys.map((prop, index) => {
                    t.propertys[index].tsTypeGuess = this.guessTypescriptType(t.propertys[index].type);
                });
            }
        );
        // guessing typescript types on gql query params..
        this.gqlQuerys.map(q => {
                q.returnTypeTsGuess = this.guessTypescriptType(this.removeSpecialChars(q.returnType));
                q.params.map((prop, index) => {
                    q.params[index].tsTypeGuess = this.guessTypescriptType(q.params[index].type);
                });
            }
        );
        // guessing typescript types on gql mutation params..
        this.gqlMutations.map(m => {
                m.returnTypeTsGuess = this.guessTypescriptType(this.removeSpecialChars(m.returnType));
                m.params.map((prop, index) => {
                    m.params[index].tsTypeGuess = this.guessTypescriptType(m.params[index].type);
                });
            }
        );
        // guessing typescript types on gql input propertys..
        this.gqlInputs.map(i => {
                i.propertys.map((prop, index) => {
                    i.propertys[index].tsTypeGuess = this.guessTypescriptType(i.propertys[index].type);
                });
            }
        );
    }

    private removeSpaces = (str: string): string => str.replace(/ /g, '');
    private removeNewLines = (str: string): string => str.replace(/\n/g, '');
    private removeSpecialChars = (str: string): string => str.replace(/[^a-z\d\s]+/gi, '');

    private replaceInSchema(searchValue: string | RegExp, replaceValue: string): void {
        this.schemaContent.replace(searchValue, replaceValue);
        // this.gqlSchema = this.gqlSchema.replace(searchValue, replaceValue);
    }

    private removeFromSchema(toRemove: string | RegExp): void {
        this.replaceInSchema(toRemove, '');
    }

    private customQueryDescriber = '';
    private queryDescriber = (): string => this.customQueryDescriber !== '' ? this.customQueryDescriber : DescriberList.QUERYS;

    private customMutationDescriber = '';
    private mutationDescriber = (): string => this.customMutationDescriber !== '' ? this.customMutationDescriber : DescriberList.MUTATIONS;

    private matchInSchema(regexp: string | RegExp): string[] {
        const res: string[] | undefined | null = this.schemaContent.match(regexp);
        if (res) {
            return res;
        }
        return [];
    }

    private extractSchema(): void {
        const result: string[] =
            this.matchInSchema(
                new RegExp(`${DescriberList.SCHEMA}${this.describerValueSeperator}{${RegexHelper.UnknownContent}}`, 'g'));
        if (result.length > 0) {
            result.map(resUnfixed => {
                const res: string[] = resUnfixed
                    .replace(`${DescriberList.SCHEMA}${this.describerValueSeperator}{`, '')
                    .replace('}', '').split('\n');
                res.map(re => {
                    if (re && re !== '') {
                        const nameAndDef: string[] = re.split(':');
                        this.gqlAliasDefinitions.push({
                            name: nameAndDef[0],
                            value: this.removeSpaces(this.removeNewLines(nameAndDef[1]))
                        });
                    }
                });

            });
        }
    }

    private cleanSchema(): void {

        const queryName: string[] = this.matchInSchema(new RegExp(`query: ${RegexHelper.UnknownContent}\n`));
        const mutName: string[] = this.matchInSchema(new RegExp(`mutation: ${RegexHelper.UnknownContent}\n`));

        if (queryName.length > 0) {
            this.customQueryDescriber = this.removeNewLines(this.removeSpaces(queryName[0].split(':')[1]));
        }
        if (mutName.length > 0) {
            this.customMutationDescriber = this.removeNewLines(this.removeSpaces(mutName[0].split(':')[1]));
        }

        this.replaceInSchema(/input /g, DescriberList.INPUTS + this.describerValueSeperator);
        this.replaceInSchema(/enum /g, DescriberList.ENUMS + this.describerValueSeperator);
        this.replaceInSchema(/type /g, DescriberList.TYPES + this.describerValueSeperator);
        this.replaceInSchema(/scalar /g, DescriberList.SCALARS + this.describerValueSeperator);
        this.replaceInSchema(/schema /g, DescriberList.SCHEMA + this.describerValueSeperator);
        this.replaceInSchema(/ /g, '');
    }

    // This goes through a string list and removes a spcific text from every entry
    private removeValueFromEachEntryOfStringList(results: string[] | undefined, desriber: string, removeFromSchema?: boolean) {
        if (!results) {
            return [];
        }
        return results.map(
            result => {
                if (removeFromSchema) {
                    this.replaceInSchema(result, '');
                }
                return result.replace(`${desriber}${this.describerValueSeperator}`, '')
                    .replace('\n', '');
            }
        );
    }

    // match Simple Describer matches a simple type. like: <describer>=<typename> ending with a new line
    private matchSimpleType(describer: string): string[] {
        return this.matchInSchema(new RegExp(describer + this.describerValueSeperator + RegexHelper.UnknownContent + '\n', 'g'));
    }

    // match matchParamlessTypeWithBody matches a type which has a "body"
    // i.e: <describer=<typename>{ <unpredictable-data> }
    private matchParamlessTypeWithBody(describer: string, inSchema: boolean = true, matchIn?: string): string[] {
        const regexToUse: RegExp = new RegExp(
            describer + this.describerValueSeperator + RegexHelper.UnknownContent + '{' + RegexHelper.UnknownContent + '}', 'g');
        if (inSchema) {
            return this.matchInSchema(regexToUse);
        } else {
            const res: string[] | undefined | null = matchIn.match(regexToUse);
            if (res) {
                return res;
            }
            return [];
        }

    }

    private matchDescriberAndRemoveItFromEachReultEntry(describer: string, removeFromSchema: boolean = true): string[] {
        return this.removeValueFromEachEntryOfStringList(this.matchSimpleType(describer), describer, removeFromSchema);
    }

    private extractBodyValueFromBlock(content: string, describer: string): string {
        return content.replace(new RegExp(`(type${this.describerValueSeperator}${describer}{)|(})`, 'g'), '');
    }

    private extractScalarList(): void {
        // these are types that resolve to a single scalar object, and can't have sub-selections in the query
        this.gqlScalars = this.matchDescriberAndRemoveItFromEachReultEntry(DescriberList.SCALARS, true);
    }

    // extracts every mutation from available mutations as a string from within a type=mutation{<mutations>} string array.
    private extractMutations(mutationEntry: string): void {
        const bodyContent: string = this.extractBodyValueFromBlock(mutationEntry, this.mutationDescriber());
        bodyContent.split('\n').map(mutationDef => mutationDef !== '' && this.mutationStringList.push(mutationDef));
    }

    private queryOrMutationStringToObjectWithoutParams(queryString: string, definitionType: GqlFunctionType): GqlFunctionTypeDefinition {

        const def: GqlFunctionTypeDefinition = {params: []} as GqlFunctionTypeDefinition;
        const nameAndParams = queryString.split(':');

        def.name = nameAndParams[0];
        def.returnType = nameAndParams[0];
        def.definitionType = definitionType;

        const isArray: string[] | undefined | null = def.returnType.match(/\[((.|\n)*?)\]/g);
        if (isArray) {
            def.returnType = def.returnType.replace(/(\[)|(\])/g, '');
            def.returnTypeIsArray = true;
        }

        return def;
    }

    private queryOrMutationStringToObject(queryString: string, definitionType: GqlFunctionType): GqlFunctionTypeDefinition {

        try {
            const def: GqlFunctionTypeDefinition = {params: []} as GqlFunctionTypeDefinition;
            const nameAndParams = queryString.split('(');
            def.name = nameAndParams[0];
            def.returnType = nameAndParams[1].split('):')[1];

            nameAndParams[1].replace(')', '').split(',').map(param => {
                const tmpParam: GqlFunctionParameterDefinition = {} as GqlFunctionParameterDefinition;
                const nameType: string[] = param.split(':');
                tmpParam.name = nameType[0];
                tmpParam.type = nameType[1];

                if (tmpParam.type.indexOf('=') !== -1) {
                    const typeSplit: string[] = tmpParam.type.split('=');
                    tmpParam.defaultValue = typeSplit[1];
                    tmpParam.type = typeSplit[0];
                }

                const isArray: string[] | undefined | null = tmpParam.type.match(/\[((.|\n)*?)\]/g);
                // new RegExp('[' + RegexHelper.UnknownContent + ']', 'g'));
                if (tmpParam.type.indexOf('!') !== -1) {
                    tmpParam.type = tmpParam.type.replace(/!/g, '');
                    tmpParam.required = true;
                }
                if (isArray) {
                    tmpParam.type = tmpParam.type.replace(/(\[)|(\])/g, '');
                    def.returnTypeIsArray = true;
                }

                def.params.push(tmpParam);
            });
            def.definitionType = definitionType;
            return def;
        } catch (e) {
            return this.queryOrMutationStringToObjectWithoutParams(queryString, definitionType);
        }

    }

    // extracts every query from available querys as a string from within a type=query{<querys>} string array.
    private extractQuerys(queryEntry: string): void {
        const body:
            string = this.extractBodyValueFromBlock(queryEntry, this.queryDescriber());
        body.split('\n'
        ).map(queryDef => queryDef !== '' && this.queryStringList.push(queryDef));
    }

    private getNameAndBodyFromBlock(typeEntry: string): { name: string; propChain: string; } {
        const nameAndPropertys = typeEntry.split('{');
        const name: string = this.removeSpaces(nameAndPropertys[0].split('=')[1]);
        const propChain: string = nameAndPropertys[1].replace('}', '');
        return {name, propChain};
    }

    // transform a prop chain (i.e:=>  vl1: string!,vl2: Int=2)
    private parsePropertyChainToObjectArray(propChain: string): GqlObjectTypeProperty[] {
        const propertys: GqlObjectTypeProperty[] = [];

        propChain.split('\n').filter(p => p && p !== '').map(propType => {

            const propTypeArr = propType.split(':');
            const newProp: GqlObjectTypeProperty = {} as GqlObjectTypeProperty;

            newProp.name = this.removeSpaces(propTypeArr[0]);
            newProp.type = propTypeArr[1];
            // /[((.|\n)*?)]/g
            const isArray: string[] | undefined | null = newProp.type.match(/\[((.|\n)*?)\]/g);

            // new RegExp('[' + RegexHelper.UnknownContent + ']', 'g'));
            if (isArray) {
                newProp.type = newProp.type.replace(/(\[)|(\])/g, '');
                newProp.isArray = true;
            }

            if (newProp.type.indexOf('!') !== -1) {
                newProp.type = newProp.type.replace(/!/g, '');
                newProp.isRequired = true;
            }

            propertys.push(newProp);
        })
        ;

        return propertys;
    }

    private parseQqlTypeDefinitionString(type: string): GqlObjectTypeDefinition {
        const typeObject: { name: string, propChain: string } = this.getNameAndBodyFromBlock(type);
        const propertys: GqlObjectTypeProperty[] = this.parsePropertyChainToObjectArray(typeObject.propChain);
        this.availableGqlTypeNames.push(typeObject.name);
        return {
            name: typeObject.name,
            propertys
        };
    }

    private typeEntryIsRealType = (contentToCheck: string): boolean =>
        !!contentToCheck.match(
            new RegExp(`type${
                this.describerValueSeperator}${RegexHelper.UnknownContent}{${RegexHelper.UnknownContent}}`, 'g'));

    private extractAllKindOfTypeBlocksAndParse(): void {

        this.typeStringList = this.matchParamlessTypeWithBody(DescriberList.TYPES);

        this.typeStringList.map(type => {

            if (type.indexOf(this.mutationDescriber()) !== -1) {
                this.extractMutations(type);
                this.mutationStringList.map(mutationString => {
                    // try {
                    this.gqlMutations.push(this.queryOrMutationStringToObject(mutationString, GqlFunctionType.Mutation));
                    /*} catch (e) {
                        this.gqlTypes.push(this.parseQqlTypeDefinitionString(type));
                        this.customGqlTypes.push(this.gqlTypes[this.gqlTypes.length - 1].name);
                    }*/
                });
            } else if (type.indexOf(this.queryDescriber()) !== -1) {
                this.extractQuerys(type);
                this.queryStringList.map(queryString => {

                    this.gqlQuerys.push(this.queryOrMutationStringToObject(queryString, GqlFunctionType.Query));
                    /*catch (e) {
                    this.gqlTypes.push(this.parseQqlTypeDefinitionString(type));
                    this.customGqlTypes.push(this.gqlTypes[this.gqlTypes.length - 1].name);
                }*/
                });
            } else if (this.typeEntryIsRealType(type)) {

                this.gqlTypes.push(this.parseQqlTypeDefinitionString(type));
                this.customGqlTypes.push(this.gqlTypes[this.gqlTypes.length - 1].name);
            }

        });

    }

    private parseInputList(): void {
        const listOfInputs: string[] = this.matchParamlessTypeWithBody(DescriberList.INPUTS);
        listOfInputs.map(input => {
            this.gqlInputs.push(this.parseQqlTypeDefinitionString(input));
            this.customGqlTypes.push(this.gqlInputs[this.gqlInputs.length - 1].name);
        });
    }

    private parseEnumList(): void {
        const listOfEnums: string[] = this.matchParamlessTypeWithBody(DescriberList.ENUMS);
        listOfEnums.map(enumEntry => {
            const enumDef: GqlEnumTypeDefinition = {isStringEnum: true} as GqlEnumTypeDefinition;
            const typeObject: { name: string, propChain: string } = this.getNameAndBodyFromBlock(enumEntry);
            enumDef.name = typeObject.name;
            enumDef.values = typeObject.propChain.split('\n').map(e => this.removeNewLines(this.removeSpaces(e)))
                .filter(e => e !== '');
            this.customGqlTypes.push(enumDef.name);
            this.gqlEnums.push(enumDef);
        });
    }

    private removeComments(): void {
        [...this.matchInSchema(/"""((.|\n)*?)"""/g), ...this.matchInSchema(/#((.|\n)*?)\n/g)].map(
            comment => {
                this.commentStringList.push(comment);
                this.removeFromSchema(comment);
            }
        );
    }

    private guessTypescriptType(gqlType: string, isArray?: boolean): string {
        let ret = 'any';
        gqlType = gqlType.toLowerCase();
        const customTypesLower: string[] = this.customGqlTypes.map(t => t = t.toLowerCase());
        const customGqlEnumsLower: string[] = this.customGqlEnums.map(t => t = t.toLowerCase());
        const indexOfLowerTypes = customTypesLower.indexOf(gqlType);
        const indexOfLowerEnums = customGqlEnumsLower.indexOf(gqlType);
        if (gqlType === 'Int' || gqlType === 'Float') {
            ret = 'number';
        } else if (gqlType === 'String') {
            ret = 'string';
        } else if (gqlType === 'Boolean') {
            ret = 'boolean';
        } else if (indexOfLowerTypes !== -1) {
            ret = this.customGqlTypes[indexOfLowerTypes];
        } else if (indexOfLowerEnums !== -1) {
            ret = this.customGqlEnums[indexOfLowerEnums];
        } else if (this.knownGqlTypes[gqlType]) {
            ret = this.knownGqlTypes[gqlType];
        }
        if (ret !== 'any') {
            this.typesWritten++;
        } else {
            this.anysWritten++;
        }
        return isArray ? (ret + '[]') : ret;
    }

}

