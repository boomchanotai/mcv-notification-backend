import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import userFetching from "../modules/userFetching";
import express from "express";
import courseFetching from "../modules/courseFetching";
const router = express.Router();

/* GET home page. */
router.post("/login", async (req: express.Request, res: express.Response) => {
  const username = req.body.username;
  const password = req.body.password;

  const response = await userFetching(username, password);
  await courseFetching(username);
  res.status(response.code).json(response.data);
});

router.get("/users", async (req: express.Request, res: express.Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.get("/courses", async (req: express.Request, res: express.Response) => {
  const courses = await prisma.course.findMany();
  res.json(courses);
});

module.exports = router;
