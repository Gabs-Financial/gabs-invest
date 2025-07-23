import { z } from "zod";

export const UserProfileDataSchema = z.object({

    firstName: z.string(),
    lastName: z.string(),
    middleName: z.string().optional(),
    dob: z.string(),
    gender: z.enum(['male', "female"])
});






export const AddBvnTypeSchema =z.object({
    bvn: z.string().length(11)
})

export const VerifyBvnTypeSchema =z.object({
    code: z.string().length(6),
    phoneNumber: z.string(),
})


export const UserTransactionPin = z.object({
    bvn: z.string().length(4)
})


export const providersSchema = z.object({
    anchor_provider_id: z.string().optional(),
    monnify_provider_id: z.string().optional()
    
})

export const usernameSchema = z.object({
    tag: z
        .string()
        .min(0, "Tag must be at least 3 characters")
        .max(20, "Tag must be at most 20 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Tag must contain only letters and numbers"),
});

// Infer TypeScript types from Zod schemas
export type UserProfileType = z.infer<typeof UserProfileDataSchema>;

export type AddBvnType = z.infer<typeof AddBvnTypeSchema>
export type ProvidersType = z.infer<typeof providersSchema>