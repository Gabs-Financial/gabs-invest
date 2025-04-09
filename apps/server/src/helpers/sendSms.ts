import axios, { AxiosError, AxiosResponse } from "axios";
import config from "../config/app.config";

type SmsPayloadType = {
    message: string,
    to: string,
    route: "dnd" | "non_dnd",
    sender_name: "SendChamp",
}

type OtpPayloadBase = {
    channel: "Voice" | "SMS" | "WhatsApp" | "Email";
    sender: string;
    token_type: "numeric" | "alphanumeric";
    token_length: number;
    expiration_time: number;
    meta_data: Record<string, any>;
    token?: string;
};

type ChannelSpecificPayload<T extends OtpPayloadBase["channel"]> = T extends "Email"
    ? { customer_email_address: string }
    : T extends "SMS"
    ? { customer_mobile_number: string }
    : {};

type OtpPayload<T extends OtpPayloadBase["channel"] = OtpPayloadBase["channel"]> = OtpPayloadBase & ChannelSpecificPayload<T>;

export const sendChamp_send_sms = async (payload: SmsPayloadType): Promise<AxiosResponse | AxiosError> => {
    try {
        const response: AxiosResponse = await axios.post(`${config.SENDCHAMP_URL}/sms/send`, JSON.stringify(payload), {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.SENDCHAMP_API_KEY}`,
                Accept: "application/json",
            },
        });


        return response as AxiosResponse;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return error as AxiosError;
        }
        throw new Error("An unexpected error occurred");
    }
}


export const sendChamp_send_otp = async (payload:OtpPayload) => {

    try {

        const response: AxiosResponse = await axios.post(`${config.SENDCHAMP_URL}/verification/create`, JSON.stringify(payload), {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.SENDCHAMP_API_KEY}`,
                Accept: "application/json",
            },
        });


        return response as AxiosResponse;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return error as AxiosError;
        }
        throw new Error("An unexpected error occurred");
    }


}