import {TransformExtensionClass, GqlSchemaDataCollection} from './definitions';

export class LogInfoExtension implements TransformExtensionClass {
    data: GqlSchemaDataCollection;

    constructor() {
    }


    logExportResults() {
        console.log(`Extracted ${this.data.gqlScalars.length} Scalars`);
        this.data.gqlScalars.map(s => console.log(` ${s}`));
        console.log(`Extracted ${this.data.gqlMutations.length} Mutations`);
        this.data.gqlMutations.map(m => console.log(` ${m.name}`));
        console.log(`Extracted ${this.data.gqlQuerys.length} Querys`);
        this.data.gqlQuerys.map(q => console.log(` ${q.name}`));
        console.log(`Extracted ${this.data.gqlTypes.length} Types`);
        this.data.gqlTypes.map(t => console.log(` ${t.name}`));
        console.log(`Extracted ${this.data.gqlInputs.length} Inputs`);
        this.data.gqlInputs.map(i => console.log(` ${i.name}`));
        console.log(`Extracted ${this.data.gqlEnums.length} Enums`);
        this.data.gqlEnums.map(e => console.log(` ${e.name}`));
        console.log(`Extracted ${this.data.gqlAliasDefinitions.length} Schema Infos`);
        this.data.gqlAliasDefinitions.map(s => console.log(` ${s.name} (${s.value})`));
    }

    export(data: GqlSchemaDataCollection, exportFilePath: string) {
        this.data = data;
        this.logExportResults();
    }



}
