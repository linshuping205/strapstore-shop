import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  variantName?: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
  color?: string;
  size?: string;
}

interface CartStore {
  items: CartItem[];
  coupon: { code: string; discount: number; type: string; value: number } | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
  setCoupon: (coupon: { code: string; discount: number; type: string; value: number } | null) => void;
  finalTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({
            items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          });
        }
      },
      clearCart: () => set({ items: [], coupon: null }),
      total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      setCoupon: (coupon) => set({ coupon }),
      finalTotal: () => {
        const total = get().total();
        const coupon = get().coupon;
        if (!coupon) return total;
        return Math.max(0, total - coupon.discount);
      },
    }),
    { name: 'cart-storage' }
  )
);

// Backward-compatible export for old imports
export const useCartStore = useCart;
export type { CartStore };
