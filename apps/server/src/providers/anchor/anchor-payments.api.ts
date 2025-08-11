import { AxiosResponse } from "axios";
import { BadRequestException } from "../../utils/error";
import { systemLogger } from "../../utils/logger";
import { AnchorBaseClass } from "./anchor-base";
import { AnchorBookTransfer, AnchorTransferType, CreateCounterPartyType } from "./anchor.types";


class AnchorPaymentsApi extends AnchorBaseClass {

    constructor() {
        super()
    }



    public async createNipTransfer(data: AnchorTransferType) {

        try {

            const payload = {
                data: {
                    type: data.type,
                    attributes: {
                        amount: data.amount,
                        currency: data.currency,
                        reason: data.reason,
                        reference: data.reference
                    },
                    relationships: {
                        account: {
                            data: {
                                type: data.accountType,
                                id: data.accountId
                            }
                        },
                        counterParty: {
                            data: {
                                type: "CounterParty",
                                id: data.counterPartyId
                            }
                        }
                    }
                }
            }


            const response = await this.axios.post("/transfers", JSON.stringify(payload))

            return response

        } catch (error) {
            console.log(error)
            systemLogger.error("Error creating counter party", error)
            throw new BadRequestException("Failed to make transfer")
        }

    }


    public async verifyTransfer(transferId: string) {

        try {

            const response = await this.axios.get(`/transfers/verify/${transferId}`)

            return response

        } catch (error) {
            console.log(error)
            systemLogger.error("Error verifying transfer", error)
            throw new BadRequestException("Failed to verify transfer")
        }

    }


    public async createBookTransfer(data:AnchorBookTransfer) {


            const payload = {
                data:{
                    type: data.type,
                    attributes:{
                        amount: data.amount,
                        currency: data.currency,
                        reason: data.reason,
                        reference: data.reference
                    },
                    relationships: {
                        destinationAccount:{
                            data:{
                                type: data.destinationAccountType,
                                id: data.destinationAccountId
                            }
                        },
                        account: {
                            data:{
                                type: data.accountType,
                                id: data.accountId
                            }
                        }
                    }
                }
            }


            const response = await this.axios.post("/transfers",JSON.stringify(payload))

            console.log(response.data.data, "direct errors be this ")

            return response 

    

    }


    public async resolveAccount(data: {BankCode:string, accountNumber:string}):Promise<AxiosResponse> {

        const response: AxiosResponse = await this.axios.get(`/payments/verify-account/${data.BankCode}/${data.accountNumber}`);
        return response;

    }
}


export default AnchorPaymentsApi



