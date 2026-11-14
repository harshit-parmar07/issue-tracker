import Pagination from '@/app/components/Pagination';
import prisma from '@/prisma/client';
import { Prisma, Priority, Status } from '@prisma/client';
import { Flex, Text } from '@radix-ui/themes';
import { Metadata } from 'next';
import IssueActions from './IssueActions';
import IssueTable, { columnNames, IssueQuery } from './IssueTable';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: IssueQuery;
}

/**
 * Formats a raw user search string into safe MySQL Boolean Full-Text prefix tokens
 * e.g. "video crash!" -> "+video* +crash*"
 */
function buildFullTextSearchQuery(raw: string): string {
  const sanitized = raw
    .replace(/[+\-><()~*"@!?:;.,/\\[\]{}|^&$#%+=`']/g, ' ')
    .trim();

  const tokens = sanitized
    .split(/\s+/)
    .filter((token) => token.length >= 2);

  if (tokens.length === 0) return '';
  return tokens.map((token) => `+${token}*`).join(' ');
}

const IssuesPage = async ({ searchParams }: Props) => {
  const statuses = Object.values(Status);
  const status =
    searchParams.status && statuses.includes(searchParams.status)
      ? searchParams.status
      : undefined;

  const priorities = Object.values(Priority);
  const priority =
    searchParams.priority && priorities.includes(searchParams.priority)
      ? searchParams.priority
      : undefined;

  const assignedToUserId =
    searchParams.assignee === 'UNASSIGNED'
      ? null
      : searchParams.assignee && searchParams.assignee !== 'ALL'
      ? searchParams.assignee
      : undefined;

  const parsedLabelId = searchParams.labelId
    ? parseInt(searchParams.labelId, 10)
    : NaN;
  const labelFilter = !isNaN(parsedLabelId)
    ? { some: { labelId: parsedLabelId } }
    : undefined;

  const isOverdueOnly = searchParams.overdue === 'true';

  const rawSearch = searchParams.search?.trim() || '';
  const fullTextQuery = rawSearch ? buildFullTextSearchQuery(rawSearch) : '';

  const andConditions: Prisma.IssueWhereInput[] = [];

  if (status) {
    andConditions.push({ status });
  }

  if (priority) {
    andConditions.push({ priority });
  }

  if (assignedToUserId !== undefined) {
    andConditions.push({ assignedToUserId });
  }

  if (labelFilter) {
    andConditions.push({ labels: labelFilter });
  }

  if (isOverdueOnly) {
    andConditions.push({
      dueDate: { lt: new Date() },
      NOT: { status: 'CLOSED' }
    });
  }

  if (rawSearch) {
    const searchOr: Prisma.IssueWhereInput[] = [
      { title: { contains: rawSearch } },
      { description: { contains: rawSearch } }
    ];

    if (fullTextQuery) {
      searchOr.unshift({
        title: { search: fullTextQuery },
        description: { search: fullTextQuery }
      });
    }

    andConditions.push({ OR: searchOr });
  }

  const where: Prisma.IssueWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const sortDirection: 'asc' | 'desc' =
    searchParams.sortOrder === 'desc' ? 'desc' : 'asc';

  const orderBy: Prisma.IssueOrderByWithRelationInput =
    searchParams.orderBy && columnNames.includes(searchParams.orderBy)
      ? { [searchParams.orderBy]: sortDirection }
      : { createdAt: 'desc' };

  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const pageSize = 10;

  const [issues, issueCount] = await Promise.all([
    prisma.issue.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        labels: { include: { label: true } },
        assignedToUser: {
          select: { id: true, name: true, image: true }
        }
      }
    }),
    prisma.issue.count({ where })
  ]);

  return (
    <Flex direction="column" gap="3">
      <IssueActions />
      <IssueTable searchParams={searchParams} issues={issues} />
      <Flex justify="between" align="center" wrap="wrap" gap="2">
        <Text size="2" color="gray">
          Showing {issues.length} of {issueCount} matching issue
          {issueCount === 1 ? '' : 's'}
        </Text>
        <Pagination
          pageSize={pageSize}
          currentPage={page}
          itemCount={issueCount}
        />
      </Flex>
    </Flex>
  );
};

export const metadata: Metadata = {
  title: 'Issue Tracker - Issue List',
  description: 'Search, filter, and sort all project issues'
};

export default IssuesPage;
