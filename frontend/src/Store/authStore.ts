import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:3116'; 


interface User {
    id: number;
    email: string;
    isVerified: boolean;
  }
  
  interface AuthState {
    user: User | null;  // Use the correct User type
    isAuthenticated: boolean;
    error: null | string;
    isLoading: boolean;
    isCheckingAuth: boolean;
    signup: (email: string, password: string, username: string) => Promise<void>;
    signin: (email: string, password: string) => Promise<void>;
    verifyEmail: (code: any) => Promise<void>;
    checkAuth: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;  
    isVerified: boolean;
    message : string |null;
    resetPassword: (token: any, password: string) => Promise<void>;
  }

  export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    isVerified: false,
    message:null,
  
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
          console.log('Signin response:', response.data); // Log the full response to inspect the structure
      
          if (response.data.user) {
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
          } else {
            set({ error: "User data missing in response", isAuthenticated: false, isLoading: false });
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error('Axios Error:', error.response);
            set({ error: error.response?.data?.message || "Error signing in", isLoading: false });
          } else {
            console.error('Unknown Error:', error);
            set({ error: "An unknown error occurred", isLoading: false });
          }
          throw error;
        }
    },
  
    verifyEmail: async (code: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.post(`/api/auth/verify-email`, { code });
        const user: User = response.data.user; 
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Error verifying email",
          isLoading: false,
        });
        throw error;
      }
    },
  
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          const response = await axios.get('/api/auth/check-auth');
          console.log('Check Auth response:', response.data); // Log the response to verify
      
          if (response.data.user) {
            set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
          } else {
            set({ isAuthenticated: false, isCheckingAuth: false });
          }
        } catch (error: any) {
          console.error('Check Auth Error:', error);
          set({ error: null, isCheckingAuth: false, isAuthenticated: false });
        }
      },
    
    forgotPassword: async (email:string) => {
        set({isLoading:true,error:null,message:null});
        try {
            const response = await axios.post("/api/auth/forgot-password",{email})
            set({message : response.data.message,isLoading:false})
        } catch (error:any) {
            set({
                isLoading: false,
                error:error.response.data.message || "Error sending reset password email"
            });
            throw error;
        }
    },

    resetPassword: async(token:any,password:any) => {
        set({isLoading:true,error:null,message:null})
        try {
            const response = await axios.post(`/api/auth/reset-password/:${token}`, {password})
            set({message:response.data.message,isLoading:false})
        } catch (error:any) {
            set({
                isLoading : false,
                error : error.response.data.message,
            });
            throw error;
        }
    }
  }));
  