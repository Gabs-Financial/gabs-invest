import { BadRequestException } from "../../utils/error";
import { generateRef } from "../../utils/generateRef";
import { systemLogger } from "../../utils/logger";
import { AnchorBaseClass } from "./anchor-base";


type CategoryTypes = 'airtime' | "data" | "electricity" | "television"

type TopUpProvidersType = "mtn" | "glo" | "airtel" | "9mobile" | "ntel"

type PaymentCatgoriesType = Capitalize<CategoryTypes>

type TopUpPurchaseBase = {
    type: PaymentCatgoriesType; // Specifies the type of bill payment
    attributes: {
        phoneNumber: string; // The phone number to receive the data bundle or airtime
        amount: number; // Fixed amount in the lowest currency denomination
        provider: string; // Slug identifier of the product/plan
        reference: string; // Unique transaction identifier
    };
    account: {
        id: string;
        type: "DepositAccount" | "SubAccount" | "ElectronicAccount";
    };
};

type AirtimePurchaseOptions = Omit<TopUpPurchaseBase, "type"> & {
    type: Extract<PaymentCatgoriesType, "Airtime">;
};

type DataPurchaseOptions = Omit<TopUpPurchaseBase, "type"> & {
    type: Extract<PaymentCatgoriesType, "Data">;
};



class AnchorBills extends AnchorBaseClass {


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

    public async createBillPayment(billPaymentOptions: TopUpPurchaseBase) {


        try {
            const payload = {
                data: {
                    type: billPaymentOptions.type,
                    attributes: {
                        provider: billPaymentOptions.attributes.provider,
                        phoneNumber: billPaymentOptions.attributes.phoneNumber,
                        reference: generateRef("gba", 7),
                        amount: billPaymentOptions.attributes.amount
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


            if (response.status !== 200) {
                throw new BadRequestException(`${payload.data.type} purchase failed Please try again`)

            }

            const { data } = response.data
        } catch (error: any) {
            console.log(error.response?.errors[0])
            systemLogger.info(`${billPaymentOptions.type} purchase failed ${error.response?.errors[0]} `)
            throw new BadRequestException(`${billPaymentOptions.type} purchase failed Please try again`)
        }

    }

}