import {NextResponse} from 'next/server';import {prisma} from '@/lib/prisma';import {requireRole} from '@/lib/auth';import {errorResponse} from '@/lib/api';
export async function GET(){try{await requireRole('TECHNICIAN','MANAGER');return NextResponse.json(await prisma.user.findMany({where:{role:'TECHNICIAN'},select:{id:true,name:true}}));}catch(e){return errorResponse(e)}}
