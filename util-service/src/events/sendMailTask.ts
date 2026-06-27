import { logger } from "../utils/logger.js";
import { transporter } from "../utils/mailerConfig.js";
import { emailVerificationTemplate, forgotPasswordTemplate, onBoardingTemplate } from "../utils/mailTemplate.js";
import { OnboardingMailMsgSchema, resetUriSchema, verificationMailMsgSchema } from "../utils/schemaValidation.js";

export const sendVerificationMailTask = async (msg: Buffer) => {
  const msgObj = await JSON.parse(msg.toString());
  const parshed = verificationMailMsgSchema.safeParse(msgObj);
  if (parshed.success !== true) {
    const errMsgArray = await JSON.parse(parshed.error.message);
    logger.warn(
      `Validation error in task msg for OTP based mail verification, ${errMsgArray[0].message}, ${errMsgArray[0].path}`,
    );
  }
  try {
    const info = await transporter.sendMail({
      from: `"SOCIAL APPLICATION" srijanspl2017@gmail.com`,
      to: parshed.data?.email,
      subject: "Email Verification via OTP",
      text: "Verify your email",
      html: emailVerificationTemplate(parshed.data?.otp!),
    });
    logger.info(
      `OTP mail sent to ${parshed.data?.email}, msgId:${info.messageId}`,
    );
  } catch (error: any) {
    logger.error(
      `Error in sendi mail to the recipient ${parshed.data?.username}, at ${parshed.data?.email}`,
    );
  }
};
export const sendOnboardingMailTask = async (msg: Buffer) => {
  const msgObj = await JSON.parse(msg.toString());
  const parshed = OnboardingMailMsgSchema.safeParse(msgObj);
  if (parshed.success !== true) {
    const errMsgArray = await JSON.parse(parshed.error.message);
    logger.warn(
      `Validation error in task msg for OTP based mail verification, ${errMsgArray[0].message}, ${errMsgArray[0].path}`,
    );
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"SOCIAL APPLICATION" srijanspl2017@gmail.com`,
      to: parshed.data?.email,
      subject: "Onboarding Mail",
      text: "Welcome to Social Application",
      html: onBoardingTemplate(parshed.data?.username!, parshed.data?.verificationLink!)
    });
    logger.info(
      `Onboarding mail sent to ${parshed.data?.email}, msgId:${info.messageId}`,
    );
  } catch (error: any) {
    logger.error(
      `Error in sendi onboarding mail to the recipient ${parshed.data?.username}, at ${parshed.data?.email}`,
    );
  }
};
export const sendForgotPasswordMailTask = async (msg: Buffer) => {
  const msgObj = await JSON.parse(msg.toString());
  const parshed = resetUriSchema.safeParse(msgObj);
  if(parshed.success === false ){
    const errMsgArray = await JSON.parse(parshed.error.message);
    logger.warn(`Validation error in forgot password mail task, ${errMsgArray[0].message}, ${errMsgArray[0].path}`)
    return
  }
  const {resetUri, username, email} = parshed.data;
  try {
    const info = await transporter.sendMail({
      to:email,
      from:`"SOCIAL APPLICATION" srijanspl2017@gmail.com`,
      subject:"RESET PASSWORD",
      text:`Reset password magic link for ${username}`,
      html:forgotPasswordTemplate(resetUri)
    })
    logger.info(
      `Reset password mail sent to ${email}, msgId:${info.messageId}`,
    );
  } catch (error) {
    logger.error(
      `Error in sending reset passwword mail to the recipient ${username}, at ${email}`,
    );
  }
};
