import { useState, useEffect, } from "react";
import axios from "axios";
import {  useParams } from "react-router-dom";



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


export const BlogDetail = () => {
    const { blog_id } = useParams();
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchBlogDetail = async () => {
        try {
          const response = await axios.get<APIResponse<BlogPost>>(`/home/${blog_id}`);
          
          if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch blog details');
          }
          
          setBlog(response.data.data || null);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
          setLoading(false);
        }
      };
  
      fetchBlogDetail();
    }, [blog_id]);
  
    if (loading) {
      return (
        <div className="p-4 min-h-screen flex items-center justify-center">
          <div className="text-gray-400 mono text-xl">Loading blog details...</div>
        </div>
      );
    }
  
    if (error || !blog) {
      return (
        <div className="p-4 min-h-screen flex items-center justify-center">
          <div className="text-red-500 text-xl">Error: {error || 'Blog not found'}</div>
        </div>
      );
    }
  
    return (
      <div className="min-w-4xl mx-auto p-6">
        <div className="bg-[#272727] rounded-3xl shadow-lg overflow-hidden">
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full h-[400px] object-cover"
          />
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={blog.user.profilePic || "/api/placeholder/32/32"}
                alt={`${blog.user.username}'s profile`}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-gray-400">By {blog.user.username}</span>
            </div>
            <h1 className="text-4xl font-bold text-[#51c8f0] mb-4">{blog.title}</h1>
            <div className="bg-red-400 text-black font-bold py-1 px-2 rounded-xl inline-block mb-4">
              {blog.category.name}
            </div>
            <p className="text-gray-100 mb-6 whitespace-pre-wrap">{blog.content}</p>
            <div className="text-gray-400 text-sm">
              Posted on {new Date(blog.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

