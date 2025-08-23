import React, { useState } from 'react';
import { Home, ShoppingBag, Users, Settings, Search, Heart, Star, User, Menu, X, ArrowLeft, Plus, Minus, MessageCircle, Shield, Truck, ShoppingCart } from 'lucide-react';
import { useProducts, useServices, useSellers, useCategories, useAdminStats, fetchProducts, fetchServices, deleteProduct, deleteService } from './hooks/useDatabase';
import { useCart } from './contexts/CartContext';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmation } from './components/OrderConfirmation';
import { AdminProductForm } from './components/AdminProductForm';
import { AdminServiceForm } from './components/AdminServiceForm';

// Tipos de dados
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  seller: string;
  image: string;
  rating: number;
  reviews: number;
  featured: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  seller: string;
  rating: number;
  reviews: number;
  featured: boolean;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminServices, setAdminServices] = useState<Service[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Hooks para dados do banco
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts(selectedCategory);
  const { services, loading: servicesLoading, refetch: refetchServices } = useServices(selectedCategory);
  const { sellers, loading: sellersLoading } = useSellers();
  const { categories, loading: categoriesLoading } = useCategories();
  const { stats, loading: statsLoading } = useAdminStats();

  // Carregar dados para admin
  const loadAdminData = async () => {
    if (currentPage !== 'admin') return;
    
    setLoadingAdmin(true);
    try {
      const [productsData, servicesData] = await Promise.all([
        fetchProducts(),
        fetchServices()
      ]);
      setAdminProducts(productsData);
      setAdminServices(servicesData);
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
    } finally {
      setLoadingAdmin(false);
    }
  };

  // Carregar dados admin quando necessário
  useEffect(() => {
    if (currentPage === 'admin') {
      loadAdminData();
    }
  }, [currentPage]);

  // Hook do carrinho
  // Funções para gerenciar produtos
  const handleNewProduct = () => {
    setEditingProduct(undefined);
    setProductFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const handleProductSaved = () => {
    refetchProducts();
    loadAdminData();
    refetchServices(); // Pode afetar estatísticas
  };

  // Funções para gerenciar serviços
  const handleNewService = () => {
    setEditingService(undefined);
    setServiceFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormOpen(true);
  };

  const handleServiceSaved = () => {
    refetchProducts(); // Pode afetar estatísticas
    refetchServices();
    loadAdminData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(id);
        loadAdminData();
        refetchProducts();
      } catch (error) {
        alert('Erro ao excluir produto');
      }
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteService(id);
        loadAdminData();
        refetchServices();
      } catch (error) {
        alert('Erro ao excluir serviço');
      }
    }
  };

  const { state: cartState, addItem } = useCart();

  // Preparar lista de categorias para filtro
  const categoryOptions = ['Todos', ...(categories.map(c => c.name) || [])];

  // Função para formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Função para formatar preço de serviço
  const formatServicePrice = (service: any) => {
    const price = formatPrice(service.price_from);
    switch (service.price_type) {
      case 'fixed':
        return price;
      case 'from':
        return `A partir de ${price}`;
      case 'hourly':
        return `${price}/hora`;
      default:
        return price;
    }
  };

  // Componente Header
  const Header = () => (
    <header className="bg-white shadow-lg border-b-4 border-blue-500">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Família Santos Marketplace</h1>
              <p className="text-sm text-gray-600">Unidos fortalecendo nossa renda</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'home' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </button>
            <button 
              onClick={() => setCurrentPage('products')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'products' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Produtos</span>
            </button>
            <button 
              onClick={() => setCurrentPage('sellers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'sellers' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Vendedores</span>
            </button>
            <button 
              onClick={() => setCurrentPage('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentPage === 'admin' 
                  ? 'bg-red-500 text-white' 
                  : 'text-gray-700 hover:bg-red-50'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </button>
            
            {/* Cart Button */}
            <button 
              onClick={() => setCartOpen(true)}
              className="relative flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-orange-50 transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Carrinho</span>
              {cartState.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {cartState.itemCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  currentPage === 'home' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Início</span>
              </button>
              <button 
                onClick={() => { setCurrentPage('products'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  currentPage === 'products' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Produtos</span>
              </button>
              <button 
                onClick={() => { setCurrentPage('sellers'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  currentPage === 'sellers' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Vendedores</span>
              </button>
              <button 
                onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  currentPage === 'admin' ? 'bg-red-500 text-white' : 'text-gray-700 hover:bg-red-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </button>
              <button 
                onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }}
                className="relative flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Carrinho</span>
                {cartState.itemCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold ml-auto">
                    {cartState.itemCount}
                  </span>
                )}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );

  // Página Inicial
  const HomePage = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Família Santos Marketplace
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Unidos fortalecendo nossa renda com produtos e serviços de qualidade
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">🎀 Artesanato</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">💻 Informática</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">🍯 Doces & Salgados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Família */}
      <section className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">Nossa Família</h3>
        {sellersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando vendedores...</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {sellers.filter(s => s.is_family_member).map((member, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all transform hover:-translate-y-1">
              <img 
                src={member.avatar_url} 
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200"
              />
              <h4 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h4>
              <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {member.specialties?.map((specialty, idx) => (
                  <span key={idx} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Produtos em Destaque */}
      <section className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">Produtos em Destaque</h3>
        {productsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {products.filter(p => p.is_featured).map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h4>
                <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{product.avg_rating?.toFixed(1) || '0.0'} ({product.review_count || 0})</span>
                  </div>
                </div>
                <p className="text-sm text-blue-600 font-semibold">Por: {product.seller?.name}</p>
                <div className="mt-4 space-y-2">
                  <button 
                    onClick={() => {
                      addItem({
                        id: product.id,
                        type: 'product',
                        name: product.name,
                        price: product.price,
                        image_url: product.image_url,
                        seller_name: product.seller?.name || 'Vendedor',
                        product
                      });
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold"
                  >
                    🛒 Adicionar ao Carrinho
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedProduct(product);
                      setCurrentPage('product-details');
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all font-semibold"
                  >
                    👁️ Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Serviços em Destaque */}
      <section className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">Serviços em Destaque</h3>
        {servicesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando serviços...</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {services.filter(s => s.is_featured).map((service) => (
            <div key={service.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h4>
              <p className="text-gray-600 mb-3">{service.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-green-600">{formatServicePrice(service)}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{service.avg_rating?.toFixed(1) || '0.0'} ({service.review_count || 0})</span>
                </div>
              </div>
              <p className="text-sm text-blue-600 font-semibold">Por: {service.seller?.name}</p>
              <div className="mt-4">
                <button 
                  onClick={() => {
                    addItem({
                      id: service.id,
                      type: 'service',
                      name: service.name,
                      price: service.price_from,
                      image_url: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400',
                      seller_name: service.seller?.name || 'Vendedor',
                      service
                    });
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all font-semibold"
                >
                  ⚡ Contratar Serviço
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
    </div>
  );

  // Página de Produtos
  const ProductsPage = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Produtos & Serviços</h2>
        
        {/* Barra de Busca */}
        <div className="relative mb-4 md:mb-0">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Buscar produtos..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filtros por Categoria */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categoryOptions.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full transition-all ${
              selectedCategory === category
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid de Produtos */}
      {(productsLoading || servicesLoading) ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos e serviços...</p>
        </div>
      ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="relative">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <button className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white transition-all">
                <Heart className="h-4 w-4 text-red-500" />
              </button>
              {product.is_featured && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Destaque
                </div>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-800 mb-2">{product.name}</h4>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold text-green-600">{formatPrice(product.price)}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{product.avg_rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 font-semibold mb-3">Por: {product.seller?.name}</p>
              <button 
                onClick={() => {
                  setSelectedProduct(product);
                  setCurrentPage('product-details');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}

        {/* Serviços (quando categoria permite) */}
        {services.map((service) => (
          <div key={service.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full mr-3">
                <Settings className="h-4 w-4" />
              </div>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Serviço</span>
            </div>
            <h4 className="font-bold text-gray-800 mb-2">{service.name}</h4>
            <p className="text-gray-600 text-sm mb-3">{service.description}</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-green-600">{formatServicePrice(service)}</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{service.avg_rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 font-semibold mb-3">Por: {service.seller?.name}</p>
            <button 
              onClick={() => {
                addItem({
                  id: service.id,
                  type: 'service',
                  name: service.name,
                  price: service.price_from,
                  image_url: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400',
                  seller_name: service.seller?.name || 'Vendedor',
                  service
                });
              }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
            >
              Contratar Serviço
            </button>
          </div>
        ))}
      </div>
    )}
    </div>
  );

  // Página de Vendedores
  const SellersPage = () => (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Nossos Vendedores</h2>
      
      {/* Família em Destaque */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 mb-8 text-white">
        <h3 className="text-2xl font-bold mb-4 text-center">👨‍👩‍👧‍👦 Família Santos - Fundadores</h3>
        {sellersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 opacity-90">Carregando vendedores...</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {sellers.filter(s => s.is_family_member).map((member, index) => (
            <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
              <img 
                src={member.avatar_url} 
                alt={member.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-3 border-white"
              />
              <h4 className="text-lg font-bold mb-2">{member.name}</h4>
              <p className="text-sm opacity-90 mb-3">{member.role}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {member.specialties?.map((specialty, idx) => (
                  <span key={idx} className="bg-white/30 px-2 py-1 rounded-full text-xs">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Estatísticas */}
      {statsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
        </div>
      ) : (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalSellers}</div>
          <div className="text-gray-600">Vendedores Ativos</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalProducts + stats.totalServices}</div>
          <div className="text-gray-600">Produtos/Serviços</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">4.8</div>
          <div className="text-gray-600">Avaliação Média</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalOrders}</div>
          <div className="text-gray-600">Pedidos Realizados</div>
        </div>
      </div>
      )}

      {/* Como se Tornar Vendedor */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quero ser Vendedor!</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="bg-green-100 text-green-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">1. Cadastre-se</h4>
            <p className="text-gray-600 text-sm">Crie seu perfil de vendedor conosco</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">2. Adicione Produtos</h4>
            <p className="text-gray-600 text-sm">Cadastre seus produtos ou serviços</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 text-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">3. Comece a Vender</h4>
            <p className="text-gray-600 text-sm">Receba pedidos e ganhe dinheiro</p>
          </div>
        </div>
        <div className="text-center">
          <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all">
            Quero ser Vendedor
          </button>
        </div>
      </div>
    </div>
  );

  // Página de Administração
  const AdminPage = () => (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Painel de Administração</h2>
      
      {/* Cards de Estatísticas */}
      {statsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
        </div>
      ) : (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Produtos</h3>
          <div className="text-3xl font-bold">{stats.totalProducts}</div>
          <p className="text-blue-100 text-sm">+2 esta semana</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Serviços</h3>
          <div className="text-3xl font-bold">{stats.totalServices}</div>
          <p className="text-green-100 text-sm">+1 este mês</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Vendedores Ativos</h3>
          <div className="text-3xl font-bold">{stats.totalSellers}</div>
          <p className="text-purple-100 text-sm">Família Santos</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Pedidos Hoje</h3>
          <div className="text-3xl font-bold">{stats.todayOrders}</div>
          <p className="text-orange-100 text-sm">+18% vs ontem</p>
        </div>
      </div>
      )}

      {/* Botões de Ação Admin */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handleNewProduct}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
        >
          + Novo Produto
        </button>
        <button
          onClick={handleNewService}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all shadow-lg"
        >
          + Novo Serviço
        </button>
      </div>

      {/* Seções de Administração */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Gerenciar Produtos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Gerenciar Produtos</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all">
              + Adicionar Novo Produto
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all">
              📝 Editar Produtos Existentes
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all">
              📊 Relatório de Vendas
            </button>
          </div>
          
          {/* Lista de Produtos Recentes */}
          <div className="mt-6">
            {productsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
            <div className="space-y-2">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.seller?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold text-sm">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Gerenciar Usuários */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Serviços Recentes</h3>
          <div className="space-y-3">
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all">
              + Aprovar Novo Vendedor
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all">
              👥 Ver Todos os Vendedores
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all">
              📈 Relatório de Performance
            </button>
          </div>

          {/* Lista de Serviços Recentes */}
          <div className="mt-6">
            {servicesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
            <div className="space-y-2">
              {services.slice(0, 5).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{service.name}</p>
                      <p className="text-xs text-gray-600">{service.seller?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold text-sm">{formatServicePrice(service)}</span>
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Configurações do Sistema */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Configurações do Sistema</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-blue-100 text-blue-700 py-3 px-4 rounded-lg hover:bg-blue-200 transition-all">
            🎨 Personalizar Tema
          </button>
          <button className="bg-purple-100 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-200 transition-all">
            💳 Configurar Pagamentos
          </button>
          <button className="bg-orange-100 text-orange-700 py-3 px-4 rounded-lg hover:bg-orange-200 transition-all">
            📧 Configurar E-mails
          </button>
          <button className="bg-green-100 text-green-700 py-3 px-4 rounded-lg hover:bg-green-200 transition-all">
            🔐 Configurar Segurança
          </button>
          <button className="bg-red-100 text-red-700 py-3 px-4 rounded-lg hover:bg-red-200 transition-all">
            📊 Backup do Sistema
          </button>
          <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all">
            ⚙️ Configurações Gerais
          </button>
        </div>
      </div>
    </div>
  );

  // Página de Detalhes do Produto
  const ProductDetailsPage = () => {
    if (!selectedProduct) return null;

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Botão Voltar */}
        <button 
          onClick={() => setCurrentPage('products')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar aos Produtos</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Imagem do Produto */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={selectedProduct.image_url} 
                alt={selectedProduct.name}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              {selectedProduct.is_featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full font-semibold">
                  ⭐ Produto em Destaque
                </div>
              )}
              <button className="absolute top-4 right-4 bg-white/90 p-3 rounded-full hover:bg-white transition-all shadow-lg">
                <Heart className="h-6 w-6 text-red-500" />
              </button>
            </div>
            
            {/* Galeria de Imagens (simulada) */}
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4].map((i) => (
                <img 
                  key={i}
                  src={selectedProduct.image_url} 
                  alt={`${selectedProduct.name} ${i}`}
                  className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                />
              ))}
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-5 w-5 ${
                        star <= (selectedProduct.avg_rating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {selectedProduct.avg_rating?.toFixed(1) || '0.0'} ({selectedProduct.review_count || 0} avaliações)
                </span>
              </div>
              <p className="text-4xl font-bold text-green-600 mb-4">
                {formatPrice(selectedProduct.price)}
              </p>
            </div>

            {/* Descrição */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
            </div>

            {/* Vendedor */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Vendido por</h3>
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedProduct.seller?.avatar_url} 
                  alt={selectedProduct.seller?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">{selectedProduct.seller?.name}</p>
                  <p className="text-sm text-blue-600">{selectedProduct.seller?.role}</p>
                  {selectedProduct.seller?.is_family_member && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 mt-1">
                      👨‍👩‍👧‍👦 Família Santos
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quantidade e Compra */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantidade</h3>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-semibold px-4">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {selectedProduct.stock_quantity && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedProduct.stock_quantity} unidades disponíveis
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {adminServices.slice(0, 8).map((service) => (
                  🛒 Adicionar ao Carrinho - {formatPrice(selectedProduct.price * quantity)}
                </button>
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                  💳 Comprar Agora
                </button>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) {
                      addItem({
                        id: selectedProduct.id,
                        type: 'product',
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                        image_url: selectedProduct.image_url,
                        seller_name: selectedProduct.seller?.name || 'Vendedor',
                        product: selectedProduct
                      });
                    }
                    setCartOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                >
                  🛒 Adicionar ao Carrinho - {formatPrice(selectedProduct.price * quantity)}
                </button>
                <button 
                  onClick={() => {
                    for (let i = 0; i < quantity; i++) {
                      addItem({
                        id: selectedProduct.id,
                        type: 'product',
                        name: selectedProduct.name,
                        price: selectedProduct.price,
                        image_url: selectedProduct.image_url,
                        seller_name: selectedProduct.seller?.name || 'Vendedor',
                        product: selectedProduct
                      });
                    }
                    setCurrentPage('checkout');
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  💳 Comprar Agora
                </button>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="bg-green-100 text-green-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Produto Garantido</p>
                <p className="text-xs text-gray-600">Qualidade assegurada</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Entrega Rápida</p>
                <p className="text-xs text-gray-600">Em até 3 dias úteis</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Suporte Direto</p>
                <p className="text-xs text-gray-600">Fale com o vendedor</p>
              </div>
            </div>
          </div>

          {loadingAdmin && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando dados...</p>
            </div>
          )}
        </div>

        {/* Avaliações */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Avaliações dos Clientes</h2>
          
          {/* Resumo das Avaliações */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-500 mb-2">
                  {selectedProduct.avg_rating?.toFixed(1) || '0.0'}
                </div>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[1,2,3,4,5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-6 w-6 ${
                        star <= (selectedProduct.avg_rating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-gray-600">{selectedProduct.review_count || 0} avaliações</p>
              </div>
              
              <div className="space-y-2">
                {[5,4,3,2,1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 w-8">{stars}★</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${Math.random() * 80 + 10}%` }}
                      ></div>
                    </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        service.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                      >
                        Excluir
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                      >
                        Excluir
                      </button>
                    <span className="text-sm text-gray-600 w-8">{Math.floor(Math.random() * 20)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de Avaliações */}
          <div className="space-y-6">
            {[
              { name: "Ana Costa", rating: 5, comment: "Produto excelente! Superou minhas expectativas. Recomendo!", date: "2 dias atrás" },
              { name: "Carlos Silva", rating: 4, comment: "Muito bom, chegou rápido e bem embalado.", date: "1 semana atrás" },
              { name: "Mariana Oliveira", rating: 5, comment: "Adorei! Já comprei outros produtos da família Santos.", date: "2 semanas atrás" }
            ].map((review, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{review.name}</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${
                            star <= review.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Botão para Adicionar Avaliação */}
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
              ✍️ Escrever Avaliação
            </button>
          </div>
        </div>

        {/* Produtos Relacionados */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Produtos Relacionados</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {products.filter(p => p.id !== selectedProduct.id && p.category_id === selectedProduct.category_id).slice(0, 4).map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h4>
                  <p className="text-green-600 font-bold mb-3">{formatPrice(product.price)}</p>
                  <button 
                    onClick={() => {
                      setSelectedProduct(product);
                      window.scrollTo(0, 0);
                    }}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderização principal
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-8">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'products' && <ProductsPage />}
        {currentPage === 'sellers' && <SellersPage />}
        {currentPage === 'admin' && <AdminPage />}
        {currentPage === 'product-details' && <ProductDetailsPage />}
        {currentPage === 'checkout' && (
          <CheckoutPage 
            onBack={() => setCartOpen(true)}
            onOrderComplete={(orderId) => {
              setCompletedOrderId(orderId);
              setCurrentPage('order-confirmation');
            }}
          />
        )}
        {currentPage === 'order-confirmation' && completedOrderId && (
          <OrderConfirmation 
            orderId={completedOrderId}
            onBackToHome={() => {
              setCurrentPage('home');
              setCompletedOrderId(null);
            }}
          />
        )}
      </main>
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCurrentPage('checkout');
        }}
      />

      {/* Formulários Admin */}
      <AdminProductForm
        product={editingProduct}
        isOpen={productFormOpen}
        onClose={() => setProductFormOpen(false)}
        onSave={handleProductSaved}
      />

      <AdminServiceForm
        service={editingService}
        isOpen={serviceFormOpen}
        onClose={() => setServiceFormOpen(false)}
        onSave={handleServiceSaved}
      />
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Família Santos Marketplace</h3>
          <p className="text-gray-300 mb-4">Unidos fortalecendo nossa renda familiar</p>
          <div className="flex justify-center space-x-6 text-sm">
            <span>💻 Informática</span>
            <span>🎀 Artesanato</span>
            <span>🍯 Doces & Salgados</span>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700 text-gray-400 text-sm">
            <p>© 2025 Família Santos Marketplace - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;