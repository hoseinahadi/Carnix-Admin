"use client";
import React,{createContext,useContext,useState} from 'react';
type T={show:(message:string,type?:'ok'|'error')=>void}; const C=createContext<T|null>(null);
export function ToastProvider({children}:{children:React.ReactNode}){const [items,setItems]=useState<{id:number,m:string,t:string}[]>([]); const show=(m:string,t:'ok'|'error'='ok')=>{const id=Date.now()+Math.random();setItems(x=>[...x,{id,m,t}]);setTimeout(()=>setItems(x=>x.filter(i=>i.id!==id)),3500)};return <C.Provider value={{show}}>{children}<div className="toasts">{items.map(i=><div key={i.id} className={'toast '+i.t}>{i.m}</div>)}</div></C.Provider>}
export const useToast=()=>{const x=useContext(C);if(!x)throw new Error('ToastProvider');return x};
