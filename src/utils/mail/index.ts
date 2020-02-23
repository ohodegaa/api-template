import sgMail from "@sendgrid/mail"
export * from "./sendMail"

const { SENDGRID_API_KEY } = process.env
if (!SENDGRID_API_KEY) {
    throw new Error("It seems you have forgotten to set the Sendgrid Api key in your .env file")
}
sgMail.setApiKey(SENDGRID_API_KEY)
