import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Input: React.FC<InputProps> = ({ icon: Icon, ...props }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-gray-300" />
      </div>
      <input 
        {...props}
        className="w-full pl-10 pr-3 py-2 bg-[#1b1d36] bg-opacity-50 rounded-lg border border-gray-700 focus:border-[#99d6ea] focus:ring-2 focus:ring-[#99d6ea] text-[#99d6ea] placeholder-gray-400 transition duration-200 font-extrabold font-mono"
      />
    </div>
  );
}

export default Input;
