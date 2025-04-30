import axios from 'axios';
    import { API_BASE_URL } from '../utils/constants';

    const api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    export const registerUser = async (userData: any) => {
        const response = await api.post('/api/auth/register/', userData);
        return response.data;
    };

    export const loginUser = async (credentials: any) => {
        const response = await api.post('/api/auth/login/', credentials);
        return response.data;
    };

    // Add more functions for logout, reset password, etc.
