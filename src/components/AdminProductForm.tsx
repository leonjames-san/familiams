import React, { useState, useEffect } from 'react';
import { X, Save, Upload, AlertCircle } from 'lucide-react';
import { supabase, Product, Category, Seller } from '../lib/supabase';
import { useCategories, useSellers } from '../hooks/useDatabase';

interface AdminProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function AdminProductForm({ product, isOpen, onClose, onSave }: AdminProductFormProps) {
  const { categories } = useCategories();
  const { sellers } = useSellers();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    seller_id: '',
    image_url: '',
    is_featured: false,
    is_active: true,
    stock_quantity: '0'
  });

  // Carregar dados do produto para edição
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category_id: product.category_id || '',
        seller_id: product.seller_id || '',
        image_url: product.image_url || '',
        is_featured: product.is_featured || false,
        is_active: product.is_active || true,
        stock_quantity: product.stock_quantity?.toString() || '0'
      });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        seller_id: '',
        image_url: '',
        is_featured: false,
        is_active: true,
        stock_quantity: '0'
      });
    }
    setError(null);
  }, [product, isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category_id || !formData.seller_id) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        seller_id: formData.seller_id,
        image_url: formData.image_url,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        stock_quantity: parseInt(formData.stock_quantity)
      };

      if (product) {
        // Atualizar produto existente
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        // Criar novo produto
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <h2 className="text-2xl font-bold">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Nome do Produto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o nome do produto"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o produto..."
              />
            </div>

            {/* Preço e Estoque */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade em Estoque
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Categoria e Vendedor */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendedor *
                </label>
                <select
                  value={formData.seller_id}
                  onChange={(e) => handleInputChange('seller_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um vendedor</option>
                  {sellers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name} {seller.is_family_member && '👨‍👩‍👧‍👦'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL da Imagem */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL da Imagem
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                </button>
              </div>
              {formData.image_url && (
                <div className="mt-3">
                  <img 
                    src={formData.image_url} 
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Opções */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700">
                  Produto em Destaque
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                  Produto Ativo
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Produto'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}