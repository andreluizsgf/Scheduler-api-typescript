/* eslint-disable new-cap */
import app from './app';
import {createDatabaseDir, createDatabaseJson} from './helper';
const port = parseInt(process.env.PORT || '3333');

const server = new app().Start(port)
    .then((port) => console.log(`Server running on port ${port}`))
    .then(() => createDatabaseDir())
    .then(() => createDatabaseJson())
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });

export default server;
