import Pagination from '@/app/components/Pagination';
import prisma from '@/prisma/client';
import { Priority, Status } from '@prisma/client';
import { Flex } from '@radix-ui/themes';
import { Metadata } from 'next';
import IssueActions from './IssueActions';
import IssueTable, {
  columnNames,
  IssueQuery
} from './IssueTable';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: IssueQuery;
}

const IssuesPage = async ({ searchParams }: Props) => {
  const statuses = Object.values(Status);
  const status = statuses.includes(searchParams.status)
    ? searchParams.status
    : undefined;

  const priorities = Object.values(Priority);
  const priority = priorities.includes(
    searchParams.priority
  )
    ? searchParams.priority
    : undefined;

  const where = { status, priority };

  const orderBy = columnNames.includes(searchParams.orderBy)
    ? { [searchParams.orderBy]: 'asc' }
    : undefined;

  const page = Math.max(
    1,
    parseInt(searchParams.page) || 1
  );
  const pageSize = 10;

  const [issues, issueCount] = await Promise.all([
    prisma.issue.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        labels: { include: { label: true } }
      }
    }),
    prisma.issue.count({ where })
  ]);

  return (
    <Flex direction="column" gap="3">
      <IssueActions />
      <IssueTable
        searchParams={searchParams}
        issues={issues}
      />
      <Pagination
        pageSize={pageSize}
        currentPage={page}
        itemCount={issueCount}
      />
    </Flex>
  );
};

export const metadata: Metadata = {
  title: 'Issue Tracker - Issue List',
  description: 'View all project issues'
};

export default IssuesPage;
