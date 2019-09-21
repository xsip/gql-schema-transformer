import {TransformExtensionClass, GqlSchemaDataCollection} from './definitions';
import * as fs from 'fs';


// generatorConfig.gqlSchemaJsonExportFIle

export class ToJsonExtension implements TransformExtensionClass {

    constructor() {
    }

    export(data: GqlSchemaDataCollection, exportFilePath: string) {
        fs.writeFileSync(exportFilePath, JSON.stringify(data, null, 2), 'utf-8');
    }


}
