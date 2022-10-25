import { AssignmentStatus, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { spawn } from "child_process";

interface User {
  id: number;
  cookie: string;
}

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
  // status: AssignmentStatus;
  courseId: number;
}

function getMonthFromString(mon: string) {
  return new Date(Date.parse(mon + " 1, 2012")).getMonth() + 1;
}

const assignmentFetching = async (user: User, course: Course) => {
  const python = spawn("python3", [
    "scripts/get-assignments.py",
    user.cookie,
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

  await prisma.assignment.createMany({
    data: filteredAssignments.map((assignment) => {
      return {
        name: assignment.name,
        image: assignment.image,
        url: assignment.url,
        postDate: assignment.postDate,
        dueDate: assignment.dueDate,
        courseId: assignment.courseId,
      };
    }),
  });

  const allAssignmentStatus = await prisma.userAssignmentStatus.findMany();
  const pushedAssignments = await prisma.assignment.findMany();
  const filteredAssignmentStatus: any[] = [];
  pushedAssignments.forEach((assignment: Assignment) => {
    const status = formattedAssignments.find(
      (a: Assignment) => a.url === assignment.url
    );
    if (status) filteredAssignmentStatus.push(status);
  });

  // Check if the assignment status is already in the database
  const assignmentStatusNotInDb: any[] = [];
  filteredAssignmentStatus.forEach((assignment: any) => {
    const assignmentId = pushedAssignments.find(
      (a) => a.url === assignment.url
    )?.id;
    const filter = allAssignmentStatus.filter(
      (c) => c.assignmentId === assignmentId && c.userId === user.id
    );
    if (filter.length == 0) {
      assignmentStatusNotInDb.push({
        assignmentId,
        ...assignment,
      });
    }
  });

  // Push the assignment status to the database
  const statusResponse = await prisma.userAssignmentStatus.createMany({
    data: assignmentStatusNotInDb.map((assignment: any) => {
      return {
        userId: 1,
        assignmentId: assignment.assignmentId,
        status: assignment.status,
      };
    }),
  });
  return statusResponse;
};

export default assignmentFetching;
