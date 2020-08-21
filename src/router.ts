import * as express from 'express'
import Cat from './models/Cat'
import cors from 'cors'
import RuleController from './RuleController'
import Rule from './models/Rule';
import { newId, writeJson, mkDir, checkDay } from './helper'
import path from 'path'
import { write, writeFileSync } from 'fs';
import moment from 'moment'

const days = ['Sunday', 'Monday','Tuesday' , 'Wednesday', 'Thursday', 'Friday', 'Saturday']

class Router {

    constructor(server: express.Express) {
        const router = express.Router()

        //const rules = new Map<string, Cat>();
        const rules = [];

        router.get('/', (req: express.Request, res: express.Response) => {
            res.json({
                message: `Nothing to see here, [url]/rules instead.`
            })
        })

        //get all rules
        /*
        router.get('/rules', cors(), (req: express.Request, res: express.Response) => {
            res.json({
                rules
            })
        })*/

        //create new cat
        router.post('/rules', cors(), async (req: express.Request, res: express.Response) => {
            try {
                let rule: Rule = {} as Rule;
                Object.assign(rule, req.body)
                const id = 1;
                
                await mkDir(path.join(__dirname, 'database'));

                const freq = 0
                if(freq === 0){
                    const day = moment('20-08-2020', 'DD-MM-YYYY').format('d')
                    //checkDay(day)
                }

                rules[id] = rule;
                //const serializedData = JSON.stringify(rules, null, 2);
                //writeFileSync(serializedData, path.join(__dirname, 'database', 'rules.json' ))
                writeJson(rules, path.join(__dirname, 'database', 'rules.json'))

                res.json({
                    uuid: id
                })
            } catch (e) {
                res.status(400).send(JSON.stringify({ "error": e }));
            }
        })

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
        });

        router.options('*', cors());

        server.use('/', router)
    }
}

export default Router;