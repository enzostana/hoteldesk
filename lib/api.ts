import { NextResponse } from 'next/server';
export function errorResponse(error: unknown) {
 const message = error instanceof Error ? error.message : 'UNKNOWN';
 const status = message === 'UNAUTHENTICATED' ? 401 : message === 'FORBIDDEN' ? 403 : 400;
 const friendly = message === 'FORBIDDEN' ? 'Você não possui permissão para realizar esta ação.' : message === 'UNAUTHENTICATED' ? 'Faça login para continuar.' : message === 'UNKNOWN' ? 'Não foi possível realizar a operação.' : message;
 return NextResponse.json({ error: friendly }, { status });
}
