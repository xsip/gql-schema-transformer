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


export class ToAngularServiceExportExtension implements TransformExtensionClass {
    enumAsType: boolean;
    private data: GqlSchemaDataCollection;
    private reducedTypes: { [index: string]: GqlObjectTypeDefinition } = {};

    constructor() {

    }

    export(data: GqlSchemaDataCollection, exportFilePath: string) {
        let exportData = '';
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
