import { api } from './api';

export interface QuestionSubmissionPayload {
    submission_question: string;
    activity: string;
    submission: any;
}

export const submitActivityAnswers = async (activityId: string, answers: QuestionSubmissionPayload[]) => {
    const response = await api.post(`/activities/${activityId}/submit/`, { answers });
    return response.data;
};