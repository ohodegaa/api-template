import express from "express"
import { Controller } from "../../utils/Controller"
import ExampleController from "./Example"

class AdminController implements Controller {
    public path = "/admin"
    public router: express.Router = express.Router()

    public constructor() {
        this.init()
    }

    public init(): void {
        this.router.use(this.path, new ExampleController().router)
    }
}

export default AdminController
