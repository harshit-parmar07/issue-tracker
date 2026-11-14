'use client';
import ErrorMessage from '@/app/components/ErrorMessage';
import Spinner from '@/app/components/Spinner';
import { issueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  Issue,
  IssueLabel,
  Label,
  Priority,
  Status
} from '@prisma/client';
import {
  Badge,
  Box,
  Button,
  Callout,
  Flex,
  Select,
  Text,
  TextField
} from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import 'easymde/dist/easymde.min.css';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false
});
import { z } from 'zod';

type IssueFormData = z.infer<typeof issueSchema>;

type IssueWithLabels = Issue & {
  labels?: (IssueLabel & { label: Label })[];
};

const statuses: { label: string; value: Status }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Closed', value: 'CLOSED' }
];

const priorities: { label: string; value: Priority }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' }
];

const IssueForm = ({
  issue
}: {
  issue?: IssueWithLabels;
}) => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<
    number[]
  >(issue?.labels?.map((l) => l.labelId) || []);

  const { data: labels } = useQuery<Label[]>({
    queryKey: ['labels'],
    queryFn: () =>
      axios.get('/api/labels').then((res) => res.data),
    staleTime: 60000
  });

  const defaultDueDate = issue?.dueDate
    ? new Date(issue.dueDate).toISOString().split('T')[0]
    : '';

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: issue?.title,
      description: issue?.description,
      status: issue?.status || 'OPEN',
      priority: issue?.priority || 'MEDIUM',
      dueDate: defaultDueDate
    }
  });

  const toggleLabel = (id: number) => {
    setSelectedLabelIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        ...data,
        labelIds: selectedLabelIds
      };
      if (issue)
        await axios.patch(
          '/api/issues/' + issue.id,
          payload
        );
      else await axios.post('/api/issues', payload);

      router.push('/issues/list');
      router.refresh();
    } catch {
      setSubmitting(false);
      setError('An unexpected error occurred.');
    }
  });

  return (
    <div className="max-w-xl">
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <form className="space-y-4" onSubmit={onSubmit}>
        <TextField.Root>
          <TextField.Input
            defaultValue={issue?.title}
            placeholder="Title"
            {...register('title')}
          />
        </TextField.Root>
        <ErrorMessage>{errors.title?.message}</ErrorMessage>

        <Flex gap="4" wrap="wrap" align="center">
          <Flex align="center" gap="2">
            <Text size="2" weight="medium">
              Status:
            </Text>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select.Root
                  value={field.value || 'OPEN'}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {statuses.map((s) => (
                      <Select.Item
                        key={s.value}
                        value={s.value}
                      >
                        {s.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Flex>

          <Flex align="center" gap="2">
            <Text size="2" weight="medium">
              Priority:
            </Text>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select.Root
                  value={field.value || 'MEDIUM'}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger />
                  <Select.Content>
                    {priorities.map((p) => (
                      <Select.Item
                        key={p.value}
                        value={p.value}
                      >
                        {p.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}
            />
          </Flex>

          <Flex align="center" gap="2">
            <Text size="2" weight="medium">
              SLA Due:
            </Text>
            <input
              type="date"
              defaultValue={defaultDueDate}
              {...register('dueDate')}
              className="rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </Flex>
        </Flex>

        {labels && labels.length > 0 && (
          <Box>
            <Text size="2" weight="medium" as="p" mb="1">
              Labels:
            </Text>
            <Flex gap="2" wrap="wrap">
              {labels.map((label) => {
                const isSelected =
                  selectedLabelIds.includes(label.id);
                return (
                  <Badge
                    key={label.id}
                    color={(label.color as any) || 'indigo'}
                    variant={
                      isSelected ? 'solid' : 'outline'
                    }
                    className="cursor-pointer select-none"
                    onClick={() => toggleLabel(label.id)}
                  >
                    {label.name}
                  </Badge>
                );
              })}
            </Flex>
          </Box>
        )}

        <Controller
          name="description"
          control={control}
          defaultValue={issue?.description}
          render={({ field }) => (
            <SimpleMDE
              placeholder="Description"
              {...field}
            />
          )}
        />
        <ErrorMessage>
          {errors.description?.message}
        </ErrorMessage>

        <Button disabled={isSubmitting}>
          {issue ? 'Update Issue' : 'Submit New Issue'}{' '}
          {isSubmitting && <Spinner />}
        </Button>
      </form>
    </div>
  );
};

export default IssueForm;
