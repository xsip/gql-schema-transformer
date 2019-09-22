export const enumAsTypeTemplate = `type {{name}} = {{values}};`;
export const enumAsStringEnumTemplate = `
enum {{name}} {
    {{values}}
};`;

export const interfaceTemplate = `
export interface {{name}} {
    {{propertyList}}
};`;

export const requiredPropertyTemplate = `{{name}}: {{tsTypeGuess}};`;
export const optionalPropertyTemplate = `{{name}}?: {{tsTypeGuess}};`;


export const angularServiceImportsTemplate = `
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import {Observable} from 'rxjs';
import { ApolloQueryResult} from 'apollo-client';
//  import * as typDefs from './gql-type-interfaces';
`;


export const angularServiceClassTemplate = `
class QueryService {
    constructor(private apollo: Apollo) {

    }

    {{functions}}
}
`;

export const angularServiceQueryFunctionReturnTypeTemplate = `
Observable<ApolloQueryResult<{{returnTypeTs}}>>
`;

export const angularServiceQueryFunctionTemplate = `
    public {{queryName}}Query({{paramListFuncDef}}{{includeOptionalParams}}): ${angularServiceQueryFunctionReturnTypeTemplate} {
        return this.apollo.query({
        query: gql\`
            query {{queryName}}({{paramListQuery}}) {
              {{queryName}}({{paramForExecution}}) {
                {{requiredPropertysToFetchList}}
              }
            }
        \`,
        variables: {
            {{queryVarMap}}
        },
        }) as ${angularServiceQueryFunctionReturnTypeTemplate}
    };
`;
