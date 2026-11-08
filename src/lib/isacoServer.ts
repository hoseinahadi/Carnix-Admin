import path from 'node:path';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function isacoDataDirectory() {
  return process.env.ISACO_DATA_DIR
    ? path.resolve(process.env.ISACO_DATA_DIR)
    : path.resolve(process.cwd(), '..', 'Back_نمیدونم_مشکلش_چیه', 'data', 'isaco');
}

export function isacoCollectorDirectory() {
  return process.env.ISACO_COLLECTOR_DIR
    ? path.resolve(process.env.ISACO_COLLECTOR_DIR)
    : path.resolve(process.cwd(), '..', 'Back_نمیدونم_مشکلش_چیه', 'scripts');
}

export async function authorizeIsacoRequest(request: NextRequest): Promise<string | NextResponse> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('ApiToken ') || authorization.length <= 'ApiToken '.length) {
    return NextResponse.json({ message: 'ورود لازم است.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const backendOrigin = (process.env.CARNIX_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.carnix.ir').replace(/\/$/, '');
  try {
    // Match the endpoint used by the Admin login flow. Category/options may
    // have route-specific access rules that do not represent session validity.
    const response = await fetch(`${backendOrigin}/api/Auth/me`, {
      headers: { Authorization: authorization, Accept: 'application/json' }, cache: 'no-store',
    });
    if (response.status === 401) {
      return NextResponse.json({ message: 'نشست کارنیکس منقضی یا نامعتبر است؛ دوباره وارد پنل شوید.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }
    if (response.status === 403) {
      return NextResponse.json({ message: 'حساب واردشده مجوز دسترسی به API کارنیکس را ندارد.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
    if (!response.ok) {
      return NextResponse.json({ message: 'اعتبارسنجی دسترسی ناموفق بود.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
    }
    return authorization;
  } catch {
    return NextResponse.json({ message: 'ارتباط با سرویس احراز هویت برقرار نشد.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
