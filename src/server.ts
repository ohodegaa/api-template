import "./config"
import App from "./app"
import * as stackPrinter from "./utils/stackPrinter"
import AdminService from "./services/Admin"

const app = new App([new AdminService()], "/")

stackPrinter.print(app.app._router.stack)
app.listen()
