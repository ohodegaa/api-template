import chalk from "chalk"

export const logSuccess = (msg: string): void => console.log(chalk.bold.rgb(0, 180, 0)(msg))
export const logError = (msg: string): void => console.log(chalk.bold.red(msg))
export const logWarning = (msg: string): void => console.log(chalk.bold.yellow(msg))
export const logInfo = (msg: string): void => console.log(chalk.bold.blue(msg))
