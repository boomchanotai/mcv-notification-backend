import axios from "axios";

const sendSmallLineMessage = async (message: string, userId: string) => {
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
};

export default sendSmallLineMessage;
