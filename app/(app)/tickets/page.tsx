'use client';
/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Plus,Search,Filter} from 'lucide-react';
import {TicketTable} from '@/components/ticket-table';
import {useSearchParams} from 'next/navigation';
export default function Tickets(){
 const[tickets,setTickets]=useState<any[]|null>(null),[q,setQ]=useState(''),[status,setStatus]=useState(''),[priority,setPriority]=useState(''),[category,setCategory]=useState(''),[assignedToId,setAssignedToId]=useState(''),[techs,setTechs]=useState<any[]>([]);
 const sp=useSearchParams();
 async function load(){setTickets(null);const p=new URLSearchParams();if(q)p.set('q',q);if(status)p.set('status',status);if(priority)p.set('priority',priority);if(category)p.set('category',category);if(assignedToId)p.set('assignedToId',assignedToId);const r=await fetch('/api/tickets?'+p.toString());setTickets(r.ok?await r.json():[])}
 const created=sp.get('created');
 useEffect(()=>{if(created)history.replaceState(null,'','/tickets');load();fetch('/api/technicians').then(r=>r.ok?r.json():[]).then(setTechs).catch(()=>setTechs([]))},[created]);
 return <>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:14}}><div><h1 className="page-title">Chamados</h1><p className="page-desc">Pesquise e acompanhe solicitações de suporte.</p></div><Link href="/tickets/new" className="btn btn-primary"><Plus size={15}/>Novo chamado</Link></div>
  <div className="card"><form className="toolbar" onSubmit={e=>{e.preventDefault();load()}}><div style={{position:'relative',flex:'1 1 220px',maxWidth:320}}><Search size={15} style={{position:'absolute',left:11,top:11,color:'#89949c'}}/><input className="input" style={{paddingLeft:34}} placeholder="Buscar número ou título" value={q} onChange={e=>setQ(e.target.value)}/></div>
   <select className="select" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos os status</option>{['OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED'].map((v,i)=><option key={v} value={v}>{['Aberto','Em atendimento','Aguardando','Resolvido','Encerrado'][i]}</option>)}</select>
   <select className="select" value={priority} onChange={e=>setPriority(e.target.value)}><option value="">Todas prioridades</option>{['LOW','MEDIUM','HIGH','CRITICAL'].map((v,i)=><option key={v} value={v}>{['Baixa','Média','Alta','Crítica'][i]}</option>)}</select>
   <select className="select" value={category} onChange={e=>setCategory(e.target.value)}><option value="">Todas categorias</option>{['HARDWARE','SOFTWARE','REDE','ACESSO','SISTEMA','EQUIPAMENTO','OUTRO'].map((v,i)=><option key={v} value={v}>{['Hardware','Software','Rede','Acesso','Sistema','Equipamento','Outro'][i]}</option>)}</select>
   {techs.length>0&&<select className="select" value={assignedToId} onChange={e=>setAssignedToId(e.target.value)}><option value="">Todos os técnicos</option>{techs.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>}
   <button className="btn"><Filter size={14}/>Filtrar</button></form><TicketTable tickets={tickets||[]}/></div>
 </>
}
