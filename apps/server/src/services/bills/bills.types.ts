import {z} from "zod"



export const airtimePurchaseSchema = z.object({
    type:z.literal("airtime"),
    phoneNumber: z.string(),
    provider: z.string(),
    accountId:z.string(),
    amount: z.number()
})


export const dataPurchaseSchema = z.object({
    type: z.literal("data"),
    phoneNumber: z.string(),
    provider: z.string(),
    accountId: z.string(),
    productSlug: z.string(),
    amount: z.number()

})


export type AirtimePaymentType = z.infer<typeof airtimePurchaseSchema>
export type DataPaymentType = z.infer<typeof dataPurchaseSchema>