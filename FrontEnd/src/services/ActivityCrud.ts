import { api } from './api';
import { type Activity } from '../types/Activity';

const listActivities = async (course_id: string) => {
    const response = await api.get(`activity/?course_id=${course_id}`);
    return response.data as Activity[];
};

const retrieveActivity = async (activity_id: string) => {
    const response = await api.get(`activity/${activity_id}/`);
    return response.data as Activity;
};

const createActivity = async (activityData: Omit<Activity, 'activity_id'>) => {
    const response = await api.post('activity/create/', activityData);
    return response.data as Activity;
};

const updateActivity = async (activity_id: string, activityData: Partial<Omit<Activity, 'activity_id'>>) => {
    const response = await api.put(`activity/${activity_id}/`, activityData);
    return response.data as Activity;
}

const uploadActivityFile = async (activity_id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('activity', activity_id);

    const response = await api.post(`activity/upload-file/${activity_id}/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

const detachActivityFile = async (attached_files_id: string) => {
    const response = await api.delete(`activity/detach-file/${attached_files_id}/`);
    return response.data;
};

export {listActivities, retrieveActivity, createActivity, updateActivity, uploadActivityFile, detachActivityFile};