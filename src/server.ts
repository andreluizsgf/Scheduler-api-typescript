/* eslint-disable new-cap */
import app from './app';
import * as file from './helpers/FileHelper';
const port = parseInt(process.env.PORT || '3333');

const server = new app().Start(port)
    .then((port) => console.log(`Server running on port ${port}`))
    .then(() => file.createDatabaseDir())
    .then(() => file.createDatabaseJson())
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });

export default server;
