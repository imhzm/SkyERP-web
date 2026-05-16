# Sky ERP Website Roadmap

## 1. هدف الموقع

الموقع مش مجرد صفحة تعريفية.
الموقع لازم يبيع Sky ERP كمنصة SaaS احترافية لإدارة الشركات.

الهدف الأساسي:

**تحويل الزائر من “عايز أعرف النظام ده إيه؟” إلى “عايز Demo أو اشتراك”.**

الموقع يخدم 5 أهداف:

1. شرح Sky ERP بشكل واضح وسريع.
2. إظهار إن النظام شامل زي Odoo لكن أبسط وأنسب للشركات العربية.
3. بناء ثقة قوية من أول Scroll.
4. استهداف كلمات ERP في مصر والسعودية والإمارات.
5. توليد Leads عبر Demo / WhatsApp / Contact Form.

---

# 2. اتجاه الهوية البصرية الجديد

هنحافظ على روح Sky Wave الأساسية من حيث الألوان والطابع التقني: الأزرق النيوني `#0A6CF1`، الكحلي العميق `#001A3A`، البنفسجي `#8B2CF5`، الوردي `#FF4FD8`، والبرتقالي المتوهج `#FF6636`، مع خطوط Cairo وPoppins وInter حسب ملف الهوية. 

لكن عشان التصميم مايبقاش مكرر، مش هنستخدم نفس فكرة المنارة/الموجة/الفضاء بالطريقة التقليدية.

## الاتجاه الجديد المقترح

### اسم الستايل:

**Enterprise Neural Command OS**

يعني الموقع شكله كأنه:

* مركز قيادة لإدارة شركة.
* Dashboard مستقبلية.
* Modules تتحرك حوالين Core.
* Panels زجاجية ذكية.
* خطوط بيانات بين الأقسام.
* إحساس SaaS عالمي مش بوستر خدمات.

## الفرق عن التصاميم السابقة

بدل ما نكرر:

* Lighthouse
* Digital wave
* Cosmic nebula
* Orbs كثيرة
* خدمات حوالين اللوجو

هنستخدم:

* **Command Center Layout**
* **Modular App Grid**
* **ERP Operating System UI**
* **Holographic Dashboards**
* **3D System Core**
* **Enterprise Data Flow**
* **Screenshots / Mockups للنظام**
* **App Marketplace visual style**

---

# 3. اللوجو والأصول البصرية

يتم وضع اللوجو داخل:

```txt
/public/images
```

الأفضل تنظيمه كده:

```txt
/public/images/
├── logo/
│   ├── sky-erp-logo.png
│   ├── sky-erp-logo.webp
│   ├── sky-erp-icon.png
│   └── sky-erp-white.png
│
├── og/
│   ├── home-og.webp
│   ├── accounting-og.webp
│   ├── inventory-og.webp
│   ├── crm-og.webp
│   └── industries-og.webp
│
├── hero/
│   ├── erp-command-center.webp
│   ├── erp-dashboard-preview.webp
│   └── erp-modular-apps.webp
│
├── modules/
│   ├── accounting.webp
│   ├── inventory.webp
│   ├── sales.webp
│   ├── crm.webp
│   ├── hr.webp
│   └── manufacturing.webp
│
├── industries/
│   ├── retail.webp
│   ├── manufacturing.webp
│   ├── services.webp
│   ├── clinics.webp
│   └── agencies.webp
│
└── icons/
    ├── ai.svg
    ├── reports.svg
    ├── automation.svg
    ├── security.svg
    └── integrations.svg
```

مهم جدًا:
أي AI Agent يشتغل على المشروع لازم يعرف إن اللوجو الرسمي موجود داخل:

```txt
/public/images
```

ولا يستخدم Logo خارجي أو يولد لوجو جديد من دماغه.

---

# 4. الرسالة التسويقية الأساسية

## Main Positioning

**Sky ERP هو نظام إدارة أعمال ذكي يجمع الحسابات، المخازن، المبيعات، المشتريات، HR، CRM، POS، المشاريع، التقارير، والأتمتة في منصة واحدة مصممة للشركات العربية.**

## Hero Headline

```txt
Sky ERP
كل إدارتك في نظام واحد
```

## Hero Subheadline

```txt
منصة ERP ذكية تساعدك تدير المبيعات، الحسابات، المخزون، الموظفين، العملاء، التقارير، والأتمتة من مكان واحد — بسرعة، وضوح، وتحكم كامل.
```

## CTA

```txt
احجز Demo مجاني
شاهد مميزات النظام
```

## Secondary CTA

```txt
تواصل واتساب
```

---

# 5. هيكل الموقع Site Architecture

