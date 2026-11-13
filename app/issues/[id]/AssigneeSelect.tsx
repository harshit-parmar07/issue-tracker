'use client';

import { Skeleton } from '@/app/components';
import type { Issue, Status, User } from '@prisma/client';
import { Button, Card, Flex, Select, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const statusOptions: {
  label: string;
  value: Status;
  color: 'red' | 'violet' | 'green';
}[] = [
  { label: 'Open', value: 'OPEN', color: 'red' },
  { label: 'In Progress', value: 'IN_PROGRESS', color: 'violet' },
  { label: 'Closed', value: 'CLOSED', color: 'green' }
];

const AssigneeSelect = ({ issue }: { issue: Issue }) => {
  const router = useRouter();
  const { data: users, error, isLoading } = useUsers();
  const [currentStatus, setCurrentStatus] = useState<Status>(issue.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const initialAssignee = issue.assignedToUserId
    ? String(issue.assignedToUserId)
    : '';

  const assignIssue = (userId: string) => {
    axios
      .patch(`/api/issues/${issue.id}`, {
        assignedToUserId: userId || null
      })
      .then(() => {
        toast.success('Assignee updated');
        router.refresh();
      })
      .catch(() => {
        toast.error('Changes could not be saved');
      });
  };

  const updateStatus = async (newStatus: Status) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;
    const previousStatus = currentStatus;
    setCurrentStatus(newStatus);
    setIsUpdatingStatus(true);

    try {
      await axios.patch(`/api/issues/${issue.id}`, { status: newStatus });
      toast.success('Status updated');
      router.refresh();
    } catch {
      setCurrentStatus(previousStatus);
      toast.error('Status could not be saved');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Flex direction="column" gap="3">
      <Card size="1" variant="surface">
        <Flex direction="column" gap="2">
          <Text size="1" weight="bold" color="gray">
            STATUS
          </Text>
          <Flex direction="column" gap="1">
            {statusOptions.map((option) => {
              const isActive = currentStatus === option.value;
              return (
                <Button
                  key={option.value}
                  type="button"
                  size="1"
                  color={option.color}
                  variant={isActive ? 'solid' : 'soft'}
                  disabled={isUpdatingStatus}
                  onClick={() => updateStatus(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </Flex>
        </Flex>
      </Card>

      {isLoading ? (
        <Skeleton height="32px" />
      ) : error ? (
        <div className="text-sm text-red-600">Failed to load users</div>
      ) : (
        <Select.Root defaultValue={initialAssignee} onValueChange={assignIssue}>
          <Select.Trigger />
          <Select.Content>
            <Select.Group>
              <Select.Label>Suggestions</Select.Label>
              <Select.Item value="">Unassigned</Select.Item>
              {users?.map((user) => (
                <Select.Item key={user.id} value={String(user.id)}>
                  {user.name}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      )}

      <Toaster />
    </Flex>
  );
};

const useUsers = () =>
  useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => axios.get('/api/users').then((res) => res.data),
    staleTime: 60000,
    retry: 3
  });

export default AssigneeSelect;
