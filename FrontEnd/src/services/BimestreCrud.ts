import { api } from './api';
import { type Bimestre } from '../types/Bimestre';

export const listBimestres = async () => {
    const response = await api.get('bimestres/');
    return response.data as Bimestre[];
};

export const retrieveBimestre = async (id: string) => {
    const response = await api.get(`bimestres/${id}/`);
    return response.data as Bimestre;
};

export const createBimestre = async (data: { name: string; year: number; courses?: string[] }) => {
    const response = await api.post('bimestres/', data);
    return response.data as Bimestre;
};

export const updateBimestre = async (id: string, data: { name: string; year: number; courses?: string[] }) => {
    const response = await api.put(`bimestres/${id}/`, data);
    return response.data as Bimestre;
};

export const deleteBimestre = async (id: string) => {
    const response = await api.delete(`bimestres/${id}/`);
    return response.data;
};
