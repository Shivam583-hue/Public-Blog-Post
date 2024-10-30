import {motion} from "framer-motion"
import Logo2 from "./Logo2.png";
import { useAuthStore } from "./Store/authStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const Sidebar = () => {
    const navigate = useNavigate()
    const [closed,setClosed] = useState(false)
    const {signout} = useAuthStore(); 
    function handleSidebar(){
        setClosed(prevState => !prevState)
    }
    function handlePost(){
        navigate("./create-blog")
    }
    function handleSearch(){
        navigate("./search")
    }
    function handleProfile(){
        navigate("./profile")
    }
    function handleHome(){
        navigate("./")
    }
    function handleBookmark(){
        navigate("./bookmarks")
    }
    function handleSignout() {
        signout().then(() => {
          navigate("/signin");
        }).catch((error) => console.error("Signout error:", error));
    }  
    function handleMore(){
        navigate("./more")
    }
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 768) {
                setClosed(true);
            }
        }

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return closed?<motion.button whileHover={{ scale: 1.0 }}   className="flex mt-5 ml-3" onClick={handleSidebar}><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="27px" fill="#e8eaed"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg></motion.button>:(
        <div className="bg-black w-[350px] shadow-4xl border-r-[1px] border-x-gray-400 min-h-screen">
            <div className="p-12">
                <div className="pl-[42px] flex">
                    <img src={Logo2} className="w-12 h-12"/>
                    <h1 style={{fontWeight:600}} className="text-gray-300 font-mono pt-2 text-2xl ">Blugify</h1>
                </div>
                <motion.button onClick={handleHome} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className=" mt-8 bg-black text-white w-64 h-12 rounded-3xl font-sans flex pt-1  pl-12 font-semibold text-[25px] hover:bg-[#343635] ">
                    <div className="pt-[6px] pr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#e8eaed"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>
                    </div>
                    Home
                </motion.button>
                <motion.button onClick={handleSearch} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-3 bg-black text-white w-64 h-12 rounded-3xl font-sans flex pt-1  pl-12 font-semibold text-[25px] hover:bg-[#343635] ">
                    <div className="pt-[6px] pr-1 font-extrabold">
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#e8eaed"><path d="M782.87-98.52 526.91-354.48q-29.43 21.74-68.15 34.61Q420.04-307 375.48-307q-114.09 0-193.55-79.46-79.45-79.45-79.45-193.54 0-114.09 79.45-193.54Q261.39-853 375.48-853q114.09 0 193.54 79.46 79.46 79.45 79.46 193.54 0 45.13-12.87 83.28T601-429.7l256.52 257.09-74.65 74.09ZM375.48-413q69.91 0 118.45-48.54 48.55-48.55 48.55-118.46t-48.55-118.46Q445.39-747 375.48-747t-118.46 48.54Q208.48-649.91 208.48-580t48.54 118.46Q305.57-413 375.48-413Z"/></svg>
                    </div>
                    Search
                </motion.button>
                <motion.button onClick={handleBookmark} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-3 bg-black text-white w-64 h-12 rounded-3xl font-sans flex pt-1 pl-12 font-semibold text-[25px] hover:bg-[#343635] ">
                    <div className="pt-[6px] pr-1">
                    <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#e8eaed"><path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z"/></svg>
                    </div>
                    Bookmarks
                </motion.button>
                <motion.button onClick={handleProfile} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-3 bg-black text-white w-64 h-12 rounded-3xl font-sans flex pt-1 pl-12 font-semibold text-[25px] hover:bg-[#343635] ">
                    <div className="pt-[6px] pr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#e8eaed"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                    </div>
                    Profile
                </motion.button>
                <motion.button onClick={handleSignout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-3 bg-black text-white w-64 h-12 rounded-3xl font-sans flex pt-1 pl-12 font-semibold text-[25px] hover:bg-[#343635] ">
                    <div className="pt-[6px] pr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#e8eaed"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
                    </div>
                    Sign Out
                </motion.button>
                <motion.button onClick={handlePost} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-9 bg-gray-600 text-white w-[220px] h-16 rounded-[50px] font-sans flex pt-[13px] pl-10 ml-10 font-semibold text-[25px]  hover:bg-[#363434] ">
                    <div className="pt-[6px] pr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#e8eaed"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z"/></svg>
                    </div>
                    Add Blog
                </motion.button>
                <motion.button onClick={handleSidebar} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-[140px] bg-black text-white w-64 h-12 rounded-3xl font-sans flex pt-1 pl-12 font-semibold text-[25px] hover:bg-[#343635] ">
                    <div className="pt-[6px] pr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>
                    </div>
                    Close Side Bar
                </motion.button>
                <motion.button onClick={handleMore} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="mt-3 bg-black text-white w-64 h-12 rounded-3xl font-sans flex pt-1 pl-12 font-semibold text-[25px] hover:bg-[#343635] ">
                    <div className="pt-[6px] pr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#e8eaed"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
                    </div>
                    More
                </motion.button>
            </div>
        </div>
    )
}

export default Sidebar
