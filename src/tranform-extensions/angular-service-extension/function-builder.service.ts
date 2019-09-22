import {GqlFunctionParameterDefinition, GqlFunctionTypeDefinition, GqlObjectTypeDefinition} from '../../definitions';
import {angularServiceQueryFunctionTemplate} from './definitions/templates';

export class FunctionBuilderService {

    constructor() {

    }

    private paramsToFunctionParamString(params: GqlFunctionParameterDefinition[]): string {
        let tmpStr = '';
        params.map((param, index) => {
            tmpStr += `${
                param.name}${!param.required ? '?:' : ':'} ${
                param.tsTypeGuess}${index !== params.length - 1 ? ',' : ''}`;
        });
        return `data: {${tmpStr}}`;
    }

    private includeInResponseConfig(retType: GqlObjectTypeDefinition): string {
        let tmpStr = '';
        retType.propertys.map((param, index) => {
            if (param.objectDefCopy) {
                if (!param.isRequired) {
                    tmpStr += `${
                        param.name}: {${this.includeInResponseConfig(param.objectDefCopy)}}${index !== retType.propertys.length - 1 ? ',\n' : '\n'}`;
                }
            } else {
                if (!param.isRequired) {
                    tmpStr += `${
                        param.name}${param.isRequired ? ': true' : ': false'}${index !== retType.propertys.length - 1 ? ',\n' : '\n'}`;
                }
            }

        });
        return tmpStr;
    }

    private requestParamsForQuery(params: GqlFunctionParameterDefinition[]): string {
        let tmpStr = '';
        params.map((param, index) => {
            tmpStr += `$${param.name}: ${param.type}${index !== params.length - 1 ? ',' : ''}`;
        });
        return tmpStr;
    }

    private queryVarMap(params: GqlFunctionParameterDefinition[], forExecution?: boolean): string {
        let tmpStr = '';
        params.map((param, index) => {
            if (!forExecution) {
                tmpStr += `${param.name}: data.${param.name}${index !== params.length - 1 ? ',' : ''}`;
            } else {
                tmpStr += `${param.name}: $${param.name}${index !== params.length - 1 ? ',' : ''}`;
            }

        });
        return tmpStr;
    }

    public buildQuery(query: GqlFunctionTypeDefinition) {
        let queryFuncTemplate = angularServiceQueryFunctionTemplate;

        queryFuncTemplate = queryFuncTemplate.replace(/{{queryName}}/g, query.name);
        queryFuncTemplate = queryFuncTemplate.replace(/{{returnTypeTs}}/g, query.returnTypeTsGuess);
        queryFuncTemplate = queryFuncTemplate.replace('{{paramListFuncDef}}', this.paramsToFunctionParamString(query.params));
        queryFuncTemplate = queryFuncTemplate.replace(
            '{{includeOptionalParams}}', `, includeInResponse: {[index: string]: boolean | any} = {${
                this.includeInResponseConfig(query.returnTypeDefCpy)}}`);
        queryFuncTemplate = queryFuncTemplate.replace('{{paramListQuery}}', this.requestParamsForQuery(query.params));
        queryFuncTemplate = queryFuncTemplate.replace('{{queryVarMap}}', this.queryVarMap(query.params));
        queryFuncTemplate = queryFuncTemplate.replace('{{paramForExecution}}', this.queryVarMap(query.params, true));

        queryFuncTemplate = queryFuncTemplate.replace('{{requiredPropertysToFetchList}}',
            this.includeInResponseConfigForGqlQuery(query.returnTypeDefCpy));
        //
        // console.log(queryFuncTemplate);
        return queryFuncTemplate;
    }

    private includeInResponseConfigForGqlQuery(retType: GqlObjectTypeDefinition): string {
        let tmpStr = '';
        retType.propertys.map((param, index) => {
            if (param.objectDefCopy) {
                tmpStr += `${
                    param.name} {${this.includeInResponseConfigForGqlQuery(param.objectDefCopy)}}${index !== retType.propertys.length - 1 ? '\n' : '\n'}`;
            } else {
                tmpStr +=
                    `${param.isRequired ? `${param.name}\n` : '${includeInResponse.' + param.name + ' ? ' + `'${param.name}'` + ': \'\' }'}${
                        index !== retType.propertys.length - 1 ? '\n' : '\n'}`;
            }

        });
        return tmpStr;
    }
}
