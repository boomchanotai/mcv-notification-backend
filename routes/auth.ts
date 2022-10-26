import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import userFetching from "../modules/userFetching";
import express from "express";
import courseFetching from "../modules/courseFetching";
import assignmentFetchingFromUser from "../modules/assignmentFetchingFromUser";
import userEnrolledCourses from "../modules/userEnrolledCourses";
import axios from "axios";
const router = express.Router();
require("dotenv").config();

/* GET home page. */
router.post("/login", async (req: express.Request, res: express.Response) => {
  const username = req.body.username;
  const password = req.body.password;
  const line = req.body.line;

  const userFetch = await userFetching(username, password, line);
  const courseFetch = await courseFetching(username);
  const userEnrolledRelation = await userEnrolledCourses(username);
  const assignmentFetch = await assignmentFetchingFromUser(username);
  if (
    userFetch.code === 200 &&
    courseFetch.code === 200 &&
    userEnrolledRelation.code === 200 &&
    assignmentFetch.code === 200
  ) {
    console.log("User logged in !");
    res.status(200).json(userFetch.data);
  }
});

router.get("/users", async (req: express.Request, res: express.Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.get("/courses", async (req: express.Request, res: express.Response) => {
  const courses = await prisma.course.findMany();
  res.json(courses);
});

router.get(
  "/assignments",
  async (req: express.Request, res: express.Response) => {
    const assignments = await prisma.assignment.findMany({
      include: {
        course: true,
      },
    });
    res.json(assignments);
  }
);

router.get(
  "/userenrolledcourses",
  async (req: express.Request, res: express.Response) => {
    const userEnrolledCourses = await prisma.userEnrolledCourses.findMany({
      include: {
        user: true,
        course: true,
      },
    });
    res.json(userEnrolledCourses);
  }
);

router.get(
  "/assignment-status",
  async (req: express.Request, res: express.Response) => {
    const assignmentStatus = await prisma.userAssignmentStatus.findMany({});
    res.json(assignmentStatus);
  }
);

module.exports = router;
