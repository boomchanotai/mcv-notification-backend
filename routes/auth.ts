import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import express from "express";
const router = express.Router();
import { spawn } from "child_process";

interface User {
  name: string;
  cookie: string;
}

/* GET home page. */
router.post("/login", async (req: express.Request, res: express.Response) => {
  const username = req.body.username;
  const password = req.body.password;

  const checkExistUser = await prisma.user.findMany({
    where: {
      studentId: username,
    },
  });

  const python = spawn("python3", ["scripts/get-token.py", username, password]);
  const scrapData = new Promise<User>((resolve, reject) => {
    python.stdout.on("data", function (data: string) {
      const name = data.toString().split(", ")[0];
      const cookie = data.toString().split(", ")[1].replace("\n", "");

      resolve({ name, cookie });
    });
    python.stderr.on("data", (data) => {
      reject(data.toString());
    });
  });

  try {
    const data = await scrapData;
    if (checkExistUser.length === 0) {
      try {
        const user = await prisma.user.create({
          data: {
            studentId: username,
            name: data.name,
            cookie: data.cookie,
          },
        });
        res.status(200).json({
          status: "success",
          data: user,
        });
      } catch (error) {
        res.status(403).send({
          status: "error",
          message: error,
        });
      }
    } else {
      try {
        const user = await prisma.user.update({
          where: {
            studentId: username,
          },
          data: {
            name: data.name,
            cookie: data.cookie,
          },
        });
        res.status(200).json({
          status: "success",
          data: user,
        });
      } catch (error) {
        res.status(403).json({
          status: "error",
          data: "Error IDK",
        });
      }
    }
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: "No user found",
    });
  }
});

router.get("/users", async (req: express.Request, res: express.Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

module.exports = router;
