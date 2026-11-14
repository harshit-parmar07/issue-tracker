import { Priority, Status } from '@prisma/client';
import { z } from 'zod';

export const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(65535),
  status: z.nativeEnum(Status).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().optional().nullable(),
  labelIds: z.array(z.number().int().positive()).optional()
});

export const patchIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255)
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(65535)
    .optional(),
  assignedToUserId: z
    .string()
    .min(1, 'AssignedToUserId is required')
    .max(255)
    .optional()
    .nullable(),
  status: z.nativeEnum(Status).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().optional().nullable(),
  labelIds: z.array(z.number().int().positive()).optional()
});

export const createCommentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comment text cannot be empty.')
    .max(2000, 'Comment is too long.')
});
