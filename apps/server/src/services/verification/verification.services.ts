import { BadRequestException } from "../../utils/error";
import { ErrorCode } from "../../@types/errorCode.enum";
import dojah from "../../config/dojah.config";

class VerificationServicea {

    public async verifyUserBvn(bvn: string) {

        if (!bvn) {
            throw new BadRequestException("Failed to provide Bank Verification Number", ErrorCode.BAD_REQUEST)
        }

        const formattedBvn = Number(bvn)

        const verifyBvnResponse = await dojah.nigeriaKyc.getNormalBvn({ bvn: formattedBvn })

        if(verifyBvnResponse.status !== 200) {
            throw new BadRequestException("Failed to verify Bank Verification Number", ErrorCode.BAD_REQUEST)

        }

        console.log(verifyBvnResponse.status, "this is the status");
        console.log(verifyBvnResponse.data, "this is the data");

        return verifyBvnResponse
    }


}

const verificationServicea = new VerificationServicea();
export default verificationServicea;