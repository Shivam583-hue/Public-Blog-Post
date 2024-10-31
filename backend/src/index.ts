import express,{Request,Response} from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import router from "./routes/auth.route";
import blog_router from "./routes/post.route";
import cookieParser from 'cookie-parser'
import { verifyToken } from "./middleware/verifiyToken";
const prisma = new PrismaClient();
import dotenv from 'dotenv';
dotenv.config();

const app = express();


app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: [
        'https://public-blog-post-app.vercel.app',
        'process.env.FRONTENDURL' // for local development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie']
}));

app.use('/api/auth',router)
app.use('/blog',blog_router)


//normal shit
app.get("/",(req,res)=>{res.send("Server is running 13")})

//Getting the Preview Cards 
app.get('/home', async (req, res) => {
  try {
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);

    const recentBlogs = await prisma.blog.findMany({
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

  } catch (error) {
    console.error('Error fetching recent blogs:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

//Getting the Particular Blog
app.get('/home/:blog_id', (async (req, res) => {
  const blog_id = Number(req.params.blog_id);
  try {
    const oneBlog = await prisma.blog.findUnique({
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
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
})as express.RequestHandler);



//Getting all the blogs belonging to one user
app.get('/:userId/blogs', (async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
      const userBlogs = await prisma.blog.findMany({
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
  } catch (error) {
      console.error('Error retrieving user blogs:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
}) as express.RequestHandler);

//Getting all the blogs of the authenticated user
app.get('/my-blogs', verifyToken, (async (req: Request, res: Response) => {  
    const userId = req.userId;  

    if (!userId) {  
        return res.status(400).json({ success: false, message: "User ID not found in token." });  
    }  

    try {  
        const userBlogs = await prisma.blog.findMany({  
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
    } catch (error) {  
        console.error('Error retrieving user blogs:', error);  
        res.status(500).json({ success: false, error: 'Internal server error' });  
    }  
})as express.RequestHandler);


//Let the authenticated user delete their blog
app.delete('/blogs/:blogId', verifyToken, (async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const userId = req.userId; 

  const parsedBlogId = Number(blogId);
  if (isNaN(parsedBlogId)) {
      return res.status(400).json({ success: false, message: "Invalid blog ID." });
  }

  try {
      const blog = await prisma.blog.findUnique({
          where: { blog_id: parsedBlogId },
      });

      if (!blog) {
          return res.status(404).json({ success: false, message: "Blog not found." });
      }

      if (blog.userId !== userId) {
          return res.status(403).json({ success: false, message: "You are not authorized to delete this blog." });
      }

      await prisma.blog.delete({
          where: { blog_id: parsedBlogId },
      });

      res.status(200).json({ success: true, message: "Blog deleted successfully." });
  } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
  }
}) as express.RequestHandler);

//Getting all the blogs bookmarks by one user
app.get('/:userId/bookmarks', (async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
      const bookmarkedBlogs = await prisma.bookmark.findMany({
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

      const blogs = bookmarkedBlogs.map((bookmark:any) => bookmark.blog);

      res.status(200).json({ success: true, data: blogs });
  } catch (error) {
      console.error('Error retrieving bookmarked blogs:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
}) as express.RequestHandler);


//Getting own profile information 
app.get('/user/:userId', verifyToken, (async (req: Request, res: Response) => {
    const { userId } = req;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized - user not authenticated" });
    }

    try {
        const userProfile = await prisma.user.findUnique({
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
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}) as express.RequestHandler);


//Getting others profile information
app.get('/:userId',(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);

  if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
      const profileInfo = await prisma.user.findUnique({
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
  } catch (error) {
      console.error('Error fetching profile info:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
  }
}) as express.RequestHandler);


//Lets authenticated user update their profile information
app.put('/:userId',verifyToken,(async (req: Request, res: Response) => {
  const { profilePic, bio } = req.body;

  if (!profilePic && !bio) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
  }

  try {
      const updatedUser = await prisma.user.update({
          where: { id: req.userId },
          data: { 
              ...(profilePic && { profilePic }),
              ...(bio && { bio }),
          }
      });

      res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          data: { 
              profilePic: updatedUser.profilePic,
              bio: updatedUser.bio
          },
      });
  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
  }
}) as express.RequestHandler);

//Follow an user
app.post('/users/:userId/follow', (async (req: Request, res: Response) => {
  const { userId: followedId } = req.params;
  const followerId = req.userId; 

  if (followerId === undefined) {
      return res.status(401).json({ success: false, message: "Unauthorized - no user ID provided" });
  }

  if (followerId === Number(followedId)) {
      return res.status(400).json({ success: false, message: "Users cannot follow themselves" });
  }

  try {
      const existingFollow = await prisma.follow.findUnique({
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

      const follow = await prisma.follow.create({
          data: {
              followerId: followerId,
              followedId: Number(followedId),
          },
      });

      res.status(201).json({ success: true, message: "User followed successfully", data: follow });
  } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}) as express.RequestHandler);


//Unfollow an user
app.delete('/users/:userId/unfollow', (async (req: Request, res: Response) => {
  const { userId: followedId } = req.params;
  const followerId = req.userId;

  if (followerId === undefined) {
      return res.status(401).json({ success: false, message: "Unauthorized - no user ID provided" });
  }

  if (followerId === Number(followedId)) {
      return res.status(400).json({ success: false, message: "Users cannot unfollow themselves" });
  }

  try {
      const existingFollow = await prisma.follow.findUnique({
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

      await prisma.follow.delete({
          where: {
              id: existingFollow.id, 
          },
      });

      res.status(200).json({ success: true, message: "User unfollowed successfully" });
  } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}) as express.RequestHandler);


//Get the following count
app.get('/users/:userId/following/count', (async (req: Request, res: Response) => {
  const { userId } = req.params;

  const parsedUserId = Number(userId);
  if (isNaN(parsedUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
      const followingCount = await prisma.follow.count({
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
  } catch (error) {
      console.error("Error retrieving following count:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}) as express.RequestHandler);

//Get the followers count
app.get('/users/:userId/followers/count', (async (req: Request, res: Response) => {
  const { userId } = req.params;

  const parsedUserId = Number(userId);
  if (isNaN(parsedUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
      const followersCount = await prisma.follow.count({
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
  } catch (error) {
      console.error("Error retrieving followers count:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}) as express.RequestHandler);

//Get the followers list
app.get('/users/:userId/followers', (async (req: Request, res: Response) => {
  const { userId } = req.params;

  const parsedUserId = Number(userId);
  if (isNaN(parsedUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
      const followers = await prisma.follow.findMany({
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

      const followersList = followers.map((follow:any) => ({
          id: follow.follower.id,
          username: follow.follower.username,
          email: follow.follower.email,
          profilePic: follow.follower.profilePic,
      }));

      res.status(200).json({
          success: true,
          data: followersList,
      });
  } catch (error) {
      console.error("Error retrieving followers list:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}) as express.RequestHandler);

//Get the following list
app.get('/users/:userId/following', (async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Validate userId
  const parsedUserId = Number(userId);
  if (isNaN(parsedUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
  }

  try {
      const following = await prisma.follow.findMany({
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

      const followingList = following.map((follow:any) => ({
          id: follow.followed.id,
          username: follow.followed.username,
          email: follow.followed.email,
          profilePic: follow.followed.profilePic,
      }));

      res.status(200).json({
          success: true,
          data: followingList,
      });
  } catch (error) {
      console.error("Error retrieving following list:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}) as express.RequestHandler);

app.listen(3116,() => {
  console.log("Running on port 3116")
})
export default app;
