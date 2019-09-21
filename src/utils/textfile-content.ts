import * as fs from 'fs';
import {generatorConfig} from './config';

export class TextfileContent {
  private fileContent: string;

  public replace(searchValue: any, replaceValue: string): void {
    this.fileContent = this.fileContent.replace(searchValue, replaceValue);
  }

  public remove(searchValue: any): void {
    this.fileContent = this.fileContent.replace(searchValue, '');
  }

  constructor(filePath: string) {
    try {
    this.fileContent = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      console.log(`Failed to open schema file at ${filePath} ..`);
      process.exit(1);
    }
  }

  public removeAllSpaces() {
    this.replace(/ /g, '');
  }

  public match = (regexp: string | RegExp): RegExpMatchArray => this.fileContent.match(regexp);
}
