import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { spawn } from "child_process";

interface ScrapCourse {
  id: string;
  title: string;
  image: string;
  url: string;
}

const courseFetching = async (studentId: string) => {
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
    const allCourses = await prisma.course.findMany();

    const filteredCourses: ScrapCourse[] = [];
    courses.forEach((course: ScrapCourse) => {
      const filter = allCourses.filter((c) => c.courseId === course.id);
      if (filter.length == 0) {
        filteredCourses.push(course);
      }
    });

    const formatted = filteredCourses.map((course: ScrapCourse) => {
      return {
        courseId: course.id,
        name: course.title,
        image: course.image,
        url: course.url,
      };
    });

    const response = await prisma.course.createMany({
      data: formatted,
    });

    return response;
  }
};

export default courseFetching;
