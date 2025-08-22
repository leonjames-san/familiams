import React from 'react';
import { CheckCircle, Download, MessageCircle, Home } from 'lucide-react';

interface OrderConfirmationProps {
  orderId: string;
  onBackToHome: () => void;
}

export function OrderConfirmation({ orderId, onBackToHome }: OrderConfirmationProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Pedido Realizado com Sucesso! 🎉
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Obrigado por comprar com a Família Santos!
        </p>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalhes do Pedido</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Número do Pedido</h3>
              <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">#{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                🕐 Aguardando Confirmação
              </span>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Previsão de Entrega</h3>
              <p className="text-gray-600">3 a 5 dias úteis</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Forma de Pagamento</h3>
              <p className="text-gray-600">PIX (Desconto aplicado)</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Próximos Passos</h3>
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-semibold text-gray-800">Confirmação do Pedido</p>
                <p className="text-sm text-gray-600">Você receberá um e-mail de confirmação em alguns minutos</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-semibold text-gray-800">Preparação</p>
                <p className="text-sm text-gray-600">Nossos vendedores prepararão seus produtos com carinho</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-semibold text-gray-800">Entrega</p>
                <p className="text-sm text-gray-600">Você receberá o código de rastreamento por e-mail</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 px-6 rounded-xl hover:bg-blue-600 transition-all">
            <Download className="h-5 w-5" />
            <span>Baixar Comprovante</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-6 rounded-xl hover:bg-green-600 transition-all">
            <MessageCircle className="h-5 w-5" />
            <span>Falar com Vendedor</span>
          </button>
          
          <button 
            onClick={onBackToHome}
            className="flex items-center justify-center space-x-2 bg-purple-500 text-white py-3 px-6 rounded-xl hover:bg-purple-600 transition-all"
          >
            <Home className="h-5 w-5" />
            <span>Voltar ao Início</span>
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <h3 className="font-bold text-gray-800 mb-2">Precisa de Ajuda?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Nossa equipe está sempre pronta para ajudar você!
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-blue-600">📧 contato@familiasantos.com</span>
            <span className="text-blue-600">📱 (11) 99999-9999</span>
            <span className="text-blue-600">💬 WhatsApp: (11) 88888-8888</span>
          </div>
        </div>
      </div>
    </div>
  );
}