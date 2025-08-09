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
            {/* Table shadow */}
            <Circle
              x={obj.x + 3}
              y={obj.y + 3}
              radius={Math.min(obj.width, obj.height) / 2}
              fill="rgba(0,0,0,0.2)"
              listening={false}
            />
            {/* Table base (pedestal) */}
            <Circle
              x={obj.x}
              y={obj.y}
              radius={Math.min(obj.width, obj.height) / 6}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth={1}
              listening={false}
            />
            {/* Table top */}
            <Circle
              {...baseProps}
              radius={Math.min(obj.width, obj.height) / 2}
              fill="#DEB887"
              stroke={isSelected ? "#3b82f6" : "#8B7355"}
              strokeWidth={isSelected ? 3 : 2}
            />
            {/* Wood grain lines */}
            <Circle
              x={obj.x}
              y={obj.y}
              radius={Math.min(obj.width, obj.height) / 2.5}
              fill="transparent"
              stroke="#CD853F"
              strokeWidth={1}
              listening={false}
            />
            <Circle
              x={obj.x}
              y={obj.y}
              radius={Math.min(obj.width, obj.height) / 4}
              fill="transparent"
              stroke="#CD853F"
              strokeWidth={1}
              listening={false}
            />
            {/* Seat count */}
            <Text
              x={obj.x - 8}
              y={obj.y - 8}
              text={obj.seats ? obj.seats.toString() : ""}
              fontSize={14}
              fill="#000000"
              fontStyle="bold"
              listening={false}
            />
          </React.Fragment>
        );

      case "square_table":
      case "rectangle_table":
        return (
          <React.Fragment key={obj.id}>
            {/* Table shadow */}
            <Rect
              x={obj.x - obj.width / 2 + 3}
              y={obj.y - obj.height / 2 + 3}
              width={obj.width}
              height={obj.height}
              fill="rgba(0,0,0,0.2)"
              cornerRadius={8}
              listening={false}
            />
            {/* Table legs (4 circles at corners) */}
            <Circle
              x={obj.x - obj.width / 2 + 10}
              y={obj.y - obj.height / 2 + 10}
              radius={3}
              fill="#654321"
              listening={false}
            />
            <Circle
              x={obj.x + obj.width / 2 - 10}
              y={obj.y - obj.height / 2 + 10}
              radius={3}
              fill="#654321"
              listening={false}
            />
            <Circle
              x={obj.x - obj.width / 2 + 10}
              y={obj.y + obj.height / 2 - 10}
              radius={3}
              fill="#654321"
              listening={false}
            />
            <Circle
              x={obj.x + obj.width / 2 - 10}
              y={obj.y + obj.height / 2 - 10}
              radius={3}
              fill="#654321"
              listening={false}
            />
            {/* Table top */}
            <Rect
              {...baseProps}
              width={obj.width}
              height={obj.height}
              offsetX={obj.width / 2}
              offsetY={obj.height / 2}
              fill="#DEB887"
              stroke={isSelected ? "#3b82f6" : "#8B7355"}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={8}
            />
            {/* Wood grain lines */}
            <Line
              points={[
                obj.x - obj.width / 2 + 15,
                obj.y - obj.height / 4,
                obj.x + obj.width / 2 - 15,
                obj.y - obj.height / 4,
              ]}
              stroke="#CD853F"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 2 + 15,
                obj.y,
                obj.x + obj.width / 2 - 15,
                obj.y,
              ]}
              stroke="#CD853F"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 2 + 15,
                obj.y + obj.height / 4,
                obj.x + obj.width / 2 - 15,
                obj.y + obj.height / 4,
              ]}
              stroke="#CD853F"
              strokeWidth={1}
              listening={false}
            />
            {/* Seat count */}
            {obj.seats && (
              <Text
                x={obj.x - 8}
                y={obj.y - 8}
                text={obj.seats.toString()}
                fontSize={14}
                fill="#000000"
                fontStyle="bold"
                listening={false}
              />
            )}
          </React.Fragment>
        );

      case "plant":
        return (
          <React.Fragment key={obj.id}>
            {/* Plant shadow */}
            <Circle
              x={obj.x + 2}
              y={obj.y + 2}
              radius={Math.min(obj.width, obj.height) / 2}
              fill="rgba(0,0,0,0.15)"
              listening={false}
            />
            {/* Pot rim */}
            <Circle
              x={obj.x}
              y={obj.y}
              radius={Math.min(obj.width, obj.height) / 2.2}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth={2}
              name={`object-${obj.id}`}
              draggable={true}
              onClick={(e: Konva.KonvaEventObject<MouseEvent>) =>
                handleObjectClick(e, obj.id)
              }
              onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
                updateObject(obj.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
            />
            {/* Soil */}
            <Circle
              x={obj.x}
              y={obj.y}
              radius={Math.min(obj.width, obj.height) / 2.5}
              fill="#4A2C2A"
              listening={false}
            />
            {/* Plant leaves - multiple layers for depth */}
            <Circle
              x={obj.x - obj.width * 0.15}
              y={obj.y - obj.height * 0.1}
              radius={obj.width * 0.12}
              fill="#228B22"
              listening={false}
            />
            <Circle
              x={obj.x + obj.width * 0.1}
              y={obj.y - obj.height * 0.15}
              radius={obj.width * 0.14}
              fill="#32CD32"
              listening={false}
            />
            <Circle
              x={obj.x - obj.width * 0.05}
              y={obj.y + obj.height * 0.05}
              radius={obj.width * 0.1}
              fill="#228B22"
              listening={false}
            />
            <Circle
              x={obj.x + obj.width * 0.15}
              y={obj.y + obj.height * 0.1}
              radius={obj.width * 0.08}
              fill="#32CD32"
              listening={false}
            />
            <Circle
              x={obj.x}
              y={obj.y - obj.height * 0.05}
              radius={obj.width * 0.16}
              fill="#228B22"
              listening={false}
            />
          </React.Fragment>
        );

      case "bar":
        return (
          <React.Fragment key={obj.id}>
            {/* Bar shadow */}
            <Rect
              x={obj.x - obj.width / 2 + 3}
              y={obj.y - obj.height / 2 + 3}
              width={obj.width}
              height={obj.height}
              fill="rgba(0,0,0,0.2)"
              cornerRadius={12}
              listening={false}
            />
            {/* Bar counter base */}
            <Rect
              {...baseProps}
              width={obj.width}
              height={obj.height}
              offsetX={obj.width / 2}
              offsetY={obj.height / 2}
              fill="#2F4F4F"
              stroke={isSelected ? "#3b82f6" : "#1C3333"}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={12}
            />
            {/* Bar top surface (marble/granite look) */}
            <Rect
              x={obj.x - obj.width / 2 + 5}
              y={obj.y - obj.height / 2 + 5}
              width={obj.width - 10}
              height={obj.height - 10}
              fill="#708090"
              cornerRadius={8}
              listening={false}
            />
            {/* Marble veining */}
            <Line
              points={[
                obj.x - obj.width / 3,
                obj.y - obj.height / 4,
                obj.x + obj.width / 4,
                obj.y + obj.height / 3,
              ]}
              stroke="#B8C6DB"
              strokeWidth={2}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 4,
                obj.y + obj.height / 4,
                obj.x + obj.width / 3,
                obj.y - obj.height / 3,
              ]}
              stroke="#B8C6DB"
              strokeWidth={1}
              listening={false}
            />
            {/* Bar stools with backs */}
            <Circle
              x={obj.x - obj.width * 0.3}
              y={obj.y - obj.height * 0.7}
              radius={8}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth={1}
              listening={false}
            />
            <Rect
              x={obj.x - obj.width * 0.3 - 3}
              y={obj.y - obj.height * 0.7 - 12}
              width={6}
              height={8}
              fill="#8B4513"
              cornerRadius={3}
              listening={false}
            />
            <Circle
              x={obj.x}
              y={obj.y - obj.height * 0.7}
              radius={8}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth={1}
              listening={false}
            />
            <Rect
              x={obj.x - 3}
              y={obj.y - obj.height * 0.7 - 12}
              width={6}
              height={8}
              fill="#8B4513"
              cornerRadius={3}
              listening={false}
            />
            <Circle
              x={obj.x + obj.width * 0.3}
              y={obj.y - obj.height * 0.7}
              radius={8}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth={1}
              listening={false}
            />
            <Rect
              x={obj.x + obj.width * 0.3 - 3}
              y={obj.y - obj.height * 0.7 - 12}
              width={6}
              height={8}
              fill="#8B4513"
              cornerRadius={3}
              listening={false}
            />
          </React.Fragment>
        );

      case "piano":
        return (
          <React.Fragment key={obj.id}>
            {/* Piano shadow */}
            <Rect
              x={obj.x - obj.width / 2 + 3}
              y={obj.y - obj.height / 2 + 3}
              width={obj.width}
              height={obj.height}
              fill="rgba(0,0,0,0.3)"
              cornerRadius={8}
              listening={false}
            />
            {/* Piano body */}
            <Rect
              {...baseProps}
              width={obj.width}
              height={obj.height}
              offsetX={obj.width / 2}
              offsetY={obj.height / 2}
              fill="#1C1C1C"
              stroke={isSelected ? "#3b82f6" : "#000000"}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={8}
            />
            {/* Piano legs */}
            <Rect
              x={obj.x - obj.width / 2 + 8}
              y={obj.y + obj.height / 2 - 5}
              width={4}
              height={10}
              fill="#0F0F0F"
              listening={false}
            />
            <Rect
              x={obj.x + obj.width / 2 - 12}
              y={obj.y + obj.height / 2 - 5}
              width={4}
              height={10}
              fill="#0F0F0F"
              listening={false}
            />
            <Rect
              x={obj.x - obj.width / 2 + 8}
              y={obj.y - obj.height / 2 - 5}
              width={4}
              height={10}
              fill="#0F0F0F"
              listening={false}
            />
            {/* Keyboard area */}
            <Rect
              x={obj.x - obj.width / 2 + 8}
              y={obj.y - obj.height / 2 + 8}
              width={obj.width - 16}
              height={obj.height * 0.4}
              fill="#FFFFFF"
              stroke="#CCCCCC"
              strokeWidth={1}
              cornerRadius={4}
              listening={false}
            />
            {/* White keys */}
            <Line
              points={[
                obj.x - obj.width / 2 + 20,
                obj.y - obj.height / 2 + 8,
                obj.x - obj.width / 2 + 20,
                obj.y - obj.height / 2 + 8 + obj.height * 0.4,
              ]}
              stroke="#DDDDDD"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 2 + 32,
                obj.y - obj.height / 2 + 8,
                obj.x - obj.width / 2 + 32,
                obj.y - obj.height / 2 + 8 + obj.height * 0.4,
              ]}
              stroke="#DDDDDD"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 2 + 44,
                obj.y - obj.height / 2 + 8,
                obj.x - obj.width / 2 + 44,
                obj.y - obj.height / 2 + 8 + obj.height * 0.4,
              ]}
              stroke="#DDDDDD"
              strokeWidth={1}
              listening={false}
            />
            {/* Black keys */}
            <Rect
              x={obj.x - obj.width / 2 + 15}
              y={obj.y - obj.height / 2 + 8}
              width={6}
              height={obj.height * 0.25}
              fill="#000000"
              listening={false}
            />
            <Rect
              x={obj.x - obj.width / 2 + 27}
              y={obj.y - obj.height / 2 + 8}
              width={6}
              height={obj.height * 0.25}
              fill="#000000"
              listening={false}
            />
            <Rect
              x={obj.x - obj.width / 2 + 39}
              y={obj.y - obj.height / 2 + 8}
              width={6}
              height={obj.height * 0.25}
              fill="#000000"
              listening={false}
            />
            {/* Music stand area */}
            <Rect
              x={obj.x - obj.width / 4}
              y={obj.y - obj.height / 2 + obj.height * 0.5}
              width={obj.width / 2}
              height={obj.height * 0.3}
              fill="transparent"
              stroke="#333333"
              strokeWidth={1}
              cornerRadius={4}
              listening={false}
            />
          </React.Fragment>
        );

      case "prep_center":
      case "host_table":
        return (
          <React.Fragment key={obj.id}>
            {/* Counter shadow */}
            <Rect
              x={obj.x - obj.width / 2 + 3}
              y={obj.y - obj.height / 2 + 3}
              width={obj.width}
              height={obj.height}
              fill="rgba(0,0,0,0.2)"
              cornerRadius={6}
              listening={false}
            />
            {/* Counter base */}
            <Rect
              {...baseProps}
              width={obj.width}
              height={obj.height}
              offsetX={obj.width / 2}
              offsetY={obj.height / 2}
              fill="#4A5568"
              stroke={isSelected ? "#3b82f6" : "#2D3748"}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={6}
            />
            {/* Stainless steel surface */}
            <Rect
              x={obj.x - obj.width / 2 + 3}
              y={obj.y - obj.height / 2 + 3}
              width={obj.width - 6}
              height={obj.height - 6}
              fill="#C0C0C0"
              cornerRadius={4}
              listening={false}
            />
            {/* Stainless steel grain lines */}
            <Line
              points={[
                obj.x - obj.width / 2 + 8,
                obj.y - obj.height / 4,
                obj.x + obj.width / 2 - 8,
                obj.y - obj.height / 4,
              ]}
              stroke="#A8A8A8"
              strokeWidth={0.5}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 2 + 8,
                obj.y,
                obj.x + obj.width / 2 - 8,
                obj.y,
              ]}
              stroke="#A8A8A8"
              strokeWidth={0.5}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 2 + 8,
                obj.y + obj.height / 4,
                obj.x + obj.width / 2 - 8,
                obj.y + obj.height / 4,
              ]}
              stroke="#A8A8A8"
              strokeWidth={0.5}
              listening={false}
            />
            {/* Equipment on surface */}
            <Circle
              x={obj.x - obj.width * 0.25}
              y={obj.y - obj.height * 0.2}
              radius={6}
              fill="#E2E8F0"
              stroke="#CBD5E0"
              strokeWidth={1}
              listening={false}
            />
            <Circle
              x={obj.x + obj.width * 0.25}
              y={obj.y + obj.height * 0.2}
              radius={6}
              fill="#E2E8F0"
              stroke="#CBD5E0"
              strokeWidth={1}
              listening={false}
            />
            <Rect
              x={obj.x - 12}
              y={obj.y - 6}
              width={24}
              height={12}
              fill="#F7FAFC"
              stroke="#E2E8F0"
              strokeWidth={1}
              cornerRadius={3}
              listening={false}
            />
            {obj.type === "host_table" && obj.seats && (
              <Text
                x={obj.x - 8}
                y={obj.y - 8}
                text={obj.seats.toString()}
                fontSize={14}
                fill="#000000"
                fontStyle="bold"
                listening={false}
              />
            )}
          </React.Fragment>
        );

      case "waiter_station":
        return (
          <React.Fragment key={obj.id}>
            {/* Station shadow */}
            <Rect
              x={obj.x - obj.width / 2 + 3}
              y={obj.y - obj.height / 2 + 3}
              width={obj.width}
              height={obj.height}
              fill="rgba(0,0,0,0.3)"
              cornerRadius={8}
              listening={false}
            />
            {/* Station base */}
            <Rect
              {...baseProps}
              width={obj.width}
              height={obj.height}
              offsetX={obj.width / 2}
              offsetY={obj.height / 2}
              fill="#2D3748"
              stroke={isSelected ? "#3b82f6" : "#1A202C"}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={8}
            />
            {/* Desktop surface */}
            <Rect
              x={obj.x - obj.width / 2 + 4}
              y={obj.y - obj.height / 2 + 4}
              width={obj.width - 8}
              height={obj.height - 8}
              fill="#4A5568"
              cornerRadius={6}
              listening={false}
            />
            {/* POS terminal base */}
            <Rect
              x={obj.x - obj.width * 0.35}
              y={obj.y - obj.height * 0.2}
              width={obj.width * 0.7}
              height={obj.height * 0.4}
              fill="#1A202C"
              stroke="#2D3748"
              strokeWidth={1}
              cornerRadius={6}
              listening={false}
            />
            {/* POS screen */}
            <Rect
              x={obj.x - obj.width * 0.3}
              y={obj.y - obj.height * 0.15}
              width={obj.width * 0.6}
              height={obj.height * 0.3}
              fill="#000000"
              stroke="#333333"
              strokeWidth={1}
              cornerRadius={4}
              listening={false}
            />
            {/* Screen bezel */}
            <Rect
              x={obj.x - obj.width * 0.25}
              y={obj.y - obj.height * 0.1}
              width={obj.width * 0.5}
              height={obj.height * 0.2}
              fill="#1a1a2e"
              cornerRadius={2}
              listening={false}
            />
            {/* Stand/arm */}
            <Rect
              x={obj.x - 2}
              y={obj.y + obj.height * 0.15}
              width={4}
              height={obj.height * 0.25}
              fill="#2D3748"
              listening={false}
            />
            {/* Keyboard area */}
            <Rect
              x={obj.x - obj.width * 0.2}
              y={obj.y + obj.height * 0.25}
              width={obj.width * 0.4}
              height={obj.height * 0.15}
              fill="#2D3748"
              stroke="#4A5568"
              strokeWidth={1}
              cornerRadius={3}
              listening={false}
            />
          </React.Fragment>
        );

      case "storage_cabinet":
        return (
          <React.Fragment key={obj.id}>
            {/* Cabinet shadow */}
            <Rect
              x={obj.x - obj.width / 2 + 3}
              y={obj.y - obj.height / 2 + 3}
              width={obj.width}
              height={obj.height}
              fill="rgba(0,0,0,0.2)"
              cornerRadius={6}
              listening={false}
            />
            {/* Cabinet body */}
            <Rect
              {...baseProps}
              width={obj.width}
              height={obj.height}
              offsetX={obj.width / 2}
              offsetY={obj.height / 2}
              fill="#8B7355"
              stroke={isSelected ? "#3b82f6" : "#6B5B47"}
              strokeWidth={isSelected ? 3 : 2}
              cornerRadius={6}
            />
            {/* Wood grain texture */}
            <Line
              points={[
                obj.x - obj.width / 2 + 8,
                obj.y - obj.height / 3,
                obj.x + obj.width / 2 - 8,
                obj.y - obj.height / 3,
              ]}
              stroke="#6B5B47"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 2 + 8,
                obj.y,
                obj.x + obj.width / 2 - 8,
                obj.y,
              ]}
              stroke="#6B5B47"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[
                obj.x - obj.width / 2 + 8,
                obj.y + obj.height / 3,
                obj.x + obj.width / 2 - 8,
                obj.y + obj.height / 3,
              ]}
              stroke="#6B5B47"
              strokeWidth={1}
              listening={false}
            />
            {/* Cabinet door dividing line */}
            <Line
              points={[
                obj.x,
                obj.y - obj.height / 2 + 4,
                obj.x,
                obj.y + obj.height / 2 - 4,
              ]}
              stroke="#5A4A3A"
              strokeWidth={2}
              listening={false}
            />
            {/* Door panels */}
            <Rect
              x={obj.x - obj.width / 2 + 6}
              y={obj.y - obj.height / 2 + 6}
              width={obj.width / 2 - 9}
              height={obj.height - 12}
              fill="transparent"
              stroke="#6B5B47"
              strokeWidth={1}
              cornerRadius={3}
              listening={false}
            />
            <Rect
              x={obj.x + 3}
              y={obj.y - obj.height / 2 + 6}
              width={obj.width / 2 - 9}
              height={obj.height - 12}
              fill="transparent"
              stroke="#6B5B47"
              strokeWidth={1}
              cornerRadius={3}
              listening={false}
            />
            {/* Door handles */}
            <Circle
              x={obj.x - obj.width * 0.15}
              y={obj.y}
              radius={3}
              fill="#C0C0C0"
              stroke="#A0A0A0"
              strokeWidth={1}
              listening={false}
            />
            <Circle
              x={obj.x + obj.width * 0.15}
              y={obj.y}
              radius={3}
              fill="#C0C0C0"
              stroke="#A0A0A0"
              strokeWidth={1}
              listening={false}
            />
            {/* Hinges */}
            <Rect
              x={obj.x - obj.width / 2 + 2}
              y={obj.y - obj.height / 3}
              width={4}
              height={8}
              fill="#A0A0A0"
              cornerRadius={2}
              listening={false}
            />
            <Rect
              x={obj.x - obj.width / 2 + 2}
              y={obj.y + obj.height / 4}
              width={4}
              height={8}
              fill="#A0A0A0"
              cornerRadius={2}
              listening={false}
            />
          </React.Fragment>
        );

      case "door":
        return (
          <React.Fragment key={obj.id}>
            {/* Door frame/opening */}
            <Rect
              x={obj.x - obj.width / 2}
              y={obj.y - obj.height / 2}
              width={obj.width}
              height={obj.height}
              fill="transparent"
              stroke={isSelected ? "#3b82f6" : "#654321"}
              strokeWidth={isSelected ? 3 : 2}
              name={`object-${obj.id}`}
              draggable={true}
              onClick={(e: Konva.KonvaEventObject<MouseEvent>) =>
                handleObjectClick(e, obj.id)
              }
              onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
                updateObject(obj.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
              onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
                handleObjectTransform(obj.id, e.target);
              }}
            />

            {/* Door opening/gap */}
            <Rect
              x={obj.x - obj.width / 2 + 3}
              y={obj.y - obj.height / 2 + 3}
              width={obj.width - 6}
              height={obj.height - 6}
              fill="#FFFFFF"
              stroke="#E5E7EB"
              strokeWidth={1}
              listening={false}
            />

            {/* Actual door (partially open at 45 degrees) */}
            <Rect
              x={obj.x - obj.width / 2}
              y={obj.y - obj.height / 2}
              width={obj.width * 0.8}
              height={8}
              fill="#8B4513"
              stroke="#654321"
              strokeWidth={1}
              cornerRadius={4}
              rotation={45}
              offsetX={0}
              offsetY={4}
              listening={false}
            />

            {/* Door panels on the opened door */}
            <Rect
              x={obj.x - obj.width / 2 + obj.width * 0.1}
              y={obj.y - obj.height / 2 - 2}
              width={obj.width * 0.25}
              height={4}
              fill="transparent"
              stroke="#654321"
              strokeWidth={0.5}
              rotation={45}
              offsetX={0}
              offsetY={2}
              listening={false}
            />
            <Rect
              x={obj.x - obj.width / 2 + obj.width * 0.45}
              y={obj.y - obj.height / 2 - 2}
              width={obj.width * 0.25}
              height={4}
              fill="transparent"
              stroke="#654321"
              strokeWidth={0.5}
              rotation={45}
              offsetX={0}
              offsetY={2}
              listening={false}
            />

            {/* Door handle */}
            <Circle
              x={obj.x - obj.width / 2 + obj.width * 0.6}
              y={obj.y - obj.height / 2 + 4}
              radius={2}
              fill="#FFD700"
              rotation={45}
              listening={false}
            />

            {/* Door swing arc (showing the path the door takes) */}
            <Line
              points={[
                obj.x - obj.width / 2,
                obj.y - obj.height / 2,
                obj.x - obj.width / 2 + obj.width * 0.7,
                obj.y - obj.height / 2 + obj.width * 0.7,
              ]}
              stroke="#CCCCCC"
              strokeWidth={1}
              dash={[3, 3]}
              listening={false}
            />

            {/* Hinge point */}
            <Circle
              x={obj.x - obj.width / 2}
              y={obj.y - obj.height / 2}
              radius={3}
              fill="#C0C0C0"
              stroke="#808080"
              strokeWidth={1}
              listening={false}
            />
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
