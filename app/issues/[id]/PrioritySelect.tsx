'use client';

import type { Issue, Priority } from '@prisma/client';
import { Select } from '@radix-ui/themes';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

const priorities: { label: string; value: Priority }[] = [
  { label: 'Low Priority', value: 'LOW' },
  { label: 'Medium Priority', value: 'MEDIUM' },
  { label: 'High Priority', value: 'HIGH' },
  { label: 'Critical Priority', value: 'CRITICAL' }
];

const PrioritySelect = ({ issue }: { issue: Issue }) => {
  const router = useRouter();
  const [priority, setPriority] = useState<Priority>(
    issue.priority
  );

  const changePriority = async (newPriority: Priority) => {
    const previous = priority;
    setPriority(newPriority);

    try {
      await axios.patch(`/api/issues/${issue.id}`, {
        priority: newPriority
      });
      toast.success('Priority updated');
      router.refresh();
    } catch {
      setPriority(previous);
      toast.error('Priority could not be saved.');
    }
  };

  return (
    <Select.Root
      value={priority}
      onValueChange={(val: Priority) => changePriority(val)}
    >
      <Select.Trigger />
      <Select.Content>
        <Select.Group>
          <Select.Label>Priority</Select.Label>
          {priorities.map((item) => (
            <Select.Item
              key={item.value}
              value={item.value}
            >
              {item.label}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
};

export default PrioritySelect;
