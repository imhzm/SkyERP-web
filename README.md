# Sky ERP Website

موقع Sky ERP - منصة ERP عربية ذكية لإدارة الشركات. بني باستخدام Next.js 16 مع TypeScript و Tailwind CSS v4.

## المتطلبات

- Node.js 20+
- npm 10+

## التشغيل المحلي

```bash
# تثبيت الحزم
npm ci

# نسخ ملف البيئة
cp .env.example .env.local

# تشغيل بيئة التطوير
npm run dev
```

## بناء للإنتاج

```bash
npm run build
npm run start
```

## PM2 Ecosystem

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## هيكل المشروع

```
├── app/                    # صفحات Next.js App Router
│   ├── apps/              # صفحات الموديولات (15 صفحة)
│   ├── industries/        # صفحات القطاعات (9 صفحات)
│   ├── blog/              # المدونة (20 مقالة)
│   ├── layout.tsx         # الـ Layout الرئيسي
│   ├── sitemap.ts         # خريطة الموقع
│   └── robots.ts          # ملف robots.txt
├── components/            # المكونات
│   ├── layout/            # Header, Footer, MobileNav, CTAStickyBar
│   ├── sections/          # أقسام الصفحة الرئيسية
│   ├── cards/             # كروت قابلة لإعادة الاستخدام
│   ├── ui/                # مكونات UI أساسية
│   └── seo/               # JSON-LD, Breadcrumbs
├── data/                  # ملفات البيانات
├── lib/                   # دوال مساعدة
│   └── seo/               # SEO utilities (metadata, schema, breadcrumbs)
└── public/images/         # الصور واللوجو
```

## النشر على السيرفر

### 1. إعداد السيرفر

```bash
# إنشاء مجلد المشروع
mkdir -p /var/www/erp.skywaveads.com
cd /var/www/erp.skywaveads.com

# سحب الكود من GitHub
git clone git@github.com:imhzm/SkyERP-wep.git .

# تثبيت الحزم
npm ci

# بناء المشروع
npm run build
```

### 2. تشغيل PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### 3. إعداد Nginx

```nginx
server {
    listen 80;
    server_name erp.skywaveads.com;

    location / {
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. تفعيل Nginx و SSL

```bash
ln -s /etc/nginx/sites-available/erp.skywaveads.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# بعد توجيه DNS
certbot --nginx -d erp.skywaveads.com
```

## SEO

- كل صفحة لها Metadata مستقلة
- Open Graph images لكل صفحة
- JSON-LD Schema منوع (SoftwareApplication, Organization, FAQPage, إلخ)
- Sitemap.xml تلقائي
- Robots.txt تلقائي
- Breadcrumbs في كل صفحة

## Tracking

- Google Analytics 4 (via NEXT_PUBLIC_GA_ID)
- Google Tag Manager (via NEXT_PUBLIC_GTM_ID)
- Meta Pixel (via NEXT_PUBLIC_META_PIXEL_ID)

ضع المتغيرات في `.env.production` قبل البناء.

## الألوان

- Primary: `#0A6CF1`
- Dark: `#001A3A`
- Purple: `#8B2CF5`
- Pink: `#FF4FD8`
- Orange: `#FF6636`

## الخطوط

- Cairo (العربية)
- Poppins (الإنجليزية)
