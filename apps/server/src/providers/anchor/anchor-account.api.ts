import { ErrorCode } from "../../@types/errorCode.enum";
import { BadRequestException } from "../../utils/error";
import { systemLogger } from "../../utils/logger";
import { AnchorBaseClass } from "./anchor-base";
import type { CreateDepositAccountData } from "./anchor.types";
import axios, { AxiosResponse } from "axios";


type FetchVirtualAccount = {
    settlementAccountId?: string;
    virtualNubanId?: string
}




class AnchorAccountApi extends AnchorBaseClass {

    constructor() {
        super();
    }

    /**
     * Creates a new deposit account  .
     * @param data -  The data of the account
     * @returns The new account data
     */

    public async createDepositAccount(data: CreateDepositAccountData) {

        const payload = {
            data: {
                type: data.type,
                attributes: {
                    productName: data.accountType
                },
                relationships: {
                    customer: {
                        data: {
                            id: data.customerId,
                            type: data.customerType
                        }
                    }
                }
            }
        }


        const response: AxiosResponse = await axios.post(`/accounts`, JSON.stringify(payload));


        return response.data
    }


    public async updateAccount(): Promise<Record<string, any>> {
        return {};
    }

    public async deleteAccount(): Promise<Record<string, any>> {
        return {};
    }

    public async fetchDepositAccountNumber(settlementId: string) {


        try {
            const response = await this.axios.get(`/account-number?settlementAccountId=${settlementId}`)

            return response.data

        } catch (error: any) {
            systemLogger.error(error?.response.data)
            throw new BadRequestException("Failed to fetch Account Number")
        }


    }



}

export default AnchorAccountApi;
