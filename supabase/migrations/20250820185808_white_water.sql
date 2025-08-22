/*
  # Schema do Marketplace Familiar

  1. Novas Tabelas
    - `sellers` - Vendedores/membros da família
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text)
      - `avatar_url` (text)
      - `specialties` (text array)
      - `is_family_member` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `categories` - Categorias de produtos/serviços
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `icon` (text)
      - `created_at` (timestamp)

    - `products` - Produtos do marketplace
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `category_id` (uuid, foreign key)
      - `seller_id` (uuid, foreign key)
      - `image_url` (text)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `stock_quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `services` - Serviços oferecidos
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price_from` (decimal)
      - `price_type` (text) -- 'fixed', 'from', 'hourly'
      - `category_id` (uuid, foreign key)
      - `seller_id` (uuid, foreign key)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `reviews` - Avaliações de produtos/serviços
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key, nullable)
      - `service_id` (uuid, foreign key, nullable)
      - `customer_name` (text)
      - `customer_email` (text)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)

    - `orders` - Pedidos realizados
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `total_amount` (decimal)
      - `status` (text) -- 'pending', 'confirmed', 'completed', 'cancelled'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `order_items` - Itens dos pedidos
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key, nullable)
      - `service_id` (uuid, foreign key, nullable)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_price` (decimal)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para leitura pública de produtos/serviços ativos
    - Políticas para vendedores gerenciarem seus próprios produtos
    - Políticas administrativas para usuários autenticados
*/

-- Criar tabela de vendedores
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  avatar_url text DEFAULT '',
  specialties text[] DEFAULT '{}',
  is_family_member boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  image_url text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price_from decimal(10,2) NOT NULL,
  price_type text DEFAULT 'from' CHECK (price_type IN ('fixed', 'from', 'hourly')),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT review_target CHECK (
    (product_id IS NOT NULL AND service_id IS NULL) OR 
    (product_id IS NULL AND service_id IS NOT NULL)
  )
);

-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text DEFAULT '',
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  CONSTRAINT item_target CHECK (
    (product_id IS NOT NULL AND service_id IS NULL) OR 
    (product_id IS NULL AND service_id IS NOT NULL)
  )
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública
CREATE POLICY "Vendedores ativos são visíveis publicamente"
  ON sellers FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Categorias são visíveis publicamente"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Produtos ativos são visíveis publicamente"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Serviços ativos são visíveis publicamente"
  ON services FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Avaliações são visíveis publicamente"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Políticas para inserção de avaliações (público pode avaliar)
CREATE POLICY "Qualquer pessoa pode criar avaliações"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Políticas para inserção de pedidos (público pode fazer pedidos)
CREATE POLICY "Qualquer pessoa pode criar pedidos"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode criar itens de pedido"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Políticas administrativas (usuários autenticados podem gerenciar tudo)
CREATE POLICY "Usuários autenticados podem gerenciar vendedores"
  ON sellers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar categorias"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar produtos"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar serviços"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ver todos os pedidos"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem atualizar pedidos"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem ver itens de pedidos"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_seller ON services(seller_id);
CREATE INDEX IF NOT EXISTS idx_services_featured ON services(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();