// src/CustomTextarea.tsx
import './CustomTextarea.css';

interface CustomTextareaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const CustomTextArea: React.FC<CustomTextareaProps> = ({ value, onChange, placeholder }) => {
  return (
    <div>
      <textarea 
        className="custom-textarea resize-none my-2 ml-3 pl-4 pt-2 bg-[#424242] rounded-2xl w-[90%] md:w-1/2 h-[150px] focus:outline-none text-white text-mono text-lg placeholder:font-bold placeholder:text-xl pb-20"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export default CustomTextArea;
