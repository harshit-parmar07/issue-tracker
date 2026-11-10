'use client';

import type { Issue, Status } from '@prisma/client';
import { Select } from '@radix-ui/themes';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const statuses: { label: string; value: Status }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Closed', value: 'CLOSED' }
];

const StatusSelect = ({ issue }: { issue: Issue }) => {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(issue.status);

  useEffect(() => {
    setStatus(issue.status);
  }, [issue.status]);

  const changeStatus = async (newStatus: Status) => {
    const previousStatus = status;
    setStatus(newStatus);

    try {
      await axios.patch(`/api/issues/${issue.id}`, { status: newStatus });
      toast.success('Status updated');
      router.refresh();
    } catch {
      setStatus(previousStatus);
      toast.error('Status could not be saved.');
    }
  };

  return (
    <Select.Root
      value={status}
      onValueChange={(value: Status) => changeStatus(value)}
    >
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          <Select.Label>Status</Select.Label>
          {statuses.map((item) => (
            <Select.Item key={item.value} value={item.value}>
              {item.label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
};

export default StatusSelect;
