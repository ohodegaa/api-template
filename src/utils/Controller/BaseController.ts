import express, { Request, NextFunction, Response } from "express"
import _ from "lodash"
import { DocumentType } from "@typegoose/typegoose"
import HttpException from "../../exceptions/HttpException"
import { Router } from "express"
import { QueryPopulateOptions } from "mongoose"
import { BaseModelType } from "../Schema"
import { logError } from "../logging"

export interface Controller {
    router: Router
    path: string
}

abstract class BaseController<T extends BaseModelType> implements Controller {
    public populateFields: (string | QueryPopulateOptions)[]
    public router: express.Router = express.Router()
    public abstract path: string
    public abstract model: T
    public abstract displayName?: string
    public abstract collectionName?: string

    protected constructor(populateFields: (string | QueryPopulateOptions)[] = []) {
        this.populateFields = populateFields
    }

    public abstract init(): void

    public add = (req: Request, res: Response, next: NextFunction): void => {
        const { body } = req
        const document = new this.model(body)
        document
            .save()
            .then((savedDocument: DocumentType<T>) => {
                let field
                for (field of this.populateFields) {
                    savedDocument.populate(field)
                }
                return savedDocument.execPopulate()
            })
            .then((populatedDocument: DocumentType<T>) => {
                res.locals.populatedDocument = { ...populatedDocument.toJSON() }

                res.status(200).json({
                    messages: [{ type: "success", message: this.addSuccessMessage(populatedDocument) }],
                    data: { [`${this.collectionName}`]: populatedDocument },
                })
            })
            .catch(err => {
                logError("Error in controller add: " + err)
                next(new HttpException({ message: `En feil oppstod ved opprettelse av en ny ${this.displayName}` }))
            })
    }

    public addSuccessMessage = (savedDocument: DocumentType<T>): string => {
        return `${this.displayName} successfully created`
    }

    public findAll = (req: Request, res: Response, next: NextFunction): void => {
        const filters = this.getFiltersFromRequest(req)
        const { page = 0, count = 50 } = req.query
        const skips = count * page
        this.model.getQuery(req.query.search).then(searchQuery => {
            return this.model
                .find({ ...filters, ...searchQuery })
                .skip(skips)
                .limit(count)
                .populate(this.populateFields.join(" "))
                .lean()
                .exec()
                .then((foundDocuments: DocumentType<T>[]) => {
                    return {
                        data: {
                            [`${this.collectionName}s`]: foundDocuments,
                        },
                    }
                })
                .then(results => {
                    res.status(200).json({ ...results })
                })
                .catch(err => {
                    console.log(err)
                    next(new HttpException({ message: `En feil oppstod ved uthentingen av alle ${this.displayName}` }))
                })
        })
    }

    public getFiltersFromRequest = (req: Request) => {
        const filters: any = { ...req.query }
        delete filters.search
        delete filters.page
        delete filters.count
        return filters
    }

    public findOne = (req: Request, res: Response, next: NextFunction): void => {
        const {
            params: { id },
        } = req
        this.model
            .findById(id)
            .exec()
            .then((foundDocument: DocumentType<T> | null) => {
                return {
                    data: {
                        [`${this.collectionName}`]: foundDocument,
                    },
                }
            })
            .then(results => {
                res.status(200).json({ ...results })
            })
            .catch(err => {
                next(new HttpException({ message: `En feil oppstod ved uthenting av ${this.displayName}` }))
            })
    }
    public update = (req: Request, res: Response, next: NextFunction): void => {
        const {
            params: { id },
            body,
        } = req
        const newobj = {}
        Object.keys(body).forEach(key => {
            if (typeof body[key] === "object") {
                Object.keys(body[key]).forEach(subkey => {
                    if (typeof body[key][subkey] === "object") {
                        Object.keys(body[key][subkey]).forEach(subsubkey => {
                            newobj[key + "." + subkey + "." + subsubkey] = body[key][subkey][subsubkey]
                        })
                    } else {
                        newobj[key + "." + subkey] = body[key][subkey]
                    }
                })
            } else {
                newobj[key] = body[key]
            }
        })
        this.model
            .findOneAndUpdate({ _id: id }, { ...newobj }, { new: true })
            .exec()
            .then((updatedDocument: DocumentType<T> | null) => {
                return {
                    messages: [
                        {
                            type: "success",
                            message: `${this.displayName} successfully updated`,
                        },
                    ],
                    data: {
                        [`${this.collectionName}`]: updatedDocument,
                    },
                }
            })
            .then(results => {
                res.status(200).json({ ...results })
            })
            .catch(err => {
                next(new HttpException({ message: `En feil oppstod ved oppdatering av ${this.displayName}` }))
            })
    }

    public remove = (req: Request, res: Response, next: NextFunction): void => {
        const {
            params: { id },
        } = req
        this.model
            .findByIdAndDelete(id)
            .exec()
            .then((removedDocument?: DocumentType<T> | null) => {
                if (!removedDocument) {
                    next(
                        new HttpException({
                            status: 404,
                            message: `${_.upperFirst(this.displayName)} med id ${id} finnes ikke og kan ikke slettes.`,
                        }),
                    )
                } else {
                    res.status(200).json({
                        messages: [
                            {
                                type: "success",
                                message: this.removeSuccessMessage(removedDocument),
                            },
                        ],
                    })
                }
            })
            .catch(err => {
                next(new HttpException({ message: `En feil oppstod ved sletting av ${this.displayName}` }))
            })
    }
    public removeSuccessMessage = (removedDocument: DocumentType<T>): string => {
        return `${this.displayName} med id ${removedDocument.id} er slettet`
    }
}

export default BaseController
