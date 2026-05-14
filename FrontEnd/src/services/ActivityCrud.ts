import { api } from './api';
import { type Activity } from '../types/Activity';

const listActivities = async (course_id: string) => {
    const response = await api.get(`activities/?course_id=${course_id}`);
    return response.data as Activity[];
};

const retrieveActivity = async (activity_id: string) => {
    const response = await api.get(`activities/${activity_id}/`);
    return response.data as Activity;
};

const createActivity = async (activityData: Omit<Activity, 'activity_id'>) => {
    const response = await api.post('activities/', activityData);
    return response.data as Activity;
};

const updateActivity = async (activity_id: string, activityData: Partial<Omit<Activity, 'activity_id'>>) => {
    const response = await api.put(`activities/${activity_id}/`, activityData);
    return response.data as Activity;
}

const uploadActivityFile = async (activity_id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('activity', activity_id);

    const response = await api.post(`activities/upload-file/${activity_id}/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

const detachActivityFile = async (attached_files_id: string) => {
    const response = await api.delete(`activities/detach-file/${attached_files_id}/`);
    return response.data;
};

const uploadActivitySubmissionFile = async (activityId: string, file: File, studentId: string): Promise<any> => {
    const formData = new FormData();
    
    formData.append('file', file);
    formData.append('activity', activityId);

    try {
        const response = await api.post(`/activities/${activityId}/student/${studentId}/upload-submission/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Falha no upload do arquivo de atividade:", error);
        throw error;
    }
};

export {listActivities, retrieveActivity, createActivity, updateActivity, uploadActivityFile, detachActivityFile, uploadActivitySubmissionFile};