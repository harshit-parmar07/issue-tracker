import authOptions from '@/app/auth/authOptions';
import { patchIssueSchema } from '@/app/validationSchemas';
import prisma from '@/prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({}, { status: 401 });

  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId)) {
    return NextResponse.json(
      { error: 'Invalid issue ID' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const validation = patchIssueSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), {
      status: 400
    });
  }

  const {
    assignedToUserId,
    title,
    description,
    status,
    priority,
    dueDate,
    labelIds
  } = validation.data;

  const existingIssue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { labels: { include: { label: true } } }
  });

  if (!existingIssue) {
    return NextResponse.json(
      { error: 'Invalid issue' },
      { status: 404 }
    );
  }

  const currentUser = session.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email }
      })
    : null;

  const parsedDueDate =
    dueDate === undefined
      ? undefined
      : dueDate && dueDate.trim() !== ''
        ? new Date(dueDate)
        : null;

  try {
    const updatedIssue = await prisma.$transaction(
      async (tx) => {
        if (labelIds !== undefined) {
          await tx.issueLabel.deleteMany({
            where: { issueId }
          });
          if (labelIds.length > 0) {
            await tx.issueLabel.createMany({
              data: labelIds.map((labelId) => ({
                issueId,
                labelId
              })),
              skipDuplicates: true
            });
          }
        }

        const updated = await tx.issue.update({
          where: { id: issueId },
          data: {
            title,
            description,
            assignedToUserId,
            status,
            priority,
            dueDate: parsedDueDate
          },
          include: {
            labels: { include: { label: true } }
          }
        });

        if (currentUser) {
          if (status && status !== existingIssue.status) {
            await tx.issueActivity.create({
              data: {
                type: 'STATUS_CHANGE',
                description: `changed status from ${existingIssue.status} to ${status}`,
                oldValue: existingIssue.status,
                newValue: status,
                issueId,
                userId: currentUser.id
              }
            });
          }

          if (
            priority &&
            priority !== existingIssue.priority
          ) {
            await tx.issueActivity.create({
              data: {
                type: 'PRIORITY_CHANGE',
                description: `changed priority from ${existingIssue.priority} to ${priority}`,
                oldValue: existingIssue.priority,
                newValue: priority,
                issueId,
                userId: currentUser.id
              }
            });
          }

          if (
            assignedToUserId !== undefined &&
            assignedToUserId !==
              existingIssue.assignedToUserId
          ) {
            const assignee = assignedToUserId
              ? await tx.user.findUnique({
                  where: { id: assignedToUserId }
                })
              : null;
            await tx.issueActivity.create({
              data: {
                type: 'ASSIGNEE_CHANGE',
                description: assignee
                  ? `assigned to ${assignee.name}`
                  : 'unassigned the issue',
                oldValue:
                  existingIssue.assignedToUserId ??
                  undefined,
                newValue: assignedToUserId ?? undefined,
                issueId,
                userId: currentUser.id
              }
            });
          }

          if (dueDate !== undefined) {
            const oldDateStr = existingIssue.dueDate
              ? existingIssue.dueDate
                  .toISOString()
                  .split('T')[0]
              : null;
            const newDateStr = parsedDueDate
              ? parsedDueDate.toISOString().split('T')[0]
              : null;

            if (oldDateStr !== newDateStr) {
              await tx.issueActivity.create({
                data: {
                  type: 'SLA_CHANGE',
                  description: newDateStr
                    ? `set SLA due date to ${newDateStr}`
                    : 'cleared SLA due date',
                  oldValue: oldDateStr ?? undefined,
                  newValue: newDateStr ?? undefined,
                  issueId,
                  userId: currentUser.id
                }
              });
            }
          }

          if (labelIds !== undefined) {
            const newLabels = updated.labels
              .map((l) => l.label.name)
              .join(', ');
            await tx.issueActivity.create({
              data: {
                type: 'LABELS_CHANGED',
                description: newLabels
                  ? `updated labels to: ${newLabels}`
                  : 'cleared all labels',
                issueId,
                userId: currentUser.id
              }
            });
          }
        }

        return updated;
      }
    );

    revalidatePath('/issues/list');
    revalidatePath(`/issues/${issueId}`);
    revalidatePath('/');

    return NextResponse.json(updatedIssue);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Invalid issue' },
        { status: 404 }
      );
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid user or label' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({}, { status: 401 });

  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId)) {
    return NextResponse.json(
      { error: 'Invalid issue ID' },
      { status: 400 }
    );
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId }
  });

  if (!issue) {
    return NextResponse.json(
      { error: 'Invalid Issue' },
      { status: 404 }
    );
  }

  await prisma.issue.delete({
    where: { id: issue.id }
  });

  revalidatePath('/issues/list');
  revalidatePath('/');

  return NextResponse.json({});
}
