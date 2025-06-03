import coursesData from "./courses.json";
import modulesData from "./modules.json";
import assignmentsData from "./assignments.json";
import usersData from "./users.json";
import enrollmentsData from "./enrollments.json";
import quizsData from "./quizs.json";

// 创建可变的数据结构
export const courses = [...coursesData];
export const modules = [...modulesData];
export const assignments = [...assignmentsData];
export const users = [...usersData];
export const enrollments = [...enrollmentsData];
export const quizs = [...quizsData];