import React, { useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Text,
  Transformer,
} from "react-konva";
import Konva from "konva";
import { useLayoutStore } from "@/lib/layout-store";
import { LayoutObject, CANVAS_CONFIG } from "@/types/layout";

interface LayoutCanvasProps {
  width: number;
  height: number;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export function LayoutCanvas({
  width,
  height,
  onDrop,
  onDragOver,
}: LayoutCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const {
    objects,
    selectedObjectId,
    zoom,
    panX,
    panY,
    selectObject,
    updateObject,
    setZoom,
    setPan,
  } = useLayoutStore();

  // Handle wheel zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    const clampedScale = Math.max(
      CANVAS_CONFIG.MIN_ZOOM,
      Math.min(CANVAS_CONFIG.MAX_ZOOM, newScale)
    );

    // Get mouse position relative to stage
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    setZoom(clampedScale);
    setPan(newPos.x, newPos.y);
  };

  // Handle stage drag (panning)
  const handleStageDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
    const newPos = e.target.position();
    setPan(newPos.x, newPos.y);
  };

  // Handle object selection
  const handleObjectClick = (
    e: Konva.KonvaEventObject<MouseEvent>,
    objectId: string
  ) => {
    e.cancelBubble = true;
    selectObject(objectId);
  };

  // Handle stage click (deselect)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectObject(null);
    }
  };

  // Handle object transform
  const handleObjectTransform = (objectId: string, node: Konva.Node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    updateObject(objectId, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });

    // Reset scale to 1 to prevent cumulative scaling
    node.scaleX(1);
    node.scaleY(1);
  };

  // Update transformer when selection changes
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;

    if (!transformer || !stage) return;

    if (selectedObjectId) {
      const selectedNode = stage.findOne(`.object-${selectedObjectId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode]);
        transformer.getLayer()?.batchDraw();
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedObjectId]);

  // Generate grid lines
  const generateGrid = () => {
    const lines = [];
    const gridSize = CANVAS_CONFIG.GRID_SIZE;
    const padding = gridSize * 10; // Extra grid area around visible canvas

    // Calculate grid bounds based on current pan and zoom
    const stageWidth = width / zoom + padding * 2;
    const stageHeight = height / zoom + padding * 2;
    const startX = Math.floor((-panX / zoom - padding) / gridSize) * gridSize;
    const startY = Math.floor((-panY / zoom - padding) / gridSize) * gridSize;

    // Vertical lines
    for (let x = startX; x < startX + stageWidth; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, startY, x, startY + stageHeight]}
          stroke="#e5e7eb"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let y = startY; y < startY + stageHeight; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[startX, y, startX + stageWidth, y]}
          stroke="#e5e7eb"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }

    return lines;
  };

  // Render object based on type
  const renderObject = (obj: LayoutObject) => {
    const isSelected = obj.id === selectedObjectId;
    const baseProps = {
      x: obj.x,
      y: obj.y,
      rotation: obj.rotation,
      fill: obj.color,
      stroke: isSelected ? "#3b82f6" : "#374151",
      strokeWidth: isSelected ? 3 : 1,
      name: `object-${obj.id}`,
      draggable: true,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) =>
        handleObjectClick(e, obj.id),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        updateObject(obj.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      },
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
        handleObjectTransform(obj.id, e.target);
      },
    };

    switch (obj.type) {
      case "round_table":
      case "existing_table":
        return (
          <React.Fragment key={obj.id}>
            <Circle
              {...baseProps}
              radius={Math.min(obj.width, obj.height) / 2}
            />
            <Text
              x={obj.x - 15}
              y={obj.y - 8}
              text={obj.seats ? obj.seats.toString() : ""}
              fontSize={16}
              fill="#ffffff"
              listening={false}
            />
          </React.Fragment>
        );

      case "square_table":
      case "rectangle_table":
      case "door":
      case "bar":
      case "plant":
      case "piano":
      case "prep_center":
      case "host_table":
      case "waiter_station":
      case "storage_cabinet":
        return (
          <React.Fragment key={obj.id}>
            <Rect
              {...baseProps}
              width={obj.width}
              height={obj.height}
              offsetX={obj.width / 2}
              offsetY={obj.height / 2}
            />
            {(obj.type === "square_table" ||
              obj.type === "rectangle_table" ||
              obj.type === "host_table") &&
              obj.seats && (
                <Text
                  x={obj.x - 10}
                  y={obj.y - 8}
                  text={obj.seats.toString()}
                  fontSize={16}
                  fill="#ffffff"
                  listening={false}
                />
              )}
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="flex-1 bg-gray-100 text-black relative"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={zoom}
        scaleY={zoom}
        x={panX}
        y={panY}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleStageDrag}
        onClick={handleStageClick}
      >
        {/* Grid Layer */}
        <Layer listening={false}>{generateGrid()}</Layer>

        {/* Objects Layer */}
        <Layer>
          {objects.map(renderObject)}

          {/* Transformer for selected objects */}
          <Transformer
            ref={transformerRef}
            resizeEnabled={true}
            rotateEnabled={true}
            borderStroke="#3b82f6"
            borderStrokeWidth={2}
            anchorStroke="#3b82f6"
            anchorStrokeWidth={2}
            anchorFill="#ffffff"
            anchorSize={8}
          />
        </Layer>
      </Stage>

      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <div className="text-xs text-black">
          Zoom: {Math.round(zoom * 100)}%
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setZoom(zoom + CANVAS_CONFIG.ZOOM_STEP)}
            disabled={zoom >= CANVAS_CONFIG.MAX_ZOOM}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded"
          >
            Zoom In
          </button>
          <button
            onClick={() => setZoom(zoom - CANVAS_CONFIG.ZOOM_STEP)}
            disabled={zoom <= CANVAS_CONFIG.MIN_ZOOM}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded"
          >
            Zoom Out
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan(0, 0);
              if (stageRef.current) {
                stageRef.current.position({ x: 0, y: 0 });
                stageRef.current.scale({ x: 1, y: 1 });
              }
            }}
            className="px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <h4 className="text-sm font-medium text-black mb-2">Controls</h4>
        <div className="text-xs text-black space-y-1">
          <p>• Drag objects from the library to add them</p>
          <p>• Click objects to select and transform</p>
          <p>• Mouse wheel to zoom in/out</p>
          <p>• Drag empty space to pan</p>
          <p>• Use transformer handles to resize/rotate</p>
        </div>
      </div>
    </div>
  );
}
