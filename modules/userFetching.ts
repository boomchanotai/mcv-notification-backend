import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { spawn } from "child_process";

interface User {
  name: string;
  cookie: string;
}

const userFetching = async (username: string, password: string) => {
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
    python.stderr.on("data", (data: string) => {
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
        return {
          code: 200,
          data: {
            status: "success",
            data: user,
          },
        };
      } catch (error) {
        return {
          code: 403,
          data: { status: "error", message: error },
        };
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
        return {
          code: 200,
          data: {
            status: "success",
            data: user,
          },
        };
      } catch (error) {
        return {
          code: 403,
          data: { status: "error", data: "Error IDK" },
        };
      }
    }
  } catch (error) {
    return {
      code: 404,
      data: { status: "error", message: "No user found" },
    };
  }
};

export default userFetching;
