export const statusLabel: Record<string,string> = { OPEN:'Aberto', IN_PROGRESS:'Em atendimento', WAITING:'Aguardando', RESOLVED:'Resolvido', CLOSED:'Encerrado' };
export const priorityLabel: Record<string,string> = { LOW:'Baixa', MEDIUM:'Média', HIGH:'Alta', CRITICAL:'Crítica' };
export const categoryLabel: Record<string,string> = { HARDWARE:'Hardware', SOFTWARE:'Software', REDE:'Rede', ACESSO:'Acesso', SISTEMA:'Sistema', EQUIPAMENTO:'Equipamento', OUTRO:'Outro' };
export const roleLabel: Record<string,string> = { CLIENT:'Cliente', TECHNICIAN:'Técnico', MANAGER:'Gerência' };
export const ticketNumber = (n:number) => `CH-${String(n).padStart(6,'0')}`;
export const dateTime = (date:Date|string) => new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(date));
