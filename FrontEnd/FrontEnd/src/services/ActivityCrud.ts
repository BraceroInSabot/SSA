import { api } from './api';
import { type Activity } from '../types/Activity';

const listActivities = async (course_id: string) => {
    const response = await api.get(`activity/?course_id=${course_id}`);
    return response.data as Activity[];
};

const createActivity = async (activityData: Omit<Activity, 'activity_id'>) => {
    const response = await api.post('activity/create/', activityData);
    return response.data as Activity;
};

export {listActivities, createActivity};