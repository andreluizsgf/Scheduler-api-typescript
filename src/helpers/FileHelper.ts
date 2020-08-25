
import {DATABASE_DIR, DATABASE_JSON} from '../paths.consts';
import fs from 'fs';
import Rule from '../models/Rule.model';

const mapToJson = (map: Map<number, Rule>) => {
  return JSON.stringify([...map]);
};

const jsonToMap = (jsonStr: string): Map<number, Rule> => {
  try {
    return new Map(JSON.parse(jsonStr));
  } catch (e) {
    return new Map();
  }
};

export const createDatabaseDir = () => {
  if (!fs.existsSync(DATABASE_DIR)) {
    return fs.promises.mkdir(DATABASE_DIR);
  }

  return Promise.resolve();
};

export const writeJson = (data: any, filepath: any) => {
  const serializedData = mapToJson(data);
  return fs.promises.writeFile(filepath, serializedData);
};

export const readJson = (filepath: string): Promise<Map<number, Rule>> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      if (err) reject(err);
      const jsonData = jsonToMap(data.toString());
      resolve(jsonData);
    });
  });
};


export const createDatabaseJson = () => {
  if (!fs.existsSync(DATABASE_JSON)) {
    return fs.open(DATABASE_JSON, 'w', (err) => {
      if (err) {
        throw err;
      }
    });
  }

  return Promise.resolve();
};