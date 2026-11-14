import { Button, Flex } from '@radix-ui/themes';
import Link from 'next/link';
import React from 'react';
import IssueStatusFilter from './IssueStatusFilter';

const IssueActions = () => {
  return (
    <Flex
      justify="between"
      align={{ initial: 'stretch', md: 'start' }}
      direction={{ initial: 'column', md: 'row' }}
      gap="3"
    >
      <IssueStatusFilter />
      <Button className="shrink-0">
        <Link href="/issues/new">New Issue</Link>
      </Button>
    </Flex>
  );
};

export default IssueActions;
