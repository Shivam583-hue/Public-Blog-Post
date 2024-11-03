import { motion } from "framer-motion";  
import React,{ useEffect, useState } from "react";  
import axios from "axios";  
import { useAuthStore } from "../Store/authStore";  
import { useNavigate } from "react-router-dom";

interface User {  
  id: string;  
  username: string;  
  profilePic: string | null;  
}  
interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface BlogCardProps {
  blog: BlogPost;
  onLikeUpdate?: (blogId: number, liked: boolean) => void;
  onDelete?: (blogId: number) => void;
}
interface Category {
  name: string;
}

interface BlogPost {
  blog_id: number;  
  title: string;
  content: string;
  description: string;
  image_url: string;
  createdAt: string;
  user: User;
  category: Category;
  _count: {
    likes: number;
  };
  isLiked?: boolean;
}

interface ProfileProps {  
  username: string;  
  bio: string;  
  followers: number;  
  following: number;  
  pfp: string;  
  onEdit: () => void;  
}  

const BlogCard = React.memo(({ blog,onDelete }: BlogCardProps) => {
  const navigate = useNavigate();
  const likeCount = blog._count.likes;
  const { user } = useAuthStore();

  const handleReadMore = () => {
    navigate(`/blog/${blog.blog_id}`);
  };
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/blogs/${blog.blog_id}`);
      if (response.data.success) {
        console.log("Blog deleted successfully: ", response.data);
        if (onDelete) {
          onDelete(blog.blog_id);
      } 
      }
    } catch (error) {
      console.log("Error in deleting the blog: ", error);
    }
  };

  if (!user) {
    return null;
  }

  
  

  return (
    <motion.div initial={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row bg-[#272727] w-full p-4 lg:p-6 rounded-3xl shadow-lg space-y-4 lg:space-y-0">
      <div className="flex-shrink-0">
        <img
          src={blog.image_url}
          className="rounded-3xl w-full lg:w-[200px] h-[250px] object-cover"
          alt={`Cover image for ${blog.title}`}
        />
      </div>
      <div className="flex flex-col justify-between w-full lg:w-2/3 space-y-4 lg:space-y-0 lg:px-5">
        <div>
          <h1
            style={{ fontFamily: "monospace", fontWeight: "900" }}
            className="tracking-wider text-[#51c8f0] text-2xl md:text-3xl mb-2"
          >
            {blog.title}
          </h1>
          <h2 className="w-auto bg-red-400 text-black font-bold py-1 px-2 rounded-xl inline-block mb-3">
            Category: {blog.category.name}
          </h2>
          <p className="text-gray-100 mb-4 text-sm md:text-base line-clamp-3">
            {blog.description}
          </p>
          <div className="flex items-center space-x-2 text-gray-400 font-semibold text-lg mb-3">
            <img
              src={blog.user.profilePic || "/api/placeholder/32/32"}
              alt={`${blog.user.username}'s profile`}
              className="w-6 h-6 rounded-full"
            />
            <h2>Written by: {blog.user.username}</h2>
            <span className="text-gray-300 text-sm">👍:{likeCount}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#51c8f0] text-black font-bold py-2 px-4 rounded-xl hover:bg-[#41a3c2] transition duration-300"
            aria-label="Read more about this blog post"
            onClick={handleReadMore}
          >
            Read More
          </motion.button>
          <motion.button whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDelete}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

const ProfileCardComponent = ({  
  username,  
  bio,  
  followers,  
  following,  
  pfp,  
  onEdit,  
}: ProfileProps) => {  
  return (  
    <div className="flex flex-col items-center p-4 md:p-6">  
      <div className="bg-black rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-4xl">  
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8">  
          <div className="flex-shrink-0">  
            <img  
              src={pfp}  
              alt={`${username}'s profile`}  
              className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-blue-500 object-cover"  
            />  
          </div>  

          <div className="flex-grow">  
            <div className="flex flex-col items-center sm:items-start">  
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 mb-3">  
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-600">  
                  {username}  
                </h2>  
                
                <motion.button  
                  whileHover={{ scale: 1.05 }}  
                  whileTap={{ scale: 0.98 }}  
                  className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-3 font-mono text-gray-300 font-bold text-sm py-1"  
                  onClick={onEdit}  
                >  
                  Edit  
                </motion.button>  
              </div>  

              <div className="flex gap-6 mb-3">  
                <div className="flex flex-col items-center sm:items-start">  
                  <span className="text-gray-300 font-semibold">  
                    {followers}  
                  </span>  
                  <span className="text-gray-400 text-sm">Followers</span>  
                </div>  
                <div className="flex flex-col items-center sm:items-start">  
                  <span className="text-gray-300 font-semibold">  
                    {following}  
                  </span>  
                  <span className="text-gray-400 text-sm">Following</span>  
                </div>  
              </div>  

              <p className="text-gray-400 text-sm sm:text-base text-center sm:text-left">  
                {bio}  
              </p>  
            </div>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
};  

interface EditProfileProps {  
  currentBio: string;  
  currentPfp: string;  
  onCancel: () => void;  
  onSave: (bio: string, pfp: string) => void;  
}  

const EditProfileCardComponent = ({  
  currentBio,  
  currentPfp,  
  onCancel,  
  onSave,  
}: EditProfileProps) => {  
  const [bio, setBio] = useState(currentBio);  
  const [pfp, setPfp] = useState(currentPfp);  

  const handleSubmit = (e: React.FormEvent) => {  
    e.preventDefault();  
    onSave(bio, pfp);  
  };  

  return (  
    <div className="flex flex-col items-center min-h-screen p-4 md:p-6">  
      <div className="bg-black rounded-3xl shadow-lg p-6 w-full max-w-2xl space-y-6">  
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 text-center mb-6">  
          Edit Profile  
        </h2>  
        <form onSubmit={handleSubmit} className="space-y-4">  
          <div className="space-y-2">  
            <label className="text-gray-400 text-sm">Profile Image URL</label>  
            <input  
              type="url"  
              name="imageUrl"  
              value={pfp}  
              onChange={(e) => setPfp(e.target.value)}  
              placeholder="Enter image URL"  
              required  
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#3a3b3a] rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"  
            />  
          </div>  

          <div className="space-y-2">  
            <label className="text-gray-400 text-sm">Bio</label>  
            <textarea  
              name="bio"  
              value={bio}  
              onChange={(e) => setBio(e.target.value)}  
              placeholder="Tell us about yourself"  
              rows={4}  
              required  
              className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#3a3b3a] rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors duration-200 resize-none"  
            />  
          </div>  

          <div className="flex justify-end space-x-4 pt-4">  
            <motion.button  
              type="button"  
              whileHover={{ scale: 1.05 }}  
              whileTap={{ scale: 0.98 }}  
              className="bg-[#2a2b2a] hover:bg-[#3a3b3a] rounded-2xl px-4 font-mono text-gray-400   
                       font-bold text-sm py-2 transition-colors duration-200"  
              onClick={onCancel}  
            >  
              Cancel  
            </motion.button>  

            <motion.button  
              type="submit"  
              whileHover={{ scale: 1.05 }}  
              whileTap={{ scale: 0.98 }}  
              className="bg-[#3a3b3a] hover:bg-[#555655] rounded-2xl px-4 font-mono text-gray-300   
                       font-bold text-sm py-2 transition-colors duration-200"  
            >  
              Save Changes  
            </motion.button>  
          </div>  
        </form>  
      </div>  
    </div>  
  );  
};  

const ProfilePage = () => {  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [username, setUsername] = useState("");  
  const [followers, setFollowers] = useState(0);  
  const [following, setFollowing] = useState(0);  
  const [bio, setBio] = useState("");  
  const [pfp, setPfp] = useState("");  
  const { user } = useAuthStore();  
  const [isEditing, setIsEditing] = useState(false);  
  
  const fetchProfile = async () => {  
    if (!user) return;  
    try {  
      const response = await axios.get(`/user/${user.id}`);  
      if (response.data.success && response.data.data) {  
        const profileData = response.data.data;  
        setUsername(profileData.username);  
        setFollowers(profileData.followers);  
        setFollowing(profileData.following);  
        setBio(profileData.bio);  
        setPfp(profileData.profilePic);  
      }  
    } catch (error) {  
      console.error("Error fetching profile:", error);  
    }  
  };  

  useEffect(() => {  
    fetchProfile();  
  }, [user]);  
 
  const handleEdit = () => {  
    setIsEditing(true);  
  };  
  
  const handleCancel = () => {  
    setIsEditing(false);  
  };  
  
  const handleSave = async (newBio: string, newPfp: string) => {  
    if (!user) return;  
    try {  
      const response = await axios.put(`/api/user/${user.id}`, {  
        profilePic: newPfp,  
        bio: newBio,  
      });  
      if (response.data.success) {  
        console.log("Profile Updated Successfully");  
        setBio(newBio);  
        setPfp(newPfp);  
        setIsEditing(false);  
      } else {  
        console.error("Failed to update profile:", response.data.message);  
      }  
    } catch (error) {  
      console.error("Error updating profile", error);  
    }  
  };  

  if (!user) {  
    return (  
      <div className="flex items-center justify-center min-h-screen">  
        <p className="text-gray-400">Loading...</p>  
      </div>  
    );  
  }  
  useEffect(() => {

    const fetchBlogs = async () => {
      try {
        const response = await axios.get<APIResponse<BlogPost[]>>('/my-blogs');
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch blogs');
        }
        
        setBlogs(response.data.data || []);
      } catch (err) {
       
      } 
    };

    fetchBlogs();

  }, []);
  const handleDelete = (blogId: number) => {
    setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.blog_id !== blogId));
  };

  return isEditing ? (  
    <EditProfileCardComponent  
      currentBio={bio}  
      currentPfp={pfp}  
      onCancel={handleCancel}  
      onSave={handleSave}  
    />  
  ) : (  
    <div>
      <ProfileCardComponent  
        username={username}  
        followers={followers}  
        following={following}  
        bio={bio}  
        pfp={pfp}  
        onEdit={handleEdit}  
      />
      <h1 className="sm:text-6xl text-4xl font-mono p-4 ml-9 font-bold bg-gradient-to-bl from-gray-800 via-gray-500 to-black-800 bg-clip-text text-transparent shadow-lg">
            Your Blogs
      </h1>
      <div className="flex flex-col items-center space-y-6 max-w-4xl mx-5">
          {blogs.length === 0 ? (
            <div className="text-gray-400 text-lg">No blogs found</div>
          ) : (
            blogs.map((blog) => (
              <BlogCard
                key={blog.blog_id}
                blog={blog}
                onDelete={handleDelete}
              />
            ))
          )}
      </div>

    </div>  
  );  
};  

export default ProfilePage;