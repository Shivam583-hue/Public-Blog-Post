import { motion } from "framer-motion"
import { useState } from "react"
import { useAuthStore } from "../Store/authStore";
import { ArrowLeft, Loader, Mail } from "lucide-react";
import Input from "../Components/Input";
import { Link } from "react-router-dom";
const ForgotPasswordPage = () => {

    const[email,setEmail] = useState("");
    const[isSubmitted,setIsSubmitted] = useState(false)

    const {isLoading,forgotPassword} = useAuthStore()

    async function handleSubmit(e:any){
        e.preventDefault();
        await forgotPassword(email);
        setIsSubmitted(true);
    }

    return (
        <motion.div initial = {{opacity : 0,y:20}}
        animate = {{opacity : 1, y: 0}}
        transition = {{duration : 1}}
        className = "max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold font-mono mb-6 text-center bg-[#99d6ea] text-transparent bg-clip-text">Forgot Password</h2>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <p className="text-gray-300 mb-6 text-center">Enter your email address</p>
                        <Input icon={Mail} type='email' placeholder='Email Address' value={email} onChange={(e:any) => setEmail(e.target.value)} required/>
                        <motion.button whileHover={{scale: 1.02}} whileTap={{scale:0.98}} className='w-full py-3 px-4 bg-[#99d6ea]  font-bold font-mono rounded-lg shadow-lg hover:bg-[#77d3f1] focus:outline-none focus:ring-2 focus:ring-[#77d3f1] focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200' type='submit'>{isLoading?<Loader className='size-6 animate-spin mx-auto'/>:"Send Reset Link"}</motion.button>
                    </form>
                ) : (
                    <div className='text-center'>
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 500, damping: 30 }}
							className='w-16 h-16 bg-[#99d6ea] rounded-full flex items-center justify-center mx-auto mb-4'
						>
							<Mail className='h-8 w-8 text-[#1b1d36]' />
						</motion.div>
						<p className='text-gray-300 mb-6'>
							Instructions to reset password has been sent to {email}.
						</p>
					</div>
                )}
            </div>
            <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
                <Link to={"/signin"} className="text-sm text-[#8bd1e9] hover:underline flex items-center"><ArrowLeft className="h-4 w-4 mr-2"/>Back to Login</Link>
            </div>
        </motion.div>
    )
}

export default ForgotPasswordPage
