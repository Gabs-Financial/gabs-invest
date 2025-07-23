import { z } from "zod"
import { AnchorBookTransfer, AnchorTransferType, TransferType } from "../../providers/anchor/anchor.types"



export const validateAccountSchema = z.object({
    accountNumber: z.string(),
    bankCode: z.string()
})

const accountType = z.enum(["DepositAccount", "VirtualNuban", "SubAccount"])

export const createTransferType = z.object({
    type: z.enum(["NIPTransfer", "BookTransfer"]),
    amount: z.number(),
    currency: z.literal("NGN").optional(),
    reason: z.string().optional(),
    id: z.string(),
    save_beneficiary: z.boolean().optional()
})


export const createNipTransferSchema = createTransferType.extend({
    accountId: z.string(),
    accountType: accountType,
    bankName: z.string(),
    bankCode: z.string(),
    accountName: z.string(),
    accountNumber:z.string()
})

export const createBookTransferSchema = createTransferType.extend({
    destinationAccountId: z.string(),
    destinationAccountType: accountType,
    accountId: z.string(),
    accountType: accountType,
})

// "data": {
//     "type": "CounterParty",
//         "attributes": {
//         "accountName": "string",
//             "accountNumber": "string",
//                 "bankCode": "string",
//                     "verifyName": true
//     },


export const createCounterPartySchema = z.object({
    accountName: z.string(),
    accountNumber: z.string(),
    bankCode:z.string(),
    verifyName:z.boolean().optional()
})

export type CreateNipTransferType = z.infer<typeof createNipTransferSchema>
export type CreateBookTransferType = z.infer<typeof createBookTransferSchema>


export type CreateTransferType<T extends TransferType> =
    T extends "NIPTransfer" ? CreateNipTransferType :
    T extends "BookTransfer" ? CreateBookTransferType :
    never;



export type ValidaAccountType = z.infer<typeof validateAccountSchema>