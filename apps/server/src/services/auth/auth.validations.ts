import { platform } from "os";
import { z } from "zod";

export const registrationValidationSchema = z.object({
    phoneNumber: z.string(),
})

export const phoneNumberVerificationValidation = z.object({
    phoneNumber: z.string(),
    otp: z.string().length(6),
})


export const passcodeVerificationValidation = z.object({
    passcode: z.string().length(6)
})


export const pinValidation = z.object({
    pin: z.string().length(4)
})





export type PasscodeVerificationType = z.infer<typeof passcodeVerificationValidation>