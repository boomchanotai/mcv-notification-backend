import axios from "axios";

const sendNewAssignmentNotification = async (data: any) => {
  const courses = data.enrolledCourses;
  let message = "‼️ New Assignment Announcement";
  for (const course of courses) {
    let text = "\n";
    if (course.assignments.length > 0) {
      text += `\n📚 ${course.name} has ${course.assignments.length} new assignments\n`;
      for (const assignment of course.assignments) {
        text += assignment.name + "\n";
        text +=
          "> ส่งวันที่ " +
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
      to: "U2a999525267a69c041507361b6200ee9",
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
