import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AddBvnTypeSchema, usernameSchema, UserProfileDataSchema, VerifyBvnTypeSchema } from "./user.types";
import { authControllers, authService } from "../auth/auth.modules";
import userServices from "./user.services";
import { HTTPSTATUS } from "../../config/statusCode.config";
import { passcodeVerificationValidation, pinValidation } from "../auth/auth.validations";
import db from "../../db/connectDb";
import { eq, exists } from "drizzle-orm";
import { user } from "../../db/schema/user.model";


class UserControllers {


    public createSecurePinController = asyncHandler(async (req: Request, res: Response) => {


        const { pin } = pinValidation.parse({ ...req.body })
        const user = req.user

        await userServices.createSecurePin(user.id, pin)


        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Passcode Created Succesfully",

        })

    })




    public getUserController = asyncHandler(async (req: Request, res: Response) => {

        const user = req.user

        const data = await userServices.getUser(user.id)



        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Customer gotten successfully",
            data: data
        })

    })




    public checkTagExist = asyncHandler(async (req: Request, res: Response) => {
        const parseResult = usernameSchema.safeParse(req.query);

        if (!parseResult.success) {
            return res.status(400).json({ error: "Invalid or missing username" });
        }

        const { tag } = parseResult.data;

        const reservedNames = ["gabs", "invest"];

        const usernameQuery = db
            .select()
            .from(user)
            .where(eq(user.gabs_tag, tag));

        const [usernameExist] = await db
            .select({ exists: exists(usernameQuery) }).from(user).execute()

        const existsInDb = usernameExist?.exists ?? false;
        const isReserved = reservedNames.includes(tag.toLowerCase());

        return res.status(200).json({ exists: existsInDb || isReserved });
    });


    public createTag = asyncHandler(async (req: Request, res: Response) => {
        const { tag } = usernameSchema.parse(req.body);
        const userId = req.user.id


        if (!tag) {
            return res.status(400).json({ success: false, message: "Invalid or missing username" });
        }

        await db.transaction(async (tx) => {
            await tx.update(user).set({ gabs_tag: tag }).where(eq(user.id, userId))
        })

        return res.status(HTTPSTATUS.OK).json({
            success: true,
            message: "Gabs tag created",
        })

    });







}

const userControllers = new UserControllers()
export default userControllers