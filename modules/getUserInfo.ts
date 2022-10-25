import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getUserInfo = async (studentId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      studentId: studentId,
    },
    include: {
      UserEnrolledCourses: {
        include: {
          course: {
            include: {
              assignments: true,
            },
          },
        },
      },
      UserAssignmentStatus: {
        include: {
          assignment: true,
        },
      },
    },
  });

  if (user) {
    const response = {
      id: user.id,
      studentId: user.studentId,
      name: user.name,
      enrolledCourses: user.UserEnrolledCourses.map((course) => {
        return {
          id: course.course.id,
          courseId: course.course.courseId,
          name: course.course.name,
          image: course.course.image,
          url: course.course.url,
          assignments: course.course.assignments.map((assignment) => {
            return {
              id: assignment.id,
              name: assignment.name,
              image: assignment.image,
              url: assignment.url,
              postDate: assignment.postDate,
              dueDate: assignment.dueDate,
              createdAt: assignment.createdAt,
              updatedAt: assignment.updatedAt,
              status: user.UserAssignmentStatus.find(
                (status) => status.assignmentId === assignment.id
              )?.status,
            };
          }),
        };
      }),
    };
    return response;
  } else {
    return null;
  }
};

export default getUserInfo;
