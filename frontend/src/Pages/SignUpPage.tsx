import { motion } from "framer-motion";
import Input from "../Components/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../Store/authStore";

const SignUpPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); // Correct usage of useNavigate
    const { signup, error, isLoading } = useAuthStore();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await signup(email, password, name);
            navigate("/verify-email"); // Navigate after signup
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-md w-full mt-28 h-full sm:ml-[35%] sm:mt-[10%] bg-black bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold font-mono mb-6 text-center text-gray-400">
                    Create Account
                </h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        icon={User}
                        placeholder="Full Name"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    />
                    <Input
                        type="email"
                        icon={Mail}
                        placeholder="Email Address"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                    <Input
                        type="password"
                        icon={Lock}
                        placeholder="Password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
                    <motion.button
                        type="submit"
                        disabled={isLoading} // Correct placement of `disabled`
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-2 w-full py-3 px-4 text-[#1b1d36] rounded-lg bg-gray-400 hover:bg-gray-600 font-bold font-mono text-xl"
                    >
                        {isLoading ? <Loader className="animate-spin mx-auto" size={24} /> : "Sign Up"}
                    </motion.button>
                </form>
            </div>
            <div className="px-8 py-4 bg-gray-800 bg-opacity-50 flex justify-center">
                <p className="text-sm text-gray-400">
                    Already have an account?{"  "}
                    <Link to={"/signin"} className="text-white hover:underline">Sign In</Link>
                </p>
            </div>
        </motion.div>
    );
};

export default SignUpPage;
