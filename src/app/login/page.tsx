"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Package, ShoppingCart, Warehouse } from 'lucide-react';

type RecoveryStep = 'login' | 'phone' | 'reset' | 'done';

const toEnglishDigits = (value: string) => value.replace(/[۰-۹٠-٩]/g, digit =>
  String(digit.charCodeAt(0) >= 0x6f0 && digit.charCodeAt(0) <= 0x6f9
    ? digit.charCodeAt(0) - 0x6f0
    : digit.charCodeAt(0) - 0x660),
);

export default function Login() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [step, setStep] = useState<RecoveryStep>('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace('/admin/dashboard');
  }, [user, router]);

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password, remember);
    } catch (cause: any) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = async () => {
    setError('');
    if (!/^09\d{9}$/.test(phoneNumber.trim())) {
      setError('شماره موبایل را با ۰۹ و در ۱۱ رقم وارد کنید.');
      return;
    }
    setBusy(true);
    try {
      await api('api/Auth/send-otp', {
        method: 'POST',
        body: { phoneNumber: phoneNumber.trim() },
      });
      setStep('reset');
    } catch (cause: any) {
      setError(cause.message || 'ارسال کد تایید انجام نشد.');
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('رمز جدید باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    if (newPassword !== passwordConfirmation) {
      setError('تکرار رمز جدید با رمز واردشده مطابقت ندارد.');
      return;
    }

    setBusy(true);
    try {
      await api('api/Auth/reset-password-with-otp', {
        method: 'POST',
        body: {
          phoneNumber: phoneNumber.trim(),
          code: code.trim(),
          newPassword,
        },
      });
      setPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
      setCode('');
      setStep('done');
    } catch (cause: any) {
      setError(cause.message || 'بازنشانی رمز انجام نشد.');
    } finally {
      setBusy(false);
    }
  };

  const backToLogin = () => {
    setError('');
    setStep('login');
  };

  const submitForm = (event: FormEvent) => {
    if (step === 'login') return submitLogin(event);
    if (step === 'reset') return submitReset(event);
    event.preventDefault();
    if (step === 'phone') return requestOtp();
  };

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-brand">
          <div className="brand-mark big">C</div>
          <div><strong>Carnix</strong><span>پنل مدیریت فروشگاه</span></div>
        </div>
        <div className="hero-copy">
          <span>فضای کاری کارنیکس</span>
          <h1>کنترل کامل فروشگاه،<br />از یک نقطه.</h1>
          <p>محصولات را مدیریت کنید، سفارش‌ها را پیگیری کنید و موجودی انبار را همیشه به‌روز نگه دارید.</p>
          <div className="login-highlights"><span><Package size={20} />مدیریت محصولات</span><span><ShoppingCart size={20} />پیگیری سفارش‌ها</span><span><Warehouse size={20} />کنترل انبار</span></div>
        </div>
        <div className="art-grid"><i /><i /><i /><i /></div>
      </section>

      <section className="login-form-wrap">
        <form onSubmit={submitForm} className="login-form">
          {step === 'login' && <>
            <div>
              <span className="login-security"><ShieldCheck size={18} />ورود به فضای مدیریت</span>
              <h2>ورود به پنل مدیریت</h2>
              <p>با حساب دارای سطح دسترسی مدیریتی وارد شوید.</p>
            </div>
            <label>
              <span>نام کاربری</span>
              <input autoFocus autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required />
            </label>
            <label>
              <span>رمز عبور</span>
              <div className="login-password"><input aria-label="رمز عبور" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
            </label>
            <label className="remember">
              <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />
              <span>مرا به خاطر بسپار</span>
            </label>
            <button className="login-recovery-link" type="button" onClick={() => { setError(''); setStep('phone'); }}>
              رمز عبور را فراموش کرده‌اید؟
            </button>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="primary login-button" disabled={busy || loading}>
              {busy ? 'در حال ورود...' : 'ورود به پنل'}
            </button>
          </>}

          {step === 'phone' && <>
            <div>
              <span className="eyebrow">بازیابی حساب</span>
              <h2>بازنشانی رمز عبور</h2>
              <p>شماره موبایل ثبت‌شده در حساب را وارد کنید تا کد تایید برایتان ارسال شود.</p>
            </div>
            <label>
              <span>شماره موبایل</span>
              <input type="text" inputMode="tel" autoComplete="tel" dir="ltr" maxLength={11} value={phoneNumber} onChange={event => setPhoneNumber(toEnglishDigits(event.target.value).replace(/\D/g, '').slice(0, 11))} placeholder="0912…" required />
            </label>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="primary login-button" type="button" disabled={busy || !phoneNumber.trim()} onClick={requestOtp}>
              {busy ? 'در حال ارسال کد...' : 'ارسال کد تایید'}
            </button>
            <button className="login-recovery-link" type="button" onClick={backToLogin}>بازگشت به ورود</button>
          </>}

          {step === 'reset' && <>
            <div>
              <span className="eyebrow">تایید شماره موبایل</span>
              <h2>رمز جدید را تنظیم کنید</h2>
              <p>کد ارسال‌شده به {phoneNumber} را همراه با رمز جدید وارد کنید.</p>
            </div>
            <label>
              <span>کد تایید پیامک‌شده</span>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" dir="ltr" maxLength={5} value={code} onChange={event => setCode(toEnglishDigits(event.target.value).replace(/\D/g, '').slice(0, 5))} required />
            </label>
            <label>
              <span>رمز جدید</span>
              <input type="password" autoComplete="new-password" minLength={6} value={newPassword} onChange={event => setNewPassword(event.target.value)} required />
            </label>
            <label>
              <span>تکرار رمز جدید</span>
              <input type="password" autoComplete="new-password" minLength={6} value={passwordConfirmation} onChange={event => setPasswordConfirmation(event.target.value)} required />
            </label>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="primary login-button" disabled={busy || code.length !== 5}>
              {busy ? 'در حال ذخیره رمز...' : 'ثبت رمز جدید'}
            </button>
            <button className="login-recovery-link" type="button" onClick={() => { setError(''); setStep('phone'); }}>اصلاح شماره موبایل</button>
          </>}

          {step === 'done' && <>
            <div>
              <span className="eyebrow">انجام شد</span>
              <h2>رمز عبور تغییر کرد</h2>
              <p>اکنون می‌توانید با رمز جدید وارد پنل مدیریت شوید.</p>
            </div>
            <button className="primary login-button" type="button" onClick={backToLogin}>بازگشت به ورود</button>
          </>}

          <p className="login-footer">دسترسی به این بخش ویژه مدیران مجاز کارنیکس است.</p>
        </form>
      </section>
    </main>
  );
}
// Test
