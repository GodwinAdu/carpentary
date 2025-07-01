
import nodemailer from 'nodemailer';
import { SendMailOptions } from 'nodemailer';

export async function wrappedSendMail(mailOptions: SendMailOptions) {
    return new Promise((resolve) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USER!,
                pass: process.env.SMTP_PASS!,
            },
        })

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("error is " + error);
                resolve(false); // or use rejcet(false) but then you will have to handle errors
            }
            else {
                console.log('Email sent: ' + info.response);
                resolve(true);
            }
        });
    })
}