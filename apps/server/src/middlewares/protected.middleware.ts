import { Request, Response, NextFunction } from "express"
import { asyncHandler } from "./asyncHandler"
import { eq } from "drizzle-orm";
import { NotFoundException, UnauthorizedException } from "../utils/error";
import { ErrorCode } from "../@types/errorCode.enum";
import { AudienceType, jwtUtility } from "../utils/jwt";
import { user } from "../db/schema/user.model";
import db from "../db/connectDb";
import { systemLogger } from "../utils/logger";
import sessionServices from "../services/session/session.services";





export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {


    const BEARER_PREFIX = "Bearer ";
    const accessToken: string | null = (req.headers['authorization'] as string | undefined) || (req.headers['Authorization'] as string | undefined) || null;




    try {

        if (!accessToken || !accessToken.startsWith(BEARER_PREFIX)) {
            throw new UnauthorizedException("UnAuthorized Access", ErrorCode.AUTH_UNAUTHORIZED_ACCESS)
        }

        const token = accessToken.slice(BEARER_PREFIX.length);

        // const token = req.cookies.access_token

        if (!token) {
            throw new UnauthorizedException("UnAuthorized Access", ErrorCode.AUTH_UNAUTHORIZED_ACCESS)
        }

        const decoded = jwtUtility.decodeToken(token)

        console.log(decoded, "this is the decoded jwt")


        const verified = jwtUtility.verifyAccessToken(token, {
            audience: AudienceType.MobileApp,
            subject: decoded?.sub as string
        });


        const session = await sessionServices.getSessionById(String(verified.session_id));

        if (!session || session.user_id !== verified.user_id) {
            return new UnauthorizedException("Invalid or expired session", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);
        }


        const [authenticatedUser] = await db.select().from(user).where(eq(user.id, verified.user_id))


        if (!authenticatedUser) return new NotFoundException();

        req.user = authenticatedUser


        next()


    } catch (error) {

        systemLogger.error(error)
        console.log(error)
        throw new UnauthorizedException("Unauthorized User", ErrorCode.AUTH_UNAUTHORIZED_ACCESS);

    }

})