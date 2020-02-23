import BaseSchema from "../../../utils/Schema"
import { getModelForClass, prop } from "@typegoose/typegoose"
import { IsString } from "class-validator"

class Example extends BaseSchema {
    @IsString()
    @prop({ required: true })
    public textProperty: string
}

export const ExampleModel = getModelForClass(Example)
