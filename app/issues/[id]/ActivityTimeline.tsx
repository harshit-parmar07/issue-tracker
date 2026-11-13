import prisma from '@/prisma/client';
import {
  Avatar,
  Box,
  Card,
  Flex,
  Text,
  Heading
} from '@radix-ui/themes';
import CommentForm from './CommentForm';

export default async function ActivityTimeline({
  issueId
}: {
  issueId: number;
}) {
  const [comments, activities] = await Promise.all([
    prisma.comment.findMany({
      where: { issueId },
      include: {
        user: { select: { name: true, image: true } }
      }
    }),
    prisma.issueActivity.findMany({
      where: { issueId },
      include: {
        user: { select: { name: true, image: true } }
      }
    })
  ]);

  // Combine and sort events by timestamp
  const timelineEvents = [
    ...comments.map((c) => ({
      id: `c-${c.id}`,
      type: 'comment' as const,
      date: c.createdAt,
      user: c.user,
      content: c.text
    })),
    ...activities.map((a) => ({
      id: `a-${a.id}`,
      type: 'activity' as const,
      date: a.createdAt,
      user: a.user,
      content: a.description
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Box className="mt-6">
      <Heading size="4" mb="4">
        Activity & Comments
      </Heading>
      <Flex direction="column" gap="4">
        {timelineEvents.map((event) => (
          <Card key={event.id} size="1">
            <Flex gap="3" align="start">
              <Avatar
                src={event.user?.image ?? undefined}
                fallback={event.user?.name?.[0] ?? '?'}
                size="2"
                radius="full"
              />
              <Box>
                <Flex gap="2" align="center">
                  <Text weight="bold" size="2">
                    {event.user?.name}
                  </Text>
                  <Text color="gray" size="1">
                    {event.date.toLocaleString()}
                  </Text>
                </Flex>
                <Text
                  size="2"
                  color={event.type === 'activity' ? 'gray' : undefined}
                  highContrast={event.type === 'comment'}
                  className="mt-1"
                >
                  {event.content}
                </Text>
              </Box>
            </Flex>
          </Card>
        ))}
      </Flex>
      <CommentForm issueId={issueId} />
    </Box>
  );
}
