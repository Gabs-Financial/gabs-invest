import express, {Express, urlencoded} from "express"
import * as http from "node:http";
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

const app: Express = express()

const server = http.createServer(app)


app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

export {
    app, server
}