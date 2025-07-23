import { BadRequestException } from "../../utils/error";
import { generateRef } from "../../utils/generateRef";
import { systemLogger } from "../../utils/logger";
import { AnchorBaseClass } from "./anchor-base";
import {  BillPurchaseType, CategoryTypes, DataPurchaseOptions, PaymentCatgoriesType } from "./anchor.types";






class AnchorBillsApi extends AnchorBaseClass {


    constructor() {
        super()
    }

    public async getBillProviders(category: CategoryTypes): Promise<Array<{ provider_id: string; name: string; category: string; slug: string }>> {

        const response = await this.axios.get(`/bills/billers?category=${category}`);

        const { data } = response.data;

        const formattedBillProviders = data?.map((i: any) => {
            return {
                provider_id: i.id,
                name: i.attributes.name,
                category: i.attributes.category,
                slug: i.attributes.slug
            };
        });

        return formattedBillProviders;

    }

    public async getBillProvidersProducts(billProviderId: string) {

        const response = await this.axios.get(`bills/billers/${billProviderId}/products`)

        if (response.status !== 200) {
            throw new BadRequestException("Failed to fetch bill products ")
        }

        const { data } = response.data

        return data

    }

    public async createBillPayment<T extends PaymentCatgoriesType>(billPaymentOptions: BillPurchaseType<T>, category: T) {


        try {
            const payload = {
                data: {
                    type: billPaymentOptions.type,
                    attributes: {
                        provider: billPaymentOptions.attributes.provider,
                        phoneNumber: billPaymentOptions.attributes.phoneNumber,
                        reference: billPaymentOptions.attributes.reference,
                        amount: billPaymentOptions.attributes.amount,
                        productSlug: category === 'Data' ? (billPaymentOptions as DataPurchaseOptions).attributes.productSlug : undefined
                    },
                    relationships: {
                        account: {
                            data: {
                                type: billPaymentOptions.account.type,
                                id: billPaymentOptions.account.id
                            }
                        }
                    }
                }
            }

            const response = await this.axios.post("/bills", JSON.stringify(payload))


            return response

        } catch (error: any) {
            console.log(error.response?.errors[0])
            systemLogger.info(`${billPaymentOptions.type} purchase failed ${error.response?.errors[0]} `)
            throw new BadRequestException(`${billPaymentOptions.type} purchase failed Please try again`)
        }

    }

}




export default AnchorBillsApi
