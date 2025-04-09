import axios, { AxiosRequestHeaders, AxiosResponseHeaders } from "axios";
import config from "../../config/app.config";
import { BadRequestException } from "../../utils/error";
import { systemLogger } from "../../utils/logger";
import { ErrorCode } from "../../@types/errorCode.enum";
import cache from "../../config/node-cache";


const axiosInstance = axios.create({
    baseURL: config.MONNIFY_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});


class MonnifyBase {

    protected readonly axios = axiosInstance;
    private client_secret = config.MONNIFY_SECRET_KEY
    private api_key = config.MONNIFY_API_KEY
    private cache_key = "monnify_access_token"
    protected contract_code = ""

    protected async authenticate() : Promise<string>{
        const authString = Buffer.from(this.api_key + ":" + this.client_secret).toString("base64")

        const cahched_accessToken = cache.get<string>(this.cache_key)

        if (cahched_accessToken) {
            return cahched_accessToken
        }

        const headers = {
            Authorization: "Basic " + authString

        }


        try {

            const response = await this.axios.post("api/v1/auth/login", null, {
                headers
            })

            if (response && response.data) {
                const { responseBody } = response.data;
                const { accessToken, expiresIn } = responseBody;

                cache.set(this.cache_key, accessToken, expiresIn)

                return accessToken
            }

        } catch (error: any) {
            console.log(error?.response?.data)
            systemLogger.error("Failed to authenticate")
            throw new BadRequestException("Failed to connect authenticate", ErrorCode.BAD_REQUEST)
        }

        // Add a fallback return statement
        throw new BadRequestException("Authentication failed with no response", ErrorCode.BAD_REQUEST);
    }


}


export default MonnifyBase