/*
  # Dados Iniciais do Marketplace Familiar

  1. Inserir Categorias
  2. Inserir Vendedores da Família
  3. Inserir Produtos Iniciais
  4. Inserir Serviços Iniciais
  5. Inserir Avaliações de Exemplo
*/

-- Inserir categorias
INSERT INTO categories (name, description, icon) VALUES
  ('Artesanato', 'Produtos artesanais feitos à mão', '🎀'),
  ('Doces & Salgados', 'Doces e salgados caseiros', '🍯'),
  ('Informática', 'Serviços de tecnologia e informática', '💻'),
  ('Crochê', 'Peças em crochê artesanal', '🧶')
ON CONFLICT (name) DO NOTHING;

-- Inserir vendedores da família
INSERT INTO sellers (name, email, role, avatar_url, specialties, is_family_member, is_active) VALUES
  (
    'Roberto Silva',
    'roberto@familiasilva.com',
    'Especialista em TI',
    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    ARRAY['Conserto de Computadores', 'Automação', 'Planilhas', 'Sites', 'Power Automate'],
    true,
    true
  ),
  (
    'Maria Silva',
    'maria@familiasilva.com',
    'Artesã',
    'https://images.pexels.com/photos/3764188/pexels-photo-3764188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    ARRAY['Laços para Cabelo', 'Crochê', 'Artesanato'],
    true,
    true
  ),
  (
    'Ana & João Silva',
    'anajoao@familiasilva.com',
    'Doces e Salgados',
    'https://images.pexels.com/photos/5560019/pexels-photo-5560019.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    ARRAY['Amendoim Japonês', 'Paçoquinha', 'Doces Artesanais'],
    true,
    true
  )
ON CONFLICT (email) DO NOTHING;

-- Inserir produtos iniciais
WITH category_ids AS (
  SELECT id, name FROM categories
),
seller_ids AS (
  SELECT id, name FROM sellers
)
INSERT INTO products (name, description, price, category_id, seller_id, image_url, is_featured, stock_quantity)
SELECT 
  p.name,
  p.description,
  p.price,
  c.id as category_id,
  s.id as seller_id,
  p.image_url,
  p.is_featured,
  p.stock_quantity
FROM (VALUES
  ('Laço Princesa Rosa', 'Lindo laço em cetim rosa com pérolas, perfeito para ocasiões especiais', 15.00, 'Artesanato', 'Maria Silva', 'https://images.pexels.com/photos/8129903/pexels-photo-8129903.jpeg?auto=compress&cs=tinysrgb&w=400', true, 25),
  ('Amendoim Japonês - 250g', 'Amendoim crocante temperado com molho especial da casa', 8.00, 'Doces & Salgados', 'Ana & João Silva', 'https://images.pexels.com/photos/4198571/pexels-photo-4198571.jpeg?auto=compress&cs=tinysrgb&w=400', true, 50),
  ('Toalha de Mesa em Crochê', 'Toalha artesanal em crochê, 1,5m x 1,5m, linha 100% algodão', 85.00, 'Crochê', 'Maria Silva', 'https://images.pexels.com/photos/6985001/pexels-photo-6985001.jpeg?auto=compress&cs=tinysrgb&w=400', true, 5),
  ('Paçoquinha Caseira - 500g', 'Paçoquinha artesanal feita com amendoim selecionado e açúcar cristal', 12.00, 'Doces & Salgados', 'Ana & João Silva', 'https://images.pexels.com/photos/4202988/pexels-photo-4202988.jpeg?auto=compress&cs=tinysrgb&w=400', false, 30),
  ('Laço Festa Azul', 'Laço elegante em cetim azul com detalhes dourados', 18.00, 'Artesanato', 'Maria Silva', 'https://images.pexels.com/photos/8129903/pexels-photo-8129903.jpeg?auto=compress&cs=tinysrgb&w=400', false, 15),
  ('Tapete Redondo Crochê', 'Tapete artesanal redondo 80cm de diâmetro', 45.00, 'Crochê', 'Maria Silva', 'https://images.pexels.com/photos/6985001/pexels-photo-6985001.jpeg?auto=compress&cs=tinysrgb&w=400', false, 8)
) AS p(name, description, price, category_name, seller_name, image_url, is_featured, stock_quantity)
JOIN category_ids c ON c.name = p.category_name
JOIN seller_ids s ON s.name = p.seller_name;

