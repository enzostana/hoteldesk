import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={title:'HotelDesk | Suporte de TI',description:'Sistema de gerenciamento de chamados de TI do hotel'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