```txt
/
├── /features
├── /apps
│   ├── /apps/accounting
│   ├── /apps/inventory
│   ├── /apps/sales
│   ├── /apps/purchase
│   ├── /apps/crm
│   ├── /apps/pos
│   ├── /apps/hr-payroll
│   ├── /apps/projects
│   ├── /apps/manufacturing
│   ├── /apps/helpdesk
│   ├── /apps/whatsapp-crm
│   ├── /apps/ai-assistant
│   ├── /apps/reports-bi
│   ├── /apps/automation
│   └── /apps/marketplace
│
├── /industries
│   ├── /industries/retail
│   ├── /industries/manufacturing
│   ├── /industries/services
│   ├── /industries/agencies
│   ├── /industries/clinics
│   ├── /industries/restaurants
│   ├── /industries/ecommerce
│   ├── /industries/distribution
│   └── /industries/maintenance
│
├── /pricing
├── /implementation
├── /integrations
├── /security
├── /about
├── /blog
│   ├── /blog/what-is-erp
│   ├── /blog/best-erp-system-egypt
│   ├── /blog/erp-vs-accounting-software
│   └── /blog/odoo-alternative-arabic-erp
│
├── /contact
├── /demo
├── /privacy-policy
├── /terms
├── /sitemap.xml
└── /robots.txt
```

---

# 6. الصفحة الرئيسية Home Page

## URL

```txt
/
```

## أقسام الصفحة

### 1. Hero Section

* لوجو Sky ERP
* Headline قوي
* وصف مختصر
* CTA: احجز Demo
* CTA ثانوي: تواصل واتساب
* Hero Visual: Dashboard ثلاثي الأبعاد يظهر كل الموديولات مربوطة ببعض

### 2. Problem Section

عنوان:

```txt
إدارة شركتك مش لازم تبقى فوضى
```

نقاط الألم:

* بيانات متفرقة.
* Excel كتير.
* مخزون مش مضبوط.
* عملاء بتضيع.
* حسابات متأخرة.
* موظفين بدون متابعة.
* تقارير يدوية.

### 3. Solution Section

عنوان:

```txt
Sky ERP يجمع كل أقسام شركتك في نظام واحد
```

Visual: Core في النص، وحوله:

* Accounting
* Inventory
* Sales
* CRM
* HR
* POS
* Reports
* AI

### 4. Modules Preview

كروت مختصرة لأهم الموديولات.

### 5. Why Sky ERP

مبني على نفس فلسفة Sky Wave: Data & AI-Driven، قياس مستمر، تكامل، شفافية، وتحسين مستمر. 

نقاط:

* عربي وسهل.
* مناسب لمصر والخليج.
* قابل للتخصيص.
* Multi-branch.
* AI Assistant.
* WhatsApp-first CRM.
* تقارير لحظية.
* أمان وصلاحيات.

### 6. Industries

كروت حسب النشاط.

### 7. AI Assistant Section

عنوان:

```txt
اسأل نظامك… وخد قرارك أسرع
```

أمثلة:

* مين العملاء المتأخرين في الدفع؟
* إيه المنتجات اللي قربت تخلص؟
* إيه أفضل فرع مبيعات؟
* كام ربح الشهر ده؟
* مين أكتر مندوب حقق مبيعات؟

### 8. App Marketplace Section

شرح إن النظام Modular:

* ثبت التطبيقات اللي تحتاجها.
* فعل أو أوقف أي App.
* ابدأ بسيط وكبّر مع الوقت.

### 9. Security Section

* صلاحيات.
* Audit Logs.
* Backup.
* 2FA.
* Data isolation.

### 10. CTA Final

```txt
جاهز تشغل شركتك بنظام؟
احجز Demo مجاني الآن
```

---

# 7. صفحات الموديولات Apps Pages

كل موديول له صفحة SEO مستقلة.

## Template موحد لكل صفحة Module

كل صفحة تحتوي:

1. Hero.
2. المشكلة التي يحلها الموديول.
3. المميزات.
4. Workflow.
5. تقارير الموديول.
6. التكامل مع باقي النظام.
7. لمن يناسب.
8. FAQ.
9. CTA.

---

# 8. جدول الصفحات + Meta + Keywords + Featured Image + Schema

