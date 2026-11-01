'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LoginFormValues, LoginState } from '../types';
import { Loader2 } from 'lucide-react';
import { cn } from 'cn';

interface LoginFormProps {
  onSubmitSuccess?: () => void;
}

/**
 * نموذج تسجيل الدخول المطابق للتصميم تماماً مع التحقق البصري ودعم اللغتين
 */
export const LoginForm = ({ onSubmitSuccess }: LoginFormProps) => {
  const t = useTranslations('Auth.login');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [values, setValues] = useState<LoginFormValues>({
    username: '',
    password: '',
  });

  const [state, setState] = useState<LoginState>({
    isLoading: false,
    error: null,
    success: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (state.error) {
      setState((prev) => ({ ...prev, error: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!values.username.trim() || !values.password.trim()) {
      setState((prev) => ({
        ...prev,
        error: isArabic
          ? 'يرجى إدخال اسم المستخدم وكلمة المرور'
          : 'Please enter both username and password',
      }));
      return;
    }

    setState({ isLoading: true, error: null, success: false });

    // محاكاة تسجيل الدخول (جاهزة للربط مع API أو Auth.js)
    setTimeout(() => {
      setState({ isLoading: false, error: null, success: true });
      onSubmitSuccess?.();
    }, 800);
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {/* رأس النموذج */}
      <div className="text-center sm:text-start mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
          {t('title')}
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          {t('subtitle')}
        </p>
      </div>

      {/* رسالة الخطأ إن وجدت */}
      {state.error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-start animate-in fade-in duration-200">
          {state.error}
        </div>
      )}

      {/* حقول الإدخال */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* اسم المستخدم */}
        <div className="text-start">
          <label
            htmlFor="username"
            className="block text-xs font-bold text-[#0A164E] mb-2"
          >
            {t('usernameLabel')}
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={values.username}
            onChange={handleChange}
            placeholder={t('usernamePlaceholder')}
            disabled={state.isLoading}
            className={cn(
              'w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 transition-all duration-150',
              'focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          />
        </div>

        {/* كلمة المرور */}
        <div className="text-start">
          <label
            htmlFor="password"
            className="block text-xs font-bold text-[#0A164E] mb-2"
          >
            {t('passwordLabel')}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            placeholder={t('passwordPlaceholder')}
            disabled={state.isLoading}
            className={cn(
              'w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 transition-all duration-150',
              'focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          />
        </div>

        {/* زر الدخول الأزرق الفخم */}
        <button
          type="submit"
          disabled={state.isLoading}
          className={cn(
            'w-full h-12 bg-[#0040D8] hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center cursor-pointer select-none mt-7',
            state.isLoading && 'opacity-70 pointer-events-none'
          )}
        >
          {state.isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('submitting')}</span>
            </span>
          ) : (
            <span>{t('submitBtn')}</span>
          )}
        </button>
      </form>
    </div>
  );
};

