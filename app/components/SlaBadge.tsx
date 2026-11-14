import { Status } from '@prisma/client';
import { Badge } from '@radix-ui/themes';
import React from 'react';

interface Props {
  dueDate: Date | string | null;
  status: Status;
}

const SlaBadge = ({ dueDate, status }: Props) => {
  if (!dueDate) return null;

  const targetDate =
    typeof dueDate === 'string'
      ? new Date(dueDate)
      : dueDate;
  if (isNaN(targetDate.getTime())) return null;

  if (status === 'CLOSED') {
    return (
      <Badge color="green" variant="soft">
        SLA Resolved ({targetDate.toLocaleDateString()})
      </Badge>
    );
  }

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(
    diffMs / (1000 * 60 * 60 * 24)
  );

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    return (
      <Badge color="red" variant="solid">
        SLA Breached (
        {overdueDays === 0 ? '<1d' : `${overdueDays}d`}{' '}
        overdue)
      </Badge>
    );
  }

  if (diffHours <= 48) {
    return (
      <Badge color="amber" variant="soft">
        Due Soon ({diffHours}h left)
      </Badge>
    );
  }

  return (
    <Badge color="gray" variant="outline">
      Due {targetDate.toLocaleDateString()}
    </Badge>
  );
};

export default SlaBadge;
