"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Send,
  Sparkles,
  CheckCircle,
  Clock,
} from "lucide-react";

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
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Consultation request submitted:', formData);

      setFormData({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        message: ''
      });
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting consultation request:', error);
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
                  <option value="consulting">Консултации и пазарен анализ</option>
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

export const ServicesCTAButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="lg"
        className="bg-gray-800 hover:bg-gray-900 text-white border-0 px-6 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        onClick={() => setIsModalOpen(true)}
        aria-describedby="cta-description"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Безплатна консултация
      </Button>
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
