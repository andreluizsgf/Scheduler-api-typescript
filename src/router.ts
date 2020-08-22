import * as express from 'express'
import cors from 'cors'
import Rule from './models/Rule';
import Interval from './models/Interval'
import { writeJson, readJson, checkConflictsByDate, checkConflictsByDay, getNewId } from './helper'
import path from 'path'
import moment from 'moment'
import { DATABASE_JSON } from './paths.consts'\
import _ from 'lodash'

class Router {

    constructor(server: express.Express) {
        const router = express.Router()

        //const rules = new Map<string, Cat>();
        const rules = [];

        //get all rules
        router.route('/rules')
        
            .get(cors(), (req: express.Request, res: express.Response) => {
                try {
                    readJson(path.join(DATABASE_JSON))
                        .then((rulesJson) => {
                            
                            res.json({
                                rulesJson
                            })
                        })
                } catch (error) {
                    
                }
            })

        //create new cat
            .post(cors(), async (req: express.Request, res: express.Response) => {
                try {
                    readJson(path.join(DATABASE_JSON))
                        .then((rulesJson) => {
                            const date: string = req.body.date
                            const intervals: Interval[] = req.body.intervals
            
                            if(date){
                                const day = +moment(date, 'DD-MM-YYYY').format('d')
                                intervals.forEach(interval => {
                                    const id = getNewId(rulesJson)
                                    const rule: Rule = { id: id, date: date, day: day, interval: interval }
                                    if(checkConflictsByDate(rule, rulesJson) && checkConflictsByDay(rule, rulesJson))
                                        rulesJson.push(rule)
                                });
                            } else {
                                const days: number[] = req.body.days || [0, 1, 2, 3, 4, 5, 6, 7]
                                days.forEach(day => {
                                    intervals.forEach(interval => {
                                        const id = getNewId(rulesJson)
                                        const rule: Rule = { id: id, date: req.body.date, day: day, interval: interval}
                                        if(checkConflictsByDay(rule, rulesJson))
                                            rulesJson.push(rule)
                                    });
                                });
                            }
                            
                            writeJson(rulesJson, DATABASE_JSON)
            
                            res.json({
                                uuid: 0
                            })
                        })
                } catch (e) {
                    res.status(400).send(JSON.stringify({ "error": e }));
                }
            })

            router.delete('/rules/:id', cors(), (req: express.Request, res: express.Response) => {
                const id = +req.params.id
                const a = undefined
                readJson(path.join(DATABASE_JSON))
                    .then((rulesJson: Rule[]) => {
                        
                        const rules = rulesJson.filter(rule => { return rule.id !== id})

                        writeJson(rules, DATABASE_JSON)
                        
                        res.json({
                            uuid: req.params.id
                        })
                    })
            });
        /*
        //get cat by id
        router.get('/rules/:id', cors(), (req: express.Request, res: express.Response) => {
            if (!!rules[req.params.id]) {
                res.json({
                    cat: rules[req.params.id]
                })
            } else {
                res.status(404).send(JSON.stringify({ "error": "no such cat" }));
            }
        })

        //update cat
        router.put('/rules/:id', cors(), (req: express.Request, res: express.Response) => {
            try {
                if (!!rules[req.params.id]) {
                    let cat: Cat = {} as Cat;
                    Object.assign(cat, req.body)
                    rules[req.params.id] = cat;
                    res.json({
                        cat: rules[req.params.id]
                    })
                } else {
                    res.status(404).send(JSON.stringify({ "error": "no such cat" }));
                }
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": "problem with posted data" }));
            }
        })

        //delete cat
        router.delete('/rules/:id', cors(), (req: express.Request, res: express.Response) => {
            if (!!rules[req.params.id]) {
                delete rules[req.params.id]
                res.json({
                    uuid: req.params.id
                })
            } else {
                res.status(404).send(JSON.stringify({ "error": "no such cat" }));
            }
        });*/

        router.options('*', cors());

        server.use('/', router)
    }
}

export default Router;