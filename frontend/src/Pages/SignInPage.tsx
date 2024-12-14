import { motion } from "framer-motion";
import Input from "../Components/Input";
import { Loader, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../Store/authStore";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signin, isLoading, error } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signin(email, password);
    } catch (error) {
      console.error("Error signing in", error);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="max-w-md w-full mt-28 h-full sm:ml-[35%] sm:mt-[10%]  bg-black bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold font-mono mb-6 text-center text-gray-400">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            icon={Mail}
            placeholder="Email Address"
            value={email}
            onChange={(e:any) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            icon={Lock}
            placeholder="Password"
            value={password}
            onChange={(e:any) => setPassword(e.target.value)}
          />
          <div className="flex items-center mb-6">
            <Link
              to={"/forgot-password"}
              className="text-sm text-white hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 w-full py-3 px-4 text-[#1b1d36] rounded-lg bg-gray-400 hover:bg-gray-600 font-bold font-mono text-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>
      </div>
      <div className="px-8 py-4 bg-gray-800 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{"  "}
          <Link to={"/signup"} className="text-white hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignInPage;
