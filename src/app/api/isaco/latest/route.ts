import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeIsacoRequest, isacoDataDirectory } from '@/lib/isacoServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authorization = await authorizeIsacoRequest(request);
  if (authorization instanceof NextResponse) return authorization;
  const mode = request.nextUrl.searchParams.get('mode') === 'Epc' ? 'Epc' : 'Prices';
  const snapshotName = mode === 'Epc' ? 'epc-latest.json' : 'prices-latest.json';
  try {
    const directory = isacoDataDirectory();
    let status: { mode?: string; state?: string; outputFile?: string; error?: string; progress?: { current?: string } } = {};
    let snapshotPath = path.join(directory, snapshotName);
    if (mode === 'Prices') {
      status = JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(directory, 'crawler-status.json'), 'utf8')) as typeof status;
      const partialPath = path.join(directory, 'prices-checkpoint.json');
      if (status.mode === 'Prices' && ['queued', 'running', 'cancelling', 'cancelled', 'failed', 'stale'].includes(String(status.state))) {
        snapshotPath = partialPath;
      }
    }
    const snapshot = JSON.parse(await readFile(/*turbopackIgnore: true*/ snapshotPath, 'utf8'));
    if (mode === 'Prices' && Array.isArray(snapshot.items)) {
      const failedProducts = Array.isArray(snapshot.failedProducts) ? [...snapshot.failedProducts] : [];
      const lastSearch = status.state === 'failed' && /collector exited with code/i.test(status.error ?? '')
        ? status.progress?.current?.match(/^تب قیمت\s+(\d+)\s*:\s*(.+)$/)
        : null;
      if (lastSearch && !failedProducts.some((record: { code?: string }) => String(record.code ?? '') === lastSearch[2].trim())) {
        failedProducts.push({ code: lastSearch[2].trim(), name: '', worker: `تب قیمت ${lastSearch[1]}`, reason: status.error });
      }
      return NextResponse.json({
        source: 'isaco-b2b-visible-price-list',
        observedAt: snapshot.observedAt ?? null,
        sourceItems: snapshot.items,
        unmatchedCodes: snapshot.unmatched ?? [],
        unmatchedProducts: snapshot.unmatchedProducts ?? [],
        failedProducts,
        completedCount: snapshot.completedKeys?.length ?? 0,
        totalCount: snapshot.productKeys?.length ?? 0,
        complete: (snapshot.completedKeys?.length ?? 0) === (snapshot.productKeys?.length ?? -1),
        partial: true,
      }, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (!snapshot || !Array.isArray(snapshot.sourceItems)) {
      return NextResponse.json({ message: 'فایل آخرین خروجی ایساکو معتبر نیست.' }, { status: 422, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json(snapshot, { headers: { 'Cache-Control': 'no-store' } });
  } catch (cause) {
    const isMissing = (cause as NodeJS.ErrnoException)?.code === 'ENOENT';
    return NextResponse.json({ message: isMissing ? `هنوز خروجی ${mode === 'Epc' ? 'EPC' : 'قیمت'} روی این محیط ثبت نشده.` : 'خواندن خروجی ایساکو از سرور ناموفق بود.' }, {
      status: isMissing ? 404 : 500, headers: { 'Cache-Control': 'no-store' },
    });
  }
}
