import React from "react";
import { Award, Users, Shield, Sparkles } from "lucide-react";

export interface CompanyValue {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const VALUES: CompanyValue[] = [
  {
    key: "professionalism",
    title: "Професионализъм",
    description: "Експертни знания и етично поведение",
    icon: Award,
  },
  {
    key: "individual-approach",
    title: "Индивидуален подход",
    description: "Всеки клиент е уникален за нас",
    icon: Users,
  },
  {
    key: "transparency",
    title: "Прозрачност",
    description: "Честна комуникация и ясни условия",
    icon: Shield,
  },
  {
    key: "innovation",
    title: "Иновации",
    description: "Модерни технологии за по-добро обслужване",
    icon: Sparkles,
  },
];

export interface CompanyValuesProps {
  className?: string;
  values?: CompanyValue[];
}

export default function CompanyValues(props: CompanyValuesProps): React.ReactElement {
  const { className, values } = props;
  const items = values?.length ? values : VALUES;

  return (
    <section aria-labelledby="values-heading" className={[className].filter(Boolean).join(" ")}> 
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <h3 id="values-heading" className="text-3xl md:text-4xl font-semibold text-white text-center mb-12">
          Нашите ценности
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map(({ key, title, description, icon: Icon }) => (
            <article
              key={key}
              className="border-2 border-white/20 rounded-lg p-6 transition-all duration-300 hover:border-[#d4af37] hover:bg-white/5"
            >
              <Icon aria-hidden="true" className="w-12 h-12 text-[#d4af37] mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
              <p className="text-white/80 text-base leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


