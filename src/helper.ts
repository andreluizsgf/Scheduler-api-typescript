import fs from 'fs'
import Rule from './models/Rule.model';
import Interval from './models/Interval.model';
import moment from 'moment';
import AvailableDay from './models/AvailableDay.model';
import { DATABASE_DIR, DATABASE_JSON } from './paths.consts'


const mapToJson = (map: Map<number, Rule>) => {
    return JSON.stringify([...map]);
}

const jsonToMap = (jsonStr: string): Map<number, Rule> => {
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
    return dates.map(date => {
        const day = +moment(date, 'DD-MM-YYYY').format('d')
        const intervals = getIntervalsByDay(day, rules)
        const intervalSort = intervals.sort(sortIntervals)
        const availableDay: AvailableDay = {day: date, intervals: generateAvailableIntervals(intervalSort)}
        
        return availableDay;
    })
}

export const generateDatesWithinRange = (firstDate: string, lastDate: string) => {
    console.log(firstDate, lastDate);
    
    const daysQuantity = moment(lastDate, "DD-MM-YYYY").diff(moment(firstDate, "DD-MM-YYYY"), 'days');
    
    return [...Array(daysQuantity + 1).keys()]
            .map(day => moment(firstDate, "DD-MM-YYYY")
            .add(day, 'days')
            .format('DD-MM-YYYY'));
}   

const generateAvailableIntervals = (intervals: Interval[]) => {
    const firstIntervalEnd = (intervals[0] !== undefined) ? intervals[0].start : "23:59"
    const firstInterval: Interval = {start: "00:00", end: firstIntervalEnd}
    
    const availableIntervals: Interval[] = []
    availableIntervals.push(firstInterval)

    intervals.forEach((interval, index) => {
        const start = interval.end
        const end = intervals[index+1] !== undefined ? intervals[index+1].start : "23:59"
        const availableInterval: Interval = {start: start, end: end} 
        availableIntervals.push(availableInterval)
    })

    return availableIntervals

}

export const createDatabaseDir = () => {
    if (!fs.existsSync(DATABASE_DIR)) 
        return fs.promises.mkdir(DATABASE_DIR);
    
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
            return (((newRule.interval.start <= interval.start && newRule.interval.end <= interval.start) || (newRule.interval.start >= interval.end && newRule.interval.end >= interval.end)))
        })
        
    else return true;
}

export const checkConflictsByDay = (newRule: Rule, rules: Map<number, Rule>) => {

    const intervals = getIntervalsByDay(newRule.day, rules)

    if(intervals.length)
        return intervals.every(interval => {
            return ( ((newRule.interval.start <= interval.start && newRule.interval.end <= interval.start) || (newRule.interval.start >= interval.end && newRule.interval.end >= interval.end)))
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

export const createDatabaseJson = () => {
    if (!fs.existsSync(DATABASE_JSON)) 
        return fs.open(DATABASE_JSON, 'w', (err, file) => {
            if (err) {
                throw err;
            }
        });

    return Promise.resolve(); 
}

const sortIntervals = ( intervalA: Interval, intervalB: Interval ) =>  { //ordenar os intervalos dps.
    if ( intervalA.start < intervalB.start ){
      return -1;
    }
    if ( intervalA.start > intervalB.start ){
      return 1;
    }
    return 0;
}
