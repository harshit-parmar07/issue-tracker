import authOptions from '@/app/auth/authOptions';
import { patchIssueSchema } from '@/app/validationSchemas';
import prisma from '@/prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId)) {
    return NextResponse.json({ error: 'Invalid issue ID' }, { status: 400 });
  }

  const body = await request.json();
  const validation = patchIssueSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user!.email! }
  });
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  const { title, description, status, assignedToUserId } = validation.data;

  if (assignedToUserId) {
    const user = await prisma.user.findUnique({
      where: { id: assignedToUserId }
    });
    if (!user) {
      return NextResponse.json({ error: 'Invalid user.' }, { status: 400 });
    }
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId }
  });
  if (!issue) {
    return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });
  }

  const activitiesToCreate = [];

  if (status && status !== issue.status) {
    activitiesToCreate.push(
      prisma.issueActivity.create({
        data: {
          type: 'STATUS_CHANGE',
          description: `changed status from ${issue.status} to ${status}`,
          oldValue: issue.status,
          newValue: status,
          issueId,
          userId: currentUser.id
        }
      })
    );
  }

  if (
    assignedToUserId !== undefined &&
    assignedToUserId !== issue.assignedToUserId
  ) {
    const newUser = assignedToUserId
      ? await prisma.user.findUnique({
          where: { id: assignedToUserId }
        })
      : null;

    activitiesToCreate.push(
      prisma.issueActivity.create({
        data: {
          type: 'ASSIGNEE_CHANGE',
          description: newUser
            ? `assigned to ${newUser.name}`
            : 'unassigned the issue',
          oldValue: issue.assignedToUserId ?? undefined,
          newValue: assignedToUserId ?? undefined,
          issueId,
          userId: currentUser.id
        }
      })
    );
  }

  const [updatedIssue] = await prisma.$transaction([
    prisma.issue.update({
      where: { id: issue.id },
      data: { title, description, status, assignedToUserId }
    }),
    ...activitiesToCreate
  ]);

  return NextResponse.json(updatedIssue);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId)) {
    return NextResponse.json({ error: 'Invalid issue ID' }, { status: 400 });
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId }
  });

  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }

  await prisma.issue.delete({
    where: { id: issueId }
  });

  return NextResponse.json({ message: 'Issue deleted successfully' });
}
