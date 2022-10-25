// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import express from "express";
import cors from "cors";

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const webhookRouter = require("./routes/webhook");
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/webhook", webhookRouter);

app.listen(4000, () => {
  console.log("Listening on port 4000");
});
