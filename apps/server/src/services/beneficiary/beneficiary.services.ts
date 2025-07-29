import { eq, or } from "drizzle-orm"
import db from "../../db/connectDb"
import { beneficiary } from "../../db/schema/beneficiary.model"
import { CreateBeneficiary } from "./beneficiary.types"
import { accounts } from "../../db/schema/account.model"
import { BadRequestException } from "../../utils/error"
import { systemLogger } from "../../utils/logger"
import { ErrorCode } from "../../@types/errorCode.enum"
import AnchorApi from "../../providers/anchor/anchor.modules"


type BeneficiaryType = typeof beneficiary.$inferInsert


class BeneficiaryServices {

    public async createBeneficiary(
        data: CreateBeneficiary,
        userId: string,
    ): Promise<Partial<BeneficiaryType>> {
        const { accountName, accountNumber, bankCode, bankName } = data;

      return  await db.transaction(async(tx) => {

            const [beneficiaryRecord] = await tx
                .select()
                .from(beneficiary)
                .where(
                    or(
                        eq(beneficiary.account_number, accountNumber),
                    )
                );    
    
            if (!beneficiaryRecord) {
    
                const counterPartyResponse = await AnchorApi.counterparty.create({ accountName, accountNumber, bankCode, verifyName:true })
    
                if (counterPartyResponse?.data?.data.errors?.length) {
                    systemLogger.error("Failed to create counterparty", {
                        errors: counterPartyResponse.data.data.errors,
                    });
                    throw new BadRequestException("Failed to create counterparty", ErrorCode.BAD_REQUEST);
                }
    
                const payload: BeneficiaryType = {
                    account_name: accountName,
                    account_number: accountNumber,
                    bank_code: bankCode,
                    bank_name: bankName,
                    counterparty_id: counterPartyResponse.data.data.id,
                    user_id: userId,
                };
    
                const [newBeneficiary] = await tx
                    .insert(beneficiary)
                    .values(payload)
                    .returning({
                        id: beneficiary.id,
                        account_name: beneficiary.account_name,
                        account_number: beneficiary.account_number,
                        counterparty_id: beneficiary.counterparty_id,
                        bank_code: beneficiary.bank_code,
                        bank_name: beneficiary.bank_name,
                        account_id: beneficiary.account_id,
                    });
    
                return newBeneficiary;
            }
    
            return beneficiaryRecord;
        })
        // Check if beneficiary exists
    }

    public async getBeneficiaryById(beneficiaryId:string) {

        const beneficiaryRecord = await db.query.beneficiary.findFirst({
            where: eq(beneficiary.id, beneficiaryId)
        })


        return beneficiaryRecord

    }

    public async getUserBeneficiaryList(userId:string) {

        const beneficiaryList = await db.query.beneficiary.findMany({
            where: eq(beneficiary.user_id, userId)
        })

        return beneficiaryList

    }


}


const beneficiaryServices = new BeneficiaryServices()
export default beneficiaryServices