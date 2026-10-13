// Keep local development configurable while ensuring a production build never
// silently points at the server's loopback interface.
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.carnix.ir').replace(/\/$/, '');
const TOKEN_KEY = 'carnix_admin_api_token';
const REFRESH_KEY = 'carnix_admin_refresh_token';
export const tokenStore = {
  get: () => typeof window === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY),
  getRefresh: () => typeof window === 'undefined' ? null : sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY),
  isPersistent: () => typeof window !== 'undefined' && localStorage.getItem(TOKEN_KEY) !== null,
  set: (value:string, refreshToken?:string, persistent = true) => {
    if (typeof window === 'undefined') return;
    const target = persistent ? localStorage : sessionStorage;
    const other = persistent ? sessionStorage : localStorage;
    other.removeItem(TOKEN_KEY); other.removeItem(REFRESH_KEY);
    target.setItem(TOKEN_KEY, value);
    if (refreshToken) target.setItem(REFRESH_KEY, refreshToken);
    else target.removeItem(REFRESH_KEY);
  },
  clear: () => { if (typeof window !== 'undefined') { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(REFRESH_KEY); } },
};
export type ApiOptions = { method?:string; body?:unknown; query?:Record<string, unknown>; formData?:FormData; signal?:AbortSignal };
function queryString(query?:Record<string,unknown>) {
  if (!query) return '';
  const p = new URLSearchParams();
  Object.entries(query).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') p.set(k,String(v)); });
  const q=p.toString(); return q ? `?${q}` : '';
}
export function fillPath(path:string, params:Record<string,string|number>) {
  return path.replace(/\{([^}:]+)(?::[^}]+)?\}/g, (_,k) => encodeURIComponent(String(params[k] ?? `{${k}}`)));
}
let refreshInFlight: Promise<boolean> | null = null;
async function renewAccess(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  if (!refreshInFlight) refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/Auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ refreshToken }), credentials: 'include', cache: 'no-store' });
      if (!response.ok) return false;
      const result = await response.json();
      const tokens = result?.data ?? result?.Data;
      const access = tokens?.accessToken ?? tokens?.AccessToken;
      const nextRefresh = tokens?.refreshToken ?? tokens?.RefreshToken;
      if (result?.isSuccess === false || typeof access !== 'string' || !access) return false;
      tokenStore.set(access, typeof nextRefresh === 'string' ? nextRefresh : refreshToken, tokenStore.isPersistent());
      return true;
    } catch { return false; }
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}
export async function api<T=any>(path:string, options:ApiOptions = {}):Promise<T> {
  return request<T>(path, options, true);
}
async function request<T>(path:string, options:ApiOptions, allowRefresh:boolean):Promise<T> {
  const headers:Record<string,string> = { Accept:'application/json' };
  const token=tokenStore.get(); if (token) headers.Authorization=`ApiToken ${token}`;
  let body:BodyInit|undefined;
  if (options.formData) body=options.formData;
  else if (options.body !== undefined) { headers['Content-Type']='application/json'; body=JSON.stringify(options.body); }
  const url = `${API_BASE}/${path.replace(/^\//,'')}${queryString(options.query)}`;
  let res:Response;
  try { res=await fetch(url,{method:options.method||'GET',headers,body,credentials:'include',cache:'no-store',signal:options.signal}); }
  catch(e:any){ if (e?.name === 'AbortError') throw e; throw new Error(e?.message || 'ارتباط با سرور برقرار نشد.'); }
  const text=await res.text(); let data:any=null;
  if(text){ try{data=JSON.parse(text)}catch{data=text} }
  if(!res.ok){
    if (res.status === 401 && allowRefresh && !/^api\/Auth\/(login|refresh|logout)$/i.test(path) && await renewAccess()) {
      return request<T>(path, options, false);
    }
    const validationErrors = data?.errors && typeof data.errors === 'object'
      ? Object.entries(data.errors as Record<string, unknown>)
          .flatMap(([field, value]) => (Array.isArray(value) ? value : [value])
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .map((message) => `${field}: ${message}`))
      : [];
    const baseMessage = data?.message || data?.Message || data?.title || (typeof data==='string'?data:null) || `خطای HTTP ${res.status}`;
    const msg = validationErrors.length
      ? `${baseMessage}: ${validationErrors.slice(0, 4).join('؛ ')}${validationErrors.length > 4 ? '؛ …' : ''}`
      : baseMessage;
    const err:any=new Error(msg); err.status=res.status; err.data=data;
    if(res.status===401 && typeof window!=='undefined'){ tokenStore.clear(); if(!location.pathname.startsWith('/login')) location.href='/login'; }
    throw err;
  }
  if(data && typeof data==='object' && (data.isSuccess === false || data.IsSuccess === false)){
    throw new Error(data.message || data.Message || 'عملیات در سرور انجام نشد.');
  }
  return data as T;
}
export function unwrapList(input:any):any[]{
  if(Array.isArray(input)) return input;
  const paths=[input?.data,input?.items,input?.records,input?.result,input?.mainResults,input?.data?.items,input?.data?.records,input?.data?.data,input?.data?.mainResults,input?.mainResults?.items,input?.mainResults?.records,input?.value,input?.data?.value];
  for(const p of paths) if(Array.isArray(p)) return p;
  if(input && typeof input==='object'){
    const arr=Object.values(input).find(Array.isArray); if(Array.isArray(arr)) return arr;
  }
  return [];
}
export function unwrapData(input:any){ return input?.data ?? input?.result ?? input; }
