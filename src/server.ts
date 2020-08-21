import app from './app'
import { mkDir, writeJson } from './helper'
import path from 'path'
import fs from 'fs'
const port = parseInt(process.env.PORT || '3333')
const databaseDir = path.join(__dirname,'../src', 'database')

const server = new app().Start(port)
  .then(port => console.log(`Server running on port ${port}`))
  .then(() => mkDir(databaseDir))
  .catch(error => {
    console.log(error)
    process.exit(1);
  });

export default server;