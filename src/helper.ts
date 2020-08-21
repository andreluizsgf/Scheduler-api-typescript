import fs, { writeFileSync } from 'fs'
import Rule from './models/Rule';
import { DATABASE_JSON } from './paths.consts'
import { parse } from 'path';

export const newId = (rulesJson: Rule[]) => {

    return 1;
}

export const mkDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) 
        return fs.promises.mkdir(dirPath);
    
    return Promise.resolve();
};

export const writeJson = <T>(data: T, filepath: any) => {
    console.log(data)
    const serializedData = JSON.stringify(data, null, 2);
    
    return fs.promises.writeFile(filepath, serializedData);
};
/*
export const readJson = <T>(filepath: string) => {
    return new Promise<T>((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            if (err) reject(err);
            const jsonData: T =  parseJson(data.toString())
            resolve(jsonData);
        });
    });
}*/

const parseJson = (data: string) => {
    try {
        return JSON.parse(data)
    } catch (e) {
        return null
    }
}