| Page                   | URL                         | Meta Title                            | Meta Description                                                                             | Primary Keywords                                           | Featured Image                              | Schema                             |
| ---------------------- | --------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| Home                   | `/`                         | Sky ERP - نظام ERP ذكي لإدارة الشركات | منصة ERP شاملة لإدارة الحسابات والمخازن والمبيعات والعملاء والموظفين والتقارير من مكان واحد. | نظام ERP، برنامج ERP، ERP مصر، ERP السعودية، إدارة الشركات | `/images/og/home-og.webp`                   | SoftwareApplication + Organization |
| Features               | `/features`                 | مميزات Sky ERP لإدارة أعمالك          | اكتشف مميزات Sky ERP في إدارة الحسابات والمبيعات والمخزون والموظفين والأتمتة والتقارير.      | مميزات ERP، برنامج إدارة أعمال                             | `/images/og/features-og.webp`               | Product + FAQPage                  |
| Apps                   | `/apps`                     | تطبيقات Sky ERP - كل موديولات شركتك   | اختار التطبيقات التي تحتاجها: حسابات، مخزون، مبيعات، CRM، HR، POS، تصنيع وتقارير.            | ERP Modules، تطبيقات ERP، موديولات ERP                     | `/images/og/apps-og.webp`                   | ItemList                           |
| Accounting             | `/apps/accounting`          | برنامج حسابات ERP متكامل              | أدِر القيود اليومية، الخزنة، البنوك، العملاء، الموردين والتقارير المالية داخل Sky ERP.       | برنامج حسابات، ERP Accounting، نظام محاسبة                 | `/images/og/accounting-og.webp`             | SoftwareApplication + FAQPage      |
| Inventory              | `/apps/inventory`           | برنامج إدارة مخازن ومخزون             | تابع المخازن، المنتجات، الجرد، التحويلات، الباركود وتنبيهات نقص الكمية بسهولة.               | برنامج مخازن، إدارة المخزون، ERP Inventory                 | `/images/og/inventory-og.webp`              | SoftwareApplication                |
| Sales                  | `/apps/sales`               | نظام مبيعات وفواتير متكامل            | أدِر عروض الأسعار، أوامر البيع، الفواتير، التحصيلات وعمولات المندوبين.                       | برنامج مبيعات، فواتير، Sales ERP                           | `/images/og/sales-og.webp`                  | SoftwareApplication                |
| Purchase               | `/apps/purchase`            | نظام مشتريات وموردين                  | أدِر طلبات الشراء، أوامر الشراء، الموردين، الفواتير والاستلامات من مكان واحد.                | برنامج مشتريات، إدارة الموردين، Purchase ERP               | `/images/og/purchase-og.webp`               | SoftwareApplication                |
| CRM                    | `/apps/crm`                 | CRM لإدارة العملاء والصفقات           | تابع العملاء والصفقات والمكالمات والمتابعات وسجل كل تواصل داخل Customer 360.                 | CRM عربي، إدارة العملاء، برنامج CRM                        | `/images/og/crm-og.webp`                    | SoftwareApplication                |
| POS                    | `/apps/pos`                 | برنامج كاشير POS متصل بالمخزون        | نقطة بيع سريعة للمحلات والفروع مع باركود وطباعة فواتير وربط مباشر بالحسابات والمخزون.        | برنامج كاشير، POS، نقطة بيع                                | `/images/og/pos-og.webp`                    | SoftwareApplication                |
| HR & Payroll           | `/apps/hr-payroll`          | برنامج HR ورواتب للموظفين             | إدارة الموظفين، الحضور، الإجازات، السلف، الخصومات، الرواتب والتقييمات.                       | برنامج HR، رواتب، حضور وانصراف                             | `/images/og/hr-payroll-og.webp`             | SoftwareApplication                |
| Projects               | `/apps/projects`            | إدارة المشاريع والمهام                | تابع المشاريع والمهام والتايم شيت والتسليمات وتكلفة كل مشروع بسهولة.                         | إدارة مشاريع، Project Management ERP                       | `/images/og/projects-og.webp`               | SoftwareApplication                |
| Manufacturing          | `/apps/manufacturing`       | ERP للتصنيع والمصانع                  | أوامر تصنيع، BOM، مراحل إنتاج، جودة، هالك، تكلفة إنتاج وتقارير مصانع.                        | ERP مصانع، برنامج تصنيع، Manufacturing ERP                 | `/images/og/manufacturing-og.webp`          | SoftwareApplication                |
| Helpdesk               | `/apps/helpdesk`            | نظام خدمة عملاء وتذاكر دعم            | أدِر شكاوى العملاء وتذاكر الدعم وSLA والتصعيد والتقييم من منصة واحدة.                        | Helpdesk، تذاكر دعم، خدمة عملاء                            | `/images/og/helpdesk-og.webp`               | SoftwareApplication                |
| WhatsApp CRM           | `/apps/whatsapp-crm`        | واتساب CRM لإدارة العملاء             | حوّل رسائل واتساب إلى Leads وتابع المحادثات والردود والمتابعات تلقائيًا.                     | واتساب CRM، بوت واتساب، WhatsApp Business CRM              | `/images/og/whatsapp-crm-og.webp`           | SoftwareApplication                |
| AI Assistant           | `/apps/ai-assistant`        | مساعد ذكاء اصطناعي داخل ERP           | اسأل النظام عن المبيعات والمخزون والعملاء والتقارير واحصل على تحليلات فورية.                 | AI ERP، ذكاء اصطناعي للشركات، ERP Assistant                | `/images/og/ai-assistant-og.webp`           | SoftwareApplication                |
| Reports BI             | `/apps/reports-bi`          | تقارير BI ولوحات تحكم                 | تقارير مالية، مبيعات، مخزون، HR، CRM ولوحات مؤشرات لحظية.                                    | BI Reports، تقارير ERP، Dashboard                          | `/images/og/reports-bi-og.webp`             | SoftwareApplication                |
| Automation             | `/apps/automation`          | أتمتة العمليات داخل ERP               | أنشئ قواعد تلقائية للمتابعة، التنبيهات، الفواتير، التذاكر والموافقات.                        | أتمتة أعمال، Workflow Automation، ERP Automation           | `/images/og/automation-og.webp`             | SoftwareApplication                |
| Marketplace            | `/apps/marketplace`         | Sky ERP Marketplace                   | ثبّت التطبيقات التي تحتاجها وشغّل نظامك كمنصة Modular قابلة للتوسع.                          | ERP Marketplace، ERP Apps، Odoo Alternative                | `/images/og/marketplace-og.webp`            | SoftwareApplication                |
| Industries             | `/industries`               | Sky ERP لكل القطاعات                  | حلول ERP جاهزة للتجارة، المصانع، الخدمات، العيادات، المطاعم، التوزيع والصيانة.               | ERP للقطاعات، ERP للشركات                                  | `/images/og/industries-og.webp`             | CollectionPage                     |
| Retail                 | `/industries/retail`        | ERP للمحلات والمعارض                  | نظام شامل للمبيعات، الكاشير، المخازن، العملاء والفروع للمحلات والمعارض.                      | ERP للمحلات، برنامج محلات، POS ERP                         | `/images/og/retail-og.webp`                 | Service                            |
| Manufacturing Industry | `/industries/manufacturing` | ERP للمصانع                           | إدارة التصنيع، الخامات، الإنتاج، الجودة، المخازن والتكاليف للمصانع.                          | ERP للمصانع، برنامج مصانع                                  | `/images/og/manufacturing-industry-og.webp` | Service                            |
| Services               | `/industries/services`      | ERP لشركات الخدمات                    | إدارة العملاء، المشاريع، الفواتير، التذاكر والتقارير لشركات الخدمات.                         | ERP لشركات الخدمات، إدارة شركات                            | `/images/og/services-og.webp`               | Service                            |
| Agencies               | `/industries/agencies`      | ERP لوكالات التسويق والشركات الرقمية  | أدِر العملاء، المشاريع، الفرق، الفواتير، الحملات والتقارير من مكان واحد.                     | CRM للوكالات، ERP لوكالات التسويق                          | `/images/og/agencies-og.webp`               | Service                            |
| Pricing                | `/pricing`                  | أسعار Sky ERP                         | باقات مرنة حسب عدد المستخدمين والموديولات وحجم الشركة.                                       | أسعار ERP، اشتراك ERP، ERP SaaS                            | `/images/og/pricing-og.webp`                | Product + OfferCatalog             |
| Implementation         | `/implementation`           | تنفيذ وتشغيل Sky ERP                  | خطوات تطبيق Sky ERP داخل شركتك من الإعداد والتدريب إلى الإطلاق والمتابعة.                    | تنفيذ ERP، تطبيق ERP، ERP Implementation                   | `/images/og/implementation-og.webp`         | HowTo                              |
| Integrations           | `/integrations`             | تكاملات Sky ERP                       | ربط Sky ERP مع واتساب، الدفع، الشحن، الإيميل، Google Sheets وAPIs.                           | ERP Integrations، تكاملات ERP                              | `/images/og/integrations-og.webp`           | ItemList                           |
| Security               | `/security`                 | أمان وخصوصية Sky ERP                  | صلاحيات، Audit Logs، نسخ احتياطي، 2FA وحماية بيانات الشركات.                                 | أمان ERP، حماية بيانات، ERP Security                       | `/images/og/security-og.webp`               | WebPage + FAQPage                  |
| About                  | `/about`                    | عن Sky ERP                            | تعرف على رؤية Sky ERP في بناء نظام إدارة أعمال عربي ذكي وسهل للشركات.                        | عن Sky ERP، نظام إدارة أعمال                               | `/images/og/about-og.webp`                  | AboutPage                          |
| Demo                   | `/demo`                     | احجز Demo مجاني                       | احجز عرض توضيحي مجاني وشاهد كيف يساعد Sky ERP في تنظيم شركتك.                                | Demo ERP، تجربة ERP، عرض ERP                               | `/images/og/demo-og.webp`                   | ContactPage                        |
| Contact                | `/contact`                  | تواصل مع Sky ERP                      | تواصل معنا للاستفسار أو حجز تجربة أو معرفة أفضل باقة لشركتك.                                 | تواصل Sky ERP، ERP مصر                                     | `/images/og/contact-og.webp`                | ContactPage                        |
| Blog                   | `/blog`                     | مدونة Sky ERP                         | مقالات عن ERP، إدارة الشركات، الحسابات، المخازن، CRM والتحول الرقمي.                         | مدونة ERP، مقالات ERP                                      | `/images/og/blog-og.webp`                   | Blog                               |

