import express, {NextFunction, Request, Response} from "express"
import {loadEnv} from "./loadEnv";
import {ETLRouter} from "./route/ETLRouter";

loadEnv()


const PORT = process.env.PORT || 3000

function initializeServer() {

    const app = express()
    app.use(ETLRouter)
    return {app}
}


const {app} = initializeServer()

if (process.env.LOCAL === "true") {
    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}`)
    })
}

module.exports = app