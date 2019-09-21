import {resolve} from 'path';

export const generatorConfig = {
  knownGqlTypes: `${resolve(__dirname, '../../typeconfig.json')}`,
  gqlSchemaLocation: `${resolve(__dirname, '../../schema.gql')}`,
  gqlSchemaJsonExportFIle: `${resolve(__dirname, '../../export/Schema.json')}`,
};
