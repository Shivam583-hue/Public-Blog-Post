import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../Store/authStore";
import toast from "react-hot-toast";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const {error,isLoading,verifyEmail}=useAuthStore()

  function handleChange(index: number, value: string) {
    const newCode = [...code];
    if (value.length > 1) {
        const pastedCode = value.slice(0, 6).split("");
        for (let i = 0; i < 6; i++) {
            newCode[i] = pastedCode[i] || "";
        }
        setCode(newCode);

        // Find the last filled index using an alternative method
        const lastFilledIndex = [...newCode].reverse().findIndex((digit) => digit !== "");
        const focusIndex = lastFilledIndex === -1 ? -1 : newCode.length - lastFilledIndex - 1;
        inputRefs.current[focusIndex < 5 ? focusIndex + 1 : 5]?.focus();
    } else {
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }
}

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode)
      navigate("/")
      toast.success("Email verified successfully")
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (code.every(digit => digit !== '')) {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>); // Simulate event
    }
  }, [code]);

  return (
    <div className="max-w-md w-full mt-28 h-full sm:ml-[35%] sm:mt-[10%] bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold font-mono mb-6 text-center text-gray-400 bg-clip-text">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-100 mb-6">
          Enter the 6-digit code sent to your email address.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)} 
                type="text"
                maxLength={6} // Change from 6 to 1
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold font-mono bg-gray-700 text-gray-400 border-gray-700 rounded-lg focus:border-[#99d6ea] focus:outline-none"
              />
            ))}
          </div>
           {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
          <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              type="submit" 
              disabled={isLoading || code.some((digit) => !digit)} 
              className="w-full bg-gray-400 text-[#1b1d36] font-extrabold font-mono py-3 px-4 rounded-lg shadow-lg text-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#99d6ea] cursor-pointer"
          >
              {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
