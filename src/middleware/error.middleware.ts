import { NextFunction, Request, Response } from "express"
import HttpException from "../exceptions/HttpException"

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500
    const message = error.message || "Ups! Her skjedde det noe rart..."
    const description = error.message
        ? error.description
        : "Vennligst kontakt utvikleren av denne applikasjonen for ytterligere hjelp."
    const fields = error.fields
    res.status(status).json({
        messages: [
            {
                type: "error",
                message,
                description,
                fields,
            },
        ],
    })
}

export default errorMiddleware
