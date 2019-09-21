import {GqlFunctionTypeDefinition, GqlEnumTypeDefinition, GqlAliasDefinition, GqlObjectTypeDefinition} from '../../definitions';


export interface GqlSchemaDataCollection {
    gqlTypes: GqlObjectTypeDefinition[];
    gqlQuerys: GqlFunctionTypeDefinition[];
    gqlMutations: GqlFunctionTypeDefinition[];
    gqlInputs: GqlObjectTypeDefinition[];
    gqlEnums: GqlEnumTypeDefinition[];
    gqlScalars: string[];
    gqlAliasDefinitions: GqlAliasDefinition[];
}

// @ts-ignore
export abstract class TransformExtensionClass<T = any> extends T {
    public export(data: GqlSchemaDataCollection, exportFilePath: string) {}
}
