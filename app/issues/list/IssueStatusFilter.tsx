'use client';
import type { Priority, Status } from '@prisma/client';
import { Flex, Select } from '@radix-ui/themes';
import {
  useRouter,
  useSearchParams
} from 'next/navigation';
import React from 'react';

const statuses: { label: string; value?: Status }[] = [
  { label: 'All Statuses' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Closed', value: 'CLOSED' }
];

const priorities: { label: string; value?: Priority }[] = [
  { label: 'All Priorities' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' }
];

const IssueStatusFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    const query = params.size
      ? '?' + params.toString()
      : '';
    router.push('/issues/list' + query);
  };

  return (
    <Flex gap="3" wrap="wrap">
      <Select.Root
        defaultValue={searchParams.get('status') || 'ALL'}
        onValueChange={(val) => updateFilter('status', val)}
      >
        <Select.Trigger />
        <Select.Content>
          {statuses.map((s) => (
            <Select.Item
              key={s.value || 'ALL'}
              value={s.value || 'ALL'}
            >
              {s.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Select.Root
        defaultValue={searchParams.get('priority') || 'ALL'}
        onValueChange={(val) =>
          updateFilter('priority', val)
        }
      >
        <Select.Trigger />
        <Select.Content>
          {priorities.map((p) => (
            <Select.Item
              key={p.value || 'ALL'}
              value={p.value || 'ALL'}
            >
              {p.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
};

export default IssueStatusFilter;
