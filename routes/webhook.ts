import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import express from "express";
const router = express.Router();

import getUserInfo from "../modules/getUserInfo";
import sendNewAssignmentNotification from "../modules/sendNewAssignmentNotification";

router.post("/", async (req: express.Request, res: express.Response) => {
  if (req.body.events[0].type == "message") {
    const text = req.body.events[0].message.text;
    const sender = req.body.events[0].source.userId;

    const user = await prisma.user.findUnique({
      where: {
        lineUserId: sender,
      },
    });

    if (user) {
      if (text == "TODO") {
        const data = await getUserInfo(user.studentId);
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
          await sendNewAssignmentNotification(sender, response, "TODO");
        }
      } else if (text == "ALL") {
        const data = await getUserInfo(user.studentId);
        if (data) {
          await sendNewAssignmentNotification(sender, data, "ALL");
        }
      }
    }
  }
  res.sendStatus(200);
});

module.exports = router;
