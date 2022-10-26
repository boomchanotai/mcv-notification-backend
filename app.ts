import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
import cors from "cors";
import getNewAssignmentEveryday from "./modules/cronjobs/getNewAssignmentEveryday";
import sendAssignmentReminder from "./modules/cronjobs/sendAssignmentReminder";

const cron = require("node-cron");

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

cron.schedule("0 7 * * *", async () => {
  const users = await prisma.user.findMany();
  for (const user of users) {
    await getNewAssignmentEveryday(user.studentId);
  }
});

cron.schedule("0 * * * *", async () => {
  await sendAssignmentReminder();
});

app.listen(4000, () => {
  console.log("Listening on port 4000");
});
