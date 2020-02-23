import mongoose from "mongoose"
import { logError, logInfo, logSuccess, logWarning } from "../utils/logging"

class Database {
    private readonly DB_URL: string
    private readonly DB_NAME: string
    private readonly DB_USER: string
    private readonly DB_PASS: string

    public constructor(dbConfig: { DB_URL?: string; DB_NAME?: string; DB_USER?: string; DB_PASS?: string }) {
        this.DB_URL = dbConfig.DB_URL || "mongodb://localhost:27017/"
        this.DB_NAME = dbConfig.DB_NAME || "spiredb"
        this.DB_USER = dbConfig.DB_USER || ""
        this.DB_PASS = dbConfig.DB_PASS || ""
        this.initConnection()
        this.initProcess()
        this.initSettings()
    }

    public connect = () => {
        const fullUrl = this.DB_URL.replace("DB_NAME", this.DB_NAME)
            .replace("DB_USER", this.DB_USER)
            .replace("DB_PASS", this.DB_PASS)
        const secretUrl = this.DB_URL.replace("DB_NAME", this.DB_NAME)
            .replace("DB_USER", "****")
            .replace("DB_PASS", "****")
        return mongoose
            .connect(fullUrl)
            .then(() => {
                logSuccess("Mongoose default connection is open to " + secretUrl)
            })
            .catch(err => {
                logError("Mongoose default connection to " + secretUrl + " failed with error \n" + err)
            })
    }

    private initConnection = () => {
        mongoose.connection.on("disconnected", (): void => {
            logWarning("Mongoose default connection is disconnected")
        })
    }

    private initSettings = () => {
        mongoose.set("useNewUrlParser", true)
        mongoose.set("useFindAndModify", false)
    }

    private initProcess = () => {
        process.on("SIGINT", () => {
            mongoose.connection.close((): void => {
                logInfo("Mongoose default connection is disconnected due to application termination")
                process.exit(0)
            })
        })
    }
}

export default Database
