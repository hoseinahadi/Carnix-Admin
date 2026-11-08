import { spawn } from 'node:child_process';
import { access, mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeIsacoRequest, isacoCollectorDirectory, isacoDataDirectory } from '@/lib/isacoServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type JobMode = 'Prices' | 'Epc';
const allModes: JobMode[] = ['Prices', 'Epc'];

async function readAvailableModes(): Promise<JobMode[]> {
  try {
    const config = JSON.parse(await readFile(path.join(isacoDataDirectory(), 'crawler-config.json'), 'utf8')) as { availableModes?: unknown };
    if (Array.isArray(config.availableModes)) return config.availableModes.filter((mode): mode is JobMode => mode === 'Prices' || mode === 'Epc');
  } catch { /* The admin can run the installed collectors directly without scheduled-task config. */ }
  return allModes;
}

async function readStatus() {
  try {
    const status = JSON.parse(await readFile(path.join(isacoDataDirectory(), 'crawler-status.json'), 'utf8')) as Record<string, unknown>;
    const updatedAt = Date.parse(String(status.updatedAt ?? ''));
    if (status.state === 'running' && Number.isInteger(Number(status.runnerPid)) && Number(status.runnerPid) > 0) {
      try {
        process.kill(Number(status.runnerPid), 0);
      } catch (cause) {
        if ((cause as NodeJS.ErrnoException)?.code !== 'EPERM') {
          status.state = 'stale';
          status.updatedAt = new Date().toISOString();
          status.error = 'فرایند کرولر متوقف شده است؛ اجرای بعدی از checkpoint ادامه می‌یابد.';
          return status;
        }
      }
    }
    if (status.state === 'running' && Number.isFinite(updatedAt) && Date.now() - updatedAt > 7 * 24 * 60 * 60 * 1000) status.state = 'stale';
    if (status.state === 'queued' && Number.isFinite(updatedAt) && Date.now() - updatedAt > 5 * 60 * 1000) status.state = 'stale';
    return status;
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException)?.code === 'ENOENT') return { state: 'idle', mode: null, message: 'هنوز اجرایی ثبت نشده.' };
    throw cause;
  }
}

async function saveStatus(status: Record<string, unknown>) {
  const directory = isacoDataDirectory();
  await mkdir(directory, { recursive: true });
  const target = path.join(directory, 'crawler-status.json');
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(status, null, 2), 'utf8');
  await rename(temporary, target);
}

