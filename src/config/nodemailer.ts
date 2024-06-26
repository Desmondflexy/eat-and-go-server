import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const user = process.env.GMAIL;
const pass = process.env.GMAIL_PASSWORD;
const host = process.env.GMAIL_HOST;
const port = Number(process.env.GMAIL_PORT);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: true,
  auth: { user, pass },
});

/** Utility function to send emails for the application */
function sendMail(to: string, subject: string, content: string) {
  const mailOptions = { from: user, to, subject, html: content };

  let result = false;
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error.message);
    } else {
      result = true;
      console.log(`Email sent: ${info.response}`);
    }
  });

  return result;
}

export default sendMail;