---

# 9. الكلمات المفتاحية الرئيسية

## Arabic Main Keywords

```txt
نظام ERP
برنامج ERP
برنامج إدارة شركات
نظام إدارة أعمال
برنامج حسابات ومخازن
برنامج مبيعات ومخازن
برنامج ERP عربي
ERP مصر
ERP السعودية
ERP الإمارات
برنامج ERP للشركات الصغيرة
برنامج ERP للشركات المتوسطة
نظام ERP للمصانع
برنامج إدارة مخازن
برنامج حسابات للشركات
برنامج CRM عربي
برنامج HR ورواتب
برنامج كاشير POS
برنامج إدارة مشاريع
برنامج إدارة عملاء
نظام تقارير للشركات
نظام أتمتة أعمال
بديل Odoo عربي
Odoo Alternative Arabic
```

## English Keywords

```txt
ERP software
ERP system
Business management software
Accounting ERP
Inventory ERP
CRM ERP
POS ERP
HR payroll software
Manufacturing ERP
ERP software Egypt
ERP software Saudi Arabia
ERP software UAE
Arabic ERP software
Odoo alternative
ERP for small business
ERP for medium business
SaaS ERP platform
Business operating system
```

## Long-tail Keywords

```txt
أفضل برنامج ERP لإدارة الشركات في مصر
برنامج ERP عربي للشركات الصغيرة والمتوسطة
برنامج حسابات ومخازن ومبيعات في نظام واحد
برنامج إدارة مخزون وفواتير وموردين
برنامج ERP للمصانع وإدارة الإنتاج
نظام CRM وربط واتساب للشركات
برنامج كاشير POS متصل بالمخزون والحسابات
أفضل بديل Odoo للشركات العربية
نظام إدارة شركات سحابي باللغة العربية
برنامج ERP للشركات في السعودية والإمارات
```

