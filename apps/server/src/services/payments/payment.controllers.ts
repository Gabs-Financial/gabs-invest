import { Request, Response } from "express";
import { HTTPSTATUS } from "../../config/statusCode.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import AnchorMiacApi from "../../providers/anchor/anchor-miac-api";
import { createBookTransferSchema, createCounterPartySchema, createNipTransferSchema, CreateTransferType, createTransferType, resolveIdentifierSchema, validateAccountSchema } from "./payment.types";
import monnifyReservedAccount from "../../providers/monnify/monnify-reserved-account";
import { BadRequestException } from "../../utils/error";
import { ErrorCode } from "../../@types/errorCode.enum";
import paymentServices from "./payment.services";
import { TransferType } from "../../providers/anchor/anchor.types";




class PaymentController {


    public fetchBankListController = asyncHandler(async (req: Request, res: Response) => {


        const response = await AnchorMiacApi.fetchBankList()

        const { data }: { data: { id: string; attributes: { name: string; nipCode: string } }[] } = response.data;

        const formattedData = data.map((bank: { id: string; attributes: { name: string; nipCode: string } }) => {
            return {
                id: bank.id,
                label: bank.attributes.name,
                value: bank.attributes.nipCode,
            };
        })

        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Bank List fetched successfully",
            data: formattedData,
        })

    })


    public validateBankAccount = asyncHandler(async (req: Request, res: Response) => {

        const data = validateAccountSchema.parse({ ...req.query })


        try {
            const response = await monnifyReservedAccount.validateBankAccount({ accountNumber: data.accountNumber, bankCode: data.bankCode })

            if (response.data?.responseMessage !== 'success') {
                throw new BadRequestException("Failed to validate account", ErrorCode.BAD_REQUEST)

            }

            const { accountNumber, accountName, bankCode } = response.data?.responseBody

            return res.status(HTTPSTATUS.CREATED).json({
                success: true,
                message: "Account validated succesfully",
                data: {
                    accountNumber,
                    accountName,
                    bankCode
                },
            })

        } catch (error) {
            console.log(error, "Validate account failure")
            throw new BadRequestException("Failed to resolve account", ErrorCode.BAD_REQUEST)
        }




    })

    public nipTransferController = asyncHandler(async (req: Request, res: Response) => {

        // const {accountName, accountNumber, bankCode, amount, type,bankName, reason, saveBeneficiary, counterPartyId, senderAccountId} = createNipTransferSchema.parse({...req.body})
        const data = createNipTransferSchema.parse({...req.body})
        const userId = req.user.id

        const responseData = await paymentServices.createNIPTransfer(data,userId )


        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Transfer processing ",
            data: responseData
        })


    })

    public bookTransferController = asyncHandler(async (req: Request, res: Response)  => {

        const data = createBookTransferSchema.parse({...req.body})
        const userId = req.user.id

        const response = await paymentServices.createBookTransfer(data,userId)


        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Transfer processing ",
            data: response
        })



    })

    public resolveAccountIndetifier = asyncHandler(async(req: Request, res: Response) => {

        const data = resolveIdentifierSchema.parse({...req.body})

        const accountData = await paymentServices.resolveAccountIdentifier(data)


        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Resolved account data succesfully ",
            data: accountData
        })

    })
  

    public createCounterParty = asyncHandler(async (req: Request, res: Response) => {

        const {accountName, accountNumber, bankCode,verifyName} = createCounterPartySchema.parse({...req.body})


        const response = await paymentServices.createCounterParty({
            accountName,
            accountNumber,
            bankCode,
            verifyName:true
        })

        return res.status(HTTPSTATUS.CREATED).json({
            success: true,
            message: "Counterparty created successfully",
            data: response,
        })


    })
}


const paymentController = new PaymentController
export default paymentController