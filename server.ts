import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type { Product, Order, Deal, Category } from './src/types/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  version: number;
  products: Product[];
  orders: Order[];
  deal: Deal;
}

// In-Memory Real-Time Active Users Tracker
const activeSessions = new Map<string, number>();

// Clean up stale sessions every 10 seconds (sessions inactive for > 30 seconds are pruned)
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 30_000) {
      activeSessions.delete(sessionId);
    }
  }
}, 10_000);

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'قالب سيليكون كروي متعدد الأشكال 3D',
    nameEn: '3D Spherical Multi-Shape Silicone Mold',
    category: 'silicone-molds',
    categoryNameAr: 'قوالب سيليكون',
    price: 85,
    originalPrice: 110,
    rating: 4.9,
    reviewsCount: 124,
    viewsCount: 842,
    stock: 18,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAHBS5UrLFS7t6XXqwAgcybLVkcRYHpPmYXsKkGdjBAwHn8gDgHMGEDFEJ7H7rWQRk294sFjIFOBgcS5QciRT7gx3m72OdsTeKi0B_g05LSJJDcONlxURvBPVtHNwRXZivR4WRXNVBZwCTFSrzaoEMT5QHEw6pYfCHZq8ANEBta3mrQ9wQhXXVYrKns_j9cBOHdZvSYnkcyKPAAgxsFDo4EGPYCbYpoZpr3dn2E_GTlizQ_DnZJ3c',
    description: 'قالب سيليكون غذائي نخب أول بتصميم كروي مجسم 3D فائق الدقة، مثالي لتحضير موس الكيك الفرنسي (Entremet) وحلويات الجيلي والمثلجات مع فك سهل وسريع دون التصاق.',
    specs: {
      material: 'سيليكون بلاتيني غذائي 100% خالي من BPA',
      temperatureRange: 'من -40°C حتى +230°C',
      dimensions: '29.5 × 17 × 4.5 سم (قطر الكرة 6 سم)',
      piecesCount: '6 تجاويف كروية متناسقة',
      foodGradeCertified: true,
    },
    badge: 'متوفر بالمخزون',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'طقم أقماع تزيين روسية مع أكياس (24 قطعة)',
    nameEn: 'Russian Piping Tips Set with Pastry Bags (24 pcs)',
    category: 'decorating-tools',
    categoryNameAr: 'أدوات التزيين',
    price: 65,
    originalPrice: 85,
    rating: 4.8,
    reviewsCount: 89,
    viewsCount: 620,
    stock: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAvxZ3mkQ41QGt7EIAYVtU7Gh-VbUdUKoXVL4c2xYzn7byAehA6u68qzI5M29DT_TjJiGzAvYfcWJhv-jWJQUF1Xc3iwEM02V49ZlhvCD98_HgwZo9Kw2PJfUqsFxT-YdvOWRhG3bkubCCNzwtlIqpSnJ2xKGe084ns5TNRKDZPIXCPlxxz1V3QKksQOWcItqgrG1hxDUT2iivJsbk8ofVnWrnJUb5Ym8SD67YcC-L6GoKhIattfg',
    description: 'مجموعة احترافية متكاملة لرسم الورود والزهور الروسية ثلاثية الأبعاد بضغطة واحدة، مصنوعة من الفولاذ المقاوم للصدأ بدرجة 304 مع أكياس سيليكون قابلة لإعادة الاستخدام ومحولات ثلاثية الألوان.',
    specs: {
      material: 'ستانلس ستيل 304 غير قابل للصدأ + سيليكون غذائي',
      piecesCount: '18 قمع زهور + 2 أكياس سيليكون + 4 محولات ورؤوس إضافية',
      dimensions: 'ارتفاع القمع 4.2 سم × قطر القاعدة 3.7 سم',
      foodGradeCertified: true,
    },
    badge: 'باقي 3 فقط',
    createdAt: '2026-09-03T11:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'صينية كيك قابلة للفك غير لاصقة 24 سم',
    nameEn: 'Round Springform Non-Stick Cake Pan 24cm',
    category: 'baking-pans',
    categoryNameAr: 'صواني وقوالب قاطو',
    price: 75,
    originalPrice: 95,
    rating: 4.7,
    reviewsCount: 54,
    viewsCount: 412,
    stock: 14,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSEuMqa8QNhDyLFpnsJDctjEYrnsaljn13aaAcTvrnRf2--lIIdw3KJGbifnCTIKcLhZHWdPnYHbiG-vl3ds94U19l86mz56Vh4NvCLgXS_pNykO5gJpYF_POSfP79dsqFcBBLOKq8GmzQYl3AMNUqmrEeWO-d5anD5AU6--5Wk2opYqwtBlZcWRQ89juEc5kklKtrnqWmb3E4WZcY8NDy98ah7kJBHRXFep6qGxlmIpCXO2x88V4',
    description: 'قالب كيك زنبركي عالي التحمل مزود بمشبك أمان مانع للتسريب وطلاء تيفال مزدوج غير لاصق لتوزيع حراري متساوٍ وخبز مثالي للتشيز كيك والكيك الإسفنجي.',
    specs: {
      material: 'فولاذ كربوني مع طلاء جرانيت مانع للالتصاق خالي من PFOA',
      temperatureRange: 'حتى +260°C في الفرن',
      dimensions: 'قطر 24 سم × ارتفاع 6.8 سم',
      foodGradeCertified: true,
    },
    badge: 'متوفر بالمخزون',
    createdAt: '2026-09-05T09:30:00Z',
  },
  {
    id: 'prod-4',
    name: 'شوكولاتة بلجيكية خام فاخرة للتذويب 1 كجم',
    nameEn: 'Gourmet Belgian Couverture Dark Chocolate Callets 1kg',
    category: 'chocolate-colors',
    categoryNameAr: 'شوكولاتة وملونات',
    price: 110,
    originalPrice: 135,
    rating: 5.0,
    reviewsCount: 210,
    viewsCount: 1540,
    stock: 40,
    expiryDate: '2027-04-30', // Sensitive product with expiry tracking
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOviQWb8N8-UdXO8j1G-JqvO5ZEOiYU7XFh1Lifa3aImCxT7c_puIqtUOmeA_Qj_OBX_SN8VSvqrz0lGt70yiBZWsy4NTvw93Ig58MML98zDN2KB3eugCuok1SQjXSwHj2MO17x0S7hH-5oPfHZ7nn1GdgQzrZWz4XPdR6aCJ2enkkaWbCCk40HJaBX36TFnSaMLnc-sds6TDiHFnHKYWyW01NQHglgF7ehRKGhXa-WxqUFe6La5I',
    description: 'حبيبات شوكولاتة داكنة بلجيكية أصيلة بنسبة كاكاو 70.5% من أرقى أنواع الكاكاو الإفريقي، سيولة فائقة مثالية لصب القوالب، التغليف، وتزيين قاطو المناسبات والبراليني.',
    specs: {
      material: 'زبدة كاكاو نقية طبيعية 100% بدون دهون نباتية مهدرجة',
      dimensions: 'كيس 1000 جرام (1 كجم)',
      foodGradeCertified: true,
    },
    badge: 'متوفر بالمخزون',
    createdAt: '2026-09-07T14:20:00Z',
  },
  {
    id: 'prod-5',
    name: 'مجموعة ملونات جل زيتية للحلويات (8 ألوان)',
    nameEn: 'Oil-Based Gel Food Coloring Set (8 colors)',
    category: 'chocolate-colors',
    categoryNameAr: 'شوكولاتة وملونات',
    price: 95,
    originalPrice: 120,
    rating: 4.6,
    reviewsCount: 38,
    viewsCount: 780,
    stock: 0,
    expiryDate: '2026-12-15', // Nearest expiry - Alert candidate for admin dashboard
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYziaCM-quqKdEDNgEicFVP5jUL6Q5pnMzP07QmLpCVinpUR2ZvfUOvvo3pG6sIbUjonTQyeVoPQCMoeSd1BOFMqOGdn7gFFw3mw0L5_ZNn7jFqsCz35J27_n2RkAMY7eyvnLkViiBrTS6U49pNPH2_BMMQ33fxZsazBOJvJv3IvJ5snp2GScS9XoXot134Eye-XZRjgO8WFC7rnqwdRh6DJwM0RRtZVG89n92Ko7_WAA-d5knro4',
    description: 'ألوان جل مركزة قائمة على الزيوت مصممة خصيصاً للشوكولاتة، عجينة السكر، وكريمة الزبدة بدون التأثير على القوام أو اللمعان، آمنة ومعتمدة صحياً.',
    specs: {
      material: 'أصباغ غذائية زيتية مركزة غير قابلة للتكتل',
      piecesCount: '8 عبوات بقطارة دقيقة (25 مل لكل عبوة)',
      foodGradeCertified: true,
    },
    badge: 'نفد مؤقتاً',
    createdAt: '2026-09-08T08:15:00Z',
  },
  {
    id: 'prod-6',
    name: 'صناديق كيك بنافذة شفافة فاخرة (12 علبة)',
    nameEn: 'Luxury Window Cake Gift Boxes (12 pack)',
    category: 'packaging',
    categoryNameAr: 'التغليف والعلب',
    price: 48,
    originalPrice: 60,
    rating: 4.9,
    reviewsCount: 72,
    viewsCount: 520,
    stock: 50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAM_8HoIg1VHAVa3m65_m4Vh7BBXnRBnpwDTBeeFgEetBsFVNPZuR6Jum46s-wZpTsog_UocT7jLWbMGJNQyeGQKTTLvTz5qntN4l1xudLv73HYBWyh73my1fOyy-xVtp5ujBz2Y-LV7lrkN7HY-MITuPpKK4jQ3soDhMHfWO1RYCC0G7VK6sly7n7CCbxwKJiSASWjO-vO0EbslqyqjnGiJol3e_NgEXkSfDpRS-2BKQNpuLM7E7w',
    description: 'كرتون مقوى غذائي سميك بلون وردي باستيل ناعم مع واجهة بانورامية من الـ PET الكريستالي الشفاف، متضمنة مقابض حريرية لحمل الكيك وقاطو الأعراس بأمان وأناقة.',
    specs: {
      material: 'ورق كرافت غذائي سميك 350GSM + بلاستيك شفاف مقاوم للرطوبة',
      dimensions: '26 × 26 × 18 سم (يناسب كيك حتى 24 سم)',
      piecesCount: '12 علبة مع قواعد سفلية مدعمة',
      foodGradeCertified: true,
    },
    badge: 'متوفر بالمخزون',
    createdAt: '2026-09-10T16:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'باقة المخملية: قالب كيك الموس + بخاخ قطيفة أحمر',
    nameEn: 'Velvet Entremet Bundle: Mold + Velvet Spray',
    category: 'silicone-molds',
    categoryNameAr: 'قوالب سيليكون',
    price: 145,
    originalPrice: 190,
    rating: 5.0,
    reviewsCount: 42,
    viewsCount: 960,
    stock: 7,
    expiryDate: '2027-08-20', // Spray expiry
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZBvrG-oCmFn2UDrkP6HhhIVqHcukA-aCdZE5GJ7u9h9Q7EgIEJXISGiTUtqs1r1QX0VGYPvN9FUKDfSQXdh3zI0wAVS5u24PbIJUd1YMgqs3qWPZw1ErFCLOzBGbj-caPbzIEQQlumeCP81NZY3sywRnxctpnPh43kCxdOFnSWWMeb0a7J1KCFK7bqFH-cykkaruv0RAFmREWpM5T5vEb9jvFTLFnZGzIBshHnyixV1madamBmZA',
    description: 'الباقة الأكثر طلباً لعشاق فن الباتيسري الفرنسي: قالب سيليكون فاخر بتعرجات إنسيابية مع بخاخ زبدة الكاكاو المخملي أحمر رويال لإعطاء ملمس القطيفة الفاخر، بالإضافة إلى ملقط دقيق لورق الذهب.',
    specs: {
      material: 'سيليكون إيطالي بلاتيني + بخاخ زبدة كاكاو فرنسي 400 مل',
      temperatureRange: 'من -50°C إلى +240°C',
      dimensions: 'قطر 20 سم × عمق 5 سم',
      piecesCount: 'قالب كيك + بخاخ قطيفة 400 مل + ملقط تزيين',
      foodGradeCertified: true,
    },
    badge: 'الأكثر مبيعاً',
    createdAt: '2026-09-12T12:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'حصيرة خبز سيليكون ميكرو-مثقوبة للتارت والإكلير',
    nameEn: 'Micro-Perforated Silicone Baking Mat',
    category: 'baking-pans',
    categoryNameAr: 'صواني وقوالب قاطو',
    price: 40,
    originalPrice: 55,
    rating: 4.8,
    reviewsCount: 63,
    viewsCount: 380,
    stock: 22,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDblY-W82YfmWcMMkI-Cdlx9yBv-6s_v4tj7kSMLLw18lqZWc8Z7sf6zVSX98c6vkTGLAedcCXrpV6UTSK8EsQPSqJuS4DcGbVded-a5LJw46xIwNpOvwyROPWx4K0BGjcgwMCf8RZLFSSOB3uEcqAYY7vMXSeIIYe0R1M1qXjNnHAA5LUQnP-pmipKxlTbK4WQvhbKt1Jx9eUHiqsRu-QNxZWC3tNLoCfYgX0vCZIVsHP7g600zuQ',
    description: 'حصيرة ألياف زجاجية مغطاة بسيليكون نقي مع ثقوب دقيقة لتصريف الرطوبة أثناء الخبز، تضمن قرمشة متساوية لقواعد التارت وعجينة الشو والماكارون بدون انتفاخات هوائية.',
    specs: {
      material: 'ألياف زجاجية مقواة بسيليكون غذائي',
      temperatureRange: 'من -40°C حتى +250°C',
      dimensions: '40 × 30 سم (حجم الفرن المنزلي القياسي)',
      foodGradeCertified: true,
    },
    badge: 'متوفر بالمخزون',
    createdAt: '2026-09-15T15:00:00Z',
  }
];

