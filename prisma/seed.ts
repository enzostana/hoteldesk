import {PrismaClient,Role,Category,Priority,Status} from '@prisma/client';import bcrypt from 'bcryptjs';
const prisma=new PrismaClient();
async function main(){
 const users=[
  {name:'VINICIUS MARQUES',email:'vinicius.marques@hotel.com',role:Role.CLIENT},
  {name:'ENZO SANTANA',email:'enzo.santana@hotel.com',role:Role.TECHNICIAN},
  {name:'GIULIA MEDEIROS',email:'giulia.medeiros@hotel.com',role:Role.TECHNICIAN},
  {name:'ARTHUR SALVADOR',email:'arthur.salvador@hotel.com',role:Role.TECHNICIAN},
  {name:'LUIZ MAINOATH',email:'luiz.mainoath@hotel.com',role:Role.TECHNICIAN},
  {name:'GERÊNCIA DE TI',email:'gerencia@hotel.com',role:Role.MANAGER},
 ];const hash=await bcrypt.hash('123456',10);const records:any={};for(const u of users)records[u.email]=await prisma.user.upsert({where:{email:u.email},update:{name:u.name,role:u.role,passwordHash:hash},create:{...u,passwordHash:hash}});
 if(await prisma.ticket.count()) {console.log('Chamados existentes preservados.');return;}
 const c=records['vinicius.marques@hotel.com'];const techs=['enzo.santana@hotel.com','giulia.medeiros@hotel.com','arthur.salvador@hotel.com','luiz.mainoath@hotel.com'].map(e=>records[e]);
 const samples=[
  {title:'Computador da recepção sem internet',description:'O computador utilizado na recepção não consegue acessar a rede desde o início do turno.',category:Category.REDE,priority:Priority.HIGH,status:Status.OPEN,assignee:null},
  {title:'Impressora administrativa não imprime',description:'A impressora do setor administrativo recebe os documentos, mas não inicia a impressão.',category:Category.HARDWARE,priority:Priority.MEDIUM,status:Status.IN_PROGRESS,assignee:techs[1]},
  {title:'Erro de acesso ao sistema de reservas',description:'Ao abrir o sistema de reservas, aparece uma mensagem de erro e o login não é concluído.',category:Category.SISTEMA,priority:Priority.CRITICAL,status:Status.WAITING,assignee:techs[2]},
  {title:'Instalação de software na gerência',description:'Solicitação para instalar o pacote de escritório no computador da gerência.',category:Category.SOFTWARE,priority:Priority.LOW,status:Status.RESOLVED,assignee:techs[3],solution:'Pacote de escritório instalado e validado com a equipe.'},
  {title:'Liberação de acesso ao Wi-Fi corporativo',description:'Novo funcionário precisa de acesso à rede sem fio corporativa.',category:Category.ACESSO,priority:Priority.MEDIUM,status:Status.CLOSED,assignee:techs[0],solution:'Credenciais corporativas configuradas e conexão testada.'},
  {title:'Leitor de cartão do caixa desconectando',description:'O equipamento perde a conexão durante o uso no restaurante.',category:Category.EQUIPAMENTO,priority:Priority.HIGH,status:Status.IN_PROGRESS,assignee:techs[0]},
 ];for(const s of samples){
  const solution='solution' in s?s.solution:undefined;
  const created=await prisma.ticket.create({data:{title:s.title,description:s.description,category:s.category,priority:s.priority,status:s.status,requesterId:c.id,assignedToId:s.assignee?.id,solution,resolvedAt:s.status==='RESOLVED'||s.status==='CLOSED'?new Date():null,closedAt:s.status==='CLOSED'?new Date():null}});
  await prisma.ticketHistory.create({data:{ticketId:created.id,userId:c.id,action:'CREATED',description:`${c.name} abriu o chamado.`}});
  let previous:Status=Status.OPEN;
  if(s.assignee){
   await prisma.ticketHistory.create({data:{ticketId:created.id,userId:s.assignee.id,action:'ASSIGNED',description:`${s.assignee.name} assumiu o chamado.`}});
   await prisma.ticketHistory.create({data:{ticketId:created.id,userId:s.assignee.id,action:'STATUS_CHANGED',description:'Status alterado de Aberto para Em atendimento.',oldValue:Status.OPEN,newValue:Status.IN_PROGRESS}});
   previous=Status.IN_PROGRESS;
  }
  if(s.status===Status.WAITING){await prisma.ticketHistory.create({data:{ticketId:created.id,userId:s.assignee!.id,action:'STATUS_CHANGED',description:'Status alterado de Em atendimento para Aguardando.',oldValue:Status.IN_PROGRESS,newValue:Status.WAITING}});previous=Status.WAITING;}
  if(solution&&s.assignee){
   await prisma.ticketHistory.create({data:{ticketId:created.id,userId:s.assignee.id,action:'SOLUTION',description:`${s.assignee.name} registrou a solução.`}});
   await prisma.ticketHistory.create({data:{ticketId:created.id,userId:s.assignee.id,action:'STATUS_CHANGED',description:`Status alterado de ${previous===Status.WAITING?'Aguardando':'Em atendimento'} para Resolvido.`,oldValue:previous,newValue:Status.RESOLVED}});
  }
  if(s.status===Status.CLOSED){
   const manager=records['gerencia@hotel.com'];
   await prisma.ticketHistory.create({data:{ticketId:created.id,userId:manager.id,action:'CLOSED',description:`${manager.name} encerrou o chamado.`}});
   await prisma.ticketHistory.create({data:{ticketId:created.id,userId:manager.id,action:'STATUS_CHANGED',description:'Status alterado de Resolvido para Encerrado.',oldValue:Status.RESOLVED,newValue:Status.CLOSED}});
  }
 }
 console.log('Seed concluído: 6 usuários e 6 chamados de demonstração.');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
