import { api } from './api';

export const userInfo = async () => {
    const response = await api.get('user/info/');
    return response.data;
};