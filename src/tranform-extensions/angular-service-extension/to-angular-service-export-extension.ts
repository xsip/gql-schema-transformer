// this file get's used by gql-schema-parser which passes all collected gql
// data as js objects to this class.
import {GqlSchemaDataCollection, TransformExtensionClass} from '../definitions';
import {ToTypescriptInterfacesExtension} from './to-typescript-interfaces-extension';
import {GqlDefReduced} from './definitions';
import {generatorConfig} from '../../utils/config';
import * as fs from 'fs';
import {GqlEnumTypeDefinition, GqlFunctionTypeDefinition, GqlObjectTypeDefinition, GqlObjectTypeProperty} from '../../definitions';
import {angularServiceClassTemplate, angularServiceImportsTemplate, angularServiceQueryFunctionTemplate} from './definitions/templates';
import {FunctionBuilderService} from './function-builder.service';


export class ToAngularServiceExportExtension implements TransformExtensionClass {

    private reducedTypes: GqlDefReduced<GqlObjectTypeDefinition>;
    private reducedEnums: GqlDefReduced<GqlEnumTypeDefinition>;

    private toTypescripInterfaces: ToTypescriptInterfacesExtension = new ToTypescriptInterfacesExtension();
    private functionBuilderService: FunctionBuilderService = new FunctionBuilderService();

    constructor() {

    }

    getTypescriptInterfacesAsString(): string {
        return this.toTypescripInterfaces.getResult();
    }

    getReducedTypesAndEnums(): void {
        this.reducedTypes = this.toTypescripInterfaces.getReducedTypes();
        this.reducedEnums = this.toTypescripInterfaces.getReducedEnums();
    }

    addCopyOfTypeDefsToQuerysAndPropertys(data: GqlSchemaDataCollection): void {
        const addTypeDefinitionToTypeProperty = (prop: GqlObjectTypeProperty) => {
            prop.objectDefCopy = this.reducedTypes[prop.tsTypeGuess];
            prop.objectDefCopy.propertys.map(prop2 => {
                if (this.reducedTypes[prop2.tsTypeGuess]) {
                    addTypeDefinitionToTypeProperty(prop2);
                }
            });

        };
        const addTypeDefinitionForReturnTypeToQuery = (querys: GqlFunctionTypeDefinition[]) => {
            querys.map((query) => {
                const escapedType: string = query.returnTypeTsGuess;
                query.returnTypeDefCpy = this.reducedTypes[escapedType];
                query.returnTypeDefCpy.propertys.map(prop => {
                    if (this.reducedTypes[prop.tsTypeGuess]) {
                        addTypeDefinitionToTypeProperty(prop);
                    }
                });
                // console.log(`Added ${escapedType} to ${query.name}`);
                // console.log(reducedTypes[escapedType]);
            });
        };
        addTypeDefinitionForReturnTypeToQuery(data.gqlQuerys);
    }

    export(data: GqlSchemaDataCollection, exportFilePath: string) {
        this.toTypescripInterfaces.export(data, exportFilePath);
        this.getReducedTypesAndEnums();
        // this.addCopyOfTypeDefsToQuerysAndPropertys(data);
        const tsInterfaces: string = this.getTypescriptInterfacesAsString();
        const angularServiceSourceCode = this.getAngularServiceSourceCode(data);
        //  this.data = data;
        fs.writeFileSync(generatorConfig.intefacesExportFile, tsInterfaces + angularServiceSourceCode);
    }

    getAngularServiceSourceCode(data: GqlSchemaDataCollection): string {
        let tmpSrc: string = angularServiceImportsTemplate;
        tmpSrc += angularServiceClassTemplate;
        let functions = '';
        data.gqlQuerys.map(q => {
            functions += this.functionBuilderService.buildQuery(q);
        });
        tmpSrc = tmpSrc.replace('{{functions}}', functions);
        return tmpSrc;
    }
}
