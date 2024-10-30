import express from "express"
import { postBlog,postComments,postLike,bookmark,searchBlog, removeLike, getLikeCount, deleteComment, getCommentCount, deleteBookmark } from "../controllers/post.controller";

const blog_router = express.Router();

blog_router.post('/post-blog',postBlog)

blog_router.post('/:blog_id/like',postLike)
blog_router.delete('/:blog_id/removeLike',removeLike)
blog_router.get('/:blog_id/likes',getLikeCount)

blog_router.post('/:blog_id/comment',postComments)
blog_router.delete('/:blog_id/comments/:comment_id',deleteComment)
blog_router.get('/:blog_id/comment/count',getCommentCount)

blog_router.post('/:blog_id/bookmark',bookmark)
blog_router.delete('/:blog_id/removebookmark',deleteBookmark)
blog_router.get('/searchBlog',searchBlog)

export default blog_router