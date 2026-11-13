import authOptions from '@/app/auth/authOptions';
import prisma from '@/prisma/client';
import { Box, Flex, Grid } from '@radix-ui/themes';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import AssigneeSelect from './AssigneeSelect';
import DeleteIssueButton from './DeleteIssueButton';
import EditIssueButton from './EditIssueButton';
import IssueDetails from './IssueDetails';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string };
}

const fetchUser = cache((issueId: number) =>
  prisma.issue.findUnique({ where: { id: issueId } })
);

const IssueDetailPage = async ({ params }: Props) => {
  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId)) notFound();

  const session = await getServerSession(authOptions);
  const issue = await fetchUser(issueId);

  if (!issue) {
    notFound();
  }

  return (
    <Grid columns={{ initial: '1', sm: '5' }} gap="5">
      <Box className="md:col-span-4">
        <IssueDetails issue={issue} />
      </Box>
      {session && (
        <Box>
          <Flex direction="column" gap="4">
            <AssigneeSelect issue={issue} />
            <EditIssueButton issueId={issue.id} />
            <DeleteIssueButton issueId={issue.id} />
          </Flex>
        </Box>
      )}
    </Grid>
  );
};

export async function generateMetadata({ params }: Props) {
  const issueId = parseInt(params.id, 10);
  if (isNaN(issueId)) {
    return {
      title: 'Issue Not Found',
      description: 'The requested issue does not exist'
    };
  }

  const issue = await fetchUser(issueId);

  return {
    title: issue?.title,
    description: 'Details of issue ' + issue?.id
  };
}

export default IssueDetailPage;
