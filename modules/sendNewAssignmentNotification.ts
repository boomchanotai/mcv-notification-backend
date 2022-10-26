import axios from "axios";

const sendNewAssignmentNotification = async (
  userId: string,
  data: any,
  type: string
) => {
  const courses = data.enrolledCourses;
  let message =
    type === "NEW"
      ? "‼️ New Assignment Announcement"
      : type === "TODO"
      ? "📝 Assignment Reminder"
      : "⏰ All Assignments";
  for (const course of courses) {
    let text = "\n";
    if (course.assignments.length > 0) {
      text +=
        type === "NEW"
          ? `\n📚 ${course.name} has ${course.assignments.length} new assignments\n`
          : type === "TODO"
          ? `\n📚 ${course.name} has ${course.assignments.length} assignments wait for you\n`
          : `\n📚 ${course.name} are\n`;
      for (const assignment of course.assignments) {
        text += assignment.name + "\n";
        text +=
          "👉 ส่งวันที่ " +
          new Date(assignment.dueDate).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) +
          " " +
          new Date(assignment.dueDate).toLocaleTimeString("en-GB") +
          "\n";
      }
      message += text;
      text = "";
    }
  }
  await axios.post(
    "https://api.line.me/v2/bot/message/push",
    {
      to: userId,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.LINE_CHANNEL_ACCESS_SECRET,
      },
    }
  );

  return null;
};

export default sendNewAssignmentNotification;
