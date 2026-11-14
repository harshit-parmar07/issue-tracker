import prisma from '@/prisma/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_LABELS = [
  { name: 'bug', color: 'red' },
  { name: 'feature', color: 'indigo' },
  { name: 'enhancement', color: 'violet' },
  { name: 'security', color: 'orange' },
  { name: 'performance', color: 'cyan' },
  { name: 'documentation', color: 'green' }
];

export async function GET() {
  let labels = await prisma.label.findMany({
    orderBy: { name: 'asc' }
  });

  if (labels.length === 0) {
    await prisma.label.createMany({
      data: DEFAULT_LABELS,
      skipDuplicates: true
    });
    labels = await prisma.label.findMany({
      orderBy: { name: 'asc' }
    });
  }

  return NextResponse.json(labels);
}
