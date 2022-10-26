import { PrismaClient } from "@prisma/client";
import sendSmallLineMessage from "../sendSmallLineMessage";
const prisma = new PrismaClient();

const dayjs = require("dayjs");

function diff(start: any, end: any) {
  start = start.split(":");
  end = end.split(":");
  var startDate = new Date(0, 0, 0, start[0], start[1], 0);
  var endDate = new Date(0, 0, 0, end[0], end[1], 0);
  var diff = endDate.getTime() - startDate.getTime();
  var hours = Math.floor(diff / 1000 / 60 / 60);
  diff -= hours * 1000 * 60 * 60;
  var minutes = Math.floor(diff / 1000 / 60);

  // If using time pickers with 24 hours format, add the below line get exact hours
  if (hours < 0) hours = hours + 24;

  return (
    (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes
  );
}

const sendAssignmentReminder = async () => {
  const assignments = await prisma.assignment.findMany({
    where: {
      AND: [
        {
          dueDate: {
            lte: dayjs().add(3, "hour").toISOString(),
            gte: dayjs().toISOString(),
          },
        },
      ],
    },
    include: {
      course: true,
      UserAssignmentStatus: {
        include: {
          user: true,
        },
      },
    },
  });

  const messages = [];
  for (const assignment of assignments) {
    const unDoneAssignments = assignment.UserAssignmentStatus.filter(
      (status) => status.status === "TODO"
    );
    for (const undone of unDoneAssignments) {
      const differenceTime = diff(
        dayjs().format("HH:mm"),
        dayjs(assignment.dueDate).format("HH:mm")
      ).split(":");
      messages.push({
        message: `❗️ Assignment Reminder\n\n${assignment.course.name} | ${
          assignment.name
        }\n👉 เหลือเวลาอีก ${
          differenceTime[0] !== "00" ? differenceTime[0] + " ชั่วโมง " : ""
        }${differenceTime[1]} นาที`,
        lineUserId: undone.user.lineUserId,
      });
    }
  }

  for (const message of messages) {
    await sendSmallLineMessage(message.message, message.lineUserId);
  }
};

export default sendAssignmentReminder;
