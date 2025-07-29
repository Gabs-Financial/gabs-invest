import { Request, Response } from "express";
import { HTTPSTATUS } from "../../config/statusCode.config";
import { asyncHandler } from "../../middlewares/asyncHandler";
import AnchorMiacApi from "../../providers/anchor/anchor-miac-api";
import { createBookTransferSchema, createCounterPartySchema, createNipTransferSchema, CreateTransferType, createTransferType, validateAccountSchema } from "./payment.types";
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
            data: {}
        })


    })


    public createTransferController = asyncHandler(async (req: Request, res: Response) => {

        const data = createTransferType.parse({ ...req.body })

        const user = req.user

            try {

                let payload: CreateTransferType<typeof data.type>

                if (data.type === "NIPTransfer") {

                    const {id, accountId, accountType, amount, currency, type, reason, accountNumber, bankName, accountName, bankCode ,save_beneficiary} = createNipTransferSchema.parse({ ...data })

                    payload = {
                        accountId,
                        accountType,
                        amount,
                        currency: currency as "NGN",
                        type,
                        reason,
                        accountNumber,
                        bankName,
                        id,
                        accountName,
                        bankCode,
                        save_beneficiary
                    }

                } else if (data.type === "BookTransfer") {
                    const {id, accountId, accountType, amount, destinationAccountId, destinationAccountType, type, currency, reason, save_beneficiary } = createBookTransferSchema.parse({ ...data })

                    payload = {
                        id,
                        accountId,
                        accountType,
                        destinationAccountId,
                        destinationAccountType,
                        amount,
                        currency: currency as "NGN",
                        type,
                        save_beneficiary
                    }
                } else {
                    throw new BadRequestException("Invalid transfer type", ErrorCode.BAD_REQUEST)
                }



                await paymentServices.createTransfer(payload, data.type, user.id)


                res.status(HTTPSTATUS.CREATED).json({
                    success: true,
                    message: "Transfer created successfully",
                })

                
            } catch (error) {
                throw new BadRequestException("Failed to create transfer", ErrorCode.BAD_REQUEST)
            }


    })

    public createCounterParty = asyncHandler(async (req: Request, res: Response) => {

        const {accountName, accountNumber, bankCode,verifyName} = createCounterPartySchema.parse({...req.body})

        console.log("running the counter party in the controller")

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