import { CookieOptions, Response } from "express";
import ms from "ms";
import config from "../config/app.config";

interface cookiePayload {
    res: Response;
    accessToken: string;
    refreshToken: string;
}

type setCookie = (cookie: cookiePayload) => Response;


export const options: CookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "development",
    sameSite: config.NODE_ENV === "development" ? "lax" : "strict",
}


export const getRefreshTokenCookieOptions = (): CookieOptions => {
    const expiresIn = config.REFRESH_TOKEN_EXPIRES_IN;
    const expires = new Date(Date.now() + ms(expiresIn as ms.StringValue ));
    return {
        ...options,
        expires,
    };
};

export const getAccessTokenCookieOptions = (): CookieOptions => {
    const expiresIn = config.ACCESS_TOKEN_EXPIRES_IN;
    const expires = new Date(Date.now() + ms(expiresIn as ms.StringValue));
    return {
        ...options,
        expires,
    };
};


export const setCookies: setCookie = ({
    res,
    accessToken,
    refreshToken,
}): Response =>
    res
        .cookie("access_token", accessToken, getAccessTokenCookieOptions())
        .cookie("refresh_token", refreshToken, getRefreshTokenCookieOptions());