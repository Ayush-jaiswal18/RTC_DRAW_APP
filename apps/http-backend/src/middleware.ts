import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies["token"] ?? " ";
    console.log("--- MIDDLEWARE DEBUG ---");
    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies);
    console.log("Token resolved:", token);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded && typeof decoded !== 'string') {
            // @ts-ignore
            req.userId = decoded.userId;
            next();
        } else {
            console.log("Token verification failed: Decoded token is invalid or string");
            res.status(403).json({
                message: "Unauthorized"
            })
        }
    } catch (error) {
        console.log("Token verification failed:", error);
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}