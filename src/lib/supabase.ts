import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export interface Seller {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  specialties: string[];
  is_family_member: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  seller_id: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  seller?: Seller;
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price_from: number;
  price_type: 'fixed' | 'from' | 'hourly';
  category_id: string;
  seller_id: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  seller?: Seller;
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
}

export interface Review {
  id: string;
  product_id?: string;
  service_id?: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  service_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
  service?: Service;
}