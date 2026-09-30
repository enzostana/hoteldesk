import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {currentUser} from '@/lib/auth';
import {errorResponse} from '@/lib/api';
const statuses=['OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED'] as const;
const ticketInclude={requester:{select:{name:true}},assignedTo:{select:{name:true}}};
export async function GET(){
 try{
  const u=await currentUser();if(!u)throw new Error('UNAUTHENTICATED');if(u.role==='CLIENT')throw new Error('FORBIDDEN');
  const base={};
  const counts=await Promise.all(statuses.map(status=>prisma.ticket.count({where:{...base,status}})));
  const recent=await prisma.ticket.findMany({where:base,include:ticketInclude,orderBy:{createdAt:'desc'},take:8});
  const technicians=u.role==='MANAGER'?await prisma.user.findMany({where:{role:'TECHNICIAN'},select:{id:true,name:true}}):[];
  const available=u.role==='TECHNICIAN'?await prisma.ticket.findMany({where:{status:'OPEN',assignedToId:null},include:ticketInclude,orderBy:{createdAt:'asc'},take:8}):[];
  const mine=u.role==='TECHNICIAN'?await prisma.ticket.findMany({where:{assignedToId:u.id,status:{in:['IN_PROGRESS','WAITING']}},include:ticketInclude,orderBy:{updatedAt:'desc'},take:8}):[];
  return NextResponse.json({role:u.role,total:counts.reduce((a,b)=>a+b,0),counts:Object.fromEntries(statuses.map((s,i)=>[s,counts[i]])),recent,technicians,available,mine});
 }catch(e){return errorResponse(e)}
}
