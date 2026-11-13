'use client';

import ErrorMessage from '@/app/components/ErrorMessage';
import Spinner from '@/app/components/Spinner';
import { issueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Issue, Status } from '@prisma/client';
import {
  Badge,
  Button,
  Callout,
  Card,
  Flex,
  Text,
  TextField
} from '@radix-ui/themes';
import axios from 'axios';
import 'easymde/dist/easymde.min.css';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), {
  ssr: false
});

type IssueFormData = z.infer<typeof issueSchema>;

const statusOptions: {
  label: string;
  value: Status;
  color: 'red' | 'violet' | 'green';
}[] = [
  { label: 'Open', value: 'OPEN', color: 'red' },
  { label: 'In Progress', value: 'IN_PROGRESS', color: 'violet' },
  { label: 'Closed', value: 'CLOSED', color: 'green' }
];

const IssueForm = ({ issue }: { issue?: Issue }) => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>(
    issue?.status ?? 'OPEN'
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: issue?.title ?? '',
      description: issue?.description ?? '',
      status: issue?.status ?? 'OPEN'
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        title: data.title,
        description: data.description,
        status: selectedStatus
      };

      if (issue) {
        await axios.patch('/api/issues/' + issue.id, payload);
      } else {
        await axios.post('/api/issues', payload);
      }

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

        <Card variant="surface">
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Flex align="center" gap="2">
              <Text size="2" weight="bold">
                Issue Status:
              </Text>
              <Badge
                color={
                  statusOptions.find((s) => s.value === selectedStatus)
                    ?.color ?? 'red'
                }
              >
                {
                  statusOptions.find((s) => s.value === selectedStatus)
                    ?.label
                }
              </Badge>
            </Flex>
            <Flex gap="2" wrap="wrap">
              {statusOptions.map((option) => {
                const isActive = selectedStatus === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="1"
                    color={option.color}
                    variant={isActive ? 'solid' : 'soft'}
                    onClick={() => setSelectedStatus(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </Flex>
          </Flex>
        </Card>

        <Controller
          name="description"
          control={control}
          defaultValue={issue?.description}
          render={({ field }) => (
            <SimpleMDE placeholder="Description" {...field} />
          )}
        />
        <ErrorMessage>{errors.description?.message}</ErrorMessage>

        <Button disabled={isSubmitting}>
          {issue ? 'Update Issue' : 'Submit New Issue'}{' '}
          {isSubmitting && <Spinner />}
        </Button>
      </form>
    </div>
  );
};

export default IssueForm;
