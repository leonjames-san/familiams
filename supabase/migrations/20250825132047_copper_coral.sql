/*
  # Add INSERT policies for authenticated users

  1. Security Updates
    - Add INSERT policy for `products` table allowing authenticated users
    - Add INSERT policy for `services` table allowing authenticated users
    - Add UPDATE policy for `products` table allowing authenticated users
    - Add UPDATE policy for `services` table allowing authenticated users
    - Add DELETE policy for `products` table allowing authenticated users
    - Add DELETE policy for `services` table allowing authenticated users

  2. Notes
    - These policies allow authenticated users to perform CRUD operations
    - In a production environment, you might want to restrict these to specific roles
*/

-- Products table policies
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Services table policies
CREATE POLICY "Authenticated users can insert services"
  ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete services"
  ON services
  FOR DELETE
  TO authenticated
  USING (true);

-- Categories table policies
CREATE POLICY "Authenticated users can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Sellers table policies
CREATE POLICY "Authenticated users can insert sellers"
  ON sellers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sellers"
  ON sellers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sellers"
  ON sellers
  FOR DELETE
  TO authenticated
  USING (true);