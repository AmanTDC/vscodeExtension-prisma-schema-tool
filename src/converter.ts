import { TextEncoder, TextDecoder } from "util";
import { Page } from "./components/page";


function toCamelCase(input: String) {
    const pascal =  toPascalCase(input);
    return input?.charAt(0)?.toLowerCase()+pascal?.slice(1);
}
function toPascalCase(str:String) {
    if (!str){
        return '';
    }
    return str.split("_").map((w)=>w.charAt(0).toUpperCase()+w.slice(1)).join('');
    
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
function getIthWord(line: string, i: number){
    return line.split(" ").filter(l=>l!=='')?.[i];
}
function main(input: Uint8Array) {
    let schema:string = new TextDecoder().decode(input);
    let output:string = new Page(schema).toString();
    return new TextEncoder().encode(output);
}

export default main;