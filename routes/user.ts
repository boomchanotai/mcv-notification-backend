import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
const router = express.Router();

import getUserInfo from "../modules/getUserInfo";
import isToday from "../utils/checkIsToday";
import sendNewAssignmentNotification from "../modules/sendNewAssignmentNotification";
import courseFetching from "../modules/courseFetching";
import userEnrolledCourses from "../modules/userEnrolledCourses";
import assignmentFetchingFromUser from "../modules/assignmentFetchingFromUser";
import sendSmallLineMessage from "../modules/sendSmallLineMessage";
import sendAssignmentReminder from "../modules/cronjobs/sendAssignmentReminder";

router.get(
  "/:studentId",
  async (req: express.Request, res: express.Response) => {
    const studentId = req.params.studentId;
    const user = await prisma.user.findUnique({
      where: {
        studentId: studentId,
      },
    });
    const data = await getUserInfo(studentId);
    if (user) {
      await sendNewAssignmentNotification(user.lineUserId, data, "ALL");
    }
    res.status(200).json({
      data,
    });
  }
);

router.get(
  "/:studentId/todo",
  async (req: express.Request, res: express.Response) => {
    const studentId = req.params.studentId;
    const user = await prisma.user.findUnique({
      where: {
        studentId: studentId,
      },
    });
    if (user) {
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
        await sendNewAssignmentNotification(user.lineUserId, response, "TODO");
        res.status(200).json({
          data: response,
        });
      } else {
        res.status(403).json({
          data: "Not Found",
        });
      }
    } else {
      res.status(403).json({
        data: "Not Found",
      });
    }
  }
);

router.get(
  "/:studentId/new",
  async (req: express.Request, res: express.Response) => {
    const studentId = req.params.studentId;
    const user = await prisma.user.findUnique({
      where: {
        studentId: studentId,
      },
    });
    if (user) {
      await courseFetching(studentId);
      await userEnrolledCourses(studentId);
      await assignmentFetchingFromUser(studentId);
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
              assignments: course.assignments.filter((assignment) =>
                isToday(assignment.createdAt)
              ),
            };
          }),
        };
        await sendNewAssignmentNotification(user.lineUserId, response, "NEW");
        res.status(200).json({
          data: response,
        });
      } else {
        res.status(403).json({
          data: "Not Found",
        });
      }
    } else {
      res.status(403).json({
        data: "Not Found",
      });
    }
  }
);

router.get("/:studentId/assignmentdue", async (req, res) => {
  await sendAssignmentReminder();
  res.status(200).json({
    data: "success",
  });
});

module.exports = router;
