import { create } from 'zustand'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartStore {
  items: CartItem[]
  addToCart: (product: any) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addToCart: (product) => set((state) => {
    const existing = state.items.find(item => item.id === product.id)
    if (existing) {
      return {
        items: state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
    }
    return {
      items: [...state.items, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        image: product.images?.[0]
      }]
    }
  }),
  
  removeFromCart: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, quantity } : item
    )
  })),
  
  clearCart: () => set({ items: [] }),
  
  total: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }
}))
