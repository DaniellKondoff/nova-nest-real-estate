"use client";

import React from "react";
import { formatPrice } from "./utils";

const DEFAULT_DOWN_PCT = 20;
const DEFAULT_YEARS = 25;
/** Typical BG mortgage rate (2026); the visitor can change it */
const DEFAULT_RATE = 2.8;

/** Standard annuity: monthly payment for a loan of `principal` at `annualRate` % over `years` */
export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (n <= 0 || principal <= 0) return 0;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

const rangeClass = "h-11 w-full cursor-pointer accent-[var(--color-accent-dark)]";

/** Interactive part of the mortgage section (client island) – inputs + live result */
export default function MortgageCalculator({ price }: { price: number }) {
  const [downPct, setDownPct] = React.useState(DEFAULT_DOWN_PCT);
  const [years, setYears] = React.useState(DEFAULT_YEARS);
  const [rate, setRate] = React.useState(String(DEFAULT_RATE));

  const rateNum = Math.min(Math.max(Number(rate.replace(",", ".")) || 0, 0), 20);
  const loan = Math.round(price * (1 - downPct / 100));
  const monthly = monthlyPayment(loan, rateNum, years);
  const interest = Math.max(monthly * years * 12 - loan, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="mc-down" className="flex justify-between text-sm font-medium text-primary">
            Самоучастие <span className="tabular-nums">{downPct}% · {formatPrice(Math.round((price * downPct) / 100))}</span>
          </label>
          <input
            id="mc-down"
            type="range"
            min={10}
            max={50}
            step={5}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className={rangeClass}
          />
        </div>
        <div>
          <label htmlFor="mc-years" className="flex justify-between text-sm font-medium text-primary">
            Срок <span className="tabular-nums">{years} г.</span>
          </label>
          <input
            id="mc-years"
            type="range"
            min={5}
            max={35}
            step={1}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className={rangeClass}
          />
        </div>
        <div>
          <label htmlFor="mc-rate" className="mb-1.5 block text-sm font-medium text-primary">
            Годишна лихва (%)
          </label>
          <input
            id="mc-rate"
            type="text"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center rounded-card bg-primary p-5 text-white" aria-live="polite">
        <p className="text-sm text-white/70">Месечна вноска</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-accent">{formatPrice(Math.round(monthly))}</p>
        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">Размер на кредита</dt>
            <dd className="font-semibold tabular-nums">{formatPrice(loan)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">Общо лихви</dt>
            <dd className="font-semibold tabular-nums">{formatPrice(Math.round(interest))}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
