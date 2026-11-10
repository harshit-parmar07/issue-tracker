import React from 'react';
import prisma from '@/prisma/client';
import { notFound } from 'next/navigation';
import EditIssueForm from '../../_components/EditIssueForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

const EditIssuePage = async ({ params }: Props) => {
  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId)) notFound();

  const issue = await prisma.issue.findUnique({
    where: { id: issueId }
  });

  if (!issue) notFound();

  return <EditIssueForm issue={issue} />;
};

export default EditIssuePage;
