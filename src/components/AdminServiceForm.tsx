import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Service } from '../lib/supabase';
import { useCategories, useSellers } from '../hooks/useDatabase';
import { createService, updateService } from '../hooks/useDatabase';

interface AdminServiceFormProps {
  service?: Service;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function AdminServiceForm({ service, isOpen, onClose, onSave }: AdminServiceFormProps) {
  const { categories } = useCategories();
  const { sellers } = useSellers();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_from: '',
    price_type: 'from' as 'fixed' | 'from' | 'hourly',
    category_id: '',
    seller_id: '',
    is_featured: false,
    is_active: true
  });

  // Carregar dados do serviço para edição
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        price_from: service.price_from.toString(),
        price_type: service.price_type || 'from',
        category_id: service.category_id || '',
        seller_id: service.seller_id || '',
        is_featured: service.is_featured || false,
        is_active: service.is_active || true
      });
    } else {
      // Reset form for new service
      setFormData({
        name: '',
        description: '',
        price_from: '',
        price_type: 'from',
        category_id: '',
        seller_id: '',
        is_featured: false,
        is_active: true
      });
    }
    setError(null);
  }, [service, isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price_from || !formData.category_id || !formData.seller_id) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price_from: parseFloat(formData.price_from),
        price_type: formData.price_type,
        category_id: formData.category_id,
        seller_id: formData.seller_id,
        is_featured: formData.is_featured,
        is_active: formData.is_active
      };

      if (service) {
        // Atualizar serviço existente
        await updateService(service.id, serviceData);
      } else {
        // Criar novo serviço
        await createService(serviceData);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar serviço');
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
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-t-2xl">
            <h2 className="text-2xl font-bold">
              {service ? 'Editar Serviço' : 'Novo Serviço'}
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

            {/* Nome do Serviço */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome do Serviço *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite o nome do serviço"
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
                placeholder="Descreva o serviço..."
              />
            </div>

            {/* Preço e Tipo */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_from}
                  onChange={(e) => handleInputChange('price_from', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Preço
                </label>
                <select
                  value={formData.price_type}
                  onChange={(e) => handleInputChange('price_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fixed">Preço Fixo</option>
                  <option value="from">A partir de</option>
                  <option value="hourly">Por Hora</option>
                </select>
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
                  Serviço em Destaque
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
                  Serviço Ativo
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
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Salvando...' : 'Salvar Serviço'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}