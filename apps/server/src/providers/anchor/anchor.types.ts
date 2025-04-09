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

export interface CreateDepositAccountData {
    type: ResourceType;
    accountType: AccountType;
    customerId: string;
    customerType: CustomerType;
}