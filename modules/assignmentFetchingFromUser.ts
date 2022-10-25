import { PrismaClient } from "@prisma/client";
import assignmentFetching from "./assignmentFetching";
const prisma = new PrismaClient();

const assignmentFetchingFromUser = async (studentId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      studentId: studentId,
    },
  });

  if (user) {
    const userCourses = await prisma.userEnrolledCourses.findMany({
      where: {
        userId: user.id,
      },
      include: {
        course: true,
      },
    });

    for (const course of userCourses) {
      const courseCode = course.course.url.replace(
        "https://www.mycourseville.com/?q=courseville/course/",
        ""
      );
      await assignmentFetching(
        {
          id: user.id,
          cookie: user.cookie,
        },
        {
          id: course.courseId,
          code: courseCode,
        }
      );
    }

    return {
      code: 200,
      data: {
        status: "success",
        data: "Fetched",
      },
    };
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

export default assignmentFetchingFromUser;
