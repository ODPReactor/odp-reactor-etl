import express, {NextFunction, Request, Response} from "express"
import {loadEnv} from "./loadEnv";
import {QueryRouter} from "./route/QueryRouter";
import cors from "cors"

loadEnv()


const PORT = process.env.PORT || 3000

function initializeServer() {

    const app = express()


    let whitelist = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []

    app.use(cors({
        origin: function(origin, callback){
        // allow requests with no origin 
            if(!origin) return callback(null, true);
            if(whitelist.indexOf(origin) === -1){
                var message = '[!] The CORS policy for this origin doesn\'t ' +
                    'allow access from the particular origin.';
                return callback(new Error(message), false);
            }
            return callback(null, true);
        }
    }));


    app.use(QueryRouter)
    return {app}
}



const {app} = initializeServer()

if (process.env.LOCAL === "true") {
    app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}`)
    })
}

module.exports = app
