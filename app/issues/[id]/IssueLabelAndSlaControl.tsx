'use client';

import { Skeleton } from '@/app/components';
import type {
  Issue,
  IssueLabel,
  Label
} from '@prisma/client';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Text
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

type IssueWithLabels = Issue & {
  labels: (IssueLabel & { label: Label })[];
};

const IssueLabelAndSlaControl = ({
  issue
}: {
  issue: IssueWithLabels;
}) => {
  const router = useRouter();
  const { data: allLabels, isLoading } = useQuery<Label[]>({
    queryKey: ['labels'],
    queryFn: () =>
      axios.get('/api/labels').then((res) => res.data),
    staleTime: 60000
  });

  const initialLabelIds = issue.labels.map(
    (l) => l.labelId
  );
  const [selectedIds, setSelectedIds] =
    useState<number[]>(initialLabelIds);

  const initialDate = issue.dueDate
    ? new Date(issue.dueDate).toISOString().split('T')[0]
    : '';
  const [dueDate, setDueDate] =
    useState<string>(initialDate);
  const [isSavingDate, setSavingDate] = useState(false);

  const toggleLabel = async (labelId: number) => {
    const prev = selectedIds;
    const next = selectedIds.includes(labelId)
      ? selectedIds.filter((id) => id !== labelId)
      : [...selectedIds, labelId];

    setSelectedIds(next);

    try {
      await axios.patch(`/api/issues/${issue.id}`, {
        labelIds: next
      });
      router.refresh();
    } catch {
      setSelectedIds(prev);
      toast.error('Failed to update labels');
    }
  };

  const updateSlaDate = async (newDate: string) => {
    setDueDate(newDate);
    setSavingDate(true);
    try {
      await axios.patch(`/api/issues/${issue.id}`, {
        dueDate: newDate || null
      });
      toast.success(
        newDate
          ? 'SLA due date updated'
          : 'SLA due date cleared'
      );
      router.refresh();
    } catch {
      toast.error('Failed to update SLA due date');
    } finally {
      setSavingDate(false);
    }
  };

  return (
    <Card size="1">
      <Flex direction="column" gap="3">
        <Box>
          <Text
            size="1"
            weight="bold"
            color="gray"
            as="p"
            mb="1"
          >
            SLA Due Date
          </Text>
          <Flex gap="2" align="center">
            <input
              type="date"
              value={dueDate}
              disabled={isSavingDate}
              onChange={(e) =>
                updateSlaDate(e.target.value)
              }
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
            {dueDate && (
              <Button
                size="1"
                variant="soft"
                color="gray"
                disabled={isSavingDate}
                onClick={() => updateSlaDate('')}
              >
                Clear
              </Button>
            )}
          </Flex>
        </Box>

        <Box>
          <Text
            size="1"
            weight="bold"
            color="gray"
            as="p"
            mb="2"
          >
            Labels (Click to toggle)
          </Text>
          {isLoading ? (
            <Skeleton height="2rem" />
          ) : (
            <Flex gap="1" wrap="wrap">
              {allLabels?.map((label) => {
                const active = selectedIds.includes(
                  label.id
                );
                return (
                  <Badge
                    key={label.id}
                    color={(label.color as any) || 'indigo'}
                    variant={active ? 'solid' : 'outline'}
                    className="cursor-pointer select-none"
                    onClick={() => toggleLabel(label.id)}
                  >
                    {label.name}
                  </Badge>
                );
              })}
            </Flex>
          )}
        </Box>
      </Flex>
    </Card>
  );
};

export default IssueLabelAndSlaControl;
