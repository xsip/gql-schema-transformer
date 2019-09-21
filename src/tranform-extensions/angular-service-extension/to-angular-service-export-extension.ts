// this file get's used by gql-schema-parser which passes all collected gql
// data as js objects to this class.
import {GqlSchemaDataCollection, TransformExtensionClass} from '../definitions';
import {GqlEnumTypeDefinition, GqlObjectTypeDefinition, GqlObjectTypeProperty} from '../../definitions';
import {
    enumAsStringEnumTemplate,
    enumAsTypeTemplate,
    interfaceTemplate,
    optionalPropertyTemplate,
    requiredPropertyTemplate
} from './definitions/templates';
import * as fs from 'fs';
import {generatorConfig} from '../../utils/config';

enum RegexHelper {
    UnknownContent = '((.|\n)*?)' as any,
    SameAsFirstMatch = '\\1' as any
}

enum RegexExecResult {
    FullMatch = 0,
    TagName = 1,
    Unknown = 2,
    Content = 3,
    Unknown2 = 4,
}

class TemplateParser {
    enumsAsTypes: boolean;

    matchInContent(match: RegExp): string[] {
        const res: string[] | null = this.content.match(match);
        if (!res) {
            return [];
        }
        return res;
    }

    constructor(private content: string) {
    }

    getTags(tagMustContain: string = ''): string[] {
        return this.matchInContent(
            new RegExp(`{{${
                RegexHelper.UnknownContent}${tagMustContain}}}${
                RegexHelper.UnknownContent}{{/${RegexHelper.SameAsFirstMatch}${tagMustContain}}}`, 'g'));
    }

    getStandaloneTags(tagMustContain: string = ''): string[] {
        return this.matchInContent(
            new RegExp(`{{var-${RegexHelper.UnknownContent}${tagMustContain}}}`, 'g'));
    }

    getAllVars() {
        const tagMustContain: string = '-loop';
        // const additionalTagAdd = '-loop';
        const regex: RegExp = new RegExp(`{{${
            RegexHelper.UnknownContent}${tagMustContain}}}${
            RegexHelper.UnknownContent}{{/${RegexHelper.SameAsFirstMatch}${tagMustContain}}}`, 'g');

        this.getTags('-loop').map(loop => {
            console.log('loop ?>' + loop);
            const destructedLoop: any[] = regex.exec(this.content);
            const propName: string = destructedLoop[RegexExecResult.TagName];
        });
    }

    getAllLoops() {
        const tagMustContain: string = '-loop';
        // const additionalTagAdd = '-loop';
        const regex: RegExp = new RegExp(`{{${
            RegexHelper.UnknownContent}${tagMustContain}}}${
            RegexHelper.UnknownContent}{{/${RegexHelper.SameAsFirstMatch}${tagMustContain}}}`, 'g');

        this.getTags('-loop').map(loop => {
            console.log('loop ?>' + loop);
            const destructedLoop: any[] = regex.exec(this.content);
            const propName: string = destructedLoop[RegexExecResult.TagName];
        });
    }
}

export class ToAngularServiceExportExtension implements TransformExtensionClass {
    enumAsType: boolean;
    private data: GqlSchemaDataCollection;
    private reducedTypes: { [index: string]: GqlObjectTypeDefinition } = {};

    constructor() {

    }

    export(data: GqlSchemaDataCollection, exportFilePath: string) {
        let exportData: string = '';
        this.data = data;
        this.reduceTypes();

        exportData += this.getEnumsAsTypescriptDefinitions();
        exportData += this.getInterfacesAsTypescriptDefinitions();

        fs.writeFileSync(generatorConfig.intefacesExportFile, exportData);
        // console.log('ToAngularServiceExportExtension is not implemented yet!');
    }

    reduceTypes() {
        this.data.gqlTypes.map(type => {
            this.reducedTypes[type.name] = type;
        });
    }

    getTypescriptInterfaceProperty(p: GqlObjectTypeProperty): string {

        let tmpPropTemplate: string = optionalPropertyTemplate;

        if (p.isRequired) {
            tmpPropTemplate = requiredPropertyTemplate;
        }

        return tmpPropTemplate.replace('{{name}}', p.name)
            .replace('{{tsTypeGuess}}', p.isArray ? `${p.tsTypeGuess}[]` : p.tsTypeGuess);
    }

    getTypescriptInterfaceCode(t: GqlObjectTypeDefinition): string {
        const tmp: string = interfaceTemplate.replace('{{name}}', t.name);
        let propertyList: string = '';
        t.propertys.map(p => {
            propertyList += this.getTypescriptInterfaceProperty(p) + '\n';
        });
        return tmp.replace('{{propertyList}}', propertyList);
    }

    getTypescriptEnumCode(e: GqlEnumTypeDefinition): string {
        if (this.enumAsType) {
            const tmpEnumDef: string = enumAsTypeTemplate.replace('{{name}}', `${e.name}`);
            return tmpEnumDef.replace('{{values}}', e.values.map(v => `'${v}'`).join('|'));
        } else {
            // enumAsStringEnumTemplate
            const tmpEnumDef: string = enumAsStringEnumTemplate.replace('{{name}}', `${e.name}`);
            return tmpEnumDef.replace('{{values}}', e.values.map(v => `${v.toUpperCase()} = '${v}' as any`)
                .join(',\n'));
        }

    }

    getEnumsAsTypescriptDefinitions(): string {
        let enumList: string = '';
        this.data.gqlEnums.map(e => {
            enumList += this.getTypescriptEnumCode(e);
        });
        return enumList;
    }

    getInterfacesAsTypescriptDefinitions(): string {
        let interfaceList: string = '';
        this.data.gqlTypes.map(t => {
            interfaceList += this.getTypescriptInterfaceCode(t);
        });
        return interfaceList;
    }

}
