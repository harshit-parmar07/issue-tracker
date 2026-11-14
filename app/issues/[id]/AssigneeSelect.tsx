'use client';

import { Skeleton } from '@/app/components';
import type { Issue, User } from '@prisma/client';
import { Select } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const AssigneeSelect = ({ issue }: { issue: Issue }) => {
  const { data: users, error, isLoading } = useUsers();

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
      })
      .catch(() => {
        toast.error('Changes could not be saved');
      });
  };

  if (isLoading) return <Skeleton height="32px" />;

  if (error)
    return <div className="text-sm text-red-600">Failed to load users</div>;

  return (
    <>
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
      <Toaster />
    </>
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
