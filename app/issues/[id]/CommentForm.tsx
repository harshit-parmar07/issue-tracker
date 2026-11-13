'use client';

import {
  Button,
  Flex,
  TextArea,
  Callout
} from '@radix-ui/themes';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CommentForm({
  issueId
}: {
  issueId: number;
}) {
  const [text, setText] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      setSubmitting(true);
      setError('');
      await axios.post(`/api/issues/${issueId}/comments`, {
        text
      });
      setText('');
      router.refresh();
    } catch (err) {
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex direction="column" gap="3" className="mt-4">
      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <TextArea
        placeholder="Leave a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <Flex justify="end">
        <Button
          disabled={isSubmitting || !text.trim()}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </Flex>
    </Flex>
  );
}
