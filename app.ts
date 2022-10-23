// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
import express from "express";
import cors from "cors";

const authRouter = require("./routes/auth");
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/auth", authRouter);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