const INITIAL_DEAL: Deal = {
  id: 'deal-week-1',
  title: 'عرض الأسبوع لصناع القاطو',
  subtitle: 'باقة الموس كيك المتكاملة',
  bundleProduct: INITIAL_PRODUCTS[6],
  discountedPrice: 145,
  originalPrice: 190,
  reservedPercent: 72,
  endsAt: new Date(Date.now() + 14 * 3600 * 1000 + 22 * 60 * 1000 + 5000).toISOString(),
};

const CATEGORIES: Category[] = [
  { id: 'cat-all', slug: 'all', name: 'الكل', icon: 'apps' },
  { id: 'cat-silicone', slug: 'silicone-molds', name: 'قوالب سيليكون', icon: 'shapes' },
  { id: 'cat-tools', slug: 'decorating-tools', name: 'أدوات التزيين', icon: 'brush' },
  { id: 'cat-pans', slug: 'baking-pans', name: 'صواني وقوالب قاطو', icon: 'cookie' },
  { id: 'cat-chocolate', slug: 'chocolate-colors', name: 'شوكولاتة وملونات', icon: 'palette' },
  { id: 'cat-packaging', slug: 'packaging', name: 'التغليف والعلب', icon: 'inventory_2' },
];

function getDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      version: Date.now(),
      products: INITIAL_PRODUCTS,
      orders: [],
      deal: INITIAL_DEAL,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Ensure all products have viewsCount and expiry fields mapped
    let mutated = false;
    for (const p of parsed.products) {
      if (typeof p.viewsCount !== 'number') {
        p.viewsCount = 100;
        mutated = true;
      }
      if (p.id === 'prod-4' && !p.expiryDate) {
        p.expiryDate = '2027-04-30';
        mutated = true;
      }
      if (p.id === 'prod-5' && !p.expiryDate) {
        p.expiryDate = '2026-12-15';
        mutated = true;
      }
    }
    if (mutated) {
      saveDatabase(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file, repairing...', err);
    const fallback: DatabaseSchema = {
      version: Date.now(),
      products: INITIAL_PRODUCTS,
      orders: [],
      deal: INITIAL_DEAL,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveDatabase(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  data.version = Date.now();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ==========================================
  // REAL-TIME ACTIVE USERS HEARTBEAT ENDPOINT
  // ==========================================
  app.post('/api/analytics/heartbeat', (req, res) => {
    const { sessionId } = req.body;
    if (sessionId && typeof sessionId === 'string') {
      activeSessions.set(sessionId, Date.now());
    }
    res.json({ success: true, activeUsersCount: activeSessions.size });
  });

  app.get('/api/analytics/active-users', (_req, res) => {
    res.json({ activeUsersCount: activeSessions.size, timestamp: new Date().toISOString() });
  });

  // ==========================================
  // REAL PRODUCT VIEWS & INTERACTION TRACKING
  // ==========================================
  app.post('/api/products/:id/view', (req, res) => {
    const db = getDatabase();
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    product.viewsCount = (product.viewsCount || 0) + 1;
    saveDatabase(db);
    res.json({ success: true, viewsCount: product.viewsCount });
  });

  // ==========================================
  // PRODUCT EXPIRY TRACKING (أقرب انتهاء صلاحية)
  // ==========================================
  app.get('/api/products/expiring-soon', (_req, res) => {
    const db = getDatabase();
    const now = new Date().getTime();

    const sensitiveProducts = db.products
      .filter((p) => Boolean(p.expiryDate))
      .map((p) => {
        const expTime = new Date(p.expiryDate!).getTime();
        const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
        return {
          ...p,
          daysUntilExpiry: diffDays,
          isUrgent: diffDays <= 90, // Flag if expiring within 3 months
        };
      })
      .sort((a, b) => (a.daysUntilExpiry ?? 0) - (b.daysUntilExpiry ?? 0));

    res.json(sensitiveProducts);
  });

  // ==========================================
  // DATABASE SYNCHRONIZATION VERSION
  // ==========================================
  app.get('/api/sync/version', (_req, res) => {
    const db = getDatabase();
    res.json({ version: db.version || 1 });
  });

  // ==========================================
  // PRODUCT CATALOG & FILTERING
  // ==========================================
  app.get('/api/products', (req, res) => {
    const db = getDatabase();
    let result = [...db.products];

    const { category, search, sort, in_stock } = req.query;

    if (category && category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.nameEn && p.nameEn.toLowerCase().includes(q))
      );
    }

    if (in_stock === 'true') {
      result = result.filter((p) => p.stock > 0);
    }

    if (sort === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'views') {
      // Sort by most viewed
      result.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else {
      // Default: newest first
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(result);
  });

  app.get('/api/products/:id', (req, res) => {
    const db = getDatabase();
    const product = db.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    res.json(product);
  });

  // Future Admin endpoints: create, update, delete
  app.post('/api/products', (req, res) => {
    const db = getDatabase();
    const body = req.body;

    if (!body.name || !body.price || !body.category) {
      return res.status(400).json({ error: 'الاسم، السعر، والتصنيف مطلوبون' });
    }

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      name: body.name,
      nameEn: body.nameEn || '',
      category: body.category,
      categoryNameAr: body.categoryNameAr || 'مستلزمات الحلويات',
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      rating: body.rating ? Number(body.rating) : 5.0,
      reviewsCount: body.reviewsCount ? Number(body.reviewsCount) : 1,
      viewsCount: 0,
      stock: Number(body.stock || 10),
      expiryDate: body.expiryDate || undefined,
      image: body.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAHBS5UrLFS7t6XXqwAgcybLVkcRYHpPmYXsKkGdjBAwHn8gDgHMGEDFEJ7H7rWQRk294sFjIFOBgcS5QciRT7gx3m72OdsTeKi0B_g05LSJJDcONlxURvBPVtHNwRXZivR4WRXNVBZwCTFSrzaoEMT5QHEw6pYfCHZq8ANEBta3mrQ9wQhXXVYrKns_j9cBOHdZvSYnkcyKPAAgxsFDo4EGPYCbYpoZpr3dn2E_GTlizQ_DnZJ3c',
      description: body.description || '',
      specs: body.specs || {
        material: 'مادة معتمدة للحلويات',
        foodGradeCertified: true,
      },
      badge: Number(body.stock) === 0 ? 'نفد مؤقتاً' : Number(body.stock) <= 3 ? `باقي ${body.stock} فقط` : 'متوفر بالمخزون',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    saveDatabase(db);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const db = getDatabase();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }

    const current = db.products[idx];
    const updated: Product = {
      ...current,
      ...req.body,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    // Auto-update stock badge
    if (updated.stock === 0) {
      updated.badge = 'نفد مؤقتاً';
    } else if (updated.stock <= 3) {
      updated.badge = `باقي ${updated.stock} فقط`;
    } else if (updated.badge === 'نفد مؤقتاً' || updated.badge?.startsWith('باقي')) {
      updated.badge = 'متوفر بالمخزون';
    }

    db.products[idx] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  app.patch('/api/products/:id/stock', (req, res) => {
    const db = getDatabase();
    const { stock } = req.body;
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'المنتج غير موجود' });

    prod.stock = Math.max(0, Number(stock));
    if (prod.stock === 0) prod.badge = 'نفد مؤقتاً';
    else if (prod.stock <= 3) prod.badge = `باقي ${prod.stock} فقط`;
    else prod.badge = 'متوفر بالمخزون';
    prod.updatedAt = new Date().toISOString();

    saveDatabase(db);
    res.json({ success: true, stock: prod.stock, badge: prod.badge });
  });

  app.patch('/api/products/:id/price', (req, res) => {
    const db = getDatabase();
    const { price, originalPrice } = req.body;
    const prod = db.products.find((p) => p.id === req.params.id);
    if (!prod) return res.status(404).json({ error: 'المنتج غير موجود' });

    if (price !== undefined) prod.price = Number(price);
    if (originalPrice !== undefined) prod.originalPrice = Number(originalPrice);
    prod.updatedAt = new Date().toISOString();

    saveDatabase(db);
    res.json({ success: true, price: prod.price, originalPrice: prod.originalPrice });
  });

  app.delete('/api/products/:id', (req, res) => {
    const db = getDatabase();
    const initialLen = db.products.length;
    db.products = db.products.filter((p) => p.id !== req.params.id);
    if (db.products.length === initialLen) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    saveDatabase(db);
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  });

  app.get('/api/categories', (_req, res) => {
    const db = getDatabase();
    const cats = CATEGORIES.map((cat) => {
      if (cat.slug === 'all') {
        return { ...cat, count: db.products.length };
      }
      return {
        ...cat,
        count: db.products.filter((p) => p.category === cat.slug).length,
      };
    });
    res.json(cats);
  });

  app.get('/api/deal', (_req, res) => {
    const db = getDatabase();
    res.json(db.deal);
  });

  app.get('/api/orders', (_req, res) => {
    const db = getDatabase();
    const sorted = [...db.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  });

  app.get('/api/orders/:id', (req, res) => {
    const db = getDatabase();
    const order = db.orders.find(
      (o) => o.id === req.params.id || o.orderNumber === req.params.id
    );
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }
    res.json(order);
  });

  // REAL ORDER CREATION & INVENTORY DEDUCTION
  app.post('/api/orders', (req, res) => {
    const db = getDatabase();
    const { customer, items, shippingFee = 40, discount = 0 } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.wilaya) {
      return res.status(400).json({ error: 'بيانات العميل (الاسم، الهاتف، الولاية) مطلوبة' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'السلة فارغة' });
    }

    // Validate real stock in database
    for (const item of items) {
      const prod = db.products.find((p) => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ error: `المنتج (${item.name}) غير متاح في المتجر` });
      }
      if (prod.stock < item.quantity) {
        return res.status(400).json({
          error: `الكمية المطلوبة من "${prod.name}" غير متوفرة. المتبقي في المخزن: ${prod.stock}`,
        });
      }
    }

    // Deduct stock atomically
    for (const item of items) {
      const prod = db.products.find((p) => p.id === item.productId)!;
      prod.stock -= item.quantity;
      if (prod.stock === 0) {
        prod.badge = 'نفد مؤقتاً';
      } else if (prod.stock <= 3) {
        prod.badge = `باقي ${prod.stock} فقط`;
      }
    }

    const subtotal = items.reduce(
      (acc: number, curr: any) => acc + curr.price * curr.quantity,
      0
    );
    const total = Math.max(0, subtotal + shippingFee - discount);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BK-2026-${randomSuffix}`;

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      customer,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDatabase(db);

    res.status(201).json({
      success: true,
      message: 'تم تسجيل طلبك بنجاح وسيتصل بك فريق التوصيل لتأكيد الشحن',
      order: newOrder,
    });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const db = getDatabase();
    const { status } = req.body;
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'الطلب غير موجود' });
    }

    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'حالة غير صالحة' });
    }

    order.status = status;
    saveDatabase(db);
    res.json(order);
  });

  app.get('/api/stats', (_req, res) => {
    const db = getDatabase();
    const totalSales = db.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = db.orders.length;
    const totalProducts = db.products.length;
    const lowStockCount = db.products.filter((p) => p.stock > 0 && p.stock <= 3).length;
    const outOfStockCount = db.products.filter((p) => p.stock === 0).length;
    const totalProductViews = db.products.reduce((acc, p) => acc + (p.viewsCount || 0), 0);

    const now = Date.now();
    const expiringSoonCount = db.products.filter((p) => {
      if (!p.expiryDate) return false;
      const days = (new Date(p.expiryDate).getTime() - now) / (1000 * 3600 * 24);
      return days <= 90;
    }).length;

    res.json({
      totalSales,
      totalOrders,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      activeUsers: activeSessions.size,
      totalProductViews,
      expiringSoonCount,
    });
  });

  // Serve static assets or mount Vite middleware in development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
