import { useState } from "react";
import type { Prediction } from "../types/chat";
import "./PredictionCard.css";

const FIELD_META: Record<string, { label: string; unit: string | null }> = {
  GrLivArea: { label: "Above-Grade Living Area", unit: "sq ft" },
  OverallQual: { label: "Overall Quality", unit: "1–10 scale" },
  YearBuilt: { label: "Year Built", unit: null },
  Neighborhood: { label: "Neighborhood", unit: null },
  TotalBsmtSF: { label: "Total Basement Area", unit: "sq ft" },
  GarageCars: { label: "Garage Capacity", unit: "cars" },
  FullBath: { label: "Full Bathrooms (above grade)", unit: null },
  YearRemodAdd: { label: "Year Last Remodelled", unit: null },
  Fireplaces: { label: "Number of Fireplaces", unit: null },
  LotArea: { label: "Lot Area", unit: "sq ft" },
  MasVnrArea: { label: "Masonry Veneer Area", unit: "sq ft" },
  Exterior1st: { label: "Primary Exterior Material", unit: null },
};

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleEntries = Object.entries(prediction.features).filter(
    ([, value]) => value != null
  );

  return (
    <div className="prediction-card">
      <div className="prediction-card__price">
        {formatUSD(prediction.prediction_usd)}
      </div>
      <div className="prediction-card__subtitle">
        Ames, Iowa · 2006–2010 market data
      </div>
      <button
        className="prediction-card__toggle"
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? "Hide details" : "Show details used"}
      </button>
      <div
        className={`prediction-card__details-wrapper${
          expanded ? " prediction-card__details-wrapper--open" : ""
        }`}
      >
        <div className="prediction-card__details">
          {visibleEntries.map(([key, value]) => {
            const meta = FIELD_META[key];
            const label = meta ? meta.label : key;
            const display = meta?.unit
              ? `${value} ${meta.unit}`
              : String(value);
            return (
              <div className="prediction-card__row" key={key}>
                <span className="prediction-card__label">{label}</span>
                <span className="prediction-card__value">{display}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
