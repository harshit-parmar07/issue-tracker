import authOptions from "@/app/auth/authOptions";
import { patchIssueSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session)
        return NextResponse.json({}, { status: 401 })
    const body = await request.json();

    const validation = patchIssueSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(validation.error.format(), { status: 400 })
    }

    const { assignedToUserId, title, description } = body;
    try {
        const updatedIssue = await prisma.issue.update({
            where: { id: parseInt(params.id) },
            data: {
                title,
                description,
                assignedToUserId
            }
        });

        revalidatePath('/issues/list');
        revalidatePath('/');

        return NextResponse.json(updatedIssue);
    } catch (error: any) {
        // P2025: Record to update not found (Issue not found)
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Invalid issue' }, { status: 404 });
        }
        // P2003: Foreign key constraint failed (User not found)
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session)
        return NextResponse.json({}, { status: 401 })
    // const body = await request.json();
    // const validation = issueSchema.safeParse(body);

    const issue = await prisma.issue.findUnique({
        where: { id: parseInt(params.id) }
    });

    if (!issue) return NextResponse.json({ error: 'Invalid Issue' }, { status: 404 })

    await prisma.issue.delete({
        where: { id: issue.id }
    })

    revalidatePath('/issues/list');
    revalidatePath('/');

    return NextResponse.json({})
}