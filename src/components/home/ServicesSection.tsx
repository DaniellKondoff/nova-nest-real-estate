"use client";
import React, { memo, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/Select";
import { 
  Home, 
  ShoppingCart, 
  KeyRound, 
  Building2, 
  Calculator, 
  FileText,
  ArrowRight,
  CheckCircle,
  X,
  Send,
  Sparkles,
  Star,
  Shield,
  Clock
} from "lucide-react";

// Memoized service data for performance
const SERVICES_DATA = [
    {
    id: "property-sales",
      icon: ShoppingCart,
      title: "Продажба на имоти",
    description: "Професионална помощ при продажбата на вашия имот с максимална цена и бързи срокове",
    features: ["Оценка на имота", "Маркетинг стратегия", "Договаряне на цената"],
    ariaLabel: "Услуги за продажба на недвижими имоти"
    },
    {
    id: "property-purchase",
      icon: Home,
      title: "Покупка на имоти",
      description: "Намираме перфектния дом според вашите критерии и бюджет",
    features: ["Персонализирана търсене", "Правни проверки", "Съпровождане до сделката"],
    ariaLabel: "Услуги за покупка на недвижими имоти"
    },
    {
    id: "property-rental",
      icon: KeyRound,
      title: "Отдаване под наем",
      description: "Управление на вашия имот и намиране на надеждни наематели",
    features: ["Скрининг на наематели", "Договори за наем", "Управление на имота"],
    ariaLabel: "Услуги за отдаване на имоти под наем"
    },
    {
    id: "property-leasing",
      icon: Building2,
      title: "Наемане на имоти",
      description: "Богат избор от апартаменти и къщи за наем в различни райони",
    features: ["Верифицирани имоти", "Гъвкави условия", "Бърза процедура"],
    ariaLabel: "Услуги за наемане на недвижими имоти"
    },
    {
    id: "property-valuation",
      icon: Calculator,
      title: "Оценка на имоти",
      description: "Професионална оценка на пазарната стойност на недвижими имоти",
    features: ["Пазарен анализ", "Детайлен доклад", "Консултация с експерт"],
    ariaLabel: "Услуги за оценка на недвижими имоти"
    },
    {
    id: "legal-support",
      icon: FileText,
      title: "Правна подкрепа",
      description: "Пълно юридическо обслужване при сделки с недвижими имоти",
    features: ["Проверка на документи", "Изготвяне на договори", "Нотариални услуги"],
    ariaLabel: "Правни услуги за недвижими имоти"
  }
] as const;

// Memoized ServiceCard component for better performance
const ServiceCard = memo(({ 
  service, 
  index 
}: { 
  service: (typeof SERVICES_DATA)[number]; 
  index: number; 
}) => {
  const Icon = service.icon;
  
  const handleCardClick = useCallback(() => {
    // Add analytics or navigation logic here
    console.log(`Service card clicked: ${service.id}`);
  }, [service.id]);

  return (
    <Card 
      className="group relative p-8 h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out cursor-pointer focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-4 overflow-hidden"
      onClick={handleCardClick}
      role="article"
      aria-labelledby={`service-title-${service.id}`}
      aria-describedby={`service-description-${service.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon Container with enhanced design */}
      <div className="relative mb-6">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out shadow-lg"
          style={{backgroundColor: '#d4af37'}}
          aria-hidden="true"
        >
          <Icon 
            className="w-8 h-8 text-white drop-shadow-sm" 
            aria-hidden="true"
          />
        </div>
        {/* Decorative element */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-800/10 group-hover:bg-gray-800/20 transition-colors duration-300" />
      </div>
      
      {/* Title with enhanced typography */}
      <h3 
        id={`service-title-${service.id}`}
        className="text-2xl font-bold text-primary mb-4 leading-tight group-hover:text-gray-800 transition-colors duration-300"
        style={{color: '#1a2642'}}
      >
        {service.title}
      </h3>
      
      {/* Description with improved readability */}
      <p 
        id={`service-description-${service.id}`}
        className="text-charcoal mb-6 leading-relaxed text-base group-hover:text-gray-700 transition-colors duration-300"
      >
        {service.description}
      </p>
      
      {/* Features list with enhanced design */}
      <ul className="space-y-3" role="list" aria-label={`Основни услуги за ${service.title}`}>
        {service.features.map((feature, idx) => (
          <li 
            key={`${service.id}-feature-${idx}`}
            className="flex items-start text-sm text-charcoal group-hover:text-gray-700 transition-colors duration-300"
          >
            <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle 
                className="w-3 h-3 text-white" 
                aria-hidden="true"
              />
            </div>
            <span className="leading-relaxed font-medium">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* Enhanced hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Corner accent */}
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
});

ServiceCard.displayName = 'ServiceCard';

// Consultation Modal Component
const ConsultationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Име е задължително';
    if (!formData.email.trim()) newErrors.email = 'Имейл е задължителен';
    if (!formData.phone.trim()) newErrors.phone = 'Телефон е задължителен';
    if (!formData.propertyType) newErrors.propertyType = 'Моля изберете тип имот';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Моля въведете валиден имейл адрес';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the data to your backend
      console.log('Consultation request submitted:', formData);
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        message: ''
      });
      setIsSuccess(true);
      
      // Auto close modal after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      // You could add a proper error state here instead of alert
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{backgroundColor: '#d4af37'}}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-primary">
                Безплатна консултация
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-charcoal hover:text-primary transition-colors p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Затвори"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="w-5 h-5 text-gray-800" />
              <span className="font-semibold text-gray-800">Бърз отговор</span>
            </div>
            <p className="text-charcoal text-sm leading-relaxed">
              Попълнете формата и ние ще се свържем с вас в най-скоро време за персонализирана консултация
            </p>
          </div>
          
          {isSuccess ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                Благодарим ви!
              </h3>
              <p className="text-charcoal text-lg">
                Вашата заявка е изпратена успешно. Ще се свържем с вас в най-скоро време.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-primary mb-3">
                Име *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-gray-800/20 ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-800'
                }`}
                placeholder="Вашето име"
              />
              {errors.name && <p className="text-sm text-red-500 mt-2 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.name}
              </p>}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-3">
                Имейл *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-gray-800/20 ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-800'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-sm text-red-500 mt-2 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.email}
              </p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-3">
                Телефон *
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-gray-800/20 ${
                  errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-800'
                }`}
                placeholder="+359 899 897 776"
              />
              {errors.phone && <p className="text-sm text-red-500 mt-2 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.phone}
              </p>}
            </div>
            
            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-semibold text-primary mb-3">
                Тип имот *
              </label>
              <select
                id="propertyType"
                value={formData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                className={`w-full h-12 px-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800/20 transition-all duration-200 ${
                  errors.propertyType ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-gray-800'
                }`}
              >
                <option value="">Изберете тип имот</option>
                <option value="sale">Продажба на имот</option>
                <option value="purchase">Покупка на имот</option>
                <option value="rental">Отдаване под наем</option>
                <option value="leasing">Наемане на имот</option>
                <option value="valuation">Оценка на имот</option>
                <option value="legal">Правна подкрепа</option>
              </select>
              {errors.propertyType && <p className="text-sm text-red-500 mt-2 flex items-center">
                <X className="w-4 h-4 mr-1" />
                {errors.propertyType}
              </p>}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-primary mb-3">
                Допълнителна информация
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Опишете вашите нужди и въпроси..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800/20 focus:border-gray-800 min-h-[120px] resize-vertical transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 hover:bg-gray-900 text-white px-12 py-4 border-0 font-semibold text-lg min-w-[240px] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Изпращане...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Изпрати заявка
                  </>
                )}
              </Button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ServicesSection = ({ id }: { id?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConsultationClick = useCallback(() => {
    setIsModalOpen(true);
    // Add analytics tracking
    console.log('Free consultation CTA clicked');
  }, []);

  return (
    <section 
      id={id || "services"} 
      className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50/30 relative overflow-hidden"
      aria-labelledby="services-heading"
      role="region"
    >
      {/* Background decoration for visual interest */}
      <div className="absolute inset-0 bg-white pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header with enhanced design */}
        <header className="text-center mb-16 sm:mb-20 lg:mb-24">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{backgroundColor: '#d4af37'}}
            >
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800 uppercase tracking-wider" style={{color: '#1a2642'}}>
              Нашите услуги
            </span>
          </div>
          <h2 
            id="services-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6 sm:mb-8 leading-tight tracking-tight"
            style={{color: '#1a2642'}}
          >
            Професионални услуги
            <span className="block text-gray-800 mt-2" style={{color: '#1a2642'}}>за недвижими имоти</span>
          </h2>
          <p className="text-xl sm:text-2xl text-charcoal max-w-4xl mx-auto leading-relaxed">
            Предлагаме пълен спектър от услуги в областта на недвижимите имоти с професионален подход и персонализирано обслужване
          </p>
        </header>

        {/* Services Grid with enhanced responsive design */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12"
          role="grid"
          aria-label="Списък с услуги"
        >
          {SERVICES_DATA.map((service, index) => (
            <div 
              key={service.id}
              role="gridcell"
              className="animate-in fade-in-0 slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              <ServiceCard service={service} index={index} />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div 
            className="relative p-8 rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto"
            style={{backgroundColor: '#d4af37'}}
            role="complementary"
            aria-labelledby="cta-heading"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
            
            <div className="relative z-10">
              <h3 
                id="cta-heading"
                className="text-2xl font-bold text-white mb-4 leading-tight"
              >
                Не намирате това, което търсите?
              </h3>
              
              <p className="text-white/90 mb-6 max-w-xl mx-auto leading-relaxed">
                Свържете се с нас за персонализирана консултация и ние ще намерим най-доброто решение за вас
              </p>
              
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-gray-800 hover:bg-gray-900 text-white border-0 px-6 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={handleConsultationClick}
                aria-describedby="cta-description"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Безплатна консултация
              </Button>
              
              <p id="cta-description" className="sr-only">
                Ще бъде отворена форма за заявка за безплатна консултация
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Consultation Modal */}
      <ConsultationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
};

export default ServicesSection;


