import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeIsacoRequest, isacoDataDirectory } from '@/lib/isacoServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
};

export async function GET(request: NextRequest) {
  const authorization = await authorizeIsacoRequest(request);
  if (authorization instanceof NextResponse) return authorization;
  const assetDirectory = path.resolve(isacoDataDirectory(), 'epc-assets');
  const name = request.nextUrl.searchParams.get('name');
  try {
    if (request.nextUrl.searchParams.get('manifest') === '1') {
      const files = await readdir(assetDirectory, { withFileTypes: true });
      return NextResponse.json({ files: files.filter(file => file.isFile()).map(file => file.name) }, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (!name || !/^[A-Za-z0-9._-]{1,180}$/.test(name) || name === '.' || name === '..') {
      return NextResponse.json({ message: 'نام فایل تصویر معتبر نیست.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    const target = path.resolve(assetDirectory, name);
    if (!target.startsWith(`${assetDirectory}${path.sep}`)) {
      return NextResponse.json({ message: 'مسیر فایل معتبر نیست.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }
    const bytes = await readFile(target);
    const type = contentTypes[path.extname(name).toLowerCase()] || 'application/octet-stream';
    return new NextResponse(bytes, { headers: { 'Content-Type': type, 'Content-Length': String(bytes.byteLength), 'Cache-Control': 'private, no-store' } });
  } catch (cause) {
    const missing = (cause as NodeJS.ErrnoException)?.code === 'ENOENT';
    return NextResponse.json({ message: missing ? 'فایل تصویر در پوشهٔ خروجی سرور پیدا نشد.' : 'خواندن تصویر سرور ناموفق بود.' }, {
      status: missing ? 404 : 500, headers: { 'Cache-Control': 'no-store' },
    });
  }
}
