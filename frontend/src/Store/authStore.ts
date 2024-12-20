import { create } from "zustand";
import axios from "axios";

axios.defaults.baseURL = 'https://public-blog-post-server-shivams-projects-0d7a6fe1.vercel.app';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';


const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.withCredentials = true;
}

axios.defaults.baseURL = 'https://public-blog-post-server-shivams-projects-0d7a6fe1.vercel.app';

interface User {
    id: number;
    email: string;
    username: string; // Added username field
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    error: null | string;
    isLoading: boolean;
    isCheckingAuth: boolean;
    signup: (email: string, password: string, username: string) => Promise<void>;
    signin: (email: string, password: string) => Promise<boolean>;
    verifyEmail: (code: string) => Promise<void>;
    checkAuth: () => Promise<void>;
    signout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    isVerified: boolean;
    message: string | null;
    setupAxiosInterceptors: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    isVerified: false,
    message: null,

    signout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post('/api/auth/signout');
            set({ user: null, isAuthenticated: false, error: null, isLoading: false });
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },
    signup: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/auth/signup', { email, password, username });
            const user: User = response.data.user;
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error:', error.response);
                set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
            } else {
                console.error('Unknown Error:', error);
                set({ error: "An unknown error occurred", isLoading: false });
            }
            throw error;
        }
    },

    signin: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('/api/auth/signin', { email, password });
            
            if (response.data.success && response.data.user) {
                // Save token first
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                }

                // Then update state atomically
                set({
                    user: response.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                return true;
            }
            
            set({ 
                error: "Invalid response from server", 
                isAuthenticated: false, 
                isLoading: false,
                user: null
            });
            return false;
        } catch (error: any) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            
            set({ 
                error: error.response?.data?.message || "Error signing in", 
                isLoading: false,
                isAuthenticated: false,
                user: null
            });
            return false;
        }
    },
    
    verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`/api/auth/verify-email`, { code });
            
            if (response.data.success) {
                // Save the new token
                localStorage.setItem('token', response.data.token);
                
                // Set the Authorization header for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                // Update the user state
                set({ 
                    user: response.data.user, 
                    isAuthenticated: true, 
                    isLoading: false,
                    error: null
                });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Error verifying email";
            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                set({ isAuthenticated: false, isCheckingAuth: false });
                return;
            }
    
            // Set Authorization header with token
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            const response = await axios.get('/api/auth/check-auth');
            console.log('Check Auth response:', response.data);
    
            if (response.data.user) {
                set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
            } else {
                set({ isAuthenticated: false, isCheckingAuth: false });
            }
        } catch (error: any) {
            console.error('Check Auth Error:', error);
            
            // Clear token if checkAuth fails
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
    
            set({ 
                error: error.message || 'Authentication failed', 
                isCheckingAuth: false, 
                isAuthenticated: false, 
                user: null 
            });
        }
    },
    

    forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await axios.post("/api/auth/forgot-password", { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response.data.message || "Error sending reset password email"
            });
            throw error;
        }
    },

    resetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await axios.post(`/api/auth/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response.data.message,
            });
            throw error;
        }
    },

    setupAxiosInterceptors: () => {
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }
}));
