import BaseController from "../../../utils/Controller"
import { ExampleModel } from "./Example.model"

class ExampleController extends BaseController<typeof ExampleModel> {
    public collectionName = "example"
    public displayName = "example"
    public model: typeof ExampleModel = ExampleModel
    public path = "/example"

    constructor() {
        super()
        this.init()
    }

    init(): void {
        this.router.get(this.path, this.findAll)
    }
}

export default ExampleController
