# 🚀 دليل نشر النظام كاملاً (الفرونت إند والباك إند) على Vercel

تم تجهيز الباك إند (NestJS) ليعمل كـ **Serverless Function** على Vercel، والفرونت إند (Next.js) ليعمل كمشروع Vercel أصلي.

---

## 📌 الفكرة الأساسية:
في Vercel، يتم إنشاء **مشروعين منفصلين (Two Projects)** من نفس الـ GitHub Repository:
1. **مشروع 1 (الباك إند)**: يقرأ من مجلد `server`.
2. **مشروع 2 (الفرونت إند)**: يقرأ من مجلد `client`.

---

## الخطوة الأولى: رفع الباك إند (NestJS API) على Vercel

1. افتح [Vercel Dashboard](https://vercel.com/new).
2. اختر مستودع المشروع (Repository) واضغط **Import**.
3. غيّر اسم المشروع ليصبح مثلاً: `clinic-api`.
4. **الخطوة الهامة (Root Directory)**:
   - اضغط **Edit** بجوار **Root Directory** واكتب أو اختر مجلد: `server`.
5. في قسم **Environment Variables** أضف المتغيرات التالية:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: رابط اتصال Neon (الـ Pooled URL)
   - `DIRECT_URL`: رابط اتصال Neon (الـ Direct URL)
   - `JWT_ACCESS_SECRET`: نص أمان عشوائي لا يقل عن 32 حرفاً
   - `JWT_REFRESH_SECRET`: نص أمان عشوائي لا يقل عن 32 حرفاً
   - `STORAGE_DRIVER`: `local` (أو `s3` عند استخدام تخزين سحابي للمرفقات)
6. اضغط **Deploy**.
7. بعد انتهاء النشر، انسخ رابط الباك إند الذي يوفره Vercel، مثلاً:
   `https://clinic-api-xxx.vercel.app`

---

## الخطوة الثانية: تشغيل Migrations قاعدة البيانات
بما أن Vercel يعمل كـ Serverless، يجب تطبيق الميجريشنز على قاعدة بيانات Neon لمرة واحدة:
- من جهازك في مجلد `server`:
  ```bash
  npx prisma migrate deploy
  ```

---

## الخطوة الثالثة: رفع الفرونت إند (Next.js) على Vercel

1. في Vercel Dashboard، اضغط **Add New…** -> **Project**.
2. اختر نفس المستودع مرة أخرى.
3. غيّر اسم المشروع ليصبح مثلاً: `clinic-web`.
4. **الخطوة الهامة (Root Directory)**:
   - اضغط **Edit** بجوار **Root Directory** واكتب أو اختر مجلد: `client`.
5. في قسم **Environment Variables** أضف المتغيرات الثلاثة:
   - `API_BASE_URL`: رابط الباك إند متبوعاً بـ `/api/v1`  
     مثال: `https://clinic-api-xxx.vercel.app/api/v1`
   - `NEXT_PUBLIC_SOCKET_URL`: رابط الباك إند  
     مثال: `https://clinic-api-xxx.vercel.app`
   - `COOKIE_SECRET`: نص تشفير قوي (32 حرفاً أو أكثر)  
     مثال: `fc1991b1f93a12a97cb3eb51ee811cab7c66d77989acf7cd40604b033f79b9eb`
6. اضغط **Deploy**.

---

## 💡 كيف يتعامل النظام مع بيئة Serverless على Vercel؟
1. **تم إنشاء Serverless Handler**:
   - تم تزويد الباك إند بـ `server/api/index.ts` وملف `server/vercel.json` مع خاصية Caching لـ NestJS Instance لتسريع الاستجابة وتقليل وقت الـ Cold Start.
2. **الاتصال اللحظي (Fallback Polling)**:
   - إذا تم فصل WebSockets بسبب طبيعة الـ Serverless، يقوم الفرونت إند تلقائياً بتفعيل الـ **Polling التلقائي كل 5 ثوانٍ** لتحديث طابور الاستقبال وشاشة الطبيب دون أي توقف.
3. **CORS الذكي**:
   - تم ضبط الـ CORS في الباك إند ليسمح بجميع دومينات Vercel تلقائياً (`*.vercel.app`) دون الحاجة لضبط معقد.
