import { api } from './api';

export const listCampaigns = async () => {
    const response = await api.get('/campaigns/');
    return response.data;
};

export const getCampaignRanking = async (campaignId: string) => {
    const response = await api.get(`/campaigns/${campaignId}/ranking/`);
    return response.data;
};

export const joinCampaign = async (accessCode: string) => {
    const response = await api.post(`/campaigns/join/`, { access_code: accessCode });
    return response.data;
};

export const createCampaign = async (data: { name: string; description: string; is_active: boolean }) => {
    const response = await api.post('/campaigns/', data);
    return response.data;
};
