import * as express from 'express'
import Rule from '../../models/Rule.model';
import Interval from '../../models/Interval.model'
import { writeJson, readJson, checkConflictsByDate, checkConflictsByDay, getNewId, getAvailableHours, generateDatesWithinRange } from '../../helper'
import moment from 'moment'


export const index = (rulesDatabase) => {
    try {        
        return Array.from(rulesDatabase.values())
            
    } catch (error) {
        console.log('erro')
    }
}

export const store = (rule, rulesDatabase) => {
    try {
        const date: string = rule.date
        const intervals: Interval[] = rule.intervals

        if(date){
            const day = +moment(date, 'DD-MM-YYYY').format('d')
            intervals.forEach(interval => {
                const id = getNewId(rulesDatabase)
                const rule: Rule = { date: date, day: day, interval: interval }
                if(interval.end > interval.start && checkConflictsByDate(rule, rulesDatabase) && checkConflictsByDay(rule, rulesDatabase))
                rulesDatabase.set(id, rule)
            });
        } else {
            const days: number[] = rule.days || [0, 1, 2, 3, 4, 5, 6]
            days.forEach(day => {
                intervals.forEach(interval => {
                    const id = getNewId(rulesDatabase)
                    const rule: Rule = { date: date, day: day, interval: interval}
                    if(interval.end > interval.start && checkConflictsByDay(rule, rulesDatabase))
                    rulesDatabase.set(id, rule)
                });
            });
        }
        
        return rulesDatabase;
            
    } catch (e) {
        return e;
    }
}
/*
export const availableHours = (req: express.Request, res: express.Response) => {
    try {
        const firstDate: any = req.query.firstDay;
        const lastDate: any = req.query.lastDay;
        
        readJson(DATABASE_JSON)
            .then((rulesJson) => {
                const dates = generateDatesWithinRange(firstDate, lastDate)

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
*/