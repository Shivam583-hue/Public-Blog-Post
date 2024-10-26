import { BrowserRouter, Navigate, Route,Routes } from "react-router-dom"
import SignUpPage from "./Pages/SignUpPage"
import SignInPage from "./Pages/SignInPage"
import EmailVerificationPage from "./Pages/EmailVerificationPage"
import { Toaster } from "react-hot-toast"
import { useAuthStore } from "./Store/authStore"
import { useEffect } from "react"
import HomePage from "./Pages/HomePage"
import ForgotPasswordPage from "./Pages/ForgotPasswordPage"
import ResetPasswordPage from "./Pages/ResetPasswordPage"

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuthStore();

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

  if (isAuthenticated && user && user.isVerified) {
    return <Navigate to='/' replace />;
  }

  return children;
};


function App() {
  
  const {checkAuth,isAuthenticated,user}=useAuthStore()

  useEffect(() => {
    checkAuth();
    console.log("Authenticated state in App: ", isAuthenticated);  
    console.log("User in App: ", user);  
  }, [checkAuth, isAuthenticated, user]);
  
  
  console.log("Authenticated state : ",isAuthenticated)
  console.log("user : ",user)

  return (
    <div className="bg-[#1b1d36] flex items-center justify-center min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
          <Route path="/signup" element={<RedirectAuthenticatedUser><SignUpPage/></RedirectAuthenticatedUser>}/>
          <Route path="/signin" element={<RedirectAuthenticatedUser><SignInPage/></RedirectAuthenticatedUser>}/>
          <Route path="/verify-email" element={<EmailVerificationPage/>}/>
          <Route path="/forgot-password" element={<RedirectAuthenticatedUser><ForgotPasswordPage/></RedirectAuthenticatedUser>}/>
          <Route path="/reset-password/:token" element={<RedirectAuthenticatedUser><ResetPasswordPage/></RedirectAuthenticatedUser>} />
        </Routes>
      </BrowserRouter>
      <Toaster/>
    </div>
    )
}

export default App
