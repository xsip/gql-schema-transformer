import {GqlSchemaDataCollection, TransformExtensionClass} from '../definitions';
import {GqlEnumTypeDefinition, GqlObjectTypeDefinition, GqlObjectTypeProperty} from '../../definitions';
import {
    enumAsStringEnumTemplate,
    enumAsTypeTemplate,
    interfaceTemplate,
    optionalPropertyTemplate,
    requiredPropertyTemplate
} from './definitions/templates';
import {GqlDefReduced} from './definitions';

export class ToTypescriptInterfacesExtension implements TransformExtensionClass {

    enumAsType: boolean;
    private data: GqlSchemaDataCollection;
    private reducedTypes: GqlDefReduced<GqlObjectTypeDefinition> = {};
    private reducedEnums: GqlDefReduced<GqlEnumTypeDefinition> = {};

    constructor() {

    }

    private exportData = '';

    export(data: GqlSchemaDataCollection, exportFilePath: string) {


        this.data = data;
        this.reduceTypesAndEnums();

        this.exportData += this.getEnumsAsTypescriptDefinitions();
        this.exportData += this.getInterfacesAsTypescriptDefinitions();


    }

    getResult(): string {
        return this.exportData;
    }

    getReducedTypes(): GqlDefReduced<GqlObjectTypeDefinition> {
        return this.reducedTypes;
    }

    getReducedEnums(): GqlDefReduced<GqlEnumTypeDefinition> {
        return this.reducedEnums;
    }

    reduceTypesAndEnums() {
        this.data.gqlTypes.map(type => {
            this.reducedTypes[type.name] = type;
        });
        this.data.gqlEnums.map(en => {
            this.reducedEnums[en.name] = en;
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
        let propertyList = '';
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
        let enumList = '';
        this.data.gqlEnums.map(e => {
            enumList += this.getTypescriptEnumCode(e);
        });
        return enumList;
    }

    getInterfacesAsTypescriptDefinitions(): string {
        let interfaceList = '';
        this.data.gqlTypes.map(t => {
            interfaceList += this.getTypescriptInterfaceCode(t);
        });
        return interfaceList;
    }

}