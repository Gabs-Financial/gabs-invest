export type KycLevel = "level_1" | "level_2" | "level_3";

export type documentType = "DRIVERS_LICENSE" | "VOTERS_CARD" | "PASSPORT" | "NATIONAL_ID" | "NIN_SLIP";

export type CustomerType = "IndividualCustomer";

export interface Kyc1Customer {
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phoneNumber: string;
    address: {
        addressLine_1: string;
        addressLine_2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: "NG";
    };
    userId: string
}

export interface Kyc2Customer extends Kyc1Customer {
    dateOfBirth: string;
    bvn: string;
    gender: string;
}

export interface Kyc3Customer extends Kyc2Customer {
    idType: documentType;
    idNumber: string;
    expiryDate: Date;
}

// type AnchorCustomerData = Kyc1Customer | Kyc2Customer | Kyc3Customer;

export type CustomerData<K extends KycLevel> = K extends "level_1"
    ? Kyc1Customer
    : K extends "level_2"
    ? Kyc2Customer
    : K extends "level_3"
    ? Kyc3Customer
    : never;


export type AccountType = "SAVINGS" | "CURRENT";

export type ResourceType = "DepositAccount" | "VirtualNuban" | "SubAccount"

export type TransferType = "NIPTransfer" | "BookTransfer"

export interface CreateDepositAccountData {
    type: ResourceType;
    accountType: AccountType;
    customerId: string;
    customerType: CustomerType;
}

export type AnchorTransferType = {

    type: TransferType
    amount: number,
    currency: "NGN",
    reason?: string,
    reference: string,
    accountId: string,
    accountType: ResourceType,
    counterPartyId: string,
}


export type AnchorBookTransfer = {
    type:TransferType,
    amount: number,
    currency: "NGN",
    reason?: string,
    reference: string,
    destinationAccountId: string,
    destinationAccountType: ResourceType,
    accountId: string,
    accountType: ResourceType,
}



export type  CreateCounterPartyType = {
    bankCode: string,
    accountName: string,
    accountNumber: string,
    verifyName: boolean
}

export type AnchorTransferResponseType = {
    data: {
        attributes: {
            failureReason?: string; // Optional, as it may not always be present
            currency: "NGN"; // Fixed value
            amount: number;
            createdAt: string; // ISO date string
            reason: string;
            reference: string;
            status: "PENDING" | "SUCCESS" | "FAILED"; // Enum for possible statuses
            metadata: string[]; // Array of strings
        };
    };
};


export type CategoryTypes = 'airtime' | "data" | "electricity" | "television"

export type TopUpProvidersType = "mtn" | "glo" | "airtel" | "9mobile" | "ntel"

export type PaymentCatgoriesType = Capitalize<CategoryTypes>

export type BillPurchaseBase = {
    type: PaymentCatgoriesType; // Specifies the type of bill payment
    account: {
        id: string;
        type: "DepositAccount" | "SubAccount" | "ElectronicAccount";
    };
};

export type AirtimePurchaseOptions = Omit<BillPurchaseBase, "type"> & {
    type: Extract<PaymentCatgoriesType, "Airtime">;
    attributes: {
        phoneNumber: string; // The phone number to receive the data bundle or airtime
        amount: number; // Fixed amount in the lowest currency denomination
        provider: string; // Slug identifier of the product/plan
        reference: string; // Unique transaction identifier
    };
};

export type DataPurchaseOptions = Omit<BillPurchaseBase, "type"> & {
    type: Extract<PaymentCatgoriesType, "Data">;
    attributes: {
        phoneNumber: string; // The phone number to receive the data bundle or airtime
        amount: number; // Fixed amount in the lowest currency denomination
        provider: string; // Slug identifier of the product/plan
        reference: string; // Unique transaction identifier
        productSlug: string
    };
};


export type BillPurchaseType<T extends PaymentCatgoriesType> = T extends 'Airtime' ? AirtimePurchaseOptions : T extends "Data" ? DataPurchaseOptions : never

