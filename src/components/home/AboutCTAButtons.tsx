"use client";

import { useRouter } from "next/navigation";

const AboutCTAButtons = () => {
  const router = useRouter();

  const handleStartSearch = () => {
    router.push("/properties");
  };

  const handleContactUs = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <button
        onClick={handleStartSearch}
        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-nova-blue to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        aria-label="Започнете търсенето на имоти"
      >
        Започнете търсенето
      </button>
      <button
        onClick={handleContactUs}
        className="w-full sm:w-auto px-8 py-4 bg-nova-blue md:bg-white/10 md:backdrop-blur-sm text-white font-black md:font-semibold rounded-xl border-2 border-white md:border-white/20 hover:bg-slate-800 md:hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-md"
        aria-label="Свържете се с нас за повече информация"
      >
        Свържете се с нас
      </button>
    </div>
  );
};

export default AboutCTAButtons;
