import React from "react";
import DetailSection from "./DetailSection";
import MortgageCalculator from "./MortgageCalculator";

/** Server shell for the mortgage calculator – only sale listings with a price get one */
export default function MortgageSection({ price }: { price: number }): React.ReactElement {
  return (
    <DetailSection title="Ипотечен калкулатор" id="mortgage">
      <MortgageCalculator price={price} />
      <p className="mt-4 text-xs text-charcoal/60">
        Ориентировъчно изчисление. Реалните условия зависят от банката и вашия профил – свържете се с нас за съдействие
        при кредитирането.
      </p>
    </DetailSection>
  );
}
