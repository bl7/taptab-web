"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Base spinner component
interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray" | "success" | "error";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const colorClasses = {
  primary: "border-blue-600",
  white: "border-white",
  gray: "border-gray-900",
  success: "border-green-600",
  error: "border-red-600",
};

export function Spinner({
  size = "md",
  color = "primary",
  className,
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

// Page-level loading component
interface PageLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  background?: "light" | "dark" | "transparent";
}

export function PageLoader({
  message = "Loading...",
  size = "lg",
  fullScreen = true,
  background = "light",
}: PageLoaderProps) {
  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-12";

  const bgClasses = {
    light: "bg-gray-50",
    dark: "bg-gray-900",
    transparent: "",
  };

  const textClasses = {
    light: "text-gray-900",
    dark: "text-gray-100",
    transparent: "text-gray-700",
  };

  const spinnerColor = background === "dark" ? "white" : "primary";

  return (
    <div className={cn(containerClasses, bgClasses[background])}>
      <div className="text-center">
        <Spinner size={size} color={spinnerColor} className="mx-auto" />
        <p className={cn("mt-4", textClasses[background])}>{message}</p>
      </div>
    </div>
  );
}

// Button loading component
interface ButtonLoaderProps {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "success" | "error";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export function ButtonLoader({
  loading = false,
  children,
  loadingText,
  size = "md",
  variant = "primary",
  className,
  disabled,
  onClick,
  type = "button",
}: ButtonLoaderProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 disabled:hover:bg-gray-600",
    success:
      "bg-green-600 text-white hover:bg-green-700 disabled:hover:bg-green-600",
    error: "bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600",
  };

  const spinnerSize = size === "sm" ? "sm" : "sm";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {loading && <Spinner size={spinnerSize} color="white" />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}

// Inline loading component for small areas
interface InlineLoaderProps {
  message?: string;
  size?: "sm" | "md";
  direction?: "horizontal" | "vertical";
  className?: string;
}

export function InlineLoader({
  message = "Loading...",
  size = "sm",
  direction = "horizontal",
  className,
}: InlineLoaderProps) {
  const containerClasses =
    direction === "horizontal"
      ? "flex items-center gap-2"
      : "flex flex-col items-center gap-2";

  return (
    <div className={cn(containerClasses, className)}>
      <Spinner size={size} />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

// Card/Section loading component
interface SectionLoaderProps {
  height?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
}

export function SectionLoader({
  height = "md",
  message = "Loading...",
  className,
}: SectionLoaderProps) {
  const heightClasses = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
    xl: "h-96",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        heightClasses[height],
        "bg-white rounded-lg shadow-sm border border-gray-200",
        className
      )}
    >
      <div className="text-center">
        <Spinner size="md" className="mx-auto" />
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Loading overlay component
interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  show,
  message = "Loading...",
  className,
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50",
        className
      )}
    >
      <div className="text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="mt-2 text-gray-700">{message}</p>
      </div>
    </div>
  );
}

// Loading skeleton components for better UX
export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-gray-200 rounded", className)} />;
}

interface SkeletonCardProps {
  showImage?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({
  showImage = true,
  lines = 3,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-white p-4 rounded-lg shadow-sm border border-gray-200",
        className
      )}
    >
      {showImage && <LoadingSkeleton className="w-full h-32 mb-4" />}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <LoadingSkeleton
            key={i}
            className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-4" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <LoadingSkeleton
                  key={colIndex}
                  className={cn("h-4", colIndex === 0 ? "w-full" : "w-3/4")}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
