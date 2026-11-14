'use client';

import type { Label, Priority, Status } from '@prisma/client';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button, Flex, Select, TextField } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface PublicUser {
  id: string;
  name: string | null;
  image: string | null;
}

const statuses: { label: string; value: Status | 'ALL' }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Closed', value: 'CLOSED' }
];

const priorities: { label: string; value: Priority | 'ALL' }[] = [
  { label: 'All Priorities', value: 'ALL' },
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' }
];

const IssueStatusFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || 'ALL';
  const currentPriority = searchParams.get('priority') || 'ALL';
  const currentAssignee = searchParams.get('assignee') || 'ALL';
  const currentLabelId = searchParams.get('labelId') || 'ALL';
  const currentOverdue = searchParams.get('overdue') === 'true';

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const { data: users } = useQuery<PublicUser[]>({
    queryKey: ['users'],
    queryFn: () => axios.get('/api/users').then((res) => res.data),
    staleTime: 60000
  });

  const { data: labels } = useQuery<Label[]>({
    queryKey: ['labels'],
    queryFn: () => axios.get('/api/labels').then((res) => res.data),
    staleTime: 60000
  });

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'ALL' && value.trim() !== '') {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    });

    params.delete('page');
    const query = params.toString();
    router.push('/issues/list' + (query ? `?${query}` : ''));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== currentSearch.trim()) {
        updateParams({ search: searchTerm });
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentStatus !== 'ALL' ||
    currentPriority !== 'ALL' ||
    currentAssignee !== 'ALL' ||
    currentLabelId !== 'ALL' ||
    currentOverdue;

  const resetAllFilters = () => {
    setSearchTerm('');
    const params = new URLSearchParams();
    const orderBy = searchParams.get('orderBy');
    const sortOrder = searchParams.get('sortOrder');
    if (orderBy) params.set('orderBy', orderBy);
    if (sortOrder) params.set('sortOrder', sortOrder);

    const query = params.toString();
    router.push('/issues/list' + (query ? `?${query}` : ''));
  };

  return (
    <Flex direction="column" gap="3" className="w-full">
      <Flex gap="3" wrap="wrap" align="center">
        <TextField.Root className="min-w-[240px] flex-1 sm:max-w-xs">
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
          <TextField.Input
            placeholder="Search title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <TextField.Slot>
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchTerm('');
                  updateParams({ search: null });
                }}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <Cross2Icon height="14" width="14" />
              </button>
            </TextField.Slot>
          )}
        </TextField.Root>

        <Select.Root
          value={currentStatus}
          onValueChange={(val) => updateParams({ status: val })}
        >
          <Select.Trigger />
          <Select.Content>
            {statuses.map((s) => (
              <Select.Item key={s.value} value={s.value}>
                {s.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={currentPriority}
          onValueChange={(val) => updateParams({ priority: val })}
        >
          <Select.Trigger />
          <Select.Content>
            {priorities.map((p) => (
              <Select.Item key={p.value} value={p.value}>
                {p.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={currentAssignee}
          onValueChange={(val) => updateParams({ assignee: val })}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="ALL">All Assignees</Select.Item>
            <Select.Item value="UNASSIGNED">Unassigned</Select.Item>
            {users?.map((user) => (
              <Select.Item key={user.id} value={user.id}>
                {user.name || 'Unnamed User'}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          value={currentLabelId}
          onValueChange={(val) => updateParams({ labelId: val })}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="ALL">All Labels</Select.Item>
            {labels?.map((label) => (
              <Select.Item key={label.id} value={String(label.id)}>
                {label.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Button
          type="button"
          variant={currentOverdue ? 'solid' : 'soft'}
          color={currentOverdue ? 'red' : 'gray'}
          onClick={() =>
            updateParams({ overdue: currentOverdue ? null : 'true' })
          }
        >
          {currentOverdue ? 'Overdue Only ✓' : 'Overdue SLA'}
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            color="gray"
            onClick={resetAllFilters}
          >
            <Cross2Icon />
            Reset
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default IssueStatusFilter;
