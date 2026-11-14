import {
  IssuePriorityBadge,
  IssueStatusBadge,
  SlaBadge
} from '@/app/components';
import { Issue, IssueLabel, Label } from '@prisma/client';
import {
  Badge,
  Card,
  Flex,
  Heading,
  Text
} from '@radix-ui/themes';
import ReactMarkdown from 'react-markdown';

type IssueWithLabels = Issue & {
  labels?: (IssueLabel & { label: Label })[];
};

const IssueDetails = ({
  issue
}: {
  issue: IssueWithLabels;
}) => {
  return (
    <>
      <Heading>{issue.title}</Heading>
      <Flex gap="3" my="2" align="center" wrap="wrap">
        <IssueStatusBadge status={issue.status} />
        <IssuePriorityBadge priority={issue.priority} />
        <SlaBadge
          dueDate={issue.dueDate}
          status={issue.status}
        />
        <Text size="2" color="gray">
          Created {issue.createdAt.toDateString()}
        </Text>
      </Flex>
      {issue.labels && issue.labels.length > 0 && (
        <Flex gap="2" my="2" wrap="wrap">
          {issue.labels.map(({ label }) => (
            <Badge
              key={label.id}
              color={(label.color as any) || 'indigo'}
              variant="soft"
            >
              {label.name}
            </Badge>
          ))}
        </Flex>
      )}
      <Card className="prose max-w-full" mt="4">
        <ReactMarkdown>{issue.description}</ReactMarkdown>
      </Card>
    </>
  );
};

export default IssueDetails;
