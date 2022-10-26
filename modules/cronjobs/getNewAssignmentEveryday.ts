import { PrismaClient } from "@prisma/client";
import isToday from "../../utils/checkIsToday";
import assignmentFetchingFromUser from "../assignmentFetchingFromUser";
import courseFetching from "../courseFetching";
import getUserInfo from "../getUserInfo";
import userEnrolledCourses from "../userEnrolledCourses";
import sendNewAssignmentNotification from "../sendNewAssignmentNotification";
const prisma = new PrismaClient();

const getNewAssignmentEveryday = async (studentId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      studentId: studentId,
    },
  });
  if (user) {
    await courseFetching(studentId);
    await userEnrolledCourses(studentId);
    await assignmentFetchingFromUser(studentId);
    const data = await getUserInfo(studentId);
    if (data) {
      const response = {
        id: data.id,
        studentId: data.studentId,
        name: data.name,
        enrolledCourses: data.enrolledCourses.map((course) => {
          return {
            id: course.id,
            courseId: course.courseId,
            name: course.name,
            image: course.image,
            url: course.url,
            assignments: course.assignments.filter((assignment) =>
              isToday(assignment.createdAt)
            ),
          };
        }),
      };
      await sendNewAssignmentNotification(user.lineUserId, response, "NEW");
    }
  }
};

export default getNewAssignmentEveryday;
