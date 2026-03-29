"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Headphones, X, Phone, Copy, Check } from "lucide-react";
import { site } from "@/config/site";

export default function WhyChooseUsCTAButtons(): React.ReactElement {
  const [isPhoneModalOpen, setIsPhoneModalOpen] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  const handlePhoneClick = () => {
    window.location.href = `tel:${site.contact.phone}`;
    setIsPhoneModalOpen(true);
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(site.contact.phone);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      console.log(`Phone number: ${site.contact.phone}`);
    }
  };

  return (
    <>
      <button
        onClick={handlePhoneClick}
        className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-gradient-to-r from-yellow-400 to-yellow-600 text-primary rounded-lg font-semibold hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 ease-out cursor-pointer"
      >
        <Headphones className="w-5 h-5" />
        Обади се сега
      </button>

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
                <div className="text-3xl font-bold text-primary mb-2" style={{ color: '#1a2642' }}>
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
    </>
  );
}
