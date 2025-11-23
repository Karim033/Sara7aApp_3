import { EventEmitter } from "node:events";
import { emailSubject, sendEmail } from "../Emails/email.utils.js";
import { template } from "../Emails/generateHTML.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.confirmEmail,
    html: template(data.otp, data.firstName),
  }).catch((err) => {
    console.log(`Error in Sending Confirmation Email: ${err}`);
  });
});

eventEmitter.on("forgetPassword", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.resetPassword,
    html: template(data.otp, data.firstName, emailSubject.resetPassword),
  }).catch((err) => {
    console.log(`Error in Sending Confirmation Email: ${err}`);
  });
});
