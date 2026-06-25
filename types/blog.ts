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
