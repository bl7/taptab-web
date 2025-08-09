"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the LayoutCanvas component to avoid SSR issues with Konva
const LayoutCanvasComponent = dynamic(
  () => import("./LayoutCanvas").then((mod) => ({ default: mod.LayoutCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 bg-gray-100 flex items-center justify-center text-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading Canvas...</p>
        </div>
      </div>
    ),
  }
);

interface KonvaStageProps {
  width: number;
  height: number;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export function KonvaStage(props: KonvaStageProps) {
  return <LayoutCanvasComponent {...props} />;
}