-- Inserir serviços iniciais
WITH category_ids AS (
  SELECT id, name FROM categories
),
seller_ids AS (
  SELECT id, name FROM sellers
)
INSERT INTO services (name, description, price_from, price_type, category_id, seller_id, is_featured)
SELECT 
  s.name,
  s.description,
  s.price_from,
  s.price_type,
  c.id as category_id,
  se.id as seller_id,
  s.is_featured
FROM (VALUES
  ('Conserto de Computador Completo', 'Diagnóstico, limpeza, troca de peças e instalação de programas', 80.00, 'from', 'Informática', 'Roberto Silva', true),
  ('Planilha Excel Personalizada', 'Criação de planilhas avançadas com fórmulas e automação', 150.00, 'fixed', 'Informática', 'Roberto Silva', true),
  ('Site Institucional', 'Desenvolvimento de site responsivo com design moderno', 800.00, 'from', 'Informática', 'Roberto Silva', true),
  ('Automação Power Automate', 'Criação de fluxos automatizados para otimizar processos', 200.00, 'fixed', 'Informática', 'Roberto Silva', false),
  ('Sistema Web Personalizado', 'Desenvolvimento de sistemas web sob medida', 1500.00, 'from', 'Informática', 'Roberto Silva', false),
  ('Consultoria em TI', 'Consultoria especializada em tecnologia por hora', 80.00, 'hourly', 'Informática', 'Roberto Silva', false)
) AS s(name, description, price_from, price_type, category_name, seller_name, is_featured)
JOIN category_ids c ON c.name = s.category_name
JOIN seller_ids se ON se.name = s.seller_name;

-- Inserir avaliações de exemplo
WITH product_ids AS (
  SELECT id, name FROM products
),
service_ids AS (
  SELECT id, name FROM services
)
INSERT INTO reviews (product_id, service_id, customer_name, customer_email, rating, comment)
SELECT 
  p.id as product_id,
  NULL as service_id,
  r.customer_name,
  r.customer_email,
  r.rating,
  r.comment
FROM (VALUES
  ('Laço Princesa Rosa', 'Ana Costa', 'ana.costa@email.com', 5, 'Produto maravilhoso! Minha filha amou o laço, muito bem feito e delicado.'),
  ('Laço Princesa Rosa', 'Carla Santos', 'carla.santos@email.com', 5, 'Qualidade excepcional! Super recomendo, chegou rapidinho.'),
  ('Amendoim Japonês - 250g', 'João Oliveira', 'joao.oliveira@email.com', 5, 'Melhor amendoim japonês que já comi! Crocante e saboroso.'),
  ('Amendoim Japonês - 250g', 'Maria Fernanda', 'maria.fernanda@email.com', 4, 'Muito gostoso, tempero na medida certa. Vou comprar mais!'),
  ('Toalha de Mesa em Crochê', 'Rosa Lima', 'rosa.lima@email.com', 5, 'Trabalho impecável! A toalha ficou linda na minha mesa de jantar.'),
  ('Paçoquinha Caseira - 500g', 'Pedro Silva', 'pedro.silva@email.com', 5, 'Paçoquinha deliciosa, igual da vovó! Sabor caseiro autêntico.')
) AS r(product_name, customer_name, customer_email, rating, comment)
JOIN product_ids p ON p.name = r.product_name

UNION ALL

SELECT 
  NULL as product_id,
  s.id as service_id,
  r.customer_name,
  r.customer_email,
  r.rating,
  r.comment
FROM (VALUES
  ('Conserto de Computador Completo', 'Carlos Mendes', 'carlos.mendes@email.com', 5, 'Excelente serviço! Roberto resolveu todos os problemas do meu computador rapidamente.'),
  ('Planilha Excel Personalizada', 'Empresa ABC', 'contato@empresaabc.com', 5, 'Planilha perfeita para nossas necessidades. Automatizou todo nosso controle financeiro.'),
  ('Site Institucional', 'Loja Bella', 'contato@lojabella.com', 5, 'Site ficou lindo e profissional. Aumentou muito nossas vendas online!'),
  ('Conserto de Computador Completo', 'Fernanda Rocha', 'fernanda.rocha@email.com', 4, 'Bom atendimento e preço justo. Computador ficou funcionando perfeitamente.')
) AS r(service_name, customer_name, customer_email, rating, comment)
JOIN service_ids s ON s.name = r.service_name;