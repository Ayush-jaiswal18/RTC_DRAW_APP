import express, { json } from "express"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"
import { prismaClient } from '@repo/db/client'

const app = express();
app.use(express.json())

app.post("/signup", async (req, res) => {
    const pardesdData = CreateUserSchema.safeParse(req.body);
    if (!pardesdData.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }

    try {
        const user = await prismaClient.user.create({
            data: {
                email: pardesdData.data?.username,
                password: pardesdData.data.password,
                name: pardesdData.data.name
            }
        })

        res.json({
            userId: user.id
        })
    } catch (e) {
        res.status(411).json({
            message: "Username already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {

    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    })

    if (!user) {
        res.status(403).json({
            message: "Not Authorized"
        })
        return
    }

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET)

    res.json({
        token
    })
})

app.post("/room", middleware, async (req, res) => {

    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect Inputs"
        })
        return;
    }
    //@ts-ignore
    const userId = req.userId

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch (e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/chats/:roomId", async (req, res) => {

    const roomId = Number(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    });

    res.json({
        messages
    })
})

const PORT = process.env.HTTP_PORT || 3001;
app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});