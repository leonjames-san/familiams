/*
  # Corrigir Políticas RLS para CRUD Operations

  1. Políticas Atualizadas
    - Remover políticas conflitantes
    - Adicionar políticas corretas para INSERT, UPDATE, DELETE
    - Permitir operações para usuários autenticados

  2. Tabelas Afetadas
    - products: Permitir CRUD completo
    - services: Permitir CRUD completo  
    - categories: Permitir CRUD completo
    - sellers: Permitir CRUD completo
    - reviews: Permitir INSERT e SELECT
    - orders: Permitir CRUD completo
    - order_items: Permitir CRUD completo

  3. Segurança
    - Manter RLS habilitado
    - Políticas específicas para cada operação
    - Acesso controlado por autenticação
*/

-- Remover políticas conflitantes existentes
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar produtos" ON products;

DROP POLICY IF EXISTS "Authenticated users can insert services" ON services;
DROP POLICY IF EXISTS "Authenticated users can update services" ON services;
DROP POLICY IF EXISTS "Authenticated users can delete services" ON services;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar serviços" ON services;

DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar categorias" ON categories;

DROP POLICY IF EXISTS "Authenticated users can insert sellers" ON sellers;
DROP POLICY IF EXISTS "Authenticated users can update sellers" ON sellers;
DROP POLICY IF EXISTS "Authenticated users can delete sellers" ON sellers;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar vendedores" ON sellers;

-- PRODUCTS: Políticas para CRUD completo
CREATE POLICY "products_select_policy" ON products
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "products_insert_policy" ON products
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "products_update_policy" ON products
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "products_delete_policy" ON products
  FOR DELETE TO authenticated
  USING (true);

-- SERVICES: Políticas para CRUD completo
CREATE POLICY "services_select_policy" ON services
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "services_insert_policy" ON services
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "services_update_policy" ON services
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "services_delete_policy" ON services
  FOR DELETE TO authenticated
  USING (true);

-- CATEGORIES: Políticas para CRUD completo
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "categories_insert_policy" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "categories_update_policy" ON categories
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "categories_delete_policy" ON categories
  FOR DELETE TO authenticated
  USING (true);

-- SELLERS: Políticas para CRUD completo
CREATE POLICY "sellers_select_policy" ON sellers
  FOR SELECT TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "sellers_insert_policy" ON sellers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "sellers_update_policy" ON sellers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "sellers_delete_policy" ON sellers
  FOR DELETE TO authenticated
  USING (true);

-- REVIEWS: Manter políticas existentes (já funcionam)
-- Não alterar as políticas de reviews pois já estão corretas

-- ORDERS: Políticas para CRUD completo
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar pedidos" ON orders;

CREATE POLICY "orders_select_policy" ON orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "orders_update_policy" ON orders
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "orders_delete_policy" ON orders
  FOR DELETE TO authenticated
  USING (true);

-- ORDER_ITEMS: Políticas para CRUD completo
DROP POLICY IF EXISTS "Usuários autenticados podem ver itens de pedidos" ON order_items;

CREATE POLICY "order_items_select_policy" ON order_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "order_items_insert_policy" ON order_items
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "order_items_update_policy" ON order_items
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "order_items_delete_policy" ON order_items
  FOR DELETE TO authenticated
  USING (true);