---

# 10. SEO Technical Plan

## Next.js SEO Implementation

يتم تنفيذ:

```txt
app/sitemap.ts
app/robots.ts
app/manifest.ts
lib/seo/metadata.ts
lib/seo/schema.ts
lib/seo/keywords.ts
```

## Metadata لكل صفحة

كل صفحة لازم تحتوي:

* Title
* Description
* Keywords
* Canonical
* Open Graph
* Twitter Card
* Robots
* Alternates لو فيه عربي/إنجليزي
* Featured image
* JSON-LD Schema

## مثال Metadata Structure

```ts
export const metadata = {
  title: "Sky ERP - نظام ERP ذكي لإدارة الشركات",
  description:
    "منصة ERP شاملة لإدارة الحسابات والمخازن والمبيعات والعملاء والموظفين والتقارير من مكان واحد.",
  keywords: [
    "نظام ERP",
    "برنامج ERP",
    "برنامج إدارة شركات",
    "ERP مصر",
    "ERP السعودية",
  ],
  alternates: {
    canonical: "https://erp.skywaveads.com",
  },
  openGraph: {
    title: "Sky ERP - كل إدارتك في نظام واحد",
    description:
      "نظام ERP ذكي لإدارة الحسابات والمخازن والمبيعات والعملاء والتقارير.",
    url: "https://erp.skywaveads.com",
    siteName: "Sky ERP",
    images: [
      {
        url: "https://erp.skywaveads.com/images/og/home-og.webp",
        width: 1200,
        height: 630,
        alt: "Sky ERP - نظام إدارة أعمال متكامل",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
};
```

---

# 11. Schema Plan

## Global Schema

على كل الموقع:

1. Organization
2. WebSite
3. SoftwareApplication
4. BreadcrumbList

## Pages Schema

| Page Type      | Schema                                       |
| -------------- | -------------------------------------------- |
| Home           | Organization + WebSite + SoftwareApplication |
| Module Pages   | SoftwareApplication + FAQPage                |
| Industry Pages | Service + FAQPage                            |
| Pricing        | Product + OfferCatalog                       |
| Blog Articles  | Article + BreadcrumbList                     |
| Demo / Contact | ContactPage                                  |
| Implementation | HowTo                                        |
| FAQ Sections   | FAQPage                                      |

## SoftwareApplication Schema Example

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Sky ERP",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Sky ERP is a cloud-based ERP platform for managing accounting, inventory, sales, CRM, HR, POS, reports, and automation.",
  "url": "https://erp.skywaveads.com",
  "brand": {
    "@type": "Brand",
    "name": "Sky ERP"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Sky Wave",
    "url": "https://skywaveads.com"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EGP",
    "availability": "https://schema.org/InStock"
  }
}
```

مهم:
ما نحطش Reviews أو Ratings وهمية. لو مفيش تقييمات حقيقية، بلاش.

---

# 12. UI/UX Sections Components

## Core Components

```txt
components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MobileNav.tsx
│   └── CTAStickyBar.tsx
│
├── sections/
│   ├── HeroCommandCenter.tsx
│   ├── ProblemSection.tsx
│   ├── SolutionOverview.tsx
│   ├── ModuleGrid.tsx
│   ├── IndustryGrid.tsx
│   ├── AISection.tsx
│   ├── MarketplaceSection.tsx
│   ├── ReportsSection.tsx
│   ├── SecuritySection.tsx
│   ├── IntegrationsSection.tsx
│   ├── PricingPreview.tsx
│   ├── FAQSection.tsx
│   └── FinalCTA.tsx
│
├── cards/
│   ├── ModuleCard.tsx
│   ├── IndustryCard.tsx
│   ├── FeatureCard.tsx
│   ├── StatCard.tsx
│   └── PricingCard.tsx
│
├── ui/
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── GlassCard.tsx
│   ├── GradientText.tsx
│   ├── SectionHeading.tsx
│   └── Container.tsx
│
└── seo/
    ├── JsonLd.tsx
    └── Breadcrumbs.tsx
