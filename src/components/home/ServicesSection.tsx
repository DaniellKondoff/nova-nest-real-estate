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
  Send
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
      className="group relative p-6 h-full shadow-lift hover:shadow-card transition-all duration-300 ease-out cursor-pointer focus-within:ring-2 focus-within:ring-accent/20 focus-within:ring-offset-2"
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
      {/* Icon Container with improved accessibility */}
      <div 
        className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ease-out"
        style={{backgroundColor: '#d4af37'}}
        aria-hidden="true"
      >
        <Icon 
          className="w-7 h-7 text-primary" 
          aria-hidden="true"
        />
      </div>
      
      {/* Title with proper heading hierarchy */}
      <h3 
        id={`service-title-${service.id}`}
        className="text-xl font-bold text-primary mb-3 leading-tight"
      >
        {service.title}
      </h3>
      
      {/* Description with improved readability */}
      <p 
        id={`service-description-${service.id}`}
        className="text-charcoal mb-4 leading-relaxed text-base"
      >
        {service.description}
      </p>
      
      {/* Features list with better visual hierarchy */}
      <ul className="space-y-2" role="list" aria-label={`Основни услуги за ${service.title}`}>
        {service.features.map((feature, idx) => (
          <li 
            key={`${service.id}-feature-${idx}`}
            className="flex items-start text-sm text-charcoal"
          >
            <CheckCircle 
              className="w-4 h-4 text-accent mr-3 mt-0.5 flex-shrink-0" 
              aria-hidden="true"
            />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* Subtle hover indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">
              Безплатна консултация
            </h2>
            <button
              onClick={onClose}
              className="text-charcoal hover:text-primary transition-colors"
              aria-label="Затвори"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-charcoal mb-6">
            Попълнете формата и ние ще се свържем с вас в най-скоро време
          </p>
          
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                Благодарим ви!
              </h3>
              <p className="text-charcoal">
                Вашата заявка е изпратена успешно. Ще се свържем с вас в най-скоро време.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                Име *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Вашето име"
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Имейл *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                Телефон *
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
                placeholder="+359 888 123 456"
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
            
            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-primary mb-2">
                Тип имот *
              </label>
              <select
                id="propertyType"
                value={formData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                  errors.propertyType ? 'border-red-500' : 'border-charcoal/20'
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
              {errors.propertyType && <p className="text-sm text-red-500 mt-1">{errors.propertyType}</p>}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
                Допълнителна информация
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Опишете вашите нужди и въпроси..."
                className="w-full px-3 py-2 border border-charcoal/20 rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 min-h-[100px] resize-vertical"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 hover:bg-gray-900 text-white px-10 py-4 border-0 font-semibold text-base min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Изпращане...
                  </>
                ) : (
                  <>
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
      className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden"
      aria-labelledby="services-heading"
      role="region"
    >
      {/* Background decoration for visual interest */}
      <div className="absolute inset-0 bg-white pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header with improved typography and spacing */}
        <header className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 
            id="services-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-6 leading-tight tracking-tight"
          >
            Нашите услуги
          </h2>
          <p className="text-lg sm:text-xl text-charcoal max-w-3xl mx-auto leading-relaxed">
            Предлагаме пълен спектър от услуги в областта на недвижимите имоти с професионален подход и персонализирано обслужване
          </p>
        </header>

        {/* Services Grid with improved responsive design */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          role="grid"
          aria-label="Списък с услуги"
        >
          {SERVICES_DATA.map((service, index) => (
            <div 
              key={service.id}
              role="gridcell"
              className="animate-in fade-in-0 slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <ServiceCard service={service} index={index} />
                </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div 
            className="p-8 rounded-2xl shadow-card"
            style={{backgroundColor: '#d4af37'}}
            role="complementary"
            aria-labelledby="cta-heading"
          >
            <h3 
              id="cta-heading"
              className="text-2xl font-bold text-primary mb-4"
            >
              Не намирате това, което търсите?
            </h3>
            <p className="text-primary/80 mb-6 max-w-xl mx-auto">
              Свържете се с нас за персонализирана консултация и ние ще намерим най-доброто решение за вас
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-gray-800 hover:bg-gray-900 text-white border-0"
              onClick={handleConsultationClick}
              aria-describedby="cta-description"
            >
              Безплатна консултация
            </Button>
            <p id="cta-description" className="sr-only">
              Ще бъде отворена форма за заявка за безплатна консултация
            </p>
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


