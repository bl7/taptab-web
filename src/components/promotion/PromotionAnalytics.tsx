"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PromotionAnalytics as AnalyticsData } from "@/interfaces/promotion";
import { PromotionAPI } from "@/lib/promotion-api";

export const PromotionAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    promotionId: "",
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: Record<string, string> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          filterParams[key] = value;
        }
      });

      const response = await PromotionAPI.getAnalytics(filterParams);

      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error("Failed to fetch analytics");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(errorMessage);
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      promotionId: "",
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  const calculateTotalMetrics = () => {
    return analytics.reduce(
      (totals, promo) => ({
        totalUses: totals.totalUses + promo.total_uses,
        totalDiscount: totals.totalDiscount + promo.total_discount_given,
        totalOriginal: totals.totalOriginal + promo.total_original_amount,
      }),
      { totalUses: 0, totalDiscount: 0, totalOriginal: 0 }
    );
  };

  const totals = calculateTotalMetrics();
  const savingsRate =
    totals.totalOriginal > 0
      ? ((totals.totalDiscount / totals.totalOriginal) * 100).toFixed(1)
      : "0";

  return (
    <div className="promotion-analytics">
      <div className="analytics-header">
        <h2>Promotion Analytics</h2>
        <p>Track the performance of your promotional campaigns</p>
      </div>

      {/* Filters */}
      <div className="analytics-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>

          <div className="filter-actions">
            <button
              className="btn btn-primary"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              Apply Filters
            </button>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-header">
                <h3>Total Promotions Used</h3>
              </div>
              <div className="card-value">
                {totals.totalUses.toLocaleString()}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h3>Total Discount Given</h3>
              </div>
              <div className="card-value discount">
                {formatCurrency(totals.totalDiscount)}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h3>Original Order Value</h3>
              </div>
              <div className="card-value">
                {formatCurrency(totals.totalOriginal)}
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <h3>Savings Rate</h3>
              </div>
              <div className="card-value rate">{savingsRate}%</div>
            </div>
          </div>

          {/* Analytics Table */}
          <div className="analytics-table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Promotion Name</th>
                  <th>Type</th>
                  <th>Discount Type</th>
                  <th>Uses</th>
                  <th>Total Discount</th>
                  <th>Original Amount</th>
                  <th>Avg Discount/Use</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {analytics.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      <div className="empty-content">
                        <p>No analytics data available</p>
                        <p className="empty-description">
                          Analytics will appear here once promotions are used
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  analytics.map((promo) => {
                    const performanceScore =
                      promo.total_original_amount > 0
                        ? (promo.total_discount_given /
                            promo.total_original_amount) *
                          100
                        : 0;

                    return (
                      <tr key={promo.id}>
                        <td>
                          <div className="promotion-info">
                            <strong>{promo.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="type-badge">
                            {promo.type.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          <span className="discount-type">
                            {promo.discountType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          <span className="uses-count">
                            {promo.total_uses.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="discount-amount">
                            {formatCurrency(promo.total_discount_given)}
                          </span>
                        </td>
                        <td>
                          <span className="original-amount">
                            {formatCurrency(promo.total_original_amount)}
                          </span>
                        </td>
                        <td>
                          <span className="avg-discount">
                            {formatCurrency(promo.avg_discount_per_use)}
                          </span>
                        </td>
                        <td>
                          <div className="performance-indicator">
                            <div className="performance-bar">
                              <div
                                className="performance-fill"
                                style={{
                                  width: `${Math.min(performanceScore, 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="performance-text">
                              {performanceScore.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Top Performing Promotions */}
          {analytics.length > 0 && (
            <div className="top-performers">
              <h3>Top Performing Promotions</h3>
              <div className="performers-grid">
                {analytics
                  .sort((a, b) => b.total_uses - a.total_uses)
                  .slice(0, 3)
                  .map((promo, index) => (
                    <div key={promo.id} className="performer-card">
                      <div className="performer-rank">#{index + 1}</div>
                      <div className="performer-info">
                        <h4>{promo.name}</h4>
                        <div className="performer-stats">
                          <div className="stat">
                            <span className="stat-label">Uses:</span>
                            <span className="stat-value">
                              {promo.total_uses}
                            </span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Discount:</span>
                            <span className="stat-value">
                              {formatCurrency(promo.total_discount_given)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
