'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { cn } from 'cn';
import { Controller, useForm } from 'react-hook-form';
import { LoginFormType } from '../types/auth';
import { loginSchema } from '../schemas/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldError, FieldLabel, Field } from '@/shared/components/ui/field';
import { Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface LoginFormProps {
  onSubmitSuccess?: () => void;
}

/**
 * نموذج تسجيل الدخول المطابق للتصميم تماماً مع التحقق البصري ودعم اللغتين
 */
export function LoginForm({ onSubmitSuccess }: LoginFormProps) {
  const t = useTranslations('Auth.login');


  const form = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: {
      username: '',
      password: ""

    },
  });

  console.log(form.formState.errors);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Click Button Form");
    

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



      {/* حقول الإدخال */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5" noValidate>
        {/* اسم المستخدم */}



        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t("workEmail")}</FieldLabel>

              <div className="flex items-center gap-2 rounded-xl border border-input px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder={t('usernamePlaceholder')}
                  className={cn(
                    'w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 transition-all duration-150',
                    'focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10',
                    'disabled:opacity-60 disabled:cursor-not-allowed'
                  )}
                  {...field}
                />
              </div>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* كلمة المرور */}
        {/* <div className="text-start">
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
            placeholder={t('passwordPlaceholder')}
            className={cn(
              'w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 transition-all duration-150',
              'focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          />
        </div> */}

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('passwordLabel')}</FieldLabel>

              <div className="flex items-center gap-2 rounded-xl border border-input px-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="text"
                  autoComplete="password"
                  placeholder={t('passwordPlaceholder')}
                  className={cn(
                    'w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 transition-all duration-150',
                    'focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10',
                    'disabled:opacity-60 disabled:cursor-not-allowed'
                  )}
                  {...field}
                />
              </div>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        {/* زر الدخول الأزرق الفخم */}
        <Button
          type="submit"
          onClick={() => console.log("Click Button !!!")
          }
          className={cn(
            'w-full h-12 bg-[#0040D8] cursor-pointer hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center cursor-pointer select-none mt-7',
            'opacity-70 pointer-events-none'
          )}
        >
          <span>{t('submitBtn')}</span>
        </Button>
      </form>
    </div>
  );
};

