/* eslint-disable max-len */
import * as express from 'express';
import Rule from '../models/Rule.model';
import Interval from '../models/Interval.model';
import * as helper from '../helper';
import moment from 'moment';
import {DATABASE_JSON} from '../paths.consts';

export const index = (req: express.Request, res: express.Response) => {
  try {
    helper.readJson(DATABASE_JSON)
        .then((rulesJson) => {
          const rules = Array.from(rulesJson.values());
          return res.status(200).json({
            message: 'Listing all rules.',
            status: true,
            rules: rules,
          });
        });
  } catch (error) {
    res.status(400).send(JSON.stringify({'error': error}));
  }
};

export const store = (req: express.Request, res: express.Response) => {
  try {
    helper.readJson(DATABASE_JSON)
        .then((rulesJson) => {
          const date: string = req.body.date;
          const intervals: Interval[] = req.body.intervals;
          const errors: Rule[] = [];

          if (date) {
            const day = +moment(date, 'DD-MM-YYYY').format('d');
            intervals.forEach((interval) => {
              const id = helper.getNewId(rulesJson);
              const rule: Rule = {date: date, day: day, interval: interval};
              if (helper.checkConflictsByDate(rule, rulesJson) && helper.checkConflictsByDay(rule, rulesJson)) {
                rulesJson.set(id, rule);
              } else {
                errors.push(rule);
              }
            });
          } else {
            const days: number[] = req.body.days || [0, 1, 2, 3, 4, 5, 6];
            days.forEach((day) => {
              intervals.forEach((interval) => {
                const id = helper.getNewId(rulesJson);
                const rule: Rule = {day: day, interval: interval};
                if (helper.checkConflictsByDay(rule, rulesJson)) {
                  rulesJson.set(id, rule);
                } else {
                  errors.push(rule);
                }
              });
            });
          }

          helper.writeJson(rulesJson, DATABASE_JSON)
              .then(() => {
                if (!errors.length) {
                  return res.status(201).json({
                    message: 'Rules successfully created.',
                    status: true,
                  });
                } else {
                  return res.status(200).json({
                    message: 'Rules successfully created.',
                    status: true,
                    conflicts: errors,
                  });
                }
              });
        });
  } catch (error) {
    return res.status(400).json({
      message: 'Problems creating rules.',
      status: false,
      error: error.message,
    });
  }
};

export const availableHours = (req: express.Request, res: express.Response) => {
  try {
    const firstDate: any = req.query.firstDay;
    const lastDate: any = req.query.lastDay;

    if (!firstDate || !lastDate) {
      return res.status(500).json({
        message: 'Problems listing available hours.',
        status: false,
        error: 'Please inform valid firstDate and lastDate values.',
      });
    }

    helper.readJson(DATABASE_JSON)
        .then((rulesJson) => {
          const dates = helper.generateDatesWithinRange(firstDate, lastDate);

          const availableHours = helper.getAvailableHours(dates, rulesJson);

          return res.status(200).json({
            message: 'All available hours.',
            status: true,
            hours: availableHours,
          });
        });
  } catch (error) {
    return res.status(400).json({
      message: 'Problems listing available hours.',
      status: false,
      error: error.message,
    });
  }
};

export const destroy = (req: express.Request, res: express.Response) => {
  const id = +req.params.id;

  helper.readJson(DATABASE_JSON)
      .then((rulesJson) => {
        try {
          const rule = rulesJson.get(id);
          if (rulesJson.delete(id)) {
            helper.writeJson(rulesJson, DATABASE_JSON);

            return res.status(200).json({
              message: 'Rule successfully deleted.',
              status: true,
              rule: rule,
            });
          } else {
            return res.status(500).json({
              message: 'Rule not found. Enter a valid ID.',
              status: false,
            });
          }
        } catch (error) {
          return res.status(400).json({
            message: 'Problems deleting rule.',
            status: false,
            error: error.message,
          });
        }
      });
};
