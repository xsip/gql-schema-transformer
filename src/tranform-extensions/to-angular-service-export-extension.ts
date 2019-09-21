// this file get's used by gql-schema-parser which passes all collected gql
// data as js objects to this class.
import {GqlSchemaDataCollection, TransformExtensionClass} from './definitions';


export class ToAngularServiceExportExtension implements TransformExtensionClass {

    constructor() {

    }

    export(data: GqlSchemaDataCollection, exportFilePath: string) {
        console.log('ToAngularServiceExportExtension is not implemented yet!');
    }


}
