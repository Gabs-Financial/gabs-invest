import AnchorMiacApi from "../../providers/anchor/anchor-miac-api";
import { BadRequestException } from "../../utils/error";
import { ErrorCode } from "../../@types/errorCode.enum";

export class PaymentServices {


    public async fetchBankList() {



        try {
            const response = await AnchorMiacApi.fetchBankList();

            

            return response.data

        } catch (error: unknown) {
            return new BadRequestException("Error fetching bank list", ErrorCode.BAD_REQUEST);
        }
    }


}