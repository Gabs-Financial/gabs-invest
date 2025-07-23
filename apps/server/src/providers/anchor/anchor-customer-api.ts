import { AxiosResponse } from "axios";

import type { CustomerData, CustomerType, Kyc1Customer, Kyc2Customer, Kyc3Customer, KycLevel, } from "./anchor.types.ts";
import { AnchorBaseClass } from "./anchor-base";
import { BadRequestException } from "../../utils/error.js";
import { ErrorCode } from "../../@types/errorCode.enum.js";

type ValidationRules = {
    [key in KycLevel]: Array<keyof Kyc1Customer | keyof Kyc2Customer | keyof Kyc3Customer>;
};

const validationRules: ValidationRules = {
    level_1: Object.keys({} as Kyc1Customer) as Array<keyof Kyc1Customer>,
    level_2: Object.keys({} as Kyc2Customer) as Array<keyof Kyc2Customer>,
    level_3: Object.keys({} as Kyc3Customer) as Array<keyof Kyc3Customer>,
};

interface CustomerApi {
    createCustomer<K extends KycLevel>(
        data: CustomerData<K>,
        type: CustomerType,
        kycLevel: K
    ): Promise<Record<string, any>>;

    updateCustomer(): Promise<Record<string, any>>;

    deleteCustomer(): Promise<Record<string, any>>;

    fetchCustomer?(): Promise<Record<string, any>>;
}

class AnchorCustomerApi extends AnchorBaseClass implements CustomerApi {


    constructor() {
        super();
    }

    private validateCustomerData<T extends KycLevel>(
        data: CustomerData<T>,
        kycLevel: T
    ): void {
        const requiredFields = validationRules[kycLevel];

        requiredFields.forEach((field) => {
            if (!(data as any)[field]) {
                throw new BadRequestException(`${field} is required for ${kycLevel}`, ErrorCode.VALIDATION_ERROR);
            }
        });
    }

    /**
     * Creates a new anchor customer with the provided data.
     * @param data -  The data of the customer
     * @param type -  The type of customer - "IndividualCustomer" | "BusinessCustomer"
     * @param kycLevel -  The KYC level of the customer
     * @returns Promise<Record<string, any>> -  The session ID
     */

    public async createCustomer<T extends KycLevel>(
        data: CustomerData<T>,
        type: CustomerType,
        kycLevel: T
    ) {
        this.validateCustomerData(data, kycLevel);

        const payload = {
            data: {
                type: type,
                attributes: {
                    fullName: {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        middleName: data.middleName,
                    },
                    address: {
                        addressLine_1: data.address.addressLine_1,
                        addressLine_2: data.address.addressLine_2,
                        city: data.address.city,
                        state: data.address.state,
                        postalCode: data.address.postalCode,
                        country: data.address.country,
                    },
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    identificationLevel2: kycLevel !== "level_1" ? {
                        dateOfBirth: (data as Kyc2Customer).dateOfBirth,
                        gender: (data as Kyc2Customer).gender,
                        bvn: (data as Kyc2Customer).bvn,
                    } : undefined,
                    identificationLevel3: kycLevel === "level_3" ? {
                        idType: (data as Kyc3Customer).idType,
                        idNumber: (data as Kyc3Customer).idNumber,
                        expiryDate: (data as Kyc3Customer).expiryDate,
                    } : undefined,
                    metadata: {
                        gabs_user_id: data.userId,
                    },
                },
            },
        };

        const response: AxiosResponse = await this.axios.post(`/customers`, JSON.stringify(payload));

        return response;
    }



    public async verifyCustomerKyc<T extends KycLevel>(
        data: T extends "level_2"
            ? Pick<Kyc2Customer, "bvn" | "dateOfBirth" | "gender">
            : T extends "level_3"
            ? Pick<Kyc3Customer, "idType" | "idNumber" | "expiryDate">
            : never,
        level: "TIER_2" | "TIER_3",
        customerId: string
    ) {
        const payload = {
            data: {
                type: "Verification",
                attributes: {
                    level: level,
                    ...(level === "TIER_2" && {
                        level2: {
                            bvn: (data as Kyc2Customer).bvn,
                            dateOfBirth: (data as Kyc2Customer).dateOfBirth,
                            gender: (data as Kyc2Customer).gender,
                        },
                    }),
                    ...(level === "TIER_3" && {
                        level3: {
                            idType: (data as Kyc3Customer).idType,
                            idNumber: (data as Kyc3Customer).idNumber,
                            expiryDate: (data as Kyc3Customer).expiryDate,
                        },
                    }),
                },
            },
        };

        const response: AxiosResponse = await this.axios.post(`/customers/${customerId}/verification/individual`, JSON.stringify(payload));

        return response;
    }


    public async updateCustomer(): Promise<Record<string, any>> {
        return {};
    }

    public async deleteCustomer(): Promise<Record<string, any>> {
        return {};
    }
}

export default AnchorCustomerApi;