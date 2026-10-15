import './globals.css';
import './pastel.css';
import './product-editor.css';
import './product-tools.css';
import './inventory.css';
import './resource-editor.css';
import './sales-workspaces.css';
import {AuthProvider} from '@/components/AuthProvider';
import {ToastProvider} from '@/components/Toast';
export const metadata={title:'Carnix Admin',description:'پنل مدیریت یکپارچه Carnix'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body><ToastProvider><AuthProvider>{children}</AuthProvider></ToastProvider></body></html>}
// Test
