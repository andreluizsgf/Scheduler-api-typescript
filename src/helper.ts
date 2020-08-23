import fs from 'fs'
import Rule from './models/Rule.model';
import Interval from './models/Interval.model';
import moment from 'moment';
import AvailableDay from './models/AvailableDay.model';
import path = require('path');
const databaseDir = path.join(__dirname,'../src', 'database')


const mapToJson = (map: Map<number, Rule>) => {
    return JSON.stringify([...map]);
}

const jsonToMap = (jsonStr): Map<number, Rule> => {
    try {
        return new Map(JSON.parse(jsonStr));
    } catch (e) {
        return new Map();
    }
  }

export const getNewId = (rules: Map<number, Rule> ) => {
    return rules.size + 1;
}

export const getAvailableHours = (dates: string[], rules: Map<number, Rule> ) => {
    const datesFromInterval = generateDates(dates)
    console.log(datesFromInterval);
    
    return datesFromInterval.map(date => {
        const day = +moment(date, 'DD-MM-YYYY').format('d')
        const intervals = getIntervalsByDay(day, rules)
        const intervalSort = intervals.sort(compare)
        const availableDay: AvailableDay = {day: date, intervals: generateAvailableIntervals(intervalSort)}
        
        return availableDay;
    })
}

const generateDates = (dates: string[]) => {
    let date = dates[0]
    const datesFromInterval: string[] = []
    while(date <= dates[1]) {
        datesFromInterval.push(date); //push every added day to an array.
        date = moment(date, "DD-MM-YYYY").add(1, 'days').format('DD-MM-YYYY'); //we use moment to add days.
    }

    return datesFromInterval
}   

const generateAvailableIntervals = (intervals: Interval[]) => {
    const edd = intervals[0] !== undefined ? intervals[0].start : "23:59"  //mudar esse nome de variavel
    const firstInterval: Interval = {start: "00:00", end: edd}
    
    const intervalss: Interval[] = [] //mudar esse nome de variavel 
    intervalss.push(firstInterval)

    intervals.forEach((interval, index) => {
        const start = interval.end
        const end = intervals[index+1] !== undefined ? intervals[index+1].start : "23:59"
        const newInterval: Interval = {start: start, end: end} 
        intervalss.push(newInterval)
    })

    return intervalss

}

export const mkDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) 
        return fs.promises.mkdir(dirPath);
    
    return Promise.resolve();
};

export const writeJson = (data: any, filepath: any)  => {
    const serializedData = mapToJson(data);
    return fs.promises.writeFile(filepath, serializedData);
};

export const readJson = (filepath: string): Promise<Map<number,Rule>> => {
    return new Promise ((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            if (err) reject(err);
            const jsonData =  jsonToMap(data.toString())
            resolve(jsonData);
        });
    });
}

export const checkConflictsByDate = (newRule: Rule, rules: Map<number, Rule>) => {
    const intervals = getIntervalsByDate(newRule.date, rules);
    if(intervals.length)
        return intervals.every(interval => {
            return (((newRule.interval.start <= interval.start && newRule.interval.end <= interval.start) || (newRule.interval.start >= interval.end && newRule.interval.end >= interval.end)) && newRule.interval.start != newRule.interval.end)
        })
        
    else return true;
}

export const checkConflictsByDay = (newRule: Rule, rules: Map<number, Rule>) => {

    const intervals = getIntervalsByDay(newRule.day, rules)

    if(intervals.length)
        return intervals.every(interval => {
            return ( ((newRule.interval.start <= interval.start && newRule.interval.end <= interval.start) || (newRule.interval.start >= interval.end && newRule.interval.end >= interval.end)) && newRule.interval.start != newRule.interval.end)
        })
    else return true;
}

const getIntervalsByDay = (day: number, rules: Map<number, Rule>) => {
    const intervals: Interval[] = [];
    
    rules.forEach(rule => {
        if(rule.day === day)
            intervals.push(rule.interval)
    })

    return intervals;
}

const getIntervalsByDate = (date: string, rules: Map<number, Rule>) => {
    const intervals: Interval[] = [];
    
    rules.forEach(rule => {
        if(rule.date === date)
            intervals.push(rule.interval)
    })

    return intervals;
}

export const createRulesJson = () => {
    if (!fs.existsSync(path.join(databaseDir,'rules.json'))) 
        return fs.open(path.join(databaseDir,'rules.json'), 'w', (err, file) => {
            if (err) {
                throw err;
            }
        });

    return Promise.resolve(); 
}

const compare = ( intervalA: Interval, intervalB: Interval ) =>  { //ordenar os intervalos dps.
    if ( intervalA.start < intervalB.start ){
      return -1;
    }
    if ( intervalA.start > intervalB.start ){
      return 1;
    }
    return 0;
}
  
