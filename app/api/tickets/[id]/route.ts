import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import { errorResponse } from '@/lib/api';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
 try {
  const user = await currentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
   where: { id },
   include: {
    requester: { select: { id: true, name: true, email: true } },
    assignedTo: { select: { id: true, name: true, email: true } },
    comments: { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'asc' } },
    history: { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'asc' } },
   },
  });
  if (!ticket) return NextResponse.json({ error: 'Chamado não encontrado.' }, { status: 404 });
  if (user.role === 'CLIENT' && ticket.requesterId !== user.id) throw new Error('FORBIDDEN');
  return NextResponse.json(ticket);
 } catch (e) { return errorResponse(e); }
}
