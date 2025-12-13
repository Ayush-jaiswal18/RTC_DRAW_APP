import exppress, { json } from "express"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { middleware } from "./middleware";

const app = exppress();

app.post("/signup", (req, res) => {

})

app.post("/signin", (req, res) => {
    

    const userId = 1;
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        token
    })
})

app.post("/room", middleware, (req, res) => {
    res.json({
        roonId: 123
    })
})

app.listen(3001);