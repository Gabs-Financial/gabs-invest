import { z } from "zod";

export const createBeneficiarySchema = z.object({
    accountNumber: z.string(),
    accountName: z.string(),
    bankName: z.string(),
    bankCode: z.string(),
})

export type CreateBeneficiary = z.infer<typeof createBeneficiarySchema> 