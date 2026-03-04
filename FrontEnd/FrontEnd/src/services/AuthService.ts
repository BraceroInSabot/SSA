import { api } from './api';

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('user/login/', { email, password });
    return response.data;
};