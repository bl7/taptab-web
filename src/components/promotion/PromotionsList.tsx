"use client";

import React, { useState } from "react";
import { Promotion, PromotionFilters } from "@/interfaces/promotion";

interface PromotionsListProps {
  promotions: Promotion[];
  loading: boolean;
  filters: PromotionFilters;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  } | null;
  onFiltersChange: (filters: Partial<PromotionFilters>) => void;
  onPageChange: (offset: number) => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDuplicate: (id: string) => void;
}

export const PromotionsList: React.FC<PromotionsListProps> = ({
  promotions,
  loading,
  filters,
  pagination,
  onFiltersChange,
  onPageChange,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
}) => {
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && Array.isArray(promotions)) {
      setSelectedPromotions(promotions.map((p) => p.id));
    } else {
      setSelectedPromotions([]);
    }
  };

  const handleSelectPromotion = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPromotions((prev) => [...prev, id]);
    } else {
      setSelectedPromotions((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const formatDiscountDisplay = (promotion: Promotion) => {
    switch (promotion.discountType) {
      case "PERCENTAGE":
        return `${promotion.discountValue}% off`;
      case "FIXED_AMOUNT":
        return `Rs. ${promotion.discountValue} off`;
      case "FIXED_PRICE":
        return `Rs. ${promotion.fixedPrice} fixed`;
      case "FREE_ITEM":
        return "Free item";
      default:
        return "Discount";
    }
  };

  const formatPromotionType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No limit";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (promotion: Promotion) => {
    if (!promotion.isActive) {
      return <span className="badge badge-inactive">Inactive</span>;
    }

    const now = new Date();
    const startDate = promotion.startDate
      ? new Date(promotion.startDate)
      : null;
    const endDate = promotion.endDate ? new Date(promotion.endDate) : null;

    if (startDate && startDate > now) {
      return <span className="badge badge-scheduled">Scheduled</span>;
    }

    if (endDate && endDate < now) {
      return <span className="badge badge-expired">Expired</span>;
    }

    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return <span className="badge badge-exhausted">Limit Reached</span>;
    }

    return <span className="badge badge-active">Active</span>;
  };

  const currentPage = pagination
    ? Math.floor(pagination.offset / pagination.limit) + 1
    : 1;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  return (
    <div className="promotions-list">
      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search promotions..."
              value={filters.search || ""}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={filters.type || ""}
              onChange={(e) => onFiltersChange({ type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="CART_DISCOUNT">Cart Discount</option>
              <option value="ITEM_DISCOUNT">Item Discount</option>
              <option value="BOGO">Buy One Get One</option>
              <option value="COMBO_DEAL">Combo Deal</option>
              <option value="FIXED_PRICE">Fixed Price</option>
              <option value="TIME_BASED">Time-Based</option>
              <option value="COUPON">Coupon Code</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={
                filters.active === undefined ? "" : filters.active.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                onFiltersChange({
                  active: value === "" ? undefined : value === "true",
                });
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="limit">Per Page</label>
            <select
              id="limit"
              value={filters.limit || 20}
              onChange={(e) =>
                onFiltersChange({ limit: parseInt(e.target.value) })
              }
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {pagination && (
        <div className="results-summary">
          <p>
            Showing {pagination.offset + 1} to{" "}
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
            of {pagination.total} promotions
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading promotions...</p>
        </div>
      )}

      {/* Promotions Table */}
      {!loading && (
        <div className="table-container">
          <table className="promotions-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(promotions) &&
                      selectedPromotions.length === promotions.length &&
                      promotions.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Name</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Valid Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(promotions) || promotions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    <div className="empty-content">
                      <p>No promotions found</p>
                      <p className="empty-description">
                        {filters.search ||
                        filters.type ||
                        filters.active !== undefined
                          ? "Try adjusting your filters"
                          : "Create your first promotion to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => (
                  <tr
                    key={promotion.id}
                    className={
                      selectedPromotions.includes(promotion.id)
                        ? "selected"
                        : ""
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedPromotions.includes(promotion.id)}
                        onChange={(e) =>
                          handleSelectPromotion(promotion.id, e.target.checked)
                        }
                      />
                    </td>
                    <td>
                      <div className="promotion-name">
                        <strong>{promotion.name}</strong>
                        {promotion.description && (
                          <p className="promotion-description">
                            {promotion.description}
                          </p>
                        )}
                        {promotion.promoCode && (
                          <span className="promo-code">
                            Code: {promotion.promoCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">
                        {formatPromotionType(promotion.type)}
                      </span>
                    </td>
                    <td>
                      <div className="discount-info">
                        <strong>{formatDiscountDisplay(promotion)}</strong>
                        {promotion.minCartValue > 0 && (
                          <p className="min-cart">
                            Min: Rs. {promotion.minCartValue}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="usage-info">
                        <span>{promotion.usageCount}</span>
                        {promotion.usageLimit && (
                          <span> / {promotion.usageLimit}</span>
                        )}
                        {!promotion.usageLimit && <span> / ∞</span>}
                      </div>
                    </td>
                    <td>
                      <div className="date-range">
                        <div>{formatDate(promotion.startDate)}</div>
                        <div>to</div>
                        <div>{formatDate(promotion.endDate)}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(promotion)}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onEdit(promotion)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className={`btn btn-sm ${
                            promotion.isActive ? "btn-warning" : "btn-success"
                          }`}
                          onClick={() =>
                            onToggle(promotion.id, !promotion.isActive)
                          }
                          title={promotion.isActive ? "Deactivate" : "Activate"}
                        >
                          {promotion.isActive ? "⏸️" : "▶️"}
                        </button>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => onDuplicate(promotion.id)}
                          title="Duplicate"
                        >
                          📋
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onDelete(promotion.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm btn-secondary"
            disabled={currentPage === 1}
            onClick={() => onPageChange(0)}
          >
            First
          </button>
          <button
            className="btn btn-sm btn-secondary"
            disabled={currentPage === 1}
            onClick={() => onPageChange(pagination.offset - pagination.limit)}
          >
            Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-sm btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(pagination.offset + pagination.limit)}
          >
            Next
          </button>
          <button
            className="btn btn-sm btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange((totalPages - 1) * pagination.limit)}
          >
            Last
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedPromotions.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-actions-bar">
            <span>{selectedPromotions.length} promotion(s) selected</span>
            <div className="bulk-buttons">
              <button
                className="btn btn-sm btn-warning"
                onClick={() => {
                  // Implement bulk deactivate
                  console.log("Bulk deactivate:", selectedPromotions);
                }}
              >
                Deactivate Selected
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete ${selectedPromotions.length} promotion(s)?`
                    )
                  ) {
                    // Implement bulk delete
                    console.log("Bulk delete:", selectedPromotions);
                  }
                }}
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
