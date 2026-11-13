import React from 'react';
import prisma from '@/prisma/client';
import { notFound } from 'next/navigation';
import IssueForm from '../../_components/IssueForm';

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

  return <IssueForm issue={issue} />;
};

export default EditIssuePage;
