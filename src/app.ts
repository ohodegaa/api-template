import bodyParser from "body-parser"
import cors from "cors"
import express, { Request, Response, NextFunction } from "express"
import morgan from "morgan"
import Database from "./db"
import ProcessEnv = NodeJS.ProcessEnv
import dotenv from "dotenv"
import HttpException from "./exceptions/HttpException"
import { Controller } from "./utils/Controller"
import errorMiddleware from "./middleware/error.middleware"
import { logSuccess } from "./utils/logging"

class App {
    public app: express.Application
    public rootPath: string
    private db!: Database

    public constructor(controllers: Controller[], rootPath = "/") {
        this.app = express()
        this.rootPath = rootPath

        dotenv.config()

        this.connectToDatabase()
        this.initializeMiddleware([cors(), morgan("dev"), bodyParser.json()])
        this.initializeControllers(controllers)
        this.initializeDefaultHandler()
    }

    public listen = () => {
        const port = process.env.PORT || 8080
        this.app.listen(port, () => {
            logSuccess(`App listening on port ${port}`)
        })
    }

    private connectToDatabase = () => {
        const { DB_URL, DB_NAME, DB_USER, DB_PASS }: ProcessEnv = process.env

        this.db = new Database({ DB_NAME, DB_URL, DB_USER, DB_PASS })
        this.db.connect()
    }

    private initializeMiddleware = (middlewares: any[]) => {
        if (middlewares) {
            middlewares.map(middleware => this.app.use(middleware))
        }
    }

    private initializeControllers = (controllers: Controller[]) => {
        controllers.forEach(controller => {
            this.app.use(this.rootPath, controller.router)
        })
    }

    private initializeDefaultHandler() {
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            next(
                new HttpException({
                    message: "Not found",
                    description: `${req.method} '${req.originalUrl}' was not found.`,
                    status: 404,
                }),
            )
        }, errorMiddleware)
    }
}

export default App
