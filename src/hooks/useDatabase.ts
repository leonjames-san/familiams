import { useState, useEffect } from 'react';
import { supabase, Product, Service, Seller, Category, Review } from '../lib/supabase';

// Hook para buscar produtos
export function useProducts(categoryFilter?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            seller:sellers(*),
            reviews(rating)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (categoryFilter && categoryFilter !== 'Todos') {
          query = query.eq('categories.name', categoryFilter);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Calcular média de avaliações
        const productsWithRatings = data?.map(product => ({
          ...product,
          avg_rating: product.reviews?.length > 0 
            ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
            : 0,
          review_count: product.reviews?.length || 0
        })) || [];

        setProducts(productsWithRatings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryFilter]);

  return { products, loading, error, refetch: () => fetchProducts() };
}

// Hook para buscar serviços
export function useServices(categoryFilter?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        let query = supabase
          .from('services')
          .select(`
            *,
            category:categories(*),
            seller:sellers(*),
            reviews(rating)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (categoryFilter && categoryFilter !== 'Todos' && categoryFilter !== 'Informática') {
          // Se não for "Todos" nem "Informática", não mostrar serviços
          setServices([]);
          setLoading(false);
          return;
        }

        const { data, error } = await query;

        if (error) throw error;

        // Calcular média de avaliações
        const servicesWithRatings = data?.map(service => ({
          ...service,
          avg_rating: service.reviews?.length > 0 
            ? service.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / service.reviews.length
            : 0,
          review_count: service.reviews?.length || 0
        })) || [];

        setServices(servicesWithRatings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [categoryFilter]);

  return { services, loading, error, refetch: () => fetchServices() };
}

// Hook para buscar vendedores
export function useSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSellers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('is_active', true)
          .order('is_family_member', { ascending: false });

        if (error) throw error;
        setSellers(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar vendedores');
      } finally {
        setLoading(false);
      }
    }

    fetchSellers();
  }, []);

  return { sellers, loading, error, refetch: () => fetchSellers() };
}

// Hook para buscar categorias
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: () => fetchCategories() };
}

// Hook para estatísticas do admin
export function useAdminStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalServices: 0,
    totalSellers: 0,
    totalOrders: 0,
    todayOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Buscar contadores
        const [productsResult, servicesResult, sellersResult, ordersResult, todayOrdersResult] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('services').select('id', { count: 'exact', head: true }),
          supabase.from('sellers').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0])
        ]);

        setStats({
          totalProducts: productsResult.count || 0,
          totalServices: servicesResult.count || 0,
          totalSellers: sellersResult.count || 0,
          totalOrders: ordersResult.count || 0,
          todayOrders: todayOrdersResult.count || 0
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error, refetch: () => fetchStats() };
}

// Função para adicionar avaliação
export async function addReview(review: Omit<Review, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Função para criar pedido
export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map(item => ({
    ...item,
    order_id: orderData.id
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
}

// Função para buscar produtos para admin
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      seller:sellers(*),
      reviews(rating)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calcular média de avaliações
  const productsWithRatings = data?.map(product => ({
    ...product,
    avg_rating: product.reviews?.length > 0 
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
      : 0,
    review_count: product.reviews?.length || 0
  })) || [];

  return productsWithRatings;
}

// Função para buscar serviços para admin
export async function fetchServices() {
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      category:categories(*),
      seller:sellers(*),
      reviews(rating)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Calcular média de avaliações
  const servicesWithRatings = data?.map(service => ({
    ...service,
    avg_rating: service.reviews?.length > 0 
      ? service.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / service.reviews.length
      : 0,
    review_count: service.reviews?.length || 0
  })) || [];

  return servicesWithRatings;
}

// Função para deletar produto
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Função para deletar serviço
export async function deleteService(id: string) {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) throw error;
}