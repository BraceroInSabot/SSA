import { api } from './api';

export const getPracticeExams = async () => {
    const response = await api.get('/practice-exams/');
    return response.data;
};

export const getPracticeExam = async (id: string) => {
    const response = await api.get(`/practice-exams/${id}/`);
    return response.data;
};

export const submitPracticeExam = async (data: any) => {
    const response = await api.post('/practice-exam-submissions/', data);
    return response.data;
};

export const logAntiCheat = async (examId: string, duration: number) => {
    const response = await api.post('/anti-cheat-logs/', {
        practice_exam: examId,
        duration_seconds: duration
    });
    return response.data;
};
