import * as express from 'express'
import Rule from '../models/Rule.model';
import Interval from '../models/Interval.model'
import { writeJson, readJson, checkConflictsByDate, checkConflictsByDay, getNewId, getAvailableHours, generateDatesWithinRange } from '../helper'
import moment from 'moment'
import { DATABASE_JSON } from '../paths.consts'

export const index = (req: express.Request, res: express.Response) => {
    try {
        readJson(DATABASE_JSON)
            .then((rulesJson) => {
                const rules = Array.from(rulesJson.values())
                return res.status(200).json({
                    message: "Listing all rules.",
                    status: true,
                    rules: rules
                });
            })
    } catch (error) {
        res.status(400).send(JSON.stringify({ "error": error }));
    }
}

export const store = (req: express.Request, res: express.Response) => {
    try {
        readJson(DATABASE_JSON)
            .then((rulesJson) => {
                const date: string = req.body.date
                const intervals: Interval[] = req.body.intervals
                const errors: Rule[] = []

                if(date){
                    const day = +moment(date, 'DD-MM-YYYY').format('d')
                    intervals.forEach(interval => {
                        const id = getNewId(rulesJson)
                        const rule: Rule = { date: date, day: day, interval: interval }
                        if(checkConflictsByDate(rule, rulesJson) && checkConflictsByDay(rule, rulesJson))
                            rulesJson.set(id, rule)
                        else
                            errors.push(rule)
                    });
                } else {
                    const days: number[] = req.body.days || [0, 1, 2, 3, 4, 5, 6]
                    days.forEach(day => {
                        intervals.forEach(interval => {
                            const id = getNewId(rulesJson)
                            const rule: Rule = { day: day, interval: interval }
                            if(checkConflictsByDay(rule, rulesJson))
                                rulesJson.set(id, rule)
                            else
                                errors.push(rule)
                        });
                    });
                }

                writeJson(rulesJson, DATABASE_JSON)
                    .then(() => {
                        if(!errors.length)
                            return res.status(201).json({
                                message: "Rules successfully created.",
                                status: true,
                            });
                        else {
                            return res.status(200).json({
                                message: "Rules successfully created.",
                                status: true,
                                conflicts: errors
                            });
                        }
                    })
            })
    } catch (e) {
        res.status(400).send(JSON.stringify({ "error": e }));
    }
}

export const availableHours = (req: express.Request, res: express.Response) => {
    try {
        const firstDate: any = req.query.firstDay;
        const lastDate: any = req.query.lastDay;
        
        if(!firstDate || !lastDate) {
            return res.status(500).json({
                message: "Problems listing available hours.",
                status: false,
                error: 'Please inform valid firstDate and lastDate values.'
            });
        }

        readJson(DATABASE_JSON)
            .then((rulesJson) => {
                const dates = generateDatesWithinRange(firstDate, lastDate)

                const availableHours = getAvailableHours(dates, rulesJson)

                return res.status(200).json({
                    message: "All available hours.",
                    status: true,
                    hours: availableHours
                });
            })
    } catch (err) {
        return res.status(400).json({
            message: "Problems listing available hours.",
            status: false,
            error: err.message
        });
    }
}

export const destroy = (req: express.Request, res: express.Response) => {
    const id = +req.params.id

    readJson(DATABASE_JSON)
        .then((rulesJson) => {
            try {
                const rule = rulesJson.get(id);
                if(rulesJson.delete(id)){
                    writeJson(rulesJson, DATABASE_JSON)
    
                    return res.status(200).json({
                        message: "Rule successfully deleted.",
                        status: true,
                        rule: rule
                    });
                }
                else {
                    res.status(500).send(JSON.stringify("Rule not found. Enter a valid ID."));
                }
            } catch (err) {
                return res.status(400).json({
                    message: "Problems deleting rule.",
                    status: false,
                    error: err.message
                });
            }
        })
}
