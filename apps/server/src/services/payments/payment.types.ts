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
    reason: z.string().optional(),
})


export const createNipTransferSchema = createTransferType.extend({
    bankName: z.string(),
    bankCode: z.string(),
    accountName: z.string(),
    accountNumber: z.string(),
    counterPartyId: z.string(),
    saveBeneficiary: z.boolean().optional(),
    senderAccountId: z.string(),
})

export const createBookTransferSchema = createTransferType.extend({
    destinationAccountId: z.string(),
    destinationAccountType: accountType.optional(),
})

export const resolveIdentifierSchema = z.object({
    identifier: z.enum(["tag", "phoneNumber", "accountNumber"]),
    value: z.string({message: "Value is required"})
})




export const createCounterPartySchema = z.object({
    accountName: z.string(),
    accountNumber: z.string(),
    bankCode: z.string(),
    verifyName: z.boolean().optional()
})

export type CreateNipTransferType = z.infer<typeof createNipTransferSchema>
export type CreateBookTransferType = z.infer<typeof createBookTransferSchema>


export type CreateTransferType<T extends TransferType> =
    T extends "NIPTransfer" ? CreateNipTransferType :
    T extends "BookTransfer" ? CreateBookTransferType :
    never;



export type ValidaAccountType = z.infer<typeof validateAccountSchema>

export type AccountIdentifier = 'tag' | "phoneNumber"  | "accountNumber"