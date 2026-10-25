import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BLOG_POSTS_SEED } from '@/data/blog-posts';

export async function GET() {
  const count = await prisma.blogPost.count();
  if (count === 0) {
    for (const post of BLOG_POSTS_SEED) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        create: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.authorName,
          readTime: post.readTime,
          coverImage: post.coverImage,
          published: post.published,
        },
        update: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.authorName,
          readTime: post.readTime,
          coverImage: post.coverImage,
          published: post.published,
        },
      });
    }
  }

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ posts });
}
