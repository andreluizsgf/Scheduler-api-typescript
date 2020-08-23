import * as express from 'express'
import Rule from '../models/Rule.model';
import Interval from '../models/Interval.model'
import { writeJson, readJson, checkConflictsByDate, checkConflictsByDay, getNewId, getAvailableHours } from '../helper'
import moment from 'moment'
import { DATABASE_JSON } from '../paths.consts'

export const index = (req: express.Request, res: express.Response) => {
    try {
        readJson(DATABASE_JSON)
            .then((rulesJson) => {
                const rules = Array.from(rulesJson.values())
                res.json({
                    rules
                })
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

                if(date){
                    const day = +moment(date, 'DD-MM-YYYY').format('d')
                    intervals.forEach(interval => {
                        const id = getNewId(rulesJson)
                        const rule: Rule = { date: date, day: day, interval: interval }
                        if(checkConflictsByDate(rule, rulesJson) && checkConflictsByDay(rule, rulesJson))
                            rulesJson.set(id, rule)
                    });
                } else {
                    const days: number[] = req.body.days || [0, 1, 2, 3, 4, 5, 6, 7]
                    days.forEach(day => {
                        intervals.forEach(interval => {
                            const id = getNewId(rulesJson)
                            const rule: Rule = { date: req.body.date, day: day, interval: interval}
                            if(checkConflictsByDay(rule, rulesJson))
                                rulesJson.set(id, rule)
                        });
                    });
                }

                writeJson(rulesJson, DATABASE_JSON)
                    .then(() => {
                        res.json({
                            uuid: 0
                        })
                    })
            })
    } catch (e) {
        res.status(400).send(JSON.stringify({ "error": e }));
    }
}

export const availableHours = (req: express.Request, res: express.Response) => {
    try {
        const dates = req.body.days;

        readJson(DATABASE_JSON)
            .then((rulesJson) => {

                const availableHours = getAvailableHours(dates, rulesJson)

                return res.status(201).json({
                    message: "Rule successfully created.",
                    status: true,
                    hous: availableHours
                });
            })
    } catch (err) {
        return res.status(500).json({
            message: "Problems creating the new rule.",
            status: false,
            error: err.message
        });
    }
}

export const destroy = (req: express.Request, res: express.Response) => {
    const id = +req.params.id

    readJson(DATABASE_JSON)
        .then((rulesJson) => {
            
            if(rulesJson.delete(id)){
                writeJson(rulesJson, DATABASE_JSON)
                res.json({
                    uuid: req.params.id
                })
            }
            else {
                res.status(400).send(JSON.stringify("Regra não encontrada. Informe um ID válido"));
            }
        })
}