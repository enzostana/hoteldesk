import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/auth';
import DashboardView from './dashboard-view';
export default async function DashboardPage(){
 const user=await currentUser();
 if(user?.role==='CLIENT')redirect('/tickets');
 return <DashboardView/>;
}
