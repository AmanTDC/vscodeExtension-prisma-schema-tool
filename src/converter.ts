import { TextEncoder, TextDecoder } from "util"
import * as _ from 'lodash';

let { writeFileSync, readFileSync } = require('fs')
//location of the schema file you want to adjust
//let schema = readFileSync('./schema.prisma')

//converts snake-case columns to camel-case
function toPascalCase(input:string) {
    return _.upperFirst(_.camelCase(input));
}
function getIthWord(line: string, i: number){
    return line.split(" ").filter(l=>l!=='')?.[i];
}
function getAllIndices(line:string, char:string){
    var indices = [];
    for(var i=0; i<line.length;i++) {
        if (line[i] === char) {
            indices.push(i);
        };
    }
    return indices;
}
function main(input: Uint8Array) {
    let schema:string = new TextDecoder().decode(input);
    schema = schema + '\n';
    let regex = new RegExp(/\w*_\w*/g);
    let lines = <RegExpMatchArray>schema.match(/.*\n/g);
    let blockStart: boolean = false;
    let isEntityMapped : boolean = false;
    let blockName: string = '';
    let blockType: string = '';
    lines.forEach((line: string, i) => {
        let newLine: string = line;
        const first = getIthWord(line,0);
        const second = getIthWord(line,1);
        if(/\{/.test(line) && first!=="generator" && first!=="datasource"){ 
            blockStart = true;
            blockName = second;
            blockType = first;
            newLine = line.replace(blockName, toPascalCase(blockName));
        }
        else if (blockStart && !/\@map/.test(line) && !/\@/.test(first) && !/role/.test(blockType)){
            let entityName = first;
            newLine = line.replace(entityName, _.camelCase(entityName)).replace(second,toPascalCase(second)).replace('\n',` @map("${entityName}")${'\n'}`);
        }
        else if(blockStart && /\@\@map/.test(line)){
            isEntityMapped = true;
        }
        if(blockStart && /\@map/.test(line)){
            newLine = line.replace('\n',` @map("${blockName}")${'\n'}`);
        }
        if(blockStart){
            let arrays = [];
            let arrayStarting = getAllIndices(line,'[');
            let arrayClosing = getAllIndices(line,']');
            for(let i=0;i<arrayStarting.length;i++){
                arrays[i] = line.slice(arrayStarting[i],arrayClosing[i]).split(" ").join(",").split(",").map(c=>`${_.camelCase(c)}`).join(",");
                newLine = newLine.replace(line.slice(arrayStarting[i],arrayClosing[i]),arrays[i]);
            }
        }
        if(blockStart && /\}/.test(line) ){
            if(!isEntityMapped){
                newLine = `  @@map("${blockName}")${'\n'}${line}`;
            }
            else{
                newLine = '}';
            }
            isEntityMapped = false;
            blockStart = false;
        }
        
        lines[i] = newLine;
    });
    let output = lines.join('\n');
    return new TextEncoder().encode(output);
}

export default main;