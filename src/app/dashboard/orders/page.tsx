"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { RefreshCw, Eye, Users, MapPin } from "lucide-react";
import { useOrders } from "@/lib/use-orders";
import { api } from "@/lib/api";
import { Table, Location, TableLayout } from "@/lib/api";
import { filterVisibleOrders } from "@/lib/order-utils";
import TableOrdersView from "@/components/orders/TableOrdersView";
import MergeBillsModal from "@/components/orders/MergeBillsModal";
import { PageLoader } from "@/lib/utils";

// Component to render a layout with table status overlays
interface LocationLayoutViewProps {
  layout: TableLayout;
  tables: Table[];
  onTableClick: (table: Table) => void;
  getTableStatus: (table: Table) => string;
  getTableOrderCount: (tableId: string) => number;
  getTableRevenue: (tableId: string) => number;
  isTableUrgent: (tableId: string) => boolean;
}

function LocationLayoutView({
  layout,
  tables,
  onTableClick,
  getTableStatus,
  getTableOrderCount,
  getTableRevenue,
  isTableUrgent,
}: LocationLayoutViewProps) {
  const layoutObjects = layout.layoutJson.objects || [];
  const layoutTables = layout.layoutJson.tables || [];
  const layoutWalls = layout.layoutJson.walls || [];

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-auto p-4">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 500 350"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render walls */}
        {layoutWalls.map((wall, index) => {
          const scale = 0.5;
          const offsetX = 20;
          const offsetY = 40;
          return (
            <line
              key={`wall-${index}`}
              x1={wall.start.x * scale + offsetX}
              y1={wall.start.y * scale + offsetY}
              x2={wall.end.x * scale + offsetX}
              y2={wall.end.y * scale + offsetY}
              stroke="#374151"
              strokeWidth="3"
            />
          );
        })}

        {/* Render layout objects (decorations, etc.) */}
        {layoutObjects.map((obj, index) => {
          const scale = 0.5;
          const offsetX = 20;
          const offsetY = 40;
          const x = obj.position.x * scale + offsetX;
          const y = obj.position.y * scale + offsetY;
          const width = obj.size.width * scale;
          const height = obj.size.height * scale;

          // Render different object types with realistic appearance
          if (obj.type === "plant") {
            return (
              <g key={`obj-${index}`}>
                {/* Plant shadow */}
                <ellipse
                  cx={x + width / 2 + 1}
                  cy={y + height * 0.9 + 1}
                  rx={width * 0.25}
                  ry={height * 0.1}
                  fill="rgba(0,0,0,0.15)"
                />
                {/* Pot rim */}
                <ellipse
                  cx={x + width / 2}
                  cy={y + height * 0.9}
                  rx={width * 0.25}
                  ry={height * 0.1}
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="1"
                />
                {/* Pot body */}
                <rect
                  x={x + width * 0.3}
                  y={y + height * 0.7}
                  width={width * 0.4}
                  height={height * 0.2}
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="1"
                  rx="2"
                />
                {/* Soil */}
                <ellipse
                  cx={x + width / 2}
                  cy={y + height * 0.75}
                  rx={width * 0.18}
                  ry={height * 0.05}
                  fill="#4A2C2A"
                />
                {/* Plant leaves - multiple layers for depth */}
                <circle
                  cx={x + width * 0.35}
                  cy={y + height * 0.4}
                  r={width * 0.12}
                  fill="#228B22"
                />
                <circle
                  cx={x + width * 0.6}
                  cy={y + height * 0.35}
                  r={width * 0.14}
                  fill="#32CD32"
                />
                <circle
                  cx={x + width * 0.45}
                  cy={y + height * 0.55}
                  r={width * 0.1}
                  fill="#228B22"
                />
                <circle
                  cx={x + width * 0.65}
                  cy={y + height * 0.6}
                  r={width * 0.08}
                  fill="#32CD32"
                />
                <circle
                  cx={x + width * 0.5}
                  cy={y + height * 0.45}
                  r={width * 0.16}
                  fill="#228B22"
                />
              </g>
            );
          } else if (obj.type === "bar") {
            return (
              <g key={`obj-${index}`}>
                {/* Bar shadow */}
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={width}
                  height={height}
                  fill="rgba(0,0,0,0.2)"
                  rx="6"
                />
                {/* Bar counter base */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="#2F4F4F"
                  stroke="#1C3333"
                  strokeWidth="1"
                  rx="6"
                />
                {/* Bar top surface (marble/granite look) */}
                <rect
                  x={x + 2.5}
                  y={y + 2.5}
                  width={width - 5}
                  height={height - 5}
                  fill="#708090"
                  rx="4"
                />
                {/* Marble veining */}
                <line
                  x1={x + width * 0.2}
                  y1={y + height * 0.25}
                  x2={x + width * 0.6}
                  y2={y + height * 0.75}
                  stroke="#B8C6DB"
                  strokeWidth="1"
                />
                <line
                  x1={x + width * 0.25}
                  y1={y + height * 0.75}
                  x2={x + width * 0.8}
                  y2={y + height * 0.2}
                  stroke="#B8C6DB"
                  strokeWidth="0.5"
                />
                {/* Bar stools with backs */}
                <circle
                  cx={x + width * 0.2}
                  cy={y - height * 0.35}
                  r="4"
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="0.5"
                />
                <rect
                  x={x + width * 0.2 - 1.5}
                  y={y - height * 0.35 - 6}
                  width="3"
                  height="4"
                  fill="#8B4513"
                  rx="1.5"
                />
                <circle
                  cx={x + width * 0.5}
                  cy={y - height * 0.35}
                  r="4"
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="0.5"
                />
                <rect
                  x={x + width * 0.5 - 1.5}
                  y={y - height * 0.35 - 6}
                  width="3"
                  height="4"
                  fill="#8B4513"
                  rx="1.5"
                />
                <circle
                  cx={x + width * 0.8}
                  cy={y - height * 0.35}
                  r="4"
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="0.5"
                />
                <rect
                  x={x + width * 0.8 - 1.5}
                  y={y - height * 0.35 - 6}
                  width="3"
                  height="4"
                  fill="#8B4513"
                  rx="1.5"
                />
              </g>
            );
          } else if (obj.type === "piano") {
            return (
              <g key={`obj-${index}`}>
                {/* Piano shadow */}
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={width}
                  height={height}
                  fill="rgba(0,0,0,0.3)"
                  rx="4"
                />
                {/* Piano body */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="#1C1C1C"
                  stroke="#000000"
                  strokeWidth="1"
                  rx="4"
                />
                {/* Piano legs */}
                <rect
                  x={x + 4}
                  y={y + height - 2.5}
                  width="2"
                  height="5"
                  fill="#0F0F0F"
                />
                <rect
                  x={x + width - 6}
                  y={y + height - 2.5}
                  width="2"
                  height="5"
                  fill="#0F0F0F"
                />
                <rect
                  x={x + 4}
                  y={y - 2.5}
                  width="2"
                  height="5"
                  fill="#0F0F0F"
                />
                {/* Keyboard area */}
                <rect
                  x={x + 4}
                  y={y + 4}
                  width={width - 8}
                  height={height * 0.4}
                  fill="#FFFFFF"
                  stroke="#CCCCCC"
                  strokeWidth="0.5"
                  rx="2"
                />
                {/* White keys */}
                <line
                  x1={x + 10}
                  y1={y + 4}
                  x2={x + 10}
                  y2={y + 4 + height * 0.4}
                  stroke="#DDDDDD"
                  strokeWidth="0.5"
                />
                <line
                  x1={x + 16}
                  y1={y + 4}
                  x2={x + 16}
                  y2={y + 4 + height * 0.4}
                  stroke="#DDDDDD"
                  strokeWidth="0.5"
                />
                <line
                  x1={x + 22}
                  y1={y + 4}
                  x2={x + 22}
                  y2={y + 4 + height * 0.4}
                  stroke="#DDDDDD"
                  strokeWidth="0.5"
                />
                {/* Black keys */}
                <rect
                  x={x + 7.5}
                  y={y + 4}
                  width="3"
                  height={height * 0.25}
                  fill="#000000"
                />
                <rect
                  x={x + 13.5}
                  y={y + 4}
                  width="3"
                  height={height * 0.25}
                  fill="#000000"
                />
                <rect
                  x={x + 19.5}
                  y={y + 4}
                  width="3"
                  height={height * 0.25}
                  fill="#000000"
                />
                {/* Music stand area */}
                <rect
                  x={x + width * 0.25}
                  y={y + height * 0.5}
                  width={width * 0.5}
                  height={height * 0.3}
                  fill="transparent"
                  stroke="#333333"
                  strokeWidth="0.5"
                  rx="2"
                />
              </g>
            );
          } else if (obj.type === "prep_center" || obj.type === "host_table") {
            return (
              <g key={`obj-${index}`}>
                {/* Counter shadow */}
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={width}
                  height={height}
                  fill="rgba(0,0,0,0.2)"
                  rx="3"
                />
                {/* Counter base */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="#4A5568"
                  stroke="#2D3748"
                  strokeWidth="1"
                  rx="3"
                />
                {/* Stainless steel surface */}
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={width - 3}
                  height={height - 3}
                  fill="#C0C0C0"
                  rx="2"
                />
                {/* Stainless steel grain lines */}
                <line
                  x1={x + 4}
                  y1={y + height * 0.25}
                  x2={x + width - 4}
                  y2={y + height * 0.25}
                  stroke="#A8A8A8"
                  strokeWidth="0.25"
                />
                <line
                  x1={x + 4}
                  y1={y + height * 0.5}
                  x2={x + width - 4}
                  y2={y + height * 0.5}
                  stroke="#A8A8A8"
                  strokeWidth="0.25"
                />
                <line
                  x1={x + 4}
                  y1={y + height * 0.75}
                  x2={x + width - 4}
                  y2={y + height * 0.75}
                  stroke="#A8A8A8"
                  strokeWidth="0.25"
                />
                {/* Equipment on surface */}
                <circle
                  cx={x + width * 0.25}
                  cy={y + height * 0.3}
                  r="3"
                  fill="#E2E8F0"
                  stroke="#CBD5E0"
                  strokeWidth="0.5"
                />
                <circle
                  cx={x + width * 0.75}
                  cy={y + height * 0.7}
                  r="3"
                  fill="#E2E8F0"
                  stroke="#CBD5E0"
                  strokeWidth="0.5"
                />
                <rect
                  x={x + width * 0.5 - 6}
                  y={y + height * 0.5 - 3}
                  width="12"
                  height="6"
                  fill="#F7FAFC"
                  stroke="#E2E8F0"
                  strokeWidth="0.5"
                  rx="1.5"
                />
              </g>
            );
          } else if (obj.type === "waiter_station") {
            return (
              <g key={`obj-${index}`}>
                {/* Station shadow */}
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={width}
                  height={height}
                  fill="rgba(0,0,0,0.3)"
                  rx="4"
                />
                {/* Station base */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="#2D3748"
                  stroke="#1A202C"
                  strokeWidth="1"
                  rx="4"
                />
                {/* Desktop surface */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={width - 4}
                  height={height - 4}
                  fill="#4A5568"
                  rx="3"
                />
                {/* POS terminal base */}
                <rect
                  x={x + width * 0.15}
                  y={y + height * 0.2}
                  width={width * 0.7}
                  height={height * 0.4}
                  fill="#1A202C"
                  stroke="#2D3748"
                  strokeWidth="0.5"
                  rx="3"
                />
                {/* POS screen */}
                <rect
                  x={x + width * 0.2}
                  y={y + height * 0.25}
                  width={width * 0.6}
                  height={height * 0.3}
                  fill="#000000"
                  stroke="#333333"
                  strokeWidth="0.5"
                  rx="2"
                />
                {/* Screen bezel */}
                <rect
                  x={x + width * 0.25}
                  y={y + height * 0.3}
                  width={width * 0.5}
                  height={height * 0.2}
                  fill="#1a1a2e"
                  rx="1"
                />
                {/* Stand/arm */}
                <rect
                  x={x + width * 0.5 - 1}
                  y={y + height * 0.65}
                  width="2"
                  height={height * 0.25}
                  fill="#2D3748"
                />
                {/* Keyboard area */}
                <rect
                  x={x + width * 0.3}
                  y={y + height * 0.75}
                  width={width * 0.4}
                  height={height * 0.15}
                  fill="#2D3748"
                  stroke="#4A5568"
                  strokeWidth="0.5"
                  rx="1.5"
                />
              </g>
            );
          } else if (obj.type === "storage_cabinet") {
            return (
              <g key={`obj-${index}`}>
                {/* Cabinet shadow */}
                <rect
                  x={x + 1.5}
                  y={y + 1.5}
                  width={width}
                  height={height}
                  fill="rgba(0,0,0,0.2)"
                  rx="3"
                />
                {/* Cabinet body */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill="#8B7355"
                  stroke="#6B5B47"
                  strokeWidth="1"
                  rx="3"
                />
                {/* Wood grain texture */}
                <line
                  x1={x + 4}
                  y1={y + height * 0.33}
                  x2={x + width - 4}
                  y2={y + height * 0.33}
                  stroke="#6B5B47"
                  strokeWidth="0.5"
                />
                <line
                  x1={x + 4}
                  y1={y + height * 0.5}
                  x2={x + width - 4}
                  y2={y + height * 0.5}
                  stroke="#6B5B47"
                  strokeWidth="0.5"
                />
                <line
                  x1={x + 4}
                  y1={y + height * 0.67}
                  x2={x + width - 4}
                  y2={y + height * 0.67}
                  stroke="#6B5B47"
                  strokeWidth="0.5"
                />
                {/* Cabinet door dividing line */}
                <line
                  x1={x + width / 2}
                  y1={y + 2}
                  x2={x + width / 2}
                  y2={y + height - 2}
                  stroke="#5A4A3A"
                  strokeWidth="1"
                />
                {/* Door panels */}
                <rect
                  x={x + 3}
                  y={y + 3}
                  width={width / 2 - 4.5}
                  height={height - 6}
                  fill="transparent"
                  stroke="#6B5B47"
                  strokeWidth="0.5"
                  rx="1.5"
                />
                <rect
                  x={x + width / 2 + 1.5}
                  y={y + 3}
                  width={width / 2 - 4.5}
                  height={height - 6}
                  fill="transparent"
                  stroke="#6B5B47"
                  strokeWidth="0.5"
                  rx="1.5"
                />
                {/* Door handles */}
                <circle
                  cx={x + width * 0.35}
                  cy={y + height * 0.5}
                  r="1.5"
                  fill="#C0C0C0"
                  stroke="#A0A0A0"
                  strokeWidth="0.5"
                />
                <circle
                  cx={x + width * 0.65}
                  cy={y + height * 0.5}
                  r="1.5"
                  fill="#C0C0C0"
                  stroke="#A0A0A0"
                  strokeWidth="0.5"
                />
                {/* Hinges */}
                <rect
                  x={x + 1}
                  y={y + height * 0.25}
                  width="2"
                  height="4"
                  fill="#A0A0A0"
                  rx="1"
                />
                <rect
                  x={x + 1}
                  y={y + height * 0.62}
                  width="2"
                  height="4"
                  fill="#A0A0A0"
                  rx="1"
                />
              </g>
            );
          } else if (obj.type === "door") {
            return (
              <g key={`obj-${index}`}>
                {/* Wall thickness on left */}
                <rect
                  x={x}
                  y={y}
                  width="3"
                  height={height}
                  fill="#8B8B8B"
                  stroke="#666666"
                  strokeWidth="0.5"
                />
                {/* Wall thickness on right */}
                <rect
                  x={x + width - 3}
                  y={y}
                  width="3"
                  height={height}
                  fill="#8B8B8B"
                  stroke="#666666"
                  strokeWidth="0.5"
                />
                {/* Door opening (gap) */}
                <rect
                  x={x + 3}
                  y={y}
                  width={width - 6}
                  height={height}
                  fill="transparent"
                  stroke="transparent"
                />
                {/* Left door panel (open outward) */}
                <rect
                  x={x + 3}
                  y={y}
                  width="3"
                  height={(width - 6) * 0.85}
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="0.5"
                  rx="1"
                  transform={`rotate(-75, ${x + 3}, ${y})`}
                />
                {/* Right door panel (open outward) */}
                <rect
                  x={x + width - 6}
                  y={y}
                  width="3"
                  height={(width - 6) * 0.85}
                  fill="#8B4513"
                  stroke="#654321"
                  strokeWidth="0.5"
                  rx="1"
                  transform={`rotate(75, ${x + width - 3}, ${y})`}
                />
                {/* Left door swing arc */}
                <line
                  x1={x + 3}
                  y1={y}
                  x2={x + 3 + (width - 6) * 0.6}
                  y2={y - (width - 6) * 0.5}
                  stroke="#CCCCCC"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                {/* Right door swing arc */}
                <line
                  x1={x + width - 3}
                  y1={y}
                  x2={x + width - 3 - (width - 6) * 0.6}
                  y2={y - (width - 6) * 0.5}
                  stroke="#CCCCCC"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
                {/* Hinges */}
                <circle
                  cx={x + 3}
                  cy={y + 4}
                  r="1"
                  fill="#C0C0C0"
                  stroke="#808080"
                  strokeWidth="0.5"
                />
                <circle
                  cx={x + 3}
                  cy={y + height - 4}
                  r="1"
                  fill="#C0C0C0"
                  stroke="#808080"
                  strokeWidth="0.5"
                />
                <circle
                  cx={x + width - 3}
                  cy={y + 4}
                  r="1"
                  fill="#C0C0C0"
                  stroke="#808080"
                  strokeWidth="0.5"
                />
                <circle
                  cx={x + width - 3}
                  cy={y + height - 4}
                  r="1"
                  fill="#C0C0C0"
                  stroke="#808080"
                  strokeWidth="0.5"
                />
                {/* Door handles */}
                <circle
                  cx={x + 3 + (width - 6) * 0.4}
                  cy={y - (width - 6) * 0.3}
                  r="1"
                  fill="#FFD700"
                  stroke="#DAA520"
                  strokeWidth="0.5"
                />
                <circle
                  cx={x + width - 3 - (width - 6) * 0.4}
                  cy={y - (width - 6) * 0.3}
                  r="1"
                  fill="#FFD700"
                  stroke="#DAA520"
                  strokeWidth="0.5"
                />
                {/* Wall edge highlights */}
                <line
                  x1={x + 3}
                  y1={y}
                  x2={x + 3}
                  y2={y + height}
                  stroke="#AAAAAA"
                  strokeWidth="0.5"
                />
                <line
                  x1={x + width - 3}
                  y1={y}
                  x2={x + width - 3}
                  y2={y + height}
                  stroke="#AAAAAA"
                  strokeWidth="0.5"
                />
              </g>
            );
          }

          // Default fallback for unknown types
          return (
            <rect
              key={`obj-${index}`}
              x={x}
              y={y}
              width={width}
              height={height}
              fill="#d1d5db"
              stroke="#9ca3af"
              strokeWidth="1"
              rx="3"
            />
          );
        })}

        {/* Render layout tables */}
        {layoutTables.map((layoutTable, index) => {
          const table = tables.find((t) => t.id === layoutTable.tableId);
          if (!table) return null;

          const orderCount = getTableOrderCount(table.id);
          const revenue = getTableRevenue(table.id);
          const isUrgent = isTableUrgent(table.id);
          const status = getTableStatus(table);

          // Get status color
          let fillColor = "#10b981"; // green for free
          if (isUrgent) fillColor = "#ef4444"; // red for urgent
          else if (status === "occupied")
            fillColor = "#f97316"; // orange for occupied
          else if (status === "reserved") fillColor = "#8b5cf6"; // purple for reserved

          // Scale down the layout positions and sizes
          const scale = 0.5;
          const offsetX = 20; // Add some offset to center content
          const offsetY = 40;
          const x = layoutTable.position.x * scale + offsetX;
          const y = layoutTable.position.y * scale + offsetY;
          const width = layoutTable.size.width * scale;
          const height = layoutTable.size.height * scale;

          return (
            <g
              key={`table-${index}`}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onTableClick(table)}
            >
              {/* Table shape with enhanced styling */}
              {layoutTable.shape === "round" ? (
                <>
                  {/* Table shadow */}
                  <circle
                    cx={x + width / 2 + 1.5}
                    cy={y + height / 2 + 1.5}
                    r={Math.min(width, height) / 2}
                    fill="rgba(0,0,0,0.2)"
                    pointerEvents="none"
                  />
                  {/* Table base (pedestal) */}
                  <circle
                    cx={x + width / 2}
                    cy={y + height / 2}
                    r={Math.min(width, height) / 6}
                    fill="#8B4513"
                    stroke="#654321"
                    strokeWidth="0.5"
                    pointerEvents="none"
                  />
                  {/* Table top */}
                  <circle
                    cx={x + width / 2}
                    cy={y + height / 2}
                    r={Math.min(width, height) / 2}
                    fill={fillColor}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  {/* Wood grain lines */}
                  <circle
                    cx={x + width / 2}
                    cy={y + height / 2}
                    r={Math.min(width, height) / 2.5}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                    pointerEvents="none"
                  />
                  <circle
                    cx={x + width / 2}
                    cy={y + height / 2}
                    r={Math.min(width, height) / 4}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                    pointerEvents="none"
                  />
                </>
              ) : (
                <>
                  {/* Table shadow */}
                  <rect
                    x={x + 1.5}
                    y={y + 1.5}
                    width={width}
                    height={height}
                    fill="rgba(0,0,0,0.2)"
                    rx="4"
                    pointerEvents="none"
                  />
                  {/* Table legs (4 circles at corners) */}
                  <circle
                    cx={x + 5}
                    cy={y + 5}
                    r="1.5"
                    fill="#654321"
                    pointerEvents="none"
                  />
                  <circle
                    cx={x + width - 5}
                    cy={y + 5}
                    r="1.5"
                    fill="#654321"
                    pointerEvents="none"
                  />
                  <circle
                    cx={x + 5}
                    cy={y + height - 5}
                    r="1.5"
                    fill="#654321"
                    pointerEvents="none"
                  />
                  <circle
                    cx={x + width - 5}
                    cy={y + height - 5}
                    r="1.5"
                    fill="#654321"
                    pointerEvents="none"
                  />
                  {/* Table top */}
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={layoutTable.shape === "square" ? 4 : 2}
                    fill={fillColor}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  {/* Wood grain lines */}
                  <line
                    x1={x + 7.5}
                    y1={y + height * 0.25}
                    x2={x + width - 7.5}
                    y2={y + height * 0.25}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                    pointerEvents="none"
                  />
                  <line
                    x1={x + 7.5}
                    y1={y + height * 0.5}
                    x2={x + width - 7.5}
                    y2={y + height * 0.5}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                    pointerEvents="none"
                  />
                  <line
                    x1={x + 7.5}
                    y1={y + height * 0.75}
                    x2={x + width - 7.5}
                    y2={y + height * 0.75}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                    pointerEvents="none"
                  />
                </>
              )}

              {/* Table number */}
              <text
                x={x + width / 2}
                y={y + height / 2 - 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                pointerEvents="none"
              >
                {table.number}
              </text>

              {/* Capacity */}
              <text
                x={x + width / 2}
                y={y + height / 2 + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="7"
                pointerEvents="none"
              >
                {table.capacity}p
              </text>

              {/* Order count badge */}
              {orderCount > 0 && (
                <>
                  <circle
                    cx={x + width - 6}
                    cy={y + 6}
                    r="6"
                    fill="white"
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={x + width - 6}
                    y={y + 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#374151"
                    fontSize="8"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {orderCount}
                  </text>
                </>
              )}

              {/* Revenue badge */}
              {revenue > 0 && (
                <>
                  <rect
                    x={x - 3}
                    y={y + height - 10}
                    width="24"
                    height="10"
                    rx="5"
                    fill="white"
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={x + 9}
                    y={y + height - 5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#374151"
                    fontSize="7"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    ${revenue.toFixed(0)}
                  </text>
                </>
              )}

              {/* Urgent indicator */}
              {isUrgent && (
                <rect
                  x={x - 2}
                  y={y - 2}
                  width={width + 4}
                  height={height + 4}
                  rx={layoutTable.shape === "round" ? (width + 4) / 2 : 2}
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  className="animate-pulse pointer-events-none"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, loading, error, refreshOrders } = useOrders();

  // State for tables and table view
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableOrders, setShowTableOrders] = useState(false);
  const [showMergeBillsModal, setShowMergeBillsModal] = useState(false);

  // State for locations and layouts
  const [locations, setLocations] = useState<Location[]>([]);
  const [layouts, setLayouts] = useState<TableLayout[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [locationsLoading, setLocationsLoading] = useState(true);

  // Load tables, locations, and layouts on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setTablesLoading(true);
        setLocationsLoading(true);

        // Load tables, locations, and layouts in parallel
        const [tablesResponse, locationsResponse, layoutsResponse] =
          await Promise.all([
            api.getTables(),
            api.getLocations(),
            api.getTableLayouts(),
          ]);

        setTables(tablesResponse.tables);
        setLocations(locationsResponse.locations.filter((loc) => loc.isActive));
        setLayouts(layoutsResponse.layouts);

        // Set the first location as selected by default
        if (locationsResponse.locations.length > 0) {
          setSelectedLocationId(locationsResponse.locations[0].id);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setTablesLoading(false);
        setLocationsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get orders for a specific table
  const getTableOrders = useCallback(
    (tableId: string) => {
      // Debug: Log all orders and their sources for this table
      const tableOrdersDebug = orders.filter((order) => {
        const table = tables.find((t) => t.id === tableId);
        return table && order.tableNumber === table.id;
      });
      console.log(
        `🏠 Table ${tableId} orders before filtering:`,
        tableOrdersDebug.map((o) => ({
          id: o.id,
          source: o.orderSource,
          status: o.status,
        }))
      );

      return orders.filter((order) => {
        // Find the table to get its number
        const table = tables.find((t) => t.id === tableId);
        if (!table) return false;

        // Handle both QR orders (tableNumber contains "10") and Waiter/Cashier orders (tableNumber contains tableId)
        const isQROrder = order.orderSource === "QR_ORDERING";

        let matches = false;
        if (isQROrder) {
          // QR orders: match order.tableNumber (tableId) with table.id
          matches = order.tableNumber === table.id;
        } else {
          // Waiter/Cashier orders: match order.tableNumber (tableId) with table.id
          matches = order.tableNumber === table.id;
        }

        // Check if order is visible
        const isVisible = filterVisibleOrders([order]).length > 0;

        // Special debugging for split orders
        if (order.orderSource === "SPLIT") {
          console.log("🚨 SPLIT ORDER DEBUG:", {
            orderId: order.id,
            orderSource: order.orderSource,
            status: order.status,
            paymentStatus: order.paymentStatus,
            tableNumber: order.tableNumber,
            tableId: table.id,
            matches,
            isVisible,
            finalResult: matches && isVisible,
          });
        }

        // Debug logging for specific order
        if (order.id === "order_1754592610791_m9q5i") {
          console.log("🎯 ORDER DEBUG:", {
            table: table.number,
            orderId: order.id,
            orderTableNumber: order.tableNumber,
            orderSource: order.orderSource,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus,
            matches,
            isVisible,
            finalResult: matches && isVisible,
          });
        }

        return matches && isVisible;
      });
    },
    [orders, tables]
  );

  // Get table status based on orders
  const getTableStatus = useCallback(
    (table: Table) => {
      const tableOrders = getTableOrders(table.id);
      if (tableOrders.length > 0) {
        return "occupied";
      }
      return table.status;
    },
    [getTableOrders]
  );

  // Get table revenue
  const getTableRevenue = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    return tableOrders.reduce((sum, order) => {
      const orderTotal =
        order.totalAmount ||
        order.finalAmount ||
        order.total ||
        order.items.reduce((itemSum, item) => itemSum + (item.total || 0), 0);
      return sum + orderTotal;
    }, 0);
  };

  // Get table order count
  const getTableOrderCount = (tableId: string) => {
    return getTableOrders(tableId).length;
  };

  // Get table wait time (average of all orders)
  const getTableWaitTime = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    if (tableOrders.length === 0) return 0;

    const totalWaitTime = tableOrders.reduce((sum, order) => {
      const waitTime = Math.floor(
        (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
      );
      return sum + waitTime;
    }, 0);

    return Math.round(totalWaitTime / tableOrders.length);
  };

  // Check if table has urgent orders
  const isTableUrgent = (tableId: string) => {
    const tableOrders = getTableOrders(tableId);
    return tableOrders.some((order) => {
      const waitTime = Math.floor(
        (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
      );
      return waitTime > 20;
    });
  };

  // Get current location
  const currentLocation = useMemo(() => {
    return locations.find((loc) => loc.id === selectedLocationId);
  }, [locations, selectedLocationId]);

  // Get layout for current location
  const currentLayout = useMemo(() => {
    if (!currentLocation) return null;
    return layouts.find(
      (layout) => layout.locationId === currentLocation.id && layout.isActive
    );
  }, [layouts, currentLocation]);

  // Get tables for current location
  const currentLocationTables = useMemo(() => {
    if (!currentLocation) return [];
    return tables.filter((table) => table.locationId === currentLocation.id);
  }, [tables, currentLocation]);

  // Get table status color
  const getTableStatusColor = (table: Table) => {
    const status = getTableStatus(table);
    const isUrgent = isTableUrgent(table.id);

    if (isUrgent) return "bg-red-500";
    if (status === "occupied") return "bg-orange-500";
    if (status === "reserved") return "bg-purple-500";
    return "bg-green-500";
  };

  // Get table shape based on capacity
  const getTableShape = (capacity: number) => {
    if (capacity <= 2) return "rounded-full"; // Circle for 2-seater
    if (capacity <= 4) return "rounded-lg"; // Square for 4-seater
    return "rounded-lg"; // Rectangle for larger tables
  };

  // Handle table click
  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setShowTableOrders(true);
  };

  // Handle order status change
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      // Update order status in the backend
      await api.updateOrderStatus(
        orderId,
        status as "active" | "closed" | "cancelled" | "merged"
      );
      await refreshOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  if (loading || tablesLoading || locationsLoading) {
    return <PageLoader message="Loading restaurant data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="p-4 rounded-full bg-red-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshOrders}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If showing table orders, render the table orders view
  if (showTableOrders && selectedTable) {
    const tableOrders = getTableOrders(selectedTable.id);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <TableOrdersView
          table={selectedTable}
          orders={tableOrders}
          onBack={() => {
            setShowTableOrders(false);
            setSelectedTable(null);
          }}
          onRefresh={refreshOrders}
          onStatusChange={handleOrderStatusChange}
          tables={tables}
        />
      </div>
    );
  }

  // Main layout view with location tabs
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
          {/* Location Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocationId(location.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium text-sm transition-colors min-w-max ${
                  selectedLocationId === location.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <MapPin className="h-3 w-3" />
                {location.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto">
            {/* Compact Status Legend */}
            <div className="bg-white rounded-lg border border-gray-200 px-2 md:px-4 py-2 shadow-sm min-w-max">
              <div className="flex items-center gap-2 md:gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Free</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Occupied</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">Urgent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Reserved</span>
                </div>
              </div>
            </div>
            <button
              onClick={refreshOrders}
              className="bg-gray-900 hover:bg-gray-800 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors min-w-max"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Global Merge Bills Button */}
            <button
              onClick={() => setShowMergeBillsModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center gap-2 md:gap-3 font-semibold text-sm md:text-base transition-colors shadow-lg min-w-max"
            >
              <Users className="h-5 w-5" />
              <span>Merge Bills</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {locations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center shadow-sm">
            <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Locations Found
            </h3>
            <p className="text-gray-600">
              No locations have been configured yet.
            </p>
          </div>
        ) : currentLocation ? (
          <div className="bg-white h-full">
            {/* Layout Display - Full Height */}
            <div className="h-full pt-8 px-4 pb-4">
              {currentLayout ? (
                <div className="bg-gray-50 h-full rounded-lg border border-gray-200 overflow-hidden">
                  <LocationLayoutView
                    layout={currentLayout}
                    tables={currentLocationTables}
                    onTableClick={handleTableClick}
                    getTableStatus={getTableStatus}
                    getTableOrderCount={getTableOrderCount}
                    getTableRevenue={getTableRevenue}
                    isTableUrgent={isTableUrgent}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="text-center py-4">
                    <div className="p-3 rounded-full bg-gray-100 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      No Layout Available
                    </h3>
                    <p className="text-gray-600 mb-3 text-sm">
                      No layout has been created for this location yet.
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentLocationTables.map((table) => {
                        const orderCount = getTableOrderCount(table.id);
                        const revenue = getTableRevenue(table.id);
                        const waitTime = getTableWaitTime(table.id);
                        const statusColor = getTableStatusColor(table);
                        const tableShape = getTableShape(table.capacity);

                        return (
                          <div
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            className={`${statusColor} ${tableShape} text-white cursor-pointer transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg min-w-[60px] min-h-[60px] flex flex-col items-center justify-center p-2 relative group`}
                          >
                            {/* Table Number */}
                            <div className="text-center">
                              <div className="font-bold text-sm">
                                {table.number}
                              </div>
                              <div className="text-xs opacity-90">
                                {table.capacity}p
                              </div>
                            </div>

                            {/* Order Info Overlay */}
                            {orderCount > 0 && (
                              <div className="absolute -top-1 -right-1 bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                                {orderCount}
                              </div>
                            )}

                            {/* Revenue Badge */}
                            {revenue > 0 && (
                              <div className="absolute -bottom-1 -left-1 bg-white text-gray-900 rounded-full px-1 py-0.5 text-xs font-bold shadow-md">
                                ${revenue.toFixed(0)}
                              </div>
                            )}

                            {/* Urgent Indicator */}
                            {isTableUrgent(table.id) && (
                              <div className="absolute inset-0 border-2 border-white border-dashed animate-pulse rounded-full"></div>
                            )}

                            {/* Hover Info */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                              <div>Wait: {waitTime}min</div>
                              <div>Orders: {orderCount}</div>
                              <div>Revenue: ${revenue.toFixed(2)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Merge Bills Modal */}
      <MergeBillsModal
        isOpen={showMergeBillsModal}
        onClose={() => {
          setShowMergeBillsModal(false);
        }}
        onMergeComplete={() => {
          refreshOrders();
          setShowMergeBillsModal(false);
        }}
      />
    </div>
  );
}