async function resolvePythonCommand(collectorDirectory: string) {
  const localVenv = process.platform === 'win32'
    ? path.resolve(collectorDirectory, '..', '.venv-isaco', 'Scripts', 'python.exe')
    : path.resolve(collectorDirectory, '..', '.venv-isaco', 'bin', 'python');
  const configured = process.env.ISACO_PYTHON_COMMAND?.trim();
  const candidates = [localVenv, configured ? path.normalize(configured) : ''].filter(Boolean);
  for (const candidate of candidates) {
    try { await access(candidate); return candidate; }
    catch { /* Try the next installed interpreter. */ }
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

export async function GET(request: NextRequest) {
  const authorization = await authorizeIsacoRequest(request);
  if (authorization instanceof NextResponse) return authorization;
  try {
    return NextResponse.json({ ...(await readStatus()), availableModes: await readAvailableModes() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'خواندن وضعیت کرولر ناموفق بود.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: NextRequest) {
  const authorization = await authorizeIsacoRequest(request);
  if (authorization instanceof NextResponse) return authorization;
  let mode: JobMode;
  let resetCheckpoint = false;
  let workers = 5;
  try {
    const body = await request.json() as { mode?: unknown; workers?: unknown; resetCheckpoint?: unknown };
    if (body.mode !== 'Prices' && body.mode !== 'Epc') return NextResponse.json({ message: 'نوع کرولر معتبر نیست.' }, { status: 400 });
    mode = body.mode;
    resetCheckpoint = body.resetCheckpoint === true;
    if (body.resetCheckpoint !== undefined && typeof body.resetCheckpoint !== 'boolean') return NextResponse.json({ message: 'گزینهٔ شروع از ابتدا معتبر نیست.' }, { status: 400 });
    if (body.resetCheckpoint === true && mode !== 'Prices') return NextResponse.json({ message: 'شروع از ابتدا فقط برای کرولر قیمت پشتیبانی می‌شود.' }, { status: 400 });
    if (body.workers !== undefined) {
      workers = Number(body.workers);
      if (!Number.isInteger(workers) || workers < 1 || workers > 12) return NextResponse.json({ message: 'تعداد تب باید بین ۱ تا ۱۲ باشد.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ message: 'درخواست شروع معتبر نیست.' }, { status: 400 });
  }
  if (!(await readAvailableModes()).includes(mode)) return NextResponse.json({ message: `اجرای ${mode === 'Prices' ? 'قیمت' : 'EPC'} در تنظیمات غیرفعال است.` }, { status: 409 });
  const current = await readStatus();
  if (current.state === 'running' || current.state === 'queued' || current.state === 'cancelling') return NextResponse.json({ message: 'یک اجرای ایساکو از قبل در حال انجام یا لغو شدن است.' }, { status: 409 });

  const collectorDirectory = isacoCollectorDirectory();
  const runner = path.join(collectorDirectory, 'run_isaco.py');
  try {
    await access(runner);
  } catch {
    return NextResponse.json({ message: `فایل اجرای کرولر پیدا نشد: ${runner}` }, { status: 503 });
  }
  const carnixApiBaseUrl = process.env.CARNIX_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.carnix.ir';

  const startedAt = new Date().toISOString();
  const runId = `${Date.now()}-${process.pid}`;
  if (mode === 'Prices' && resetCheckpoint) {
    const checkpoint = path.join(isacoDataDirectory(), 'prices-checkpoint.json');
    const archive = path.join(isacoDataDirectory(), `prices-checkpoint-expired-${Date.now()}.json`);
    try { await rename(checkpoint, archive); }
    catch (cause) {
      if ((cause as NodeJS.ErrnoException)?.code !== 'ENOENT') return NextResponse.json({ message: 'checkpoint قبلی آرشیو نشد؛ اجرای تازه شروع نشد.' }, { status: 500 });
    }
  }
  await unlink(path.join(isacoDataDirectory(), 'crawler.cancel')).catch(() => undefined);
  await saveStatus({ mode, state: 'queued', startedAt, updatedAt: startedAt, runId, workers: mode === 'Prices' ? workers : 1, logFile: '', outputFile: '' });
  const python = await resolvePythonCommand(collectorDirectory);
  const child = spawn(/*turbopackIgnore: true*/ python, [runner, '--mode', mode, '--data-dir', isacoDataDirectory(), '--collector-dir', collectorDirectory, '--workers', String(workers)], {
    cwd: collectorDirectory,
    detached: true,
    windowsHide: false,
    stdio: 'ignore',
    env: { ...process.env, CARNIX_API_BASE_URL: carnixApiBaseUrl, CARNIX_API_TOKEN: authorization.slice('ApiToken '.length) },
  });
  const launchError = await new Promise<string | null>(resolve => {
    const timer = setTimeout(() => resolve(null), 700);
    child.once('error', error => { clearTimeout(timer); resolve(error.message); });
    child.once('spawn', () => { clearTimeout(timer); resolve(null); });
  });
  if (launchError) {
    await saveStatus({ mode, state: 'failed', startedAt, updatedAt: new Date().toISOString(), runId, error: `اجرای Python ناموفق بود: ${launchError}` });
    return NextResponse.json({ message: `اجرای Python ناموفق بود: ${launchError}` }, { status: 503 });
  }
  child.unref();
  return NextResponse.json({ started: true, mode, message: 'فرایند جمع‌آوری روی همین محیط اجرا شد.' }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
}

export async function DELETE(request: NextRequest) {
  const authorization = await authorizeIsacoRequest(request);
  if (authorization instanceof NextResponse) return authorization;
  try {
    const current = await readStatus();
    if (current.state === 'cancelling') {
      return NextResponse.json({ cancelling: true, message: 'درخواست لغو قبلاً ثبت شده است.' }, { status: 202 });
    }
    if (current.state !== 'running' && current.state !== 'queued') {
      return NextResponse.json({ message: 'اجرای فعالی برای لغو وجود ندارد.' }, { status: 409 });
    }
    const directory = isacoDataDirectory();
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'crawler.cancel'), new Date().toISOString(), 'utf8');
    await saveStatus({
      ...current,
      state: 'cancelling',
      updatedAt: new Date().toISOString(),
      message: 'درخواست لغو ثبت شد؛ checkpoint در حال ذخیره‌شدن است.',
    });
    return NextResponse.json({ cancelling: true, message: 'لغو اجرا درخواست شد؛ پیشرفت ذخیره‌شده حفظ می‌شود.' }, { status: 202 });
  } catch {
    return NextResponse.json({ message: 'ثبت درخواست لغو ناموفق بود.' }, { status: 500 });
  }
}
