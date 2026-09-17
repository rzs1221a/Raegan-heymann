import { useMemo, useState } from "react";
import type { Listing } from "../../data/listings";
import { formatPrice } from "../../data/listings";

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

/**
 * Estimated monthly payment — pure client-side, no data dependency. Brings
 * affordability into the moment of decision (P&I + HOA + estimated tax). A
 * clearly-labeled estimate, not a quote.
 */
export default function MortgageCalculator({ listing }: { listing: Listing }) {
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);

  const calc = useMemo(() => {
    const down = (listing.price * downPct) / 100;
    const loan = listing.price - down;
    const mr = rate / 100 / 12;
    const n = termYears * 12;
    const pi =
      mr === 0 ? loan / n : (loan * mr * (1 + mr) ** n) / ((1 + mr) ** n - 1);
    const hoa = listing.hoaMonthly ?? 0;
    const tax = (listing.taxAnnual ?? 0) / 12;
    return { down, loan, pi, hoa, tax, total: pi + hoa + tax };
  }, [listing.price, listing.hoaMonthly, listing.taxAnnual, downPct, rate, termYears]);

  return (
    <div className="glass-deep rounded-3xl p-6">
      <p className="eyebrow mb-3">Estimate the payment</p>
      <div className="flex items-baseline gap-2">
        <p className="font-display text-3xl font-medium text-mist-100">
          {money(calc.total)}
        </p>
        <span className="text-sm text-mist-400">/ mo est.</span>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex justify-between text-xs text-mist-300">
            <label htmlFor="mc-down">Down payment</label>
            <span className="text-mist-100">
              {downPct}% · {money(calc.down)}
            </span>
          </div>
          <input
            id="mc-down"
            type="range"
            min={5}
            max={50}
            step={1}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--color-gold)]"
          />
        </div>
        <div>
          <div className="flex justify-between text-xs text-mist-300">
            <label htmlFor="mc-rate">Interest rate</label>
            <span className="text-mist-100">{rate.toFixed(2)}%</span>
          </div>
          <input
            id="mc-rate"
            type="range"
            min={3}
            max={9}
            step={0.125}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--color-gold)]"
          />
        </div>
        <div>
          <label htmlFor="mc-term" className="text-xs text-mist-300">
            Loan term
          </label>
          <select
            id="mc-term"
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
            className="input-glass mt-2 rounded-xl py-2 text-sm"
          >
            <option value={30}>30-year fixed</option>
            <option value={20}>20-year fixed</option>
            <option value={15}>15-year fixed</option>
          </select>
        </div>
      </div>

      <dl className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-mist-400">Principal &amp; interest</dt>
          <dd className="text-mist-200">{money(calc.pi)}</dd>
        </div>
        {listing.hoaMonthly ? (
          <div className="flex justify-between">
            <dt className="text-mist-400">HOA / dues</dt>
            <dd className="text-mist-200">{money(calc.hoa)}</dd>
          </div>
        ) : null}
        {listing.taxAnnual ? (
          <div className="flex justify-between">
            <dt className="text-mist-400">Est. property tax</dt>
            <dd className="text-mist-200">{money(calc.tax)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-white/10 pt-1.5 font-medium">
          <dt className="text-mist-200">Loan amount</dt>
          <dd className="text-mist-100">{formatPrice(calc.loan)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] leading-relaxed text-mist-400">
        Estimate only, not a loan offer. An advisor connects you with a lender
        for real numbers.
      </p>
    </div>
  );
}
