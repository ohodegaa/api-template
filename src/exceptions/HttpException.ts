export interface HttpExceptionType {
    message: string
    description?: string
    status?: number
    fields?: { [fieldName: string]: string }
}

class HttpException extends Error {
    public status?: number
    public message: string
    public description?: string
    public fields?: { [fieldName: string]: string }

    public constructor(props: HttpExceptionType) {
        const { status, message, description, fields } = props
        super(message)
        this.status = status
        this.message = message
        this.description = description
        this.fields = fields
    }
}

export default HttpException
