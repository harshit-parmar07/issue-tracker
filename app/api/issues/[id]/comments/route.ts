import authOptions from '@/app/auth/authOptions';
import { createCommentSchema } from '@/app/validationSchemas';
import prisma from '@/prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );

  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId))
    return NextResponse.json(
      { error: 'Invalid issue ID' },
      { status: 400 }
    );

  const body = await request.json();
  const validation = createCommentSchema.safeParse(body);
  if (!validation.success)
    return NextResponse.json(validation.error.format(), {
      status: 400
    });

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user!.email! }
  });
  if (!currentUser)
    return NextResponse.json(
      { error: 'User not found' },
      { status: 401 }
    );

  const issue = await prisma.issue.findUnique({
    where: { id: issueId }
  });
  if (!issue)
    return NextResponse.json(
      { error: 'Issue not found' },
      { status: 404 }
    );

  // ACID Transaction for Comment & Audit Log
  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        text: validation.data.text,
        issueId,
        userId: currentUser.id
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    }),
    prisma.issueActivity.create({
      data: {
        type: 'COMMENT_ADDED',
        description: 'added a comment',
        issueId,
        userId: currentUser.id
      }
    })
  ]);

  return NextResponse.json(newComment, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId))
    return NextResponse.json(
      { error: 'Invalid issue ID' },
      { status: 400 }
    );

  const comments = await prisma.comment.findMany({
    where: { issueId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      }
    }
  });

  return NextResponse.json(comments);
}
