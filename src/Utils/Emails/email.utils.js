import nodemailer from "nodemailer";

export async function sendEmail({
  to = "",
  text = "",
  html = "",
  subject = "",
  attachments = [],
  cc = "",
  bcc = "",
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Route Academy✌️😁" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
    html,
    attachments,
    cc,
    bcc,
  });
}

export const emailSubject = {
  confirmEmail: "Confirm Your Email",
  resetPassword: "Reset Your Password",
  welcome: "Welcome to Route Academy",
};
