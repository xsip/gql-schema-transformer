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

// structure idea. extends and provide to export within transformExtensionClass
export interface GqlSchemaDataCollectionReduced {
    names: {
        gqlTypes: string[];
        gqlQuerys: string[];
        gqlMutations: string[];
        gqlInputs: string[];
        gqlEnums: string[];
        gqlScalars: string[];
        gqlAliasDefinitions: string[];
    };
    definitions: {
        gqlTypes: { [index: string]: GqlObjectTypeDefinition };
        gqlQuerys: { [index: string]: GqlFunctionTypeDefinition };
        gqlMutations: { [index: string]: GqlFunctionTypeDefinition };
        gqlInputs: { [index: string]: GqlObjectTypeDefinition };
        gqlEnums: { [index: string]: GqlEnumTypeDefinition };
        gqlScalars: string[];
        gqlAliasDefinitions: { [index: string]: GqlAliasDefinition };
    };
}

// @ts-ignore
export abstract class TransformExtensionClass<T = any> extends T {
    public export(data: GqlSchemaDataCollection, exportFilePath: string) {}
}
