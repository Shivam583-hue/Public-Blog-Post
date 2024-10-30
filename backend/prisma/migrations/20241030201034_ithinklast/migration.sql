-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_blogId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_blogId_fkey";

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("blog_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("blog_id") ON DELETE CASCADE ON UPDATE CASCADE;
