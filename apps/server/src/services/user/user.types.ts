import { z } from "zod";

export const UserProfileDataSchema = z.object({

    firstName: z.string(),
    lastName: z.string(),
    middleName: z.string().optional(),
    dob: z.string(),
    gender: z.enum(['male', "female"])
});

export const UserEmailAndPasswordSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});


export const UserAddressTypeSchema = z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
});

export const AddBvnTypeSchema =z.object({
    bvn: z.string().length(11)
})


export const UserTransactionPin = z.object({
    bvn: z.string().length(4)
})


export const providersSchema = z.object({
    anchor_provider_id: z.string().optional(),
    monnify_provider_id: z.string().optional()
    
})

// Infer TypeScript types from Zod schemas
export type UserProfileType = z.infer<typeof UserProfileDataSchema>;
export type UserAddressType = z.infer<typeof UserAddressTypeSchema>;
export type AddBvnType = z.infer<typeof AddBvnTypeSchema>
export type UserEmailAndPasswordType = z.infer<typeof UserEmailAndPasswordSchema>
export type ProvidersType = z.infer<typeof providersSchema>