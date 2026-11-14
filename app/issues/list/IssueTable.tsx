import {
  IssuePriorityBadge,
  IssueStatusBadge,
  Link,
  SlaBadge
} from '@/app/components';
import {
  Issue,
  IssueLabel,
  Label,
  Priority,
  Status
} from '@prisma/client';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import { Badge, Flex, Table } from '@radix-ui/themes';
import NextLink from 'next/link';

export interface IssueQuery {
  status: Status;
  priority: Priority;
  orderBy: keyof Issue;
  page: string;
}

type IssueWithLabels = Issue & {
  labels: (IssueLabel & { label: Label })[];
};

interface Props {
  searchParams: IssueQuery;
  issues: IssueWithLabels[];
}

const IssueTable = ({ searchParams, issues }: Props) => {
  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          {columns.map((column) => (
            <Table.ColumnHeaderCell
              key={column.value}
              className={column.className}
            >
              <NextLink
                href={{
                  query: {
                    ...searchParams,
                    orderBy: column.value
                  }
                }}
              >
                {column.label}
              </NextLink>
              {column.value === searchParams.orderBy && (
                <ArrowUpIcon className="inline" />
              )}
            </Table.ColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {issues.map((issue) => (
          <Table.Row key={issue.id}>
            <Table.Cell>
              <Flex direction="column" gap="1">
                <Link href={`/issues/${issue.id}`}>
                  {issue.title}
                </Link>
                {issue.labels.length > 0 && (
                  <Flex gap="1" wrap="wrap">
                    {issue.labels.map(({ label }) => (
                      <Badge
                        key={label.id}
                        size="1"
                        color={
                          (label.color as any) || 'indigo'
                        }
                        variant="soft"
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Flex>
              <div className="mt-1 flex gap-2 md:hidden">
                <IssueStatusBadge status={issue.status} />
                <IssuePriorityBadge
                  priority={issue.priority}
                />
              </div>
            </Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              <IssueStatusBadge status={issue.status} />
            </Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              <IssuePriorityBadge
                priority={issue.priority}
              />
            </Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              <SlaBadge
                dueDate={issue.dueDate}
                status={issue.status}
              />
            </Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              {issue.createdAt.toDateString()}
            </Table.Cell>
          </Table.Row>
        ))}
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
  {
    label: 'Status',
    value: 'status',
    className: 'hidden md:table-cell'
  },
  {
    label: 'Priority',
    value: 'priority',
    className: 'hidden md:table-cell'
  },
  {
    label: 'SLA',
    value: 'dueDate',
    className: 'hidden md:table-cell'
  },
  {
    label: 'Created',
    value: 'createdAt',
    className: 'hidden md:table-cell'
  }
];

export const columnNames = columns.map(
  (column) => column.value
);

export default IssueTable;
