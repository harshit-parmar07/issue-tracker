import {
  IssuePriorityBadge,
  IssueStatusBadge,
  Link,
  SlaBadge
} from '@/app/components';
import { Issue, IssueLabel, Label, Priority, Status } from '@prisma/client';
import { ArrowDownIcon, ArrowUpIcon } from '@radix-ui/react-icons';
import { Avatar, Badge, Flex, Table, Text } from '@radix-ui/themes';
import NextLink from 'next/link';

export interface IssueQuery {
  status?: Status;
  priority?: Priority;
  assignee?: string;
  labelId?: string;
  overdue?: string;
  search?: string;
  orderBy?: keyof Issue;
  sortOrder?: 'asc' | 'desc';
  page?: string;
}

type IssueWithRelations = Issue & {
  labels: (IssueLabel & { label: Label })[];
  assignedToUser?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

interface Props {
  searchParams: IssueQuery;
  issues: IssueWithRelations[];
}

const IssueTable = ({ searchParams, issues }: Props) => {
  const currentSortOrder = searchParams.sortOrder === 'desc' ? 'desc' : 'asc';

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          {columns.map((column) => {
            const isCurrentSortColumn = column.value === searchParams.orderBy;
            const nextSortOrder =
              isCurrentSortColumn && currentSortOrder === 'asc'
                ? 'desc'
                : 'asc';

            return (
              <Table.ColumnHeaderCell
                key={column.value}
                className={column.className}
              >
                <NextLink
                  href={{
                    query: {
                      ...searchParams,
                      orderBy: column.value,
                      sortOrder: nextSortOrder
                    }
                  }}
                >
                  {column.label}
                </NextLink>
                {isCurrentSortColumn &&
                  (currentSortOrder === 'desc' ? (
                    <ArrowDownIcon className="ml-1 inline" />
                  ) : (
                    <ArrowUpIcon className="ml-1 inline" />
                  ))}
              </Table.ColumnHeaderCell>
            );
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {issues.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={columns.length} className="py-8 text-center">
              <Text color="gray">
                No issues found matching your search or filter criteria.
              </Text>
            </Table.Cell>
          </Table.Row>
        ) : (
          issues.map((issue) => (
            <Table.Row key={issue.id}>
              <Table.Cell>
                <Flex justify="between" align="center" gap="3">
                  <Flex direction="column" gap="1">
                    <Link href={`/issues/${issue.id}`}>{issue.title}</Link>
                    {issue.labels.length > 0 && (
                      <Flex gap="1" wrap="wrap">
                        {issue.labels.map(({ label }) => (
                          <Badge
                            key={label.id}
                            size="1"
                            color={(label.color as any) || 'indigo'}
                            variant="soft"
                          >
                            {label.name}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Flex>
                  {issue.assignedToUser && (
                    <Avatar
                      src={issue.assignedToUser.image || undefined}
                      fallback={issue.assignedToUser.name?.[0] || '?'}
                      size="1"
                      radius="full"
                      title={`Assigned to ${issue.assignedToUser.name || 'User'}`}
                    />
                  )}
                </Flex>
                <div className="mt-1 flex flex-wrap gap-2 md:hidden">
                  <IssueStatusBadge status={issue.status} />
                  <IssuePriorityBadge priority={issue.priority} />
                  <SlaBadge dueDate={issue.dueDate} status={issue.status} />
                </div>
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                <IssueStatusBadge status={issue.status} />
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                <IssuePriorityBadge priority={issue.priority} />
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                <SlaBadge dueDate={issue.dueDate} status={issue.status} />
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                {issue.createdAt.toDateString()}
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Root>
  );
};

const columns: {
  label: string;
  value: keyof Issue;
  className?: string;
}[] = [
  { label: 'Issue', value: 'title' },
  { label: 'Status', value: 'status', className: 'hidden md:table-cell' },
  { label: 'Priority', value: 'priority', className: 'hidden md:table-cell' },
  { label: 'SLA', value: 'dueDate', className: 'hidden md:table-cell' },
  { label: 'Created', value: 'createdAt', className: 'hidden md:table-cell' }
];

export const columnNames = columns.map((column) => column.value);

export default IssueTable;
