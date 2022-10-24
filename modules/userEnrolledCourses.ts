import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { spawn } from "child_process";

interface UserEnrolledCourses {
  userId: number;
  courseId: number;
}

const userEnrolledCourses = async (studentId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      studentId: studentId,
    },
  });

  if (user) {
    const python = spawn("python3", ["scripts/get-course.py", user.cookie]);
    const scrapData = new Promise((resolve, reject) => {
      python.stdout.on("data", function (data: string) {
        resolve(data.toString());
      });
      python.stderr.on("data", (data: string) => {
        reject(data.toString());
      });
    });

    const data = await scrapData;
    const courses = JSON.parse(String(data).replace(/'/g, '"'));
    const courseList = courses.map((course: any) => {
      return course.id;
    });

    const userCourses = await prisma.course.findMany({
      where: {
        courseId: {
          in: courseList,
        },
      },
    });

    const formatted = userCourses.map((course: any) => {
      return {
        courseId: course.id,
        userId: user.id,
      };
    });

    const allUserEnrolledCourses = await prisma.userEnrolledCourses.findMany({
      where: {
        userId: user.id,
      },
    });
    const filteredUserEnrolled: UserEnrolledCourses[] = [];
    formatted.forEach((course: UserEnrolledCourses) => {
      const filter = allUserEnrolledCourses.filter(
        (c) => c.courseId === course.courseId && c.userId === course.userId
      );
      if (filter.length == 0) {
        filteredUserEnrolled.push(course);
      }
    });

    try {
      const response = await prisma.userEnrolledCourses.createMany({
        data: filteredUserEnrolled,
      });
      return {
        code: 200,
        data: {
          status: "success",
          data: response,
        },
      };
    } catch (error) {
      return {
        code: 403,
        data: {
          status: "error",
          data: error,
        },
      };
    }
  } else {
    return {
      code: 403,
      data: {
        status: "error",
        data: "no user found",
      },
    };
  }
};
export default userEnrolledCourses;
