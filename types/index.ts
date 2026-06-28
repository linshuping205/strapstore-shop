export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  images: string[];
  category: string;
  material: string | null;
  tags: string[];
  stock: number;
  sku: string | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  images: string;
  category: string;
  material: string;
  stock: string;
  sku: string;
  isActive: boolean;
  metaTitle: string;
  metaDesc: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  tags: string[];
  published: boolean;
  likes: number;
  views: number;
  metaTitle: string | null;
  metaDesc: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
}

export interface Order {
  id: string;
  email: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  total: number;
  status: string;
  stripeSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
}

export interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export interface SiteSettings {
  siteTitle?: string;
  tagline?: string;
  siteIcon?: string;
  adminEmail?: string;
  contactAddress?: string;
  instagramUrl?: string;
  pinterestUrl?: string;
}
