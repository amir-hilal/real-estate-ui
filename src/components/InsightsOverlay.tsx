import { useState, useEffect, useRef, useCallback } from 'react';
import type { InsightsData } from '../types/chat';
import { fetchInsights } from '../services/api';
import { BarChart } from './charts/BarChart';
import './InsightsOverlay.css';

interface InsightsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatUsd(value: number): string {
  return '$' + value.toLocaleString('en-US');
}

export function InsightsOverlay({ isOpen, onClose }: InsightsOverlayProps) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<InsightsData | null>(null);

  const load = useCallback(async () => {
    if (cacheRef.current) {
      setData(cacheRef.current);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchInsights();
      cacheRef.current = result;
      setData(result);
    } catch {
      setError('Could not load market insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      load();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, load]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stats = data?.price_statistics;
  const perf = data?.model_performance;

  const featureItems = data?.feature_importances.map(f => ({
    label: f.display_name,
    value: f.importance,
  })) ?? [];

  const neighborhoodItems = data?.neighborhoods.map(n => ({
    label: n.name,
    value: n.median_price,
    displayValue: formatUsd(n.median_price),
  })) ?? [];

  // Price bar positions (as % of range from 0 to 75th percentile * 1.15)
  const barMax = stats ? stats.percentile_75 * 1.15 : 1;
  const p25Pct = stats ? (stats.percentile_25 / barMax) * 100 : 0;
  const medPct = stats ? (stats.median / barMax) * 100 : 0;
  const p75Pct = stats ? (stats.percentile_75 / barMax) * 100 : 0;

  return (
    <div className="insights-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="insights-overlay__panel">
        <button className="insights-overlay__close" onClick={onClose}>×</button>

        {loading && <div className="insights-overlay__loading">Loading insights…</div>}
        {error && <div className="insights-overlay__error">{error}</div>}

        {data && stats && perf && (
          <>
            {/* Section A: Header */}
            <h2 className="insights-overlay__title">Market Insights</h2>
            <p className="insights-overlay__subtitle">
              Ames, Iowa &middot; Based on {stats.sample_size.toLocaleString()} property sales
            </p>

            {/* Section B: Model Performance */}
            <div className="insights-cards">
              <div className="insights-card">
                <span className="insights-card__value">{formatUsd(perf.test_mae)}</span>
                <span className="insights-card__label">Typical Estimate Error</span>
                <span className="insights-card__label">How far off our estimates usually are</span>
              </div>
              <div className="insights-card">
                <span className="insights-card__value">{(perf.test_r2 * 100).toFixed(1)}%</span>
                <span className="insights-card__label">Prediction Accuracy</span>
              </div>
              <div className="insights-card">
                <span className="insights-card__value">{perf.improvement_pct}%</span>
                <span className="insights-card__label">Better Than Guessing</span>
              </div>
              <div className="insights-card">
                <span className="insights-card__value">${Math.round(stats.median_price_per_sqft)}/sq ft</span>
                <span className="insights-card__label">Median Price per Sq Ft</span>
              </div>
            </div>

            {/* Section C: Price Distribution */}
            <div className="insights-section">
              <h3 className="insights-section__title">Price Distribution</h3>
              <div className="price-distribution">
                <div className="price-distribution__item">
                  <span className="price-distribution__value">{formatUsd(stats.percentile_25)}</span>
                  <span className="price-distribution__label">Budget Range</span>
                </div>
                <div className="price-distribution__item">
                  <span className="price-distribution__value">{formatUsd(stats.median)}</span>
                  <span className="price-distribution__label">Typical Home</span>
                </div>
                <div className="price-distribution__item">
                  <span className="price-distribution__value">{formatUsd(stats.percentile_75)}</span>
                  <span className="price-distribution__label">Premium Range</span>
                </div>
              </div>
              <div className="price-bar">
                <div className="price-bar__fill" style={{ left: `${p25Pct}%`, width: `${p75Pct - p25Pct}%` }} />
                <div className="price-bar__marker" style={{ left: `${medPct}%` }} />
              </div>
            </div>

            {/* Section D: Feature Importance */}
            <div className="insights-section">
              <h3 className="insights-section__title">What Drives Property Prices</h3>
              <p className="insights-section__subtitle">How much each factor influences the final price estimate</p>
              <BarChart items={featureItems} color="#2563eb" />
            </div>

            {/* Section E: Neighborhood Comparison */}
            <div className="insights-section">
              <h3 className="insights-section__title">Neighborhood Price Comparison</h3>
              <p className="insights-section__subtitle">Typical sale price in each neighborhood</p>
              <BarChart items={neighborhoodItems} color="#059669" />
            </div>

            {/* Section F: Footer */}
            <p className="insights-footer">
              Based on Ames, Iowa housing data (2006–2010). Prices reflect historical market conditions and are used for demonstration purposes.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
