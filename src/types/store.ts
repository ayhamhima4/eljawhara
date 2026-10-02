export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  category: 'silicone-molds' | 'decorating-tools' | 'baking-pans' | 'chocolate-colors' | 'packaging';
  categoryNameAr: string;
  // Monetary values throughout the store are denominated in Algerian dinars (DZD).
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  viewsCount: number; // Real database views tracking
  stock: number;
  unit?: string;
  expiryDate?: string; // YYYY-MM-DD or ISO string for sensitive baking ingredients (chocolate, colors, yeast)
  image: string;
  description: string;
  specs: {
    material: string;
    temperatureRange?: string;
    dimensions?: string;
    piecesCount?: number | string;
    foodGradeCertified: boolean;
  };
  badge?: string; // 'متوفر بالمخزون' | 'باقي 3 فقط' | 'نفد مؤقتاً' | 'جديد' | 'الأكثر مبيعاً'
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  slug: 'all' | 'silicone-molds' | 'decorating-tools' | 'baking-pans' | 'chocolate-colors' | 'packaging';
  name: string;
  icon: string;
  count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  // Price per item in Algerian dinars (DZD).
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  full_name: string;
  phone: string;
  wilaya: string;
  address: string;
  notes?: string;
  payment_method: 'cod' | 'edahabia';
  items: OrderItem[];
  // Order amounts in Algerian dinars (DZD).
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  subtitle: string;
  bundleProduct: Product;
  // Deal amounts in Algerian dinars (DZD).
  discountedPrice: number;
  originalPrice: number;
  reservedPercent: number;
  endsAt: string; // ISO string
}

export interface StoreStats {
  // Sales total in Algerian dinars (DZD).
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeUsers: number;
  totalProductViews: number;
  expiringSoonCount: number;
}

export interface ActiveSession {
  sessionId: string;
  lastHeartbeat: number;
  ip?: string;
}
