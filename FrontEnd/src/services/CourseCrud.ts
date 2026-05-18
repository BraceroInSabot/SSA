import { api } from './api';
import { type Course } from '../types/Courses';

const listCourses = async () => {
    const response = await api.get('courses/');
    return response.data as Course[];
};

const retrieveCourse = async (courseID: string) => {
    const response = await api.get(`courses/${courseID}/`);
    return response.data as Course;
};

const createCourse = async (courseData: { course_name: string; course_year: string, color: string }) => {
    const response = await api.post('courses/', courseData);
    return response.data as Course;
};

const updateCourse = async (courseID: string, courseData: Partial<Course>) => {
    const response = await api.patch(`courses/${courseID}/`, courseData);
    return response.data as Course;
};

const deleteCourse = async (courseID: string) => {
    const response = await api.delete(`courses/${courseID}/`);
    return response.data;
};

const getCourseAnalytics = async (courseID: string) => {
    const response = await api.get(`courses/${courseID}/analytics/`);
    return response.data;
};

export {
    listCourses,
    retrieveCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseAnalytics
};