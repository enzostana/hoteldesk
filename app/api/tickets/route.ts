import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { currentUser, requireRole } from '@/lib/auth';
import { errorResponse } from '@/lib/api';
import { ticketNumber } from '@/lib/labels';
const schema=z.object({title:z.string().trim().min(1).max(150),description:z.string().trim().min(1).max(5000),category:z.enum(['HARDWARE','SOFTWARE','REDE','ACESSO','SISTEMA','EQUIPAMENTO','OUTRO']),priority:z.enum(['LOW','MEDIUM','HIGH','CRITICAL'])});
export async function GET(req:Request) {
 try {
  const user=await currentUser(); if(!user) throw new Error('UNAUTHENTICATED');
  const p=new URL(req.url).searchParams; const where:any={};
  if(user.role==='CLIENT') where.requesterId=user.id;
  if(p.get('status')) where.status=p.get('status'); if(p.get('priority')) where.priority=p.get('priority'); if(p.get('category')) where.category=p.get('category'); if(p.get('assignedToId')) where.assignedToId=p.get('assignedToId');
  if(p.get('q')) where.OR=[{title:{contains:p.get('q'),mode:'insensitive'}},{number:isNaN(Number(p.get('q')?.replace(/\D/g,'')))?undefined:Number(p.get('q')?.replace(/\D/g,''))}].filter(x=>Object.values(x).some(v=>v!==undefined));
  const tickets=await prisma.ticket.findMany({where,include:{requester:{select:{id:true,name:true}},assignedTo:{select:{id:true,name:true}}},orderBy:{createdAt:'desc'}});
  return NextResponse.json(tickets.map(t=>({...t,numberLabel:ticketNumber(t.number)})));
 } catch(e){return errorResponse(e);}
}
export async function POST(req:Request) {
 try { const user=await requireRole('CLIENT'); const data=schema.parse(await req.json()); const ticket=await prisma.$transaction(async tx=>{const t=await tx.ticket.create({data:{...data,requesterId:user.id}}); await tx.ticketHistory.create({data:{ticketId:t.id,userId:user.id,action:'CREATED',description:`${user.name} abriu o chamado.`}}); return t;}); return NextResponse.json(ticket,{status:201}); }
 catch(e){return errorResponse(e);}
}
