import { z } from "zod";

export const UserEmailAndPasswordSchema = z.object({
    email: z.string().email(),
});

export const UserAddressTypeSchema = z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
});


export const bvnSchema = z.object({
    bvn: z.string().length(11, "BVN must be 11 digits")
})

export const verifyBvnWithPhone = z.object({
    code: z.string()
})

export const createPasswordShcema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter")
        .regex(/[0-9]/, "Password must include at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must include at least one special character")
})

export const passcodeSchema = z.object({
    passcode: z.string().length(6, "Passcode must be 6 digits long")
})