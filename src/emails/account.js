const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'oscar_andres5@hotmail.com',
        subject: 'Thanks for joining in',
        text: `Welcome to the app, ${name}. Let me know how get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'oscar_andres5@hotmail.com',
        subject: 'Sorry to see you go',
        text: `Dear ${name}, let us know why you delete the account.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}

