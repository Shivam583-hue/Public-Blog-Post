import {motion} from "framer-motion"
import axios from 'axios';
import { useState } from "react"
import CustomTextArea from "../Components/Description Component/CustomTextArea"
import AnotherCustom from "../Components/Content Component/AnotherCustom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../Store/authStore";

const CreateBlogPage = () => {
    const [cat,setCat] = useState("Please choose a category") // category
    const [text, setText] = useState<string>(''); //description
    const [content,setContent] = useState<string>(''); //content
    const [url,setUrl] = useState('') //image url
    const [title,setTitle] = useState('')
    const navigate = useNavigate()
    const { user } = useAuthStore(state => state);
    const userId = user?.id; 
    const username = user?.username; 

    function descriptionHandler(event: React.ChangeEvent<HTMLTextAreaElement>){
        setText(event.target.value);
    }
    function contentHandler(event: React.ChangeEvent<HTMLTextAreaElement>){
        setContent(event.target.value);
    }
    const handleCreate = async () => {
        const categoryMap = {
            "Hardware": 1,
            "Health": 2,
            "Education": 3,
            "Personal Progress": 4,
            "Software": 5,
            "Food": 6,
            "Travel": 7,
            "Photography": 8,
            "Business": 9
        };
    
        const categoryId = categoryMap[cat as keyof typeof categoryMap];
    
        if (!userId || !categoryId || !text || !content || !url) {
            alert("All fields are required.");
            return;
        }
    
        try {
            const response = await axios.post('/blog/post-blog', {
                userId,
                title: title,
                writtenby: username,
                categoryId,
                description: text,
                content,
                image_url: url,
            });
    
            if (response.data.success) {
                alert("Blog created successfully!");
                navigate('/')
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Error creating blog:", error);
            alert("Failed to create blog.");
        }
    };    
   

  return (
    <div className="ml-2 pt-2">        
        
        <h1 className="text-6xl font-serif p-4 font-bold bg-gradient-to-r from-gray-300 via-gray-500 to-gray-700 bg-clip-text text-transparent shadow-lg">
            Create New Blog
        </h1>
        <div className="ml-7 pt-4 flex flex-col md:flex-row justify-between">
            <div className="flex-1 mr-4">
                <input
                    type="text"
                    className="ml-3 pl-4 my-3 pb-2 bg-[#424242] rounded-2xl sm:w-full h-14 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 transition duration-200 text-[#5bcdf3] text-mono font-bold text-lg shadow-md"
                    placeholder="Add a title to your blog"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="ml-3 my-3 pl-4 pb-2 bg-[#424242] rounded-2xl sm:w-full h-14 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 transition duration-200 text-[#5bcdf3] text-mono font-bold text-lg shadow-md"
                    placeholder="Address of preview image"
                />
            </div>
            <div className="flex-1 ml-4">
                {url && (
                    <img
                        className="h-[250px] rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                        src={url}
                    />
                )}
                </div>
            </div>

       
        <h1 className="text-xl font-mono text-gray-300 ml-3 mt-4 mb-1 "> ➫ Select one of the categories for your blog below</h1>
        <div className="sm:w-5/6">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2" onClick={() => setCat("Hardware")}>
                Hardware
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2 " onClick={() => setCat("Health")}>
                Health
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2" onClick={() => setCat("Education")}>
                Education
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2" onClick={() => setCat("Personal Progress")}>
                Personal Progress
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2" onClick={() => setCat("Software")}>
                Software
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2" onClick={() => setCat("Food")}>
                Food
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2" onClick={() => setCat("Travel")}>
                Travel
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2" onClick={() => setCat("Photography")}>
                Photography
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 mt-2" onClick={() => setCat("Business")}>
                Business
            </motion.button>
        </div>

        <h1 className="text-xl mt-4  font-mono text-gray-300 ml-3 "> ➫ The Category You Have Chosen Is</h1>
        <h1 className="bg-[#99d6ea] rounded-2xl px-2 font-mono w-max text-gray-700 font-bold text-lg py-1 mx-2 mb-3">{cat}</h1>


        <CustomTextArea value={text} onChange={descriptionHandler}  placeholder={"Add a small description to your blog"}/>


        <AnotherCustom value={content} onChange={contentHandler} placeholder={"Write the content of your blog here"}/>
        <motion.button onClick={handleCreate} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-lg py-1 mx-2 my-2">
            Create
        </motion.button>
    </div>
  )
}

export default CreateBlogPage
