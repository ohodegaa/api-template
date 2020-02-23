import { plainToClass } from "class-transformer"
import { validate, ValidationError } from "class-validator"
import * as express from "express"
import HttpException from "../exceptions/HttpException"

const flattenErrors = (errors: ValidationError[]) => {
    return errors.reduce((acc, error: ValidationError) => {
        if (error.children && error.children.length > 0) {
            return flattenErrors(error.children)
        }
        return { ...acc, [error.property]: Object.values(error.constraints).join(", ") }
    }, {})
}

const validationMiddleware = (type: any, skipMissingProperties = false): express.RequestHandler => (req, res, next) => {
    validate(plainToClass(type, req.body), { skipMissingProperties })
        .then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                const errorObj = flattenErrors(errors)
                next(new HttpException({ status: 400, fields: errorObj, message: "Feil ved innsending av skjema." }))
            } else {
                next()
            }
        })
        .catch(err => {
            console.log("Error in validation middleware: " + err)
        })
}

export default validationMiddleware
