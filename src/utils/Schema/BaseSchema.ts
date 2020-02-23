import { getModelWithString, modelOptions, plugin, ReturnModelType } from "@typegoose/typegoose"
import { SchemaType } from "mongoose"
import autopopulate from "mongoose-autopopulate"
type SchemaTypeInstance = "String" | "Number" | "Array" | "Date" | "ObjectID" | "Boolean"

@plugin(autopopulate)
@modelOptions({ schemaOptions: { timestamps: true } })
class BaseSchema {
    public static getSearchFields?: () => string[]

    public static getQuery(this: ReturnModelType<typeof BaseSchema>, searchValue?: string): Promise<any> {
        if (!searchValue || searchValue.length <= 0 || !this.getSearchFields) {
            return Promise.resolve({})
        }
        const promiseQueries: Promise<{ [k: string]: { $in: string[] } | { $elemMatch: { $in: string[] } } }>[] = []
        const stringQueries: { [k: string]: RegExp }[] = []
        this.getSearchFields().forEach(field => {
            const fieldObject = this.schema.path(field) as SchemaType & {
                instance?: SchemaTypeInstance
                caster?: any
            }

            if (fieldObject) {
                if (fieldObject.instance === "String") {
                    stringQueries.push({ [field]: new RegExp(searchValue, "i") })
                }
                if (fieldObject.instance === "ObjectID") {
                    const objectIdOptions = (fieldObject as any).options
                    const model: ReturnModelType<typeof BaseSchema> = getModelWithString<
                        ReturnModelType<typeof BaseSchema>
                    >(objectIdOptions.ref)

                    if (!model.getSearchFields) {
                        return
                    }
                    const subDocsQuery = {
                        $or: model.getSearchFields().map(f => ({ [f]: new RegExp(searchValue, "i") })),
                    }
                    promiseQueries.push(
                        model
                            .find(subDocsQuery)
                            .lean()
                            .exec()
                            .then(subDocs => {
                                return {
                                    [field]: {
                                        $in: subDocs.map(sd => sd._id),
                                    },
                                }
                            }),
                    )
                }
                if (fieldObject.instance === "Array" && fieldObject?.caster?.options?.ref) {
                    const ref: string = fieldObject?.caster?.options?.ref
                    const model: ReturnModelType<typeof BaseSchema> = getModelWithString(ref)
                    if (model.getSearchFields) {
                        const subDocsQuery = {
                            $or: model.getSearchFields().map(f => ({ [f]: new RegExp(searchValue, "i") })),
                        }
                        promiseQueries.push(
                            model
                                .find(subDocsQuery)
                                .lean()
                                .exec()
                                .then(subDocs => {
                                    return {
                                        [field]: { $elemMatch: { $in: subDocs.map(t => t._id) } },
                                    }
                                }),
                        )
                    }
                }
            }
        })
        return Promise.all(promiseQueries)
            .then(subDocQueries => {
                const finalQuery = { $or: [...stringQueries, ...subDocQueries] }
                if (finalQuery.$or.length <= 0) {
                    return {}
                }
                return finalQuery
            })
            .catch(err => {
                console.log(err)
            })
    }
}

export default BaseSchema

export type BaseModelType = ReturnModelType<typeof BaseSchema>
