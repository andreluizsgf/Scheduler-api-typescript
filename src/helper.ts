import fs from 'fs'
import Rule from './models/Rule';

export const mkDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) 
        return fs.promises.mkdir(dirPath);
    
    return Promise.resolve();
};

export const writeJson = <T>(data: T, filepath: any) => {
    const serializedData = JSON.stringify(data, null, 2);
    
    return fs.promises.writeFile(filepath, serializedData);
};

export const readJson = <T>(filepath: string): any => {
    return new Promise<T>((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            if (err) reject(err);
            const jsonData: T =  parseJson(data.toString())
            resolve(jsonData);
        });
    });
}

const parseJson = (data: string) => {
    try {
        return JSON.parse(data)
    } catch (e) {
        return [];
    }
}

export const checkConflictsByDate = (newRule: Rule, rules: any) => {
    const intervals = getIntervalsByDate(newRule.date, rules);
    
    if(intervals.length)
        return intervals.every(interval => {
            return ( ((newRule.interval.start <= interval.start && newRule.interval.end <= interval.start) || (newRule.interval.start >= interval.end && newRule.interval.end >= interval.end)) && newRule.interval.start != newRule.interval.end)
        })
    else return true;
}

export const checkConflictsByDay = (newRule: Rule, rules: Rule[]) => {

    const intervals = getIntervalsByDay(newRule.day, rules)

    if(intervals.length)
        return intervals.every(interval => {
            return ( ((newRule.interval.start <= interval.start && newRule.interval.end <= interval.start) || (newRule.interval.start >= interval.end && newRule.interval.end >= interval.end)) && newRule.interval.start != newRule.interval.end)
        })
    else return true;
}

const getIntervalsByDay = (day: number, rules: Rule[]) => {
    return rules.map(rule => {
        if(rule.day === day)
            return rule.interval;
    }).filter(interval => { return interval !== undefined})
}

const getIntervalsByDate = (date: string, rules: Rule[]) => {
    return rules.map(rule => {
        if(rule.date === date)
            return rule.interval;
    }).filter(interval => { return interval !== undefined})
}

const compare = ( a, b ) =>  { //ordenar os intervalos dps.
    if ( a.last_nom < b.last_nom ){
      return -1;
    }
    if ( a.last_nom > b.last_nom ){
      return 1;
    }
    return 0;
  }
  