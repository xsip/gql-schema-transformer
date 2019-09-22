import {GqlObjectTypeDefinition} from '../../../definitions';

export interface GqlDefReduced<T> {
    [index: string]: T;
}
