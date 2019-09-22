// this file get's used by gql-schema-parser which passes all collected gql
// data as js objects to this class.
import {GqlSchemaDataCollection, TransformExtensionClass} from '../definitions';
import {ToTypescriptInterfacesExtension} from './to-typescript-interfaces-extension';
import {ReducedGqlTypes} from './definitions';
import {generatorConfig} from '../../utils/config';
import * as fs from 'fs';


export class ToAngularServiceExportExtension implements TransformExtensionClass {
    private reducedTypes: ReducedGqlTypes;
    private toTypescripInterfaces: ToTypescriptInterfacesExtension = new ToTypescriptInterfacesExtension();

    constructor() {

    }

    getTypescriptInterfacesAsString(): string {
        return this.toTypescripInterfaces.getResult();
    }

    getReducedTypes(): void {
        this.reducedTypes = this.toTypescripInterfaces.getReducedTypes();
    }

    export(data: GqlSchemaDataCollection, exportFilePath: string) {
        this.toTypescripInterfaces.export(data, exportFilePath);
        this.getReducedTypes();
        const tsInterfaces: string = this.getTypescriptInterfacesAsString();
        //  this.data = data;
        fs.writeFileSync(generatorConfig.intefacesExportFile, tsInterfaces);
    }
}
