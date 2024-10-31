"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBlog = exports.deleteBookmark = exports.bookmark = exports.getCommentCount = exports.deleteComment = exports.postComments = exports.getLikeCount = exports.removeLike = exports.postLike = exports.postBlog = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
//Post Blogs
exports.postBlog = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, title, writtenby, categoryId, description, content, image_url } = req.body;
    if (!userId || !title || !categoryId || !description || !content || !image_url) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }
    const userExists = yield prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
        return res.status(400).json({ success: false, message: "User does not exist." });
    }
    const categoryExists = yield prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
        return res.status(400).json({ success: false, message: "Category does not exist." });
    }
    try {
        const newBlog = yield prisma.blog.create({
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
    }
    catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Like Posts
exports.postLike = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const blogId = Number(req.params.blog_id);
    if (isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }
    try {
        const userExists = yield prisma.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const blogExists = yield prisma.blog.findUnique({ where: { blog_id: blogId } });
        if (!blogExists) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }
        const existingLike = yield prisma.like.findUnique({
            where: {
                userId_blogId: { userId, blogId }
            }
        });
        if (existingLike) {
            return res.status(400).json({ success: false, message: 'Blog already liked by this user' });
        }
        yield prisma.like.create({
            data: {
                userId,
                blogId
            }
        });
        const likeCount = yield prisma.like.count({ where: { blogId } });
        res.json({ success: true, message: 'Blog liked', likeCount });
    }
    catch (error) {
        console.error('Error liking blog:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Remove the Like
exports.removeLike = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const blogId = Number(req.params.blog_id);
    if (isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }
    try {
        const existingLike = yield prisma.like.findUnique({
            where: {
                userId_blogId: { userId, blogId }
            }
        });
        if (!existingLike) {
            return res.status(404).json({ success: false, message: 'Like not found' });
        }
        yield prisma.like.delete({
            where: {
                userId_blogId: { userId, blogId }
            }
        });
        res.json({ success: true, message: 'Like removed' });
    }
    catch (error) {
        console.error('Error removing like:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Get the number of likes
exports.getLikeCount = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogId = Number(req.params.blog_id);
    if (isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }
    try {
        const likeCount = yield prisma.like.count({
            where: {
                blogId
            }
        });
        res.json({ success: true, likeCount });
    }
    catch (error) {
        console.error('Error fetching like count:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Post Comments
exports.postComments = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const newComment = yield prisma.comment.create({
            data: {
                content,
                userId: userIdNum,
                blogId: blogIdNum,
            }
        });
        res.status(201).json({ success: true, message: "Comment added successfully", data: newComment });
    }
    catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Delete Comment
exports.deleteComment = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commentId = Number(req.params.comment_id);
    const blogId = Number(req.params.blog_id);
    if (isNaN(commentId) || isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid comment ID or blog ID' });
    }
    try {
        const existingComment = yield prisma.comment.findUnique({
            where: { id: commentId }
        });
        if (!existingComment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }
        yield prisma.comment.delete({
            where: { id: commentId }
        });
        res.json({ success: true, message: 'Comment deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Get the number of comments
exports.getCommentCount = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogId = Number(req.params.blog_id);
    if (isNaN(blogId)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }
    try {
        const commentCount = yield prisma.comment.count({
            where: { blogId }
        });
        res.json({ success: true, count: commentCount });
    }
    catch (error) {
        console.error('Error fetching comment count:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Add Bookmark
exports.bookmark = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, blogId } = req.body;
    if (!userId || !blogId) {
        return res.status(400).json({ success: false, message: "User ID and Blog ID are required." });
    }
    try {
        const existingBookmark = yield prisma.bookmark.findUnique({
            where: {
                userId_blogId: { userId, blogId }
            }
        });
        if (existingBookmark) {
            return res.status(400).json({ success: false, message: "Bookmark already exists." });
        }
        const newBookmark = yield prisma.bookmark.create({
            data: { userId, blogId }
        });
        res.status(201).json({ success: true, message: "Bookmark added successfully.", data: newBookmark });
    }
    catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Delete Bookmark
exports.deleteBookmark = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const blogId = Number(req.params.blog_id);
    if (!userId || !blogId) {
        return res.status(400).json({ success: false, message: "User ID and Blog ID are required." });
    }
    try {
        const existingBookmark = yield prisma.bookmark.findUnique({
            where: {
                userId_blogId: { userId, blogId }
            }
        });
        if (!existingBookmark) {
            return res.status(404).json({ success: false, message: 'Bookmark not found' });
        }
        yield prisma.bookmark.delete({
            where: { id: existingBookmark.id }
        });
        res.json({ success: true, message: 'Bookmark deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting bookmark:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//Search Blogs
exports.searchBlog = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.query;
    if (typeof name !== 'string' || !name) {
        return res.status(400).json({ success: false, message: "Search term is required." });
    }
    try {
        const blogs = yield prisma.blog.findMany({
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
    }
    catch (error) {
        console.error('Error searching blogs:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
