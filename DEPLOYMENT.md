# 🚀 دليل نشر النظام كاملاً (Express + Next.js + MongoDB) على Vercel

تم تجهيز الباك إند (Express.js + MongoDB/Mongoose) ليعمل كـ **Serverless Function** على Vercel، والفرونت إند (Next.js) ليعمل كمشروع Vercel أصلي.

---

## 📌 الفكرة الأساسية:

في Vercel، يتم إنشاء **مشروعين منفصلين (Two Projects)** من نفس الـ GitHub Repository:

1. **مشروع 1 (الباك إند)**: يقرأ من مجلد `server`.
2. **مشروع 2 (الفرونت إند)**: يقرأ من مجلد `client`.

---

## الخطوة الأولى: إعداد قاعدة بيانات MongoDB Atlas (مهم جداً)

1. افتح حسابك في [MongoDB Atlas](https://cloud.mongodb.com/).
2. توجه إلى **Network Access**:
   - اضغط **Add IP Address**.
   - اختر **Allow Access from Anywhere (`0.0.0.0/0`)** ثم احفظ.
     > ⚠️ **تنبيه حاسم:** وظائف Vercel Serverless لا تمتلك IP ثابت. إذا لم تُفعل `0.0.0.0/0` سيتجمد السيرفر عند أي طلب ولن يستجيب!
3. انسخ رابط الاتصال (Connection String)، مثلاً:
   `mongodb+srv://user:password@cluster0.xxx.mongodb.net/clinic?retryWrites=true&w=majority`

---

## الخطوة الثانية: رفع الباك إند (Express API) على Vercel

1. افتح [Vercel Dashboard](https://vercel.com/new).
2. اختر مستودع المشروع (Repository) واضغط **Import**.
3. غيّر اسم المشروع ليصبح مثلاً: `clinic-api`.
4. **الخطوة الأكثر أهمية (Root Directory)**:
   - اضغط **Edit** بجوار **Root Directory** واكتب أو اختر مجلد: `server`.
     > ⚠️ **إذا تركت الـ Root Directory فارغاً، سينشر Vercel صفحة فارغة بدون أخطاء ولن يعمل السيرفر إطلاقاً!**
5. في قسم **Environment Variables** أضف المتغيرات التالية:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: رابط اتصال MongoDB Atlas الخاص بك
   - `JWT_ACCESS_SECRET`: نص أمان عشوائي لا يقل عن 32 حرفاً
   - `JWT_REFRESH_SECRET`: نص أمان عشوائي لا يقل عن 32 حرفاً
6. اضغط **Deploy**.
7. بعد انتهاء النشر، افتح الرابط في المتصفح، مثلاً:
   `https://clinic-api-xxx.vercel.app/`
   يجب أن يعيد لك استجابة JSON سليمة:
   ```json
   {
     "status": "ok",
     "service": "Clinic Management API (Express + MongoDB)",
     "version": "1.0.0"
   }
   ```

---

## الخطوة الثالثة: تشغيل الـ Seed لإنشاء الحسابات الأولية

من جهازك محلياً في مجلد `server`، تأكد أن ملف `.env` يحتوي على نفس رابط `MONGODB_URI` الخاص بـ Atlas، ثم شغّل:

```bash
pnpm run seed
```

أو

```bash
npm run seed
```

سيقوم هذا بإنشاء حسابات الأدمن، والدكتور، والريسبشن، والإعدادات الافتراضية.

---

## الخطوة الرابعة: رفع الفرونت إند (Next.js) على Vercel

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

## 🛠️ استكشاف الأخطاء الشائعة (Troubleshooting)

| المشكلة                                                  | السبب المحتمل                                     | الحل                                                                            |
| :------------------------------------------------------- | :------------------------------------------------ | :------------------------------------------------------------------------------ |
| شاشة بيضاء أو 404 ولا يوجد أي أخطاء في الـ Logs          | لم يتم ضبط **Root Directory** على `server`        | من إعدادات Vercel -> General -> غيّر Root Directory إلى `server` واضغط Redeploy |
| الطلبات تستغرق وقتاً طويلاً ثم تعطي 504 Gateway Timeout  | لم يتم السماح لـ Vercel بالاتصال في MongoDB Atlas | أضف `0.0.0.0/0` في MongoDB Atlas -> Network Access                              |
| خطأ `Missing MONGODB_URI` أو فشل الاتصال بقاعدة البيانات | لم تتم إضافة متغير `MONGODB_URI` في Vercel        | أضف `MONGODB_URI` في Project Settings -> Environment Variables ثم Redeploy      |
| خطأ CORS عند الاتصال من الفرونت إند                      | اختلاف الدومينات                                  | تم ضبط CORS في السيرفر تلقائياً للسماح بجميع دومينات `vercel.app`               |
