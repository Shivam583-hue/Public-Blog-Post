import { motion } from "framer-motion";
import React,{ useState, useEffect,  } from "react";
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

interface BlogCardProps {
  blog: BlogPost;
  onLikeUpdate?: (blogId: number, liked: boolean) => void;
}




const BlogCard = React.memo(({ blog, onLikeUpdate }: BlogCardProps) => {
  const navigate = useNavigate();
  const [isMarked, setIsMarked] = useState(false);
  const [isLiked, setIsLiked] = useState(blog.isLiked);
  const [likeCount, setLikeCount] = useState(blog._count.likes);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleReadMore = () => {
    navigate(`/blog/${blog.blog_id}`);
  };

  if (!user) {
    return null;
  }

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.post<APIResponse<void>>(`/blog/${blog.blog_id}/like`, {
        userId: user.id,
      });

      if (response.data.success) {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        onLikeUpdate?.(blog.blog_id, true);
      } else {
        throw new Error(response.data.message || "Failed to like blog");
      }
    } catch (error) {
      console.error("Error liking blog:", error);
      showErrorToast("Unable to like the blog. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleRemoveLike = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.delete<APIResponse<void>>(`/blog/${blog.blog_id}/removeLike`, {
        data: { userId: user.id },
      });

      if (response.data.success) {
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
        onLikeUpdate?.(blog.blog_id, false);
      } else {
        throw new Error(response.data.message || "Failed to remove like");
      }
    } catch (error) {
      console.error("Error removing like:", error);
      showErrorToast("Unable to unlike the blog. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async() => {
    try {
      const response = await axios.post(`/blog/:blog_id/bookmark`,{
        userId: user.id,
        blogId: blog.blog_id,
      })
      if (response.data.success) {
        setIsMarked(true)
      } else {
        throw new Error(response.data.message || "Failed to bookmark blog");
      }
    } catch (error) {
      console.error("Error bookmark blog:", error);
      showErrorToast("Unable to bookmark the blog. Please try again later.");
    }
  }

  const showErrorToast = (message: string) => {
    alert(message);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-[#272727] w-full p-4 lg:p-6 rounded-3xl shadow-lg space-y-4 lg:space-y-0">
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
            {isMarked ? (<motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsMarked(!isMarked)}
            className="flex-shrink-0"
            aria-label={isMarked ? "Remove bookmark" : "Bookmark this post"}
          >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
                aria-hidden="true"
              >
                <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Z" />
              </svg></motion.button>
            ) : (
              <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBookmark}
            className="flex-shrink-0"
            aria-label={isMarked ? "Remove bookmark" : "Bookmark this post"}
            ><svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e8eaed"
                aria-hidden="true"
              >
                <path d="M200-120v-640q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v640L480-240 200-120Zm80-122 200-86 200 86v-518H280v518Zm0-518h400-400Z" />
              </svg></motion.button>
            )}
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={isLiked ? handleRemoveLike : handleLike}
              className="flex-shrink-0"
              disabled={isLoading}
              aria-label={isLiked ? "Unlike this post" : "Like this post"}
            >
              {isLiked ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e8eaed"
                  aria-hidden="true"
                >
                  <path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e8eaed"
                  aria-hidden="true"
                >
                  <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
                </svg>
              )}
            </motion.button>
            <span className="text-gray-300 text-sm">{likeCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
});



const Bookmarks = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const { user } = useAuthStore();

  useEffect(()=>{
    const fetchBookmarksBlogs = async() => {
      if (!user) return;
      const response = await axios.get(`/${user.id}/bookmarks`)
      setBlogs(response.data.data || []);
    }
    fetchBookmarksBlogs()
  },[])

  return (
    <div className="ml-9">
      <h1 className="sm:text-6xl text-4xl font-serif p-4 font-bold bg-gradient-to-tr from-gray-800 via-gray-400 to-purple-800 bg-clip-text text-transparent shadow-lg">
            Your Bookmarks
      </h1>
      <div className="flex flex-col items-center space-y-6 max-w-4xl mx-auto">
          {blogs.length === 0 ? (
            <div className="text-gray-400 text-lg">No blogs found</div>
          ) : (
            blogs.map((blog) => (
              <BlogCard
                key={blog.blog_id}
                blog={blog}
              />
            ))
          )}
      </div>
    </div>
  )
}

export default Bookmarks
