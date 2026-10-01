import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { PromoHero } from './components/PromoHero';
import { CategoryPills } from './components/CategoryPills';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { supabase } from './supabaseClient';
import { trackProductView, sendHeartbeat } from './services/api';
import type { Product, Category, Order } from './types/store';

const StoreContent: React.FC = () => {
  const { notification } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // 1. REAL ACTIVE USERS TRACKING (Zero simulated numbers)
  useEffect(() => {
    let sessionId = sessionStorage.getItem('bake_store_session');
    if (!sessionId) {
      sessionId = 'usr_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      sessionStorage.setItem('bake_store_session', sessionId);
    }

    // Send immediate heartbeat on mount
    sendHeartbeat(sessionId);

    // Periodically send heartbeat every 15 seconds
    const interval = setInterval(() => {
      sendHeartbeat(sessionId!);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // 2. REAL-TIME DATABASE SYNCHRONIZATION WITH ADMIN DASHBOARD
  useEffect(() => {
    const checkSync = async () => {
      try {
        const { version } = await fetchSyncVersion();
        if (dbVersion > 0 && version !== dbVersion) {
          // Admin updated prices, stock, or products in the database!
          loadStoreData(false);
        }
        setDbVersion(version);
      } catch {
        // quiet error
      }
    };

    const syncInterval = setInterval(checkSync, 10000);
    return () => clearInterval(syncInterval);
  }, [dbVersion]);

  const loadStoreData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [prods, cats, sync] = await Promise.all([
        fetchProducts({
          category: selectedCategory,
          search: searchQuery,
          sort: sortBy,
          in_stock: inStockOnly,
        }),
        fetchCategories(),
        fetchSyncVersion().catch(() => ({ version: 0 })),
      ]);
      setProducts(prods);
      setCategories(cats);
      if (sync.version) setDbVersion(sync.version);
    } catch (err) {
      console.error('Error loading store data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreData(true);
  }, [selectedCategory, searchQuery, inStockOnly, sortBy]);

  // 3. REAL PRODUCT VIEW TRACKING
  const handleSelectProduct = (product: Product) => {
    setDetailProduct(product);
    // Fire genuine view increment in the database
    trackProductView(product.id).then((res) => {
      if (res.viewsCount) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, viewsCount: res.viewsCount } : p))
        );
      }
    });
  };

  const handleOrderSuccess = (order: Order) => {
    setSuccessOrder(order);
    loadStoreData();
  };

  return (
    <div className="min-h-screen bg-[#fef8f4] text-[#1d1b19] flex flex-col font-['Readex_Pro',sans-serif] pb-12">
      {/* Fixed Header */}
      <Header />

      {/* Floating Cart Notification Toast */}
      {notification && (
        <div className="fixed top-18 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-[#43271a] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg border border-[#ffd9dd] flex items-center gap-2 animate-fadeIn max-w-sm">
          <span className="material-symbols-outlined text-[18px] text-[#ffd9dd]">
            check_circle
          </span>
          <span className="truncate flex-1">{notification}</span>
        </div>
      )}

      {/* Main Storefront Content Area */}
      <main className="max-w-4xl mx-auto w-full px-3.5 sm:px-6 pt-20 flex-1 space-y-4">
        {/* Search & Filter Area */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          inStockOnly={inStockOnly}
          onInStockChange={setInStockOnly}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Hero Banner (Brand & Catalog Showcase) */}
        {!searchQuery && selectedCategory === 'all' && (
          <PromoHero
            onCtaClick={() => {
              setSelectedCategory('silicone-molds');
            }}
          />
        )}

        {/* Horizontal Scrollable Category Pills */}
        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Section Title & Product Count */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#1d1b19]">
              {selectedCategory === 'all'
                ? 'مستلزمات مختارة'
                : categories.find((c) => c.slug === selectedCategory)?.name || 'المنتجات'}
            </h3>
            <span className="bg-[#ffd9dd]/60 text-[#400012] text-xs font-bold px-2 py-0.5 rounded-full">
              {products.length} {products.length === 1 ? 'منتج' : 'منتجات'}
            </span>
          </div>

          {/* Quick sort selector */}
          <div className="flex items-center gap-1 text-xs text-[#43271a] font-medium">
            <span className="material-symbols-outlined text-[16px] text-[#9e3d50]">
              swap_vert
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-[#43271a] cursor-pointer"
            >
              <option value="newest">عرض الأحدث</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="price_asc">السعر: من الأقل</option>
              <option value="price_desc">السعر: من الأعلى</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 py-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-3 border border-[#ede7e3] h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="w-full aspect-square bg-[#f3ede9] rounded-xl"></div>
                <div className="h-4 bg-[#f3ede9] rounded-full w-3/4 mt-2"></div>
                <div className="h-4 bg-[#f3ede9] rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-[#ede7e3] text-center my-6">
            <div className="w-16 h-16 rounded-full bg-[#ffd9dd]/40 text-[#9e3d50] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[32px]">search_off</span>
            </div>
            <h4 className="text-sm font-bold text-[#43271a]">لا توجد منتجات مطابقة للبحث</h4>
            <p className="text-xs text-[#82746e] mt-1">
              جرب تغيير كلمات البحث أو إزالة التصفية لعرض جميع المستلزمات المتوفرة
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setInStockOnly(false);
              }}
              className="mt-4 bg-[#43271a] text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-[#5c3d2e]"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 pb-4">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenDetails={handleSelectProduct}
              />
            ))}
          </section>
        )}

        {/* Quality Commitment Section */}
        <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#ede7e3] flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ffd9dd]/50 flex items-center justify-center text-[#9e3d50] shrink-0">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-[#43271a]">
              جودة مختارة للشيف المنزلي والمحترف
            </h4>
            <p className="text-xs text-[#50443f] mt-0.5">
              جميع قوالب وأدوات المتجر مصنوعة من السيليكون الغذائي البلاتيني الخالي تماماً من مادة BPA ومطابقة لمعايير سلامة الأغذية الأوروبية والعالمية.
            </p>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Checkout Modal */}
      <CheckoutModal onOrderSuccess={handleOrderSuccess} />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <StoreContent />
    </CartProvider>
  );
}
