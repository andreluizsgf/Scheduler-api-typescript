import * as express from 'express'
import cors from 'cors'
import { index, store, availableHours, destroy } from './controllers/RuleController'

class Router {
    constructor(server: express.Express) {
        const router = express.Router()

        //get all rules
        router.route('/rules')
            .get(cors(), index)
            .post(cors(), store)
            router.get('/rules/hours', cors(), availableHours);
            router.delete('/rules/:id', cors(), destroy);

        router.options('*', cors());

        server.use('/', router)
    }
}

export default Router;