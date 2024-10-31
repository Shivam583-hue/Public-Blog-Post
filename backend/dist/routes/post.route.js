"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_controller_1 = require("../controllers/post.controller");
const blog_router = express_1.default.Router();
blog_router.post('/post-blog', post_controller_1.postBlog);
blog_router.post('/:blog_id/like', post_controller_1.postLike);
blog_router.delete('/:blog_id/removeLike', post_controller_1.removeLike);
blog_router.get('/:blog_id/likes', post_controller_1.getLikeCount);
blog_router.post('/:blog_id/comment', post_controller_1.postComments);
blog_router.delete('/:blog_id/comments/:comment_id', post_controller_1.deleteComment);
blog_router.get('/:blog_id/comment/count', post_controller_1.getCommentCount);
blog_router.post('/:blog_id/bookmark', post_controller_1.bookmark);
blog_router.delete('/:blog_id/removebookmark', post_controller_1.deleteBookmark);
blog_router.get('/searchBlog', post_controller_1.searchBlog);
exports.default = blog_router;
