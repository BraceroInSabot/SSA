import { api } from './api';
import { type Course } from '../types/Courses';

const listCourses = async () => {
    const response = await api.get('course/');
    return response.data as Course[];
};

const retrieveCourse = async (courseID: number) => {
    const response = await api.get(`course/${courseID}/`);
    return response.data as Course;
};

const createCourse = async (courseData: { course_name: string; course_year: string }) => {
    const response = await api.post('course/create/', courseData);
    return response.data as Course;
};

export {
    listCourses,
    retrieveCourse,
    createCourse,
};