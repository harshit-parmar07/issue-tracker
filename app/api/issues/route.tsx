import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/client';
import { issueSchema } from '../../validationSchemas';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/auth/authOptions';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({}, { status: 401 });

  const body = await request.json();
  const validation = issueSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), {
      status: 400
    });
  }

  const {
    title,
    description,
    status,
    priority,
    dueDate,
    labelIds
  } = validation.data;

  const parsedDueDate =
    dueDate && dueDate.trim() !== ''
      ? new Date(dueDate)
      : null;

  const newIssue = await prisma.issue.create({
    data: {
      title,
      description,
      status: status || 'OPEN',
      priority: priority || 'MEDIUM',
      dueDate: parsedDueDate,
      labels:
        labelIds && labelIds.length > 0
          ? {
              create: labelIds.map((labelId) => ({
                labelId
              }))
            }
          : undefined
    },
    include: {
      labels: { include: { label: true } }
    }
  });

  revalidatePath('/issues/list');
  revalidatePath('/');

  return NextResponse.json(newIssue, { status: 201 });
}
