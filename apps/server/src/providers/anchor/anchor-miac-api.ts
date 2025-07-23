import { AxiosError, AxiosResponse } from "axios";
import { AnchorBaseClass } from "./anchor-base";
import { BadRequestException } from "../../utils/error";
import { ErrorCode } from "../../@types/errorCode.enum";




class AnchorMiscApi extends AnchorBaseClass {

    constructor() {
        super()
    }


    public async fetchBankList() {

        const response: AxiosResponse = await this.axios.get(`/banks`);
        return response;
    }


}


export default new AnchorMiscApi();