```

---

# 13. Next.js Project Structure

```txt
SkyERP-wep/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── manifest.ts
│   │
│   ├── features/
│   │   └── page.tsx
│   │
│   ├── apps/
│   │   ├── page.tsx
│   │   ├── accounting/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── sales/page.tsx
│   │   ├── purchase/page.tsx
│   │   ├── crm/page.tsx
│   │   ├── pos/page.tsx
│   │   ├── hr-payroll/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── manufacturing/page.tsx
│   │   ├── helpdesk/page.tsx
│   │   ├── whatsapp-crm/page.tsx
│   │   ├── ai-assistant/page.tsx
│   │   ├── reports-bi/page.tsx
│   │   ├── automation/page.tsx
│   │   └── marketplace/page.tsx
│   │
│   ├── industries/
│   │   ├── page.tsx
│   │   ├── retail/page.tsx
│   │   ├── manufacturing/page.tsx
│   │   ├── services/page.tsx
│   │   ├── agencies/page.tsx
│   │   ├── clinics/page.tsx
│   │   ├── restaurants/page.tsx
│   │   ├── ecommerce/page.tsx
│   │   ├── distribution/page.tsx
│   │   └── maintenance/page.tsx
│   │
│   ├── pricing/page.tsx
│   ├── implementation/page.tsx
│   ├── integrations/page.tsx
│   ├── security/page.tsx
│   ├── about/page.tsx
│   ├── demo/page.tsx
│   ├── contact/page.tsx
│   ├── privacy-policy/page.tsx
│   └── terms/page.tsx
│
├── components/
├── data/
│   ├── modules.ts
│   ├── industries.ts
│   ├── faqs.ts
│   ├── pricing.ts
│   ├── navigation.ts
│   └── seo.ts
│
├── lib/
│   ├── seo/
│   │   ├── metadata.ts
│   │   ├── schema.ts
│   │   └── breadcrumbs.ts
│   ├── constants.ts
│   └── utils.ts
│
├── public/
│   └── images/
│
├── next.config.ts
├── package.json
├── ecosystem.config.cjs
├── .env.example
├── .env.production.example
├── README.md
└── .gitignore
```

---

# 14. Content Plan لكل صفحة Module

## Accounting Page

Hero:

```txt
حاسب شركتك بدقة… من أول القيد لحد التقرير المالي
```

Sections:

* شجرة الحسابات.
* القيود اليومية.
* الخزنة والبنوك.
* العملاء والموردين.
* الضرائب.
* مراكز التكلفة.
* تقارير مالية.
* الربط مع المبيعات والمشتريات.

FAQ:

* هل يدعم ضرائب؟
* هل يدعم أكتر من خزنة؟
* هل يظهر أرباح وخسائر؟

---

## Inventory Page

Hero:

```txt
مخزونك تحت السيطرة… بدون جرد عشوائي ولا كميات ضايعة
```

Sections:

* منتجات.
* باركود.
* مخازن متعددة.
* تحويلات.
* جرد.
* حد أدنى.
* Batch / Serial.
* تنبيهات نقص الكمية.

---

## CRM Page

Hero:

```txt
كل عميل له تاريخ… وكل متابعة في مكانها
```

Sections:

* Leads.
* Deals.
* Pipeline.
* Customer 360.
* WhatsApp messages.
* Follow-up.
* Sales team performance.

---

## POS Page

Hero:

```txt
بيع أسرع… ومخزونك يتحدث تلقائيًا
```

Sections:

* شاشة كاشير.
* باركود.
* شيفتات.
* طباعة فواتير.
* طرق دفع.
* ربط مخزون وحسابات.

---

# 15. Blog SEO Plan

نبدأ بـ 20 مقال أساسي:

1. ما هو نظام ERP؟
2. أفضل برنامج ERP للشركات في مصر.
3. الفرق بين ERP وبرنامج الحسابات.
4. لماذا تحتاج الشركات الصغيرة إلى ERP؟
5. أفضل بديل Odoo عربي للشركات.
6. كيف تختار برنامج ERP مناسب لشركتك؟
7. ERP للمصانع: أهم المميزات.
8. ERP للمحلات ونقاط البيع.
9. برنامج حسابات ومخازن ومبيعات في نظام واحد.
10. أهمية CRM داخل نظام ERP.
11. لماذا تفشل الشركات في تطبيق ERP؟
12. خطوات تطبيق ERP داخل شركتك.
13. ERP Cloud vs ERP Local.
14. برنامج إدارة مخزون للشركات.
15. برنامج HR ورواتب متكامل.
16. ERP في السعودية: ماذا تحتاج الشركات؟
17. ERP في الإمارات: مميزات مهمة.
18. كيف تساعد تقارير BI في نمو الشركة؟
19. أتمتة الأعمال داخل ERP.
20. مستقبل ERP مع الذكاء الاصطناعي.

---

# 16. Performance & Core Web Vitals

لازم الموقع يبقى سريع جدًا لأن Sky Wave أصلاً بتشتغل بمنهجية أداء وCore Web Vitals وSEO تقني. 

## Targets

```txt
LCP أقل من 2.5s
INP أقل من 200ms
CLS أقل من 0.1
PageSpeed Mobile فوق 90
```

## تنفيذ

* استخدام `next/image`.
* تحويل الصور إلى WebP/AVIF.
* Lazy loading للصور الثقيلة.
* تقليل Animation الثقيلة.
* استخدام CSS gradients بدل فيديوهات خلفية في الموبايل.
* Dynamic import للأقسام الثقيلة.
* عدم تحميل مكتبات Charts في الصفحة الرئيسية إلا لو ضروري.
* ضغط SVGs.
* Font optimization.
* Sitemap تلقائي.
* Robots مضبوط.

---

# 17. Tracking & Analytics

يتم تجهيز:

```txt
Google Analytics 4
Google Tag Manager
Meta Pixel
Meta Conversion API لاحقًا
Hotjar أو Microsoft Clarity
Search Console
Bing Webmaster Tools
```

## Events

```txt
demo_click
whatsapp_click
contact_submit
pricing_view
module_view
scroll_75
industry_cta_click
```

---

# 18. GitHub Plan

## Repo

```txt
Account: imhzm
Repository: SkyERP-wep
```

## Branches

```txt
main
dev
staging
```

## Commit Convention

```txt
feat: add homepage hero section
feat: add apps pages
seo: add metadata and schema
ui: add command center design system
deploy: add pm2 ecosystem config
fix: optimize mobile layout
```

## GitHub Rules

* ممنوع رفع `.env`.
* ممنوع رفع tokens.
* ممنوع رفع credentials.
* إضافة `.env.example`.
* إضافة README فيه طريقة التشغيل.
* إضافة `.gitignore`.

---

# 19. Deployment Plan على السيرفر

## الدومين

```txt
erp.skywaveads.com
```

## المسار المقترح

```txt
/var/www/erp.skywaveads.com
```

## PM2 App Name

```txt
skyerp-web
```

## Port مقترح

بما إن البورتات المستخدمة عندك:

```txt
3001, 3002, 3003, 3011, 3050, 3200, 4000, 5006, 44004
```

نستخدم بورت جديد بعيد:

```txt
3300
```

## مهم جدًا

لا نلمس أي دومين شغال حاليًا.
لا نعدل ملفات Nginx الخاصة بأي مشروع موجود.
نعمل ملف جديد فقط:

```txt
/etc/nginx/sites-available/erp.skywaveads.com
```

وسيم لينك جديد فقط:

```txt
/etc/nginx/sites-enabled/erp.skywaveads.com
```

---

# 20. Safe Server Deployment Steps

## 1. فحص السيرفر بدون تعديل

```bash
hostname
whoami
pm2 list
nginx -T | grep -E "server_name|proxy_pass|listen" | head -n 200
ls -la /var/www
ls -la /etc/nginx/sites-available
ls -la /etc/nginx/sites-enabled
```

## 2. إنشاء فولدر المشروع

```bash
mkdir -p /var/www/erp.skywaveads.com
cd /var/www/erp.skywaveads.com
```

## 3. سحب المشروع من GitHub

الأفضل تستخدم SSH Deploy Key.

```bash
git clone git@github.com:imhzm/SkyERP-wep.git .
```

لو هتستخدم HTTPS، ما تحطش التوكن في الأمر المحفوظ في history. الأفضل SSH.

## 4. تثبيت وتشغيل

```bash
npm ci
npm run build
```

## 5. PM2

```bash
pm2 start npm --name skyerp-web -- run start -- -p 3300 -H 127.0.0.1
pm2 save
```

أو ملف ecosystem:

```js
module.exports = {
  apps: [
    {
      name: "skyerp-web",
      cwd: "/var/www/erp.skywaveads.com",
      script: "npm",
      args: "run start -- -p 3300 -H 127.0.0.1",
      env: {
        NODE_ENV: "production",
        PORT: "3300",
        HOSTNAME: "127.0.0.1"
      }
    }
  ]
};
```

تشغيله:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

---

# 21. Nginx Config

```nginx
server {
    listen 80;
    server_name erp.skywaveads.com;

    access_log /var/log/nginx/erp.skywaveads.com.access.log;
    error_log /var/log/nginx/erp.skywaveads.com.error.log;

    location / {
        proxy_pass http://127.0.0.1:3300;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_cache_bypass $http_upgrade;
    }
}
```

تفعيل:

```bash
ln -s /etc/nginx/sites-available/erp.skywaveads.com /etc/nginx/sites-enabled/erp.skywaveads.com
nginx -t
systemctl reload nginx
```

بعد ما DNS يوجه:

```txt
erp.skywaveads.com → 147.79.66.116
```

نشغل SSL:

```bash
certbot --nginx -d erp.skywaveads.com
nginx -t
systemctl reload nginx
```

---

# 22. Checklist قبل الإطلاق

## Technical

```txt
[ ] Logo موجود داخل /public/images
[ ] كل الصور WebP
[ ] Metadata لكل صفحة
[ ] OG image لكل صفحة
[ ] Schema لكل صفحة
[ ] sitemap.xml شغال
[ ] robots.txt شغال
[ ] canonical مضبوط
[ ] 404 page
[ ] loading states
[ ] responsive mobile
[ ] no console errors
[ ] no broken links
[ ] Lighthouse +90
```

## SEO

```txt
[ ] H1 واحد لكل صفحة
[ ] H2/H3 منظم
[ ] Internal links بين الموديولات
[ ] Breadcrumbs
[ ] FAQ لكل صفحة مهمة
[ ] Alt text للصور
[ ] Arabic keywords
[ ] English keywords
[ ] Country modifiers: مصر / السعودية / الإمارات
[ ] Search Console
```

## Conversion

```txt
[ ] CTA واضح فوق الصفحة
[ ] WhatsApp ثابت
[ ] Demo form
[ ] Pricing CTA
[ ] Sticky mobile CTA
[ ] Lead tracking events
[ ] Thank you state بعد الفورم
```

---

# 23. Featured Images Direction

كل Featured Image تكون:

```txt
1200x630
WebP
Dark futuristic SaaS dashboard
بدون نص كتير داخل الصورة
تحتوي على UI mockups أكثر من أيقونات
ألوان Sky ERP
```

## Naming

```txt
home-og.webp
accounting-og.webp
inventory-og.webp
crm-og.webp
pos-og.webp
hr-payroll-og.webp
manufacturing-og.webp
security-og.webp
pricing-og.webp
```

## Style Prompt عام للصور

```txt
Futuristic enterprise ERP SaaS dashboard, dark navy background, neon blue and purple glassmorphism panels, modular business app cards, data flow lines, premium corporate technology style, clean composition, no people, high contrast, 3D UI, suitable for Arabic SaaS website hero and Open Graph image, Sky Wave inspired colors, modern and unique, not cosmic lighthouse, not repeated old style.
```

---

# 24. أمر جاهز للـ AI Agent ينفذ الموقع

```txt
Act as a senior Next.js SaaS website architect, UI/UX designer, SEO strategist, and deployment engineer.

