/* eslint-disable max-len */
import Rule from '../../models/Rule.model';
import Interval from '../../models/Interval.model';
import {checkConflictsByDate, checkConflictsByDay, getNewId, getAvailableHours, generateDatesWithinRange} from '../../helper';
import moment from 'moment';

export const index = (rulesDatabase: Map<number, Rule> ) => {
  try {
    return Array.from(rulesDatabase.values());
  } catch (error) {
    console.log('erro');
  }
};

export const store = (rule, rulesDatabase: Map<number, Rule>) => {
  try {
    const date: string = rule.date;
    const intervals: Interval[] = rule.intervals;

    if (date) {
      const day = +moment(date, 'DD-MM-YYYY').format('d');
      intervals.forEach((interval) => {
        const id = getNewId(rulesDatabase);
        const rule: Rule = {date: date, day: day, interval: interval};
        if (interval.end > interval.start && checkConflictsByDate(rule, rulesDatabase) && checkConflictsByDay(rule, rulesDatabase)) {
          rulesDatabase.set(id, rule);
        }
      });
    } else {
      const days: number[] = rule.days || [0, 1, 2, 3, 4, 5, 6];
      days.forEach((day) => {
        intervals.forEach((interval) => {
          const id = getNewId(rulesDatabase);
          const rule: Rule = {date: date, day: day, interval: interval};
          if (interval.end > interval.start && checkConflictsByDay(rule, rulesDatabase)) {
            rulesDatabase.set(id, rule);
          }
        });
      });
    }

    return rulesDatabase;
  } catch (e) {
    return e;
  }
};


export const availableHours = (rulesDatabase: Map<number, Rule>, firstDay: string, lastDay: string) => {
  try {
    const firstDate: any = firstDay;
    const lastDate: any = lastDay;
    if (!firstDate || !lastDate) {
      return 'Please inform valid firstDate and lastDate values.';
    }

    const dates = generateDatesWithinRange(firstDate, lastDate);

    const availableHours = getAvailableHours(dates, rulesDatabase);

    return availableHours;
  } catch (err) {
    return err;
  }
};

export const destroy = (rulesDatabase: Map<number, Rule>, id: number) => {
  if (rulesDatabase.delete(id)) {
    return ('Rule successfully deleted.');
  } else {
    return ('Rule not found. Enter a valid ID.');
  }
};
