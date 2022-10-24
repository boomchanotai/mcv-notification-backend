import { AssignmentStatus, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { spawn } from "child_process";

interface Course {
  id: number;
  code: string;
}

interface Assignment {
  id: number;
  name: string;
  image: string;
  url: string;
  postDate: Date;
  dueDate: Date;
  status: AssignmentStatus;
  courseId: number;
}

function getMonthFromString(mon: string) {
  return new Date(Date.parse(mon + " 1, 2012")).getMonth() + 1;
}

const assignmentFetching = async (cookie: string, course: Course) => {
  const python = spawn("python3", [
    "scripts/get-assignments.py",
    cookie,
    course.code,
  ]);
  const scrapData = new Promise((resolve, reject) => {
    python.stdout.on("data", function (data: string) {
      resolve(data.toString());
    });
    python.stderr.on("data", (data: string) => {
      reject(data.toString());
    });
  });
  const data = await scrapData;
  const assignments = JSON.parse(String(data).replace(/'/g, '"'));
  const formattedAssignments = assignments.map((assignment: any) => {
    return {
      name: assignment.name,
      image: assignment.img,
      url: assignment.url,
      postDate: new Date(
        assignment.post_date.split(" ")[2],
        getMonthFromString(assignment.post_date.split(" ")[1]),
        assignment.post_date.split(" ")[0]
      ),
      dueDate: new Date(
        assignment.due_date.split(" ")[2],
        getMonthFromString(assignment.due_date.split(" ")[1]),
        assignment.due_date.split(" ")[0],
        assignment.due_date.split(" ")[4].split(":")[0],
        assignment.due_date.split(" ")[4].split(":")[1]
      ),
      status: assignment.status.includes("Submitted") ? "DONE" : "TODO",
      courseId: course.id,
    };
  });

  const allAssignments = await prisma.assignment.findMany();
  const filteredAssignments: Assignment[] = [];
  formattedAssignments.forEach((assignment: Assignment) => {
    const filter = allAssignments.filter((a) => a.url === assignment.url);
    if (filter.length == 0) {
      filteredAssignments.push(assignment);
    }
  });

  const response = await prisma.assignment.createMany({
    data: filteredAssignments,
  });
  return response;
};

export default assignmentFetching;
