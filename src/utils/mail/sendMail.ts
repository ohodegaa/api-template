import sgMail from "@sendgrid/mail"

export const sendMailWithTemplate = (from, to, templateData, templateId) => {
    const message = {
        from,
        to,
        templateId: templateId,
        // eslint-disable-next-line @typescript-eslint/camelcase
        dynamic_template_data: {
            ...templateData,
        },
    }

    return sgMail.send(message)
}
