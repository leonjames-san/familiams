import React, { useState } from 'react';
import { ArrowLeft, CreditCard, MapPin, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../hooks/useDatabase';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderComplete: (orderId: string) => void;
}

export function CheckoutPage({ onBack, onOrderComplete }: CheckoutPageProps) {
  const { state: cartState, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Dados, 2: Pagamento, 3: Confirmação

  // Estados do formulário
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'pix'
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitOrder = async () => {
    if (!customerData.name || !customerData.email || !customerData.phone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      // Preparar dados do pedido
      const orderData = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        total_amount: cartState.total,
        status: 'pending' as const
      };

      // Preparar itens do pedido
      const orderItems = cartState.items.map(item => ({
        product_id: item.type === 'product' ? item.id : undefined,
        service_id: item.type === 'service' ? item.id : undefined,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      // Criar pedido no banco
      const order = await createOrder(orderData, orderItems);
      
      // Limpar carrinho
      clearCart();
      
      // Ir para confirmação
      onOrderComplete(order.id);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar ao Carrinho</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Finalizar Pedido</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`h-1 w-16 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dados Pessoais</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    CEP
                  </label>
                  <input
                    type="text"
                    value={customerData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="00000-000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={customerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={customerData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sua cidade"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Continuar para Pagamento
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Forma de Pagamento</h2>
              
              <div className="space-y-4">
                <div 
                  onClick={() => handleInputChange('paymentMethod', 'pix')}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    customerData.paymentMethod === 'pix' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 text-green-600 p-3 rounded-full">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">PIX</h3>
                      <p className="text-sm text-gray-600">Pagamento instantâneo e seguro</p>
                      <p className="text-sm font-semibold text-green-600">Desconto de 5%</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => handleInputChange('paymentMethod', 'card')}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    customerData.paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Cartão de Crédito</h3>
                      <p className="text-sm text-gray-600">Parcelamento em até 12x</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, Elo</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => handleInputChange('paymentMethod', 'boleto')}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    customerData.paymentMethod === 'boleto' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Boleto Bancário</h3>
                      <p className="text-sm text-gray-600">Vencimento em 3 dias úteis</p>
                      <p className="text-sm text-gray-500">Aprovação em até 2 dias úteis</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Finalizar Pedido'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumo do Pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Resumo do Pedido</h3>
            
            <div className="space-y-4 mb-6">
              {cartState.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-600">Qtd: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-green-600 text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(cartState.total)}</span>
              </div>
              {customerData.paymentMethod === 'pix' && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto PIX (5%):</span>
                  <span>-{formatPrice(cartState.total * 0.05)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Frete:</span>
                <span className="text-green-600">Grátis</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-green-600">
                  {formatPrice(
                    customerData.paymentMethod === 'pix' 
                      ? cartState.total * 0.95 
                      : cartState.total
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-semibold">Compra 100% Segura</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Seus dados estão protegidos com criptografia SSL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}