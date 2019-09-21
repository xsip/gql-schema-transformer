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
