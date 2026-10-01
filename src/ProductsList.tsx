import React, { useEffect, useState } from 'react';
// استيراد ملف الاتصال بـ Supabase الذي أنشأناه سابقاً
import { supabase } from '../supabaseClient'; 

// تعريف هيكل المنتج (TypeScript Interfaces) لترتيب البيانات ونظافتها
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  expiry_date: string;
  image_url: string;
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // دالة لجلب المنتجات من قاعدة البيانات عند فتح الصفحة
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      // الاتصال بجدول products وجلب كل الأعمدة (*)
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('خطأ أثناء جلب المنتجات:', error.message);
      } else if (data) {
        setProducts(data); // حفظ المنتجات في المتغير لعرضها
      }
    } catch (error) {
      console.error('حدث خطأ غير متوقع:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-10">جاري تحميل مستلزمات الكعك... 🍰</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">قائمة مستلزمات الحلويات المتوفرة</h2>
      
      {/* إذا كان جدول المنتجات فارغاً في قاعدة البيانات */}
      {products.length === 0 ? (
        <p className="text-gray-500">لا توجد منتجات مضافة حالياً. جرب إضافة منتج جديد من لوحة التحكم!</p>
      ) : (
        // عرض المنتجات بشبكة منظمة (Grid) باستخدام Tailwind CSS
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between">
              <div>
                {/* صورة المنتج */}
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-md mb-4 text-gray-400">لا توجد صورة</div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-pink-600 font-bold mt-2">{product.price} د.ج</p>
                <p className="text-sm text-gray-500 mt-1">المخزون المتوفر: {product.stock} قطعة</p>
                {product.expiry_date && (
                  <p className="text-xs text-red-500 mt-1">تاريخ الصلاحية: {product.expiry_date}</p>
                )}
              </div>

              <button className="mt-4 w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition">
                أضف إلى السلة
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}