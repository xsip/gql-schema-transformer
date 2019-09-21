import {GqlFunctionType} from './enums';

export interface GqlFunctionParameterDefinition {
    required?: boolean;
    name: string;
    type: string;
    isArray?: boolean;
    defaultValue: number | string;
    tsTypeGuess?: string;
    objectDefCopy?: GqlObjectTypeDefinition;
}

export interface GqlObjectTypeProperty {
    name?: string;
    isRequired?: boolean;
    isArray?: boolean;
    type: string;
    tsTypeGuess: string;
    objectDefCopy?: GqlObjectTypeDefinition;
}

export interface GqlAliasDefinition {
    name: string;
    value: string;
}

export interface GqlObjectTypeDefinition {
    name: string;
    propertys: GqlObjectTypeProperty[];
}

export interface GqlEnumTypeDefinition {
    isStringEnum?: boolean;
    name: string;
    values: string[];
}

export interface GqlFunctionTypeDefinition {
    returnType: string;
    returnTypeIsArray?: boolean;
    returnTypeDefCpy?: GqlObjectTypeDefinition;
    returnTypeTsGuess: string;
    name: string;
    schemaDef: string;
    definitionType: GqlFunctionType;
    params: GqlFunctionParameterDefinition[];
}


export interface KnownGqlTypes {
    [index: string]: string;
}


