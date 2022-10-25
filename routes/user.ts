import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
const router = express.Router();

import getUserInfo from "../modules/getUserInfo";

router.get(
  "/:studentId",
  async (req: express.Request, res: express.Response) => {
    const studentId = req.params.studentId;
    const data = await getUserInfo(studentId);
    res.status(200).json({
      data,
    });
  }
);

router.get(
  "/:studentId/todo",
  async (req: express.Request, res: express.Response) => {
    const studentId = req.params.studentId;
    const data = await getUserInfo(studentId);
    if (data) {
      const response = {
        id: data.id,
        studentId: data.studentId,
        name: data.name,
        enrolledCourses: data.enrolledCourses.map((course) => {
          return {
            id: course.id,
            courseId: course.courseId,
            name: course.name,
            image: course.image,
            url: course.url,
            assignments: course.assignments.filter(
              (assignment) => assignment.status === "TODO"
            ),
          };
        }),
      };
      res.status(200).json({
        data: response,
      });
    }
    res.status(200).json({
      data: null,
    });
  }
);

module.exports = router;