Build a complete professional marketing website for Sky ERP using Next.js.

Project:
- Name: Sky ERP
- GitHub repository: imhzm/SkyERP-wep
- Production domain: https://erp.skywaveads.com
- Logo assets are inside /public/images. Do not generate or replace the logo.
- Brand must be inspired by Sky Wave but visually new and not repetitive.
- Use a new visual direction: Enterprise Neural Command OS, modular ERP command center, glassmorphism dashboards, app marketplace UI, data flow, enterprise SaaS feel.

Tech:
- Next.js App Router
- TypeScript
- Tailwind CSS
- SEO-ready architecture
- Dynamic metadata
- JSON-LD schema
- Sitemap and robots
- Optimized images
- Responsive design

Pages:
Home, Features, Apps, Accounting, Inventory, Sales, Purchase, CRM, POS, HR Payroll, Projects, Manufacturing, Helpdesk, WhatsApp CRM, AI Assistant, Reports BI, Automation, Marketplace, Industries, Retail, Manufacturing Industry, Services, Agencies, Clinics, Restaurants, Ecommerce, Distribution, Maintenance, Pricing, Implementation, Integrations, Security, About, Blog, Demo, Contact, Privacy Policy, Terms.

Requirements:
1. Create a premium SaaS landing experience.
2. Use Arabic as the main language.
3. Support future English version.
4. Create strong conversion sections with Demo and WhatsApp CTAs.
5. Use the logo from /public/images only.
6. Build reusable components.
7. Create data files for modules, industries, FAQs, SEO metadata, pricing, navigation.
8. Add metadata for every page.
9. Add Open Graph image path for every page.
10. Add schema for every page type.
11. Add sitemap.ts and robots.ts.
12. Add internal linking between all related pages.
13. Add FAQ sections to important module pages.
14. Optimize for Core Web Vitals.
15. Add a PM2 ecosystem config for production on port 3300.
16. Add deployment README for Nginx reverse proxy on erp.skywaveads.com.
17. Do not touch any existing domain or server app.
18. Do not include secrets, passwords, or tokens in the codebase.
```

---

# 25. الخلاصة التنفيذية

الموقع لازم يطلع كده:

```txt
Sky ERP = منصة ERP عربية ذكية
شكلها SaaS عالمي
مبنية على هوية Sky Wave
لكن بتجربة بصرية جديدة تمامًا
SEO قوي لكل موديول
صفحات قطاعية للبيع
Demo واضح
WhatsApp CTA
Featured Images احترافية
Schema كامل
Next.js سريع
Deployment آمن على erp.skywaveads.com
```

أفضل Hook للموقع:

```txt
كل إدارتك في مكان واحد
```

وأفضل Tagline:

```txt
Sky ERP — نظام واحد. رؤية أوضح. شركة أقوى.
```
