"use client";
import React,{createContext,useContext,useEffect,useState} from 'react';
import {api,tokenStore,unwrapData} from '@/lib/api';
import {usePathname,useRouter} from 'next/navigation';
type Auth={user:any;loading:boolean;login:(u:string,p:string,r?:boolean)=>Promise<void>;logout:()=>Promise<void>;refresh:()=>Promise<void>};
const C=createContext<Auth|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){
 const [user,setUser]=useState<any>(null); const [loading,setLoading]=useState(true); const path=usePathname(); const router=useRouter();
 const refresh=async()=>{const t=tokenStore.get(); if(!t){setUser(null);setLoading(false);return;} try{const x=await api('api/Auth/me');setUser(unwrapData(x));}catch{setUser(null);}finally{setLoading(false)}};
 useEffect(()=>{refresh()},[]);
 useEffect(()=>{if(!loading && !user && path.startsWith('/admin')) router.replace('/login')},[loading,user,path,router]);
 const login=async(u:string,p:string,r=false)=>{const x:any=await api('api/Auth/login',{method:'POST',body:{userName:u,password:p,rememberMe:r}}); const t=x?.accessToken||x?.token; if(typeof t!=='string'||!t) throw new Error(x?.message||'توکن ورود دریافت نشد.'); tokenStore.set(t,x?.refreshToken,r);try{const me=await api('api/Auth/me');setUser(unwrapData(me));setLoading(false);router.replace('/admin/dashboard')}catch(error){tokenStore.clear();setUser(null);throw error}};
 const logout=async()=>{try{await api('api/Auth/logout',{method:'POST'})}catch{} tokenStore.clear();setUser(null);router.replace('/login')};
 return <C.Provider value={{user,loading,login,logout,refresh}}>{children}</C.Provider>
}
export const useAuth=()=>{const x=useContext(C);if(!x)throw new Error('AuthProvider missing');return x};
