import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";

import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import {
    CreateUserSchema,
    SigninSchema,
    CreateRoomSchema
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);


app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({ message: "Incorrect inputs" });
    }

    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.username,
                password: parsedData.data.password,
                name: parsedData.data.name,
            },
        });

        res.json({ userId: user.id });
    } catch {
        res.status(409).json({
            message: "User already exists",
        });
    }
});

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({ message: "Incorrect inputs" });
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password,
        },
    });

    if (!user) {
        return res.status(403).json({ message: "Not authorized" });
    }

    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    // ✅ SET COOKIE (SSR SAFE)
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
    });

    res.json({ success: true });
});

app.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    });

    res.redirect("http://localhost:3000/");
});


app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({ message: "Incorrect inputs" });
    }

    // @ts-ignore
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId,
            },
        });

        res.json({ roomId: room.id });
    } catch {
        res.status(409).json({
            message: "Room already exists",
        });
    }
});

app.get("/rooms", middleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    try {
        const rooms = await prismaClient.room.findMany({
            where: {
                adminId: userId,
            },
            orderBy: {
                createAt: "desc",
            },
            select: {
                id: true,
                slug: true,
                createAt: true,
            },
        });

        res.json({ rooms });
    } catch (error) {
        console.error("Failed to fetch user rooms", error);
        res.status(500).json({ message: "Failed to fetch rooms" });
    }
});

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages: messages.reverse()
        })
    } catch (e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
});

const PORT = process.env.HTTP_PORT || 3001;

app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});
