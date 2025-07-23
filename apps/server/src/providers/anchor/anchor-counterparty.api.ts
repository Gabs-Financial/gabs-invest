import { systemLogger } from "../../utils/logger";
import { AnchorBaseClass } from "./anchor-base";
import { CreateCounterPartyType } from "./anchor.types";


class AnchorCounterParty extends AnchorBaseClass {

    constructor() {
        super()
    }

    public async create(data: CreateCounterPartyType) {


        try {

            const payload = {
                data: {
                    type: "CounterParty",
                    attributes: {
                        bankCode: data.bankCode,
                        accountName: data.accountName,
                        accountNumber: data.accountNumber,
                        verifyName: data.verifyName
                    }
                }
            }

            const response = await this.axios.post("/counterparties", JSON.stringify(payload))

            return response

        } catch (error) {

            console.log(error)
            systemLogger.error("Error creating counter party", error)
            throw error
        }



    }

}


export default AnchorCounterParty