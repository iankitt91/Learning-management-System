import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendMail = async (email, subject, data, template) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:parseInt(process.env.SMTP_PORT), 
    service:process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // load ejs template
  const templatePath = path.join(__dirname, '../emailTemplate',template);
  const html = await ejs.renderFile(templatePath, data);

  // send mail
  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: subject,
    html: html
  });
};
