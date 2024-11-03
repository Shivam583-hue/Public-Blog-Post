import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";  
import { useEffect } from "react";  
import { Toaster } from "react-hot-toast";  
import { useAuthStore } from "./Store/authStore";  

import SignUpPage from "./Pages/SignUpPage";  
import SignInPage from "./Pages/SignInPage";  
import EmailVerificationPage from "./Pages/EmailVerificationPage";  
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";  
import ResetPasswordPage from "./Pages/ResetPasswordPage";  

import HomePage from "./BlogPages/HomePage";  
import CreateBlogPage from "./BlogPages/CreateBlogPage";  
import SearchPage from "./BlogPages/SearchPage";  
import ProfilePage from "./BlogPages/ProfilePage";  
import Sidebar from "./Sidebar";  
import Bookmarks from "./BlogPages/Bookmarks";
import More from "./BlogPages/More";
import { BlogDetail } from "./BlogPages/BlogDetail";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {  
  const { isAuthenticated, user, isLoading } = useAuthStore();  

  // Handle loading state
  if (isLoading) {
      return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated || !user) {  
      return <Navigate to='/signin' replace />;  
  }  

  if (!user.isVerified) {  
      return <Navigate to='/verify-email' replace />;  
  }  

  return children;  
};  

const RedirectAuthenticatedUser = ({ children }: { children: JSX.Element }) => {  
  const { isAuthenticated, user } = useAuthStore();  

  // Directly return Navigate based on condition
  if (isAuthenticated && user && user.isVerified) {
      return <Navigate to='/' replace />;  
  }  

  return children;  
};  


function App() {  
  const { checkAuth, isAuthenticated, user, setupAxiosInterceptors } = useAuthStore();  

  useEffect(() => {  
    setupAxiosInterceptors();  
    checkAuth();  
  }, []);  

  useEffect(() => {  
    console.log("Authenticated state in App: ", isAuthenticated);  
    console.log("User in App: ", user);  
  }, [isAuthenticated, user]);  

  return (  
    <div className="bg-[#181818] flex min-h-screen">  
      <BrowserRouter>  
        {isAuthenticated && user && user.isVerified ? <Sidebar /> : null}  
        <Routes>  
          {/* Authentication Routes */}  
          <Route path="/signup" element={<RedirectAuthenticatedUser><SignUpPage/></RedirectAuthenticatedUser>} />  
          <Route path="/signin" element={<RedirectAuthenticatedUser><SignInPage/></RedirectAuthenticatedUser>} />  
          <Route path="/verify-email" element={<EmailVerificationPage/>} />  
          <Route path="/forgot-password" element={<RedirectAuthenticatedUser><ForgotPasswordPage/></RedirectAuthenticatedUser>} />  
          <Route path="/reset-password/:token" element={<RedirectAuthenticatedUser><ResetPasswordPage/></RedirectAuthenticatedUser>} />  

          {/* Protected Blog Routes */}  
          <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>} />  
          <Route path="/create-blog" element={<ProtectedRoute><CreateBlogPage /></ProtectedRoute>} />  
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />  
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />  
          <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />  
          <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />  
          <Route path="/blog/:blog_id" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />
        </Routes>  
      </BrowserRouter>  
      <Toaster />  
    </div>  
  );  
}  

export default App;