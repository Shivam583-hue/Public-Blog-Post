import { PrismaClient } from "@prisma/client"
import express,{Request,Response} from "express"

const prisma = new PrismaClient();

interface PostBlogRequestBody {
    userId: number;
    title: string;
    writtenby: string; 
    categoryId: number;
    description: string;
    content: string;
    image_url: string;
  }

//Post Blogs
export const postBlog = (async (req: Request, res: Response) => {
    const { userId, title, writtenby, categoryId, description, content, image_url }:PostBlogRequestBody = req.body;

    if (!userId || !title || !categoryId || !description || !content || !image_url) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        return res.status(400).json({ success: false, message: "User does not exist." });
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Category does not exist." });
    }

    try {
        const newBlog = await prisma.blog.create({
            data: {
                title,
                categoryId,
                description,
                content,
                image_url,
                userId,
                writtenby,
            },
        });
        res.status(201).json({ success: true, blog: newBlog }); 
    } catch (error) { 
        console.error('Error creating blog:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})as express.RequestHandler;

//Like Posts
export const postLike = (async (req: Request, res: Response) => {
    const { userId } = req.body;
    const blogId = Number(req.params.blog_id);

    if (isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    try {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const blogExists = await prisma.blog.findUnique({ where: { blog_id: blogId } });
        if (!blogExists) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_blogId: { userId, blogId }
            }
        });

        if (existingLike) {
            return res.status(400).json({ success: false, message: 'Blog already liked by this user' });
        }

        await prisma.like.create({
            data: {
                userId,
                blogId
            }
        });

        const likeCount = await prisma.like.count({ where: { blogId } });
        
        res.json({ success: true, message: 'Blog liked', likeCount });
    } catch (error) {
        console.error('Error liking blog:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})as express.RequestHandler;

//Remove the Like
export const removeLike = (async (req: Request, res: Response) => {
    const { userId } = req.body;
    const blogId = Number(req.params.blog_id);

    if (isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    try {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_blogId: { userId, blogId }
            }
        });

        if (!existingLike) {
            return res.status(404).json({ success: false, message: 'Like not found' });
        }

        await prisma.like.delete({
            where: {
                userId_blogId: { userId, blogId }
            }
        });

        res.json({ success: true, message: 'Like removed' });
    } catch (error) {
        console.error('Error removing like:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})as express.RequestHandler;

//Get the number of likes
export const getLikeCount = (async (req: Request, res: Response) => {
    const blogId = Number(req.params.blog_id);

    if (isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    try {
        const likeCount = await prisma.like.count({
            where: {
                blogId
            }
        });

        res.json({ success: true, likeCount });
    } catch (error) {
        console.error('Error fetching like count:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})as express.RequestHandler;


//Post Comments
export const postComments = (async (req: Request, res: Response) => {
    const { content, blogId, userId } = req.body;

    // Input validation
    if (!userId || !content || !blogId) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (typeof content !== 'string' || content.length > 500) { // Example length check
        return res.status(400).json({ success: false, message: "Content must be a string and less than 500 characters." });
    }

    const blogIdNum = Number(blogId);
    const userIdNum = Number(userId);

    if (isNaN(blogIdNum) || isNaN(userIdNum)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID or user ID." });
    }

    try {
        const newComment = await prisma.comment.create({
            data: {
                content,
                userId: userIdNum,
                blogId: blogIdNum,
            }
        });
        res.status(201).json({ success: true, message: "Comment added successfully", data: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}) as express.RequestHandler;

//Delete Comment
export const deleteComment = (async (req: Request, res: Response) => {
    const commentId = Number(req.params.comment_id);
    const blogId = Number(req.params.blog_id); 

    if (isNaN(commentId) || isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid comment ID or blog ID' });
    }

    try {
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!existingComment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });

        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}) as express.RequestHandler;

//Get the number of comments
export const getCommentCount = (async (req: Request, res: Response) => {
    const blogId = Number(req.params.blog_id);

    if (isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    try {
        const commentCount = await prisma.comment.count({
            where: { blogId }
        });

        res.json({ success: true, count: commentCount });
    } catch (error) {
        console.error('Error fetching comment count:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}) as express.RequestHandler;


//Add Bookmark
export const bookmark = (async(req: Request, res: Response) => {
    const { userId, blogId } = req.body;

    if (!userId || !blogId) {
        return res.status(400).json({ success: false, message: "User ID and Blog ID are required." });
    }

    try {
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_blogId: { userId, blogId}
            }
        });
        if (existingBookmark) {
            return res.status(400).json({ success: false, message: "Bookmark already exists." });
        }

        const newBookmark = await prisma.bookmark.create({
            data: { userId, blogId }
        });
        
        res.status(201).json({ success: true, message: "Bookmark added successfully.", data: newBookmark });
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}) as express.RequestHandler;

//Delete Bookmark
export const deleteBookmark = (async(req: Request, res: Response) => {
    const { userId } = req.body; 
    const blogId = Number(req.params.blog_id); 

    if (!userId || !blogId) {
        return res.status(400).json({ success: false, message: "User ID and Blog ID are required." });
    }

    try {
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_blogId: { userId, blogId }
            }
        });
        
        if (!existingBookmark) {
            return res.status(404).json({ success: false, message: 'Bookmark not found' });
        }

        await prisma.bookmark.delete({
            where: { id: existingBookmark.id }
        });

        res.json({ success: true, message: 'Bookmark deleted successfully' });
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    } 
}) as express.RequestHandler;


//Search Blogs
export const searchBlog = (async (req: Request, res: Response) => {
    const { name } = req.query;

    if (typeof name !== 'string' || !name) {
        return res.status(400).json({ success: false, message: "Search term is required." });
    }

    try {
        const blogs = await prisma.blog.findMany({
            where: {
                OR: [  
                    { title: { contains: name, mode: 'insensitive' } },
                    { description: { contains: name, mode: 'insensitive' } },
                    { content: { contains: name, mode: 'insensitive' } },
                    { category: { name: { contains: name, mode: 'insensitive' } } }
                ]
            },
            include: {
                user: {
                    select: {
                        username: true,
                        profilePic: true  
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({ success: true, message: "Blogs retrieved successfully.", data: blogs });
    } catch (error) {
        console.error('Error searching blogs:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}) as express.RequestHandler;



