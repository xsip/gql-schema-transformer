import * as fs from 'fs';
import {resolve} from 'path';
import {KnownGqlTypes} from './definitions';
import {generatorConfig} from './utils/config';
import {GqlSchemaTransformer} from './gql-schema-parser';
import {LogInfoExtension} from './tranform-extensions/log-info-extension';
import {ToJsonExtension} from './tranform-extensions/to-json-extension';


let knownTypes: KnownGqlTypes = [] as any;
try {
    knownTypes = JSON.parse(fs.readFileSync(generatorConfig.knownGqlTypes, 'utf8'));
} catch (e) {
    console.log(`couldn't load known types..`);
}

if (!fs.existsSync(`${resolve(__dirname, '../export')}`)) {
    fs.mkdirSync(`${resolve(__dirname, '../export')}`);
}

const transformer: GqlSchemaTransformer = new GqlSchemaTransformer(generatorConfig.gqlSchemaLocation, knownTypes);

transformer.parse();


if (transformer.succeeded()) {
    transformer.transformUsingExtension(ToJsonExtension, generatorConfig.gqlSchemaJsonExportFIle);
    transformer.transformUsingExtension(LogInfoExtension);
    // transformer.transformUsingExtension(ToAngularServiceExportExtension, 'no export file path yet');

}
