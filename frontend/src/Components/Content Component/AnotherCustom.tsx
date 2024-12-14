// src/AnotherCustom.tsx
import './AnotherCustom.css';

interface CustomTextareaProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
}

const AnotherCustom: React.FC<CustomTextareaProps> = ({ value, onChange, placeholder }) => {
  return (
    <div>
      <textarea 
        className="anothercustom-textarea resize-none my-2 ml-3 pl-4 pt-2 bg-[#181818] rounded-2xl w-[90%] md:w-3/4 h-[150px] focus:outline-none text-white text-mono text-lg placeholder:font-bold placeholder:text-xl pb-20"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export default AnotherCustom;
