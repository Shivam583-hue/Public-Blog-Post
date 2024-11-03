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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const post_route_1 = __importDefault(require("./routes/post.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const verifiyToken_1 = require("./middleware/verifiyToken");
const prisma = new client_1.PrismaClient();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Origin', 'Accept'],
    exposedHeaders: ['set-cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.options('*', (0, cors_1.default)());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://public-blog-post.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
app.use('/api/auth', auth_route_1.default);
app.use('/blog', post_route_1.default);
//normal shit
app.get("/test", (req, res) => { res.send("Server is running 14"); });
//Getting the Preview Cards 
app.get('/home', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
        const recentBlogs = yield prisma.blog.findMany({
            where: {
                createdAt: { gte: tenHoursAgo }
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
                },
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            count: recentBlogs.length,
            data: recentBlogs
        });
    }
    catch (error) {
        console.error('Error fetching recent blogs:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}));
//Getting the Particular Blog
app.get('/home/:blog_id', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blog_id = Number(req.params.blog_id);
    try {
        const oneBlog = yield prisma.blog.findUnique({
            where: { blog_id },
            include: {
                user: {
                    select: {
                        username: true,
                        profilePic: true,
                    },
                },
                category: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                    },
                },
            },
        });
        if (!oneBlog) {
            return res.status(404).json({
                success: false,
                error: "Blog not found",
            });
        }
        res.json({ success: true, data: oneBlog });
    }
    catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
})));
//Getting all the blogs belonging to one user
app.get('/:userId/blogs', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    try {
        const userBlogs = yield prisma.blog.findMany({
            where: { userId },
            include: {
                category: {
                    select: {
                        name: true,
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
        if (!userBlogs.length) {
            return res.status(404).json({ success: false, message: "No blogs found for this user." });
        }
        res.status(200).json({ success: true, data: userBlogs });
    }
    catch (error) {
        console.error('Error retrieving user blogs:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})));
//Getting all the blogs of the authenticated user
app.get('/my-blogs', verifiyToken_1.verifyToken, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID not found in token." });
    }
    try {
        const userBlogs = yield prisma.blog.findMany({
            where: { userId },
            include: {
                category: {
                    select: {
                        name: true,
                    }
                },
                user: {
                    select: {
                        username: true,
                        profilePic: true,
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
        if (!userBlogs.length) {
            return res.status(200).json({ success: true, data: [] });
        }
        res.status(200).json({ success: true, data: userBlogs });
    }
    catch (error) {
        console.error('Error retrieving user blogs:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})));
//Let the authenticated user delete their blog
app.delete('/blogs/:blogId', verifiyToken_1.verifyToken, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogId } = req.params;
    const userId = req.userId;
    const parsedBlogId = Number(blogId);
    if (isNaN(parsedBlogId)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID." });
    }
    try {
        const blog = yield prisma.blog.findUnique({
            where: { blog_id: parsedBlogId },
        });
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found." });
        }
        if (blog.userId !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this blog." });
        }
        yield prisma.blog.delete({
            where: { blog_id: parsedBlogId },
        });
        res.status(200).json({ success: true, message: "Blog deleted successfully." });
    }
    catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
})));
//Getting all the blogs bookmarks by one user
app.get('/:userId/bookmarks', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    try {
        const bookmarkedBlogs = yield prisma.bookmark.findMany({
            where: { userId },
            include: {
                blog: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                profilePic: true,
                            }
                        },
                        category: {
                            select: {
                                name: true,
                            }
                        },
                        _count: {
                            select: {
                                likes: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                blog: {
                    createdAt: 'desc'
                }
            }
        });
        if (!bookmarkedBlogs.length) {
            return res.status(404).json({ success: false, message: "No bookmarked blogs found for this user." });
        }
        const blogs = bookmarkedBlogs.map((bookmark) => bookmark.blog);
        res.status(200).json({ success: true, data: blogs });
    }
    catch (error) {
        console.error('Error retrieving bookmarked blogs:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})));
//Getting own profile information 
app.get('/user/:userId', verifiyToken_1.verifyToken, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized - user not authenticated" });
    }
    try {
        const userProfile = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                profilePic: true,
                bio: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        if (!userProfile) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const profileData = {
            username: userProfile.username,
            profilePic: userProfile.profilePic,
            bio: userProfile.bio,
            followers: userProfile._count.followers,
            following: userProfile._count.following,
        };
        res.status(200).json({ success: true, data: profileData });
    }
    catch (error) {
        console.error("Error retrieving user profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
})));
//Getting others profile information
app.get('/:userId', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    try {
        const profileInfo = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                profilePic: true,
                bio: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                    }
                }
            }
        });
        if (!profileInfo) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, data: profileInfo });
    }
    catch (error) {
        console.error('Error fetching profile info:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
})));
//Lets authenticated user update their profile information
app.put('/api/user/:userId', verifiyToken_1.verifyToken, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profilePic, bio } = req.body;
    if (!profilePic && !bio) {
        return res.status(400).json({ success: false, message: "Nothing to update" });
    }
    try {
        const updatedUser = yield prisma.user.update({
            where: { id: req.userId },
            data: Object.assign(Object.assign({}, (profilePic && { profilePic })), (bio && { bio }))
        });
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                profilePic: updatedUser.profilePic,
                bio: updatedUser.bio
            },
        });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
})));
//Follow an user
app.post('/users/:userId/follow', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: followedId } = req.params;
    const followerId = req.userId;
    if (followerId === undefined) {
        return res.status(401).json({ success: false, message: "Unauthorized - no user ID provided" });
    }
    if (followerId === Number(followedId)) {
        return res.status(400).json({ success: false, message: "Users cannot follow themselves" });
    }
    try {
        const existingFollow = yield prisma.follow.findUnique({
            where: {
                followerId_followedId: {
                    followerId: followerId,
                    followedId: Number(followedId),
                },
            },
        });
        if (existingFollow) {
            return res.status(400).json({ success: false, message: "Already following this user" });
        }
        const follow = yield prisma.follow.create({
            data: {
                followerId: followerId,
                followedId: Number(followedId),
            },
        });
        res.status(201).json({ success: true, message: "User followed successfully", data: follow });
    }
    catch (error) {
        console.error("Error following user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})));
//Unfollow an user
app.delete('/users/:userId/unfollow', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: followedId } = req.params;
    const followerId = req.userId;
    if (followerId === undefined) {
        return res.status(401).json({ success: false, message: "Unauthorized - no user ID provided" });
    }
    if (followerId === Number(followedId)) {
        return res.status(400).json({ success: false, message: "Users cannot unfollow themselves" });
    }
    try {
        const existingFollow = yield prisma.follow.findUnique({
            where: {
                followerId_followedId: {
                    followerId: followerId,
                    followedId: Number(followedId),
                },
            },
        });
        if (!existingFollow) {
            return res.status(404).json({ success: false, message: "You are not following this user" });
        }
        yield prisma.follow.delete({
            where: {
                id: existingFollow.id,
            },
        });
        res.status(200).json({ success: true, message: "User unfollowed successfully" });
    }
    catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})));
