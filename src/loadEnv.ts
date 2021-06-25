import dotenv from "dotenv";
import path from "path";

function loadEnv() {
    dotenv.config({
        path: path.join(__dirname, "../.env")
    })
}

export { loadEnv }