import { ReturnModelType } from "@typegoose/typegoose"

export const getSearchQuery = (fields, q) => {
    if (!q || q.length <= 0) {
        return {}
    }
    return {
        $or: fields.map(f => ({ [f]: new RegExp(q, "i") })),
    }
}

export const count = fields => {
    return function(q) {
        const query = {
            $or: fields.map(f => ({ [f]: new RegExp(q, "i") })),
        }
        return this.countDocuments(query)
    }
}

export const add = fields => {
    return function(newFields) {
        const populatedFields = {}
        fields.forEach(field => (populatedFields[field] = newFields[field]))
        const newDoc = new this({ ...populatedFields })
        return newDoc.save()
    }
}
