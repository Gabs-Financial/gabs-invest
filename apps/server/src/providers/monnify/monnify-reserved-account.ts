import { ErrorCode } from "../../@types/errorCode.enum";
import { BadRequestException } from "../../utils/error";
import { systemLogger } from "../../utils/logger";
import MonnifyBase from "./monnify-base";
import type { ReservedAccountOptions } from "./monnify-types";



class MonnifyReserrvedAccount extends MonnifyBase {

    constructor() {
        super()
    }


    public async createReservedAccount(options: ReservedAccountOptions) {

        const accessToken = await this.authenticate()

        const headers = {
            Authorization: `Bearer ${accessToken}`
        }

        try {


            const response = await this.axios.post('api/v2/bank-transfer/reserved-accounts', options, { headers })


            return response.data



        } catch (error) {
            systemLogger.error(error)
            throw new BadRequestException("Error Creating Reserved Account", ErrorCode.BAD_REQUEST)

        }

    }





}


export default new MonnifyReserrvedAccount()