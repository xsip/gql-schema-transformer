# GQL Schema Transformer

**GQL Schema Transformer** is a tool which parses **schema.gql** files and can create various types of output files through Extensions depending on the parsed data which contains **enums, scalars, types, querys, mutations and Inputs**.
 
The idea or reason i made this tool is that i wanted to create an automated Build task for creating angular services containing flexible mutations and query functions and Export Typescript types out of those schemas.

I was searching for a **GQL Schema Transformer** all over the www but didn't find what i needed.

So instead of writing just a GQL Json to Angular Service Script, i wrote a parser which is extendable by extensions and i will add the planned Angular Extension .

**Also this parser is developed by heavily holding on eye  on the official GQL Schema Documentation so there shouldn't be any big issues!**

# Ussage Example
**src/index.ts** shows how this could be used ( **Keep in mind that this as stilll in DEV and not PROD Ready** )

# Planned Flow Chart
```mermaid
Schema.gql -- GQL Schema Transformer --> Schema as typed Objects
Schema as typed Objects -- Export Extension-- --> Angular Service i.e
```

# Info on some Repo files
1. **typeconfig.json** defines mappings for gql types.
 in this example DateTime & Id will both be guessed as string at the **tsTypeGuess** property!
 **If any type is unresolveable any will be used** !
2. **Schema.gql** is just an example schema file which is one of the files i used for development and testing.


# STILL IN DEVELOPMENT

This Repository is still in development and not production ready at all, so i decided to not going write down any  object/ Type documentation. Also I am not going to write about how to execute or similar content at this state of development. **Please be patient :-)**