//Get the following count
app.get('/users/:userId/following/count', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    try {
        const followingCount = yield prisma.follow.count({
            where: {
                followerId: parsedUserId,
            },
        });
        res.status(200).json({
            success: true,
            data: {
                userId: parsedUserId,
                followingCount,
            },
        });
    }
    catch (error) {
        console.error("Error retrieving following count:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})));
//Get the followers count
app.get('/users/:userId/followers/count', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    try {
        const followersCount = yield prisma.follow.count({
            where: {
                followedId: parsedUserId,
            },
        });
        res.status(200).json({
            success: true,
            data: {
                userId: parsedUserId,
                followersCount,
            },
        });
    }
    catch (error) {
        console.error("Error retrieving followers count:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})));
//Get the followers list
app.get('/users/:userId/followers', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    try {
        const followers = yield prisma.follow.findMany({
            where: {
                followedId: parsedUserId,
            },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profilePic: true,
                    },
                },
            },
        });
        const followersList = followers.map((follow) => ({
            id: follow.follower.id,
            username: follow.follower.username,
            email: follow.follower.email,
            profilePic: follow.follower.profilePic,
        }));
        res.status(200).json({
            success: true,
            data: followersList,
        });
    }
    catch (error) {
        console.error("Error retrieving followers list:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})));
//Get the following list
app.get('/users/:userId/following', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    // Validate userId
    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    try {
        const following = yield prisma.follow.findMany({
            where: {
                followerId: parsedUserId,
            },
            include: {
                followed: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        profilePic: true,
                    },
                },
            },
        });
        const followingList = following.map((follow) => ({
            id: follow.followed.id,
            username: follow.followed.username,
            email: follow.followed.email,
            profilePic: follow.followed.profilePic,
        }));
        res.status(200).json({
            success: true,
            data: followingList,
        });
    }
    catch (error) {
        console.error("Error retrieving following list:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
})));
app.use('*', (req, res) => {
    console.log('404 route hit:', req.originalUrl);
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});
app.listen(3116, () => {
    console.log("Running on port 3116");
});
exports.default = app;
