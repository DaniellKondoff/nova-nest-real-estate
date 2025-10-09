"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Users, Award, Smartphone, Headphones, TrendingUp, X, Phone, Copy, Check } from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/design-tokens";
import { site } from "@/config/site";

interface Advantage {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  stat: string;
}

const advantages: Advantage[] = [
  {
    icon: MapPin,
    title: "Местна експертиза",
    description: "Дълбоко познаване на пазара в Стара Загора и всичките й райони",
    stat: "10+ години опит"
  },
  {
    icon: Users,
    title: "Личен подход",
    description: "Индивидуално внимание и персонализирани решения за всеки клиент",
    stat: "500+ доволни клиенти"
  },
  {
    icon: Award,
    title: "Професионален екип",
    description: "Сертифицирани специалисти с богат опит в недвижимите имоти",
    stat: "#1 в региона"
  },
  {
    icon: Smartphone,
    title: "Модерни технологии",
    description: "Най-новите инструменти за търсене, оценка и представяне на имоти",
    stat: "Винаги актуални"
  },
  {
    icon: Headphones,
    title: "Пълна подкрепа",
    description: "Съпровождане през целия процес от първата среща до подписването",
    stat: "24/7 поддръжка"
  },
  {
    icon: TrendingUp,
    title: "Доказани резултати",
    description: "Успешно реализирани сделки с максимална стойност за клиентите",
    stat: "95% успеваемост"
  }
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export interface WhyChooseUsSectionProps extends React.HTMLAttributes<HTMLElement> {}

export default function WhyChooseUsSection({ className, ...rest }: WhyChooseUsSectionProps): React.ReactElement {
  const [isPhoneModalOpen, setIsPhoneModalOpen] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  const handlePhoneClick = () => {
    // Try to initiate phone call
    window.location.href = `tel:${site.contact.phone}`;
    // Show modal as fallback
    setIsPhoneModalOpen(true);
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.phone);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.log(`Phone number: ${site.contact.phone}`);
    }
  };
  return (
    <section
      aria-labelledby="why-choose-us-heading"
      className={cn(
        "py-20 bg-gradient-to-br from-gray-100 to-white",
        className
      )}
      {...rest}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Heading
            as="h2"
            id="why-choose-us-heading"
            size="h1"
            weight="semibold"
            className="text-4xl md:text-5xl font-bold text-primary mb-6"
            style={{color: '#1a2642'}}
          >
            Защо да изберете Nova Nest?
          </Heading>
          <Text as="p" size="xl" className="text-xl text-gray-700 max-w-2xl mx-auto">
            Ние не сме просто агенция - ние сме вашите партньори в намирането на перфектния дом
          </Text>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          aria-label="Предимства на Nova Nest"
        >
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;
            return (
              <motion.div
                key={advantage.title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-10 rounded-full transform translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
                
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ease-out">
                     <div style={{color: '#1a2642'}}>
                       <Icon className="w-7 h-7" />
                     </div>
                  </div>
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-primary mb-1" style={{color: '#1a2642'}}>{advantage.title}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{advantage.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-yellow-200">
             <h3 className="text-2xl font-bold text-primary mb-4" style={{color: '#1a2642'}}>
              Готови да започнем заедно?
            </h3>
            <p className="text-gray-700 mb-6 max-w-xl mx-auto">
              Нека ви помогнем да намерите вашето ново гнездо или да продадете сегашния ви имот на най-добра цена
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#contact" 
                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#1a2642] text-white rounded-lg font-semibold hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
              >
                Безплатна консултация
              </a>
              <button
                onClick={handlePhoneClick}
                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-primary rounded-lg font-semibold hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 ease-out cursor-pointer"
              >
                <Headphones className="w-5 h-5" />
                Обади се сега
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Beautiful Phone Modal */}
      {isPhoneModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsPhoneModalOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
              <button
                onClick={() => setIsPhoneModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Обадете се сега</h3>
                  <p className="text-white/80 text-sm">Готови сме да ви помогнем</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary mb-2" style={{color: '#1a2642'}}>
                  {site.contact.phoneDisplay}
                </div>
                <p className="text-gray-600">
                  Нашият експерт ще отговори на вашите въпроси
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    window.location.href = `tel:${site.contact.phone}`;
                    setIsPhoneModalOpen(false);
                  }}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Обади се сега
                </button>
                
                <button
                  onClick={handleCopyNumber}
                  className="w-full bg-gray-100 text-primary py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      Копирано!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Копирай номера
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Работно време: Понеделник - Петък 9:00 - 18:00
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}


