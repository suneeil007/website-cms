
import { SignJWT, jwtVerify } from "jose";

import { env } from "../../config/env.js";

const secret = new TextEncoder().encode(
    env.JWT_ACCESS_SECRET
);

export async function generateAccessToken(user) {
    return new SignJWT({
        email: user.email,
        type: "access",
    })
        .setProtectedHeader({
            alg: "HS256",
        })
        .setSubject(String(user.id))
        .setIssuedAt()
        .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
        .sign(secret);
}

export async function verifyAccessToken(token) {
    const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
    });

    if (payload.type !== "access") {
        throw new Error("Invalid access token type.");
    }

    return payload;
}
