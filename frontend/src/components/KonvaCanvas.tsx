<<<<<<< HEAD
//KonvaCanvas.tsx

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from "react-konva";
=======
// src/components/KonvaCanvas.tsx

import { useEffect, useRef, useState, useMemo } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text, Transformer, Line, Group } from "react-konva";
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
import Konva from "konva";
import { CertificateElement } from "../types/certificate";

interface KonvaCanvasProps {
<<<<<<< HEAD
  width: number;
  height: number;
  elements: CertificateElement[];
  onElementSelect?: (id: string | null) => void;
  onElementUpdate?: (id: string, updates: Partial<CertificateElement>) => void;
}

interface ImageElement {
  id: string;
  image: HTMLImageElement;
  element: CertificateElement;
}

export default function KonvaCanvas({
  width,
  height,
  elements,
  onElementSelect,
  onElementUpdate,
}: KonvaCanvasProps) {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedShapeRef = useRef<Konva.Node | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const imageElements = elements.filter((el) => el.imageUrl);
      const loadedImages: ImageElement[] = [];

      for (const element of imageElements) {
        if (element.imageUrl) {
          try {
            const img = new window.Image();
            img.crossOrigin = "anonymous";

            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject();
              img.src = element.imageUrl!;
            });

            loadedImages.push({
              id: element.id,
              image: img,
              element,
            });
          } catch (error) {
            console.error(`Failed to load image for element ${element.id}:`, error);
          }
        }
      }

      setImages(loadedImages);
    };

    loadImages();
  }, [elements]);

  useEffect(() => {
    if (transformerRef.current && selectedShapeRef.current) {
      transformerRef.current.nodes([selectedShapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onElementSelect?.(id);
  };

  const handleDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      onElementSelect?.(null);
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, elementId: string) => {
    onElementUpdate?.(elementId, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, elementId: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onElementUpdate?.(elementId, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    });
  };

  const handleTextChange = (elementId: string, newText: string) => {
    onElementUpdate?.(elementId, {
      content: newText,
    });
  };

  const sortedElements = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const textElements = sortedElements.filter((el) => el.type === "text" || el.type === "signature");

  return (
    <div className="shadow-lg border border-slate-300">
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onMouseDown={handleDeselect}
        onTouchStart={handleDeselect}
        style={{ backgroundColor: "#ffffff" }}
      >
        <Layer>
          {images.map((img) => {
            const isSelected = selectedId === img.id;
            const scaleX = img.element.width ? img.element.width / img.image.width : 1;
            const scaleY = img.element.height ? img.element.height / img.image.height : 1;

            return (
              <KonvaImage
                key={img.id}
                image={img.image}
                x={img.element.x}
                y={img.element.y}
                scaleX={scaleX}
                scaleY={scaleY}
                opacity={img.element.opacity ?? 1}
                draggable
                onClick={() => handleSelect(img.id)}
                onTap={() => handleSelect(img.id)}
                onDragEnd={(e) => handleDragEnd(e, img.id)}
                onTransformEnd={(e) => handleTransformEnd(e, img.id)}
                ref={(node) => {
                  if (isSelected) {
                    selectedShapeRef.current = node;
                  }
                }}
              />
            );
          })}

          {textElements.map((element) => {
            const isSelected = selectedId === element.id;
            const textAlign = element.textAlign === "center" ? "center" : element.textAlign === "right" ? "right" : "left";

            return (
              <Text
                key={element.id}
                text={element.content || ""}
                x={element.x - (element.width ?? 200) / 2}
                y={element.y}
                width={element.width ?? 200}
                fontSize={element.fontSize ?? 16}
                fontFamily={element.fontFamily ?? "Arial"}
                fill={element.color ?? "#000000"}
                fontStyle={element.fontWeight === "bold" ? "bold" : "normal"}
                align={textAlign}
                draggable
                onClick={() => handleSelect(element.id)}
                onTap={() => handleSelect(element.id)}
                onDragEnd={(e) => handleDragEnd(e, element.id)}
                onTransformEnd={(e) => handleTransformEnd(e, element.id)}
                onDblClick={(e) => {
                  const textNode = e.target as Konva.Text;
                  const stage = textNode.getStage();
                  if (!stage) return;

                  textNode.hide();
                  const textarea = document.createElement("textarea");
                  document.body.appendChild(textarea);

                  const textPosition = textNode.getClientRect();
                  const stageBox = stage.container().getBoundingClientRect();
                  const areaPosition = {
                    x: stageBox.left + textPosition.x,
                    y: stageBox.top + textPosition.y,
                  };

                  textarea.value = textNode.text();
                  textarea.style.position = "absolute";
                  textarea.style.top = areaPosition.y + "px";
                  textarea.style.left = areaPosition.x + "px";
                  textarea.style.width = textNode.width() - (textNode.padding() * 2) + "px";
                  textarea.style.fontSize = textNode.fontSize() + "px";
                  textarea.style.border = "none";
                  textarea.style.padding = "0px";
                  textarea.style.margin = "0px";
                  textarea.style.overflow = "hidden";
                  textarea.style.background = "none";
                  textarea.style.outline = "none";
                  textarea.style.resize = "none";
                  textarea.style.lineHeight = textNode.lineHeight().toString();
                  textarea.style.fontFamily = textNode.fontFamily();
                  textarea.style.transformOrigin = "left top";
                  textarea.style.textAlign = textNode.align();
                  textarea.style.color = String(textNode.fill());

                  textarea.focus();

                  textarea.addEventListener("keydown", (e) => {
                    if (e.key === "Escape") {
                      textNode.show();
                      document.body.removeChild(textarea);
                    }
                  });

                  textarea.addEventListener("blur", () => {
                    handleTextChange(element.id, textarea.value);
                    textNode.show();
                    document.body.removeChild(textarea);
                  });
                }}
                ref={(node) => {
                  if (isSelected) {
                    selectedShapeRef.current = node;
                  }
                }}
              />
            );
          })}

          {selectedId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
=======
	width: number;
	height: number;
	elements: CertificateElement[];
	onElementSelect?: (id: string | null) => void;
	onElementUpdate?: (id: string, updates: Partial<CertificateElement>) => void;
	onElementFinalUpdate?: (id: string, updates: Partial<CertificateElement>) => void;
	onImagesLoaded?: () => void;
	isEditable?: boolean;
	isAddingText?: boolean;
	onPlaceAt?: (pos: { x: number; y: number }) => void;
	onCancelAddMode?: () => void;
}

interface ImageElement {
	id: string;
	image: HTMLImageElement;
	element: CertificateElement;
}

interface SnapGuide {
	points: number[];
	orientation: 'vertical' | 'horizontal';
}

export default function KonvaCanvas({
	width,
	height,
	elements,
	onElementSelect,
	onElementUpdate,
	onElementFinalUpdate,
	onImagesLoaded,
	isEditable = true,
	isAddingText = false,
	onPlaceAt,
}: KonvaCanvasProps) {
	const [images, setImages] = useState<ImageElement[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [guides, setGuides] = useState<SnapGuide[]>([]);

	// Text Editing State
	const [editingId, setEditingId] = useState<string | null>(null);
	const [textEditValue, setTextEditValue] = useState("");
	const [textEditStyle, setTextEditStyle] = useState<React.CSSProperties>({});
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const stageRef = useRef<Konva.Stage>(null);
	const itemsRef = useRef<Record<string, Konva.Node>>({});

	// --- Load Images ---
	useEffect(() => {
		const loadImages = async () => {
			const imageElements = elements.filter(
				// ⭐️ UPDATED: Added 'qrCode' to the list of elements that load images
				(el) =>
					(el.type === "image" || el.type === "background" || el.type === "cornerFrame" || el.type === "qrCode") &&
					el.imageUrl
			);

			const loadedImages: ImageElement[] = [];

			for (const element of imageElements) {
				try {
					const img = new window.Image();
					const src = element.imageUrl!;
					img.crossOrigin = 'anonymous';

					await new Promise<void>((resolve) => {
						img.onload = () => resolve();
						img.onerror = () => resolve();
						img.src = src;
					});

					if (img.width > 0) {
						loadedImages.push({ id: element.id, image: img, element });
					}
				} catch (err) {
					console.error(`Error loading image ${element.id}:`, err);
				}
			}
			setImages(loadedImages);
			onImagesLoaded?.();
		};
		loadImages();
	}, [elements, onImagesLoaded]);

	// --- 🟢 FIX: Multi-Node Selection for Corners ---
	const activeSelectionIds = useMemo(() => {
		if (!selectedId || editingId) return [];
		const activeEl = elements.find(el => el.id === selectedId);
		if (!activeEl) return [];

		// If a corner frame is selected, we return 4 pseudo-IDs (one for each corner)
		// This tells Konva to render 4 separate Transformers.
		if (activeEl.type === 'cornerFrame') {
			return [`${activeEl.id}_0`, `${activeEl.id}_1`, `${activeEl.id}_2`, `${activeEl.id}_3`];
		}

		return [selectedId];
	}, [selectedId, editingId, elements]);

	// --- Cursor Style ---
	useEffect(() => {
		const stage = stageRef.current;
		if (!stage) return;
		const container = stage.container();
		if (isAddingText) container.style.cursor = "crosshair";
		else container.style.cursor = "default";
	}, [isAddingText]);

	const handleSelect = (id: string) => {
		if (!isEditable || isAddingText) return;
		setSelectedId(id);
		onElementSelect?.(id);
	};

	const handleDeselect = () => {
		setSelectedId(null);
		setEditingId(null);
		onElementSelect?.(null);
	};

	const handleStageMouseDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
		if (!isEditable) return;
		const stage = stageRef.current;
		if (!stage) return;

		if (isAddingText) {
			const pointer = stage.getPointerPosition();
			if (pointer && onPlaceAt) {
				onPlaceAt({ x: pointer.x, y: pointer.y });
			}
			return;
		}

		if (e.target === stage) {
			handleDeselect();
		}
	};

	// --- Snapping & Dragging ---
	const SNAP_THRESHOLD = 10;
	const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
		if (!isEditable) return;
		const node = e.target;
		const stage = node.getStage();
		if (!stage) return;

		const box = node.getClientRect({ relativeTo: node.getParent() });

		const nodeCenterX = box.x + box.width / 2;
		const nodeCenterY = box.y + box.height / 2;
		const stageCenterX = stage.width() / 2;
		const stageCenterY = stage.height() / 2;

		const newGuides: SnapGuide[] = [];
		let absX = box.x;
		let absY = box.y;

		if (Math.abs(nodeCenterX - stageCenterX) < SNAP_THRESHOLD) {
			const delta = stageCenterX - nodeCenterX;
			absX += delta;
			newGuides.push({ orientation: 'vertical', points: [stageCenterX, 0, stageCenterX, stage.height()] });
		}

		if (Math.abs(nodeCenterY - stageCenterY) < SNAP_THRESHOLD) {
			const delta = stageCenterY - nodeCenterY;
			absY += delta;
			newGuides.push({ orientation: 'horizontal', points: [0, stageCenterY, stage.width(), stageCenterY] });
		}

		if(newGuides.length > 0) {
			node.setAttrs({
				x: node.x() + (absX - box.x),
				y: node.y() + (absY - box.y)
			});
		}
		setGuides(newGuides);
	};

	const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, elementId: string) => {
		if (!isEditable) return;
		setGuides([]);
		const updates = { x: e.target.x(), y: e.target.y() };
		if (onElementFinalUpdate) onElementFinalUpdate(elementId, updates);
		else onElementUpdate?.(elementId, updates);
	};

	const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, elementId: string) => {
		if (!isEditable) return;
		const node = e.target;
		const scaleX = node.scaleX();
		const scaleY = node.scaleY();
		node.scaleX(1);
		node.scaleY(1);

		const updates = {
			x: node.x(),
			y: node.y(),
			width: Math.max(5, node.width() * scaleX),
			height: Math.max(5, node.height() * scaleY),
			rotation: node.rotation(),
		};

		if (onElementFinalUpdate) onElementFinalUpdate(elementId, updates);
		else onElementUpdate?.(elementId, updates);
	};

	// 🟢 NEW: Specialized handler for Corner Frames
	// When one corner is resized, we update the main element's width/height, which updates ALL corners.
	const handleCornerTransformEnd = (e: Konva.KonvaEventObject<Event>, elementId: string) => {
		if (!isEditable) return;
		const node = e.target;
		const scaleX = node.scaleX();
		// Reset scale
		node.scaleX(1);
		node.scaleY(1);

		// Calculate new dimension based on the scaling of the single corner
		// Ensure min size of 20px
		const newSize = Math.max(20, node.width() * scaleX);

		const updates = {
			width: newSize,
			height: newSize,
			// We don't update X/Y or Rotation because corners are pinned
		};

		if (onElementFinalUpdate) onElementFinalUpdate(elementId, updates);
		else onElementUpdate?.(elementId, updates);
	};

	// --- Text Handling ---
	const handleTextDblClick = (el: CertificateElement, textNode: Konva.Text) => {
		if (!isEditable) return;
		const stage = stageRef.current;
		if (!stage) return;

		setSelectedId(null);
		onElementSelect?.(null);

		const absPos = textNode.getAbsolutePosition();
		const currentTransform = el.textTransform as string;
		let cssTransform: "none" | "uppercase" | "lowercase" | "capitalize" = "none";
		if (currentTransform === "upper" || currentTransform === "uppercase") cssTransform = "uppercase";
		else if (currentTransform === "lower" || currentTransform === "lowercase") cssTransform = "lowercase";
		else if (currentTransform === "title" || currentTransform === "capitalize") cssTransform = "capitalize";

		setEditingId(el.id);
		setTextEditValue(el.content || "");

		setTextEditStyle({
			position: "absolute",
			top: `${absPos.y}px`,
			left: `${absPos.x}px`,
			width: `${textNode.width() * stage.scaleX()}px`,
			height: `${textNode.height() * stage.scaleY()}px`,
			fontSize: `${(el.fontSize ?? 16) * stage.scaleX()}px`,
			fontFamily: el.fontFamily ?? "Arial",
			fontWeight: el.fontWeight || "normal",
			fontStyle: el.fontStyle || "normal",
			textDecoration: el.textDecoration || "none",
			color: el.color ?? "#000000",
			textAlign: (el.textAlign as any) ?? "left",
			lineHeight: `${(el.lineHeight ?? 1.2) * (el.fontSize ?? 16) * stage.scaleX()}px`,
			textTransform: cssTransform,
			background: "none",
			border: "1px dashed #0099ff",
			padding: 0, margin: 0, resize: "none", outline: "none", overflow: "hidden", zIndex: 1000,
		});
		setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.select(); }, 50);
	};

	const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setTextEditValue(e.target.value);
		onElementUpdate?.(editingId!, { content: e.target.value });
	};

	const handleTextEditComplete = () => {
		if (editingId) {
			onElementFinalUpdate?.(editingId, { content: textEditValue });
			setEditingId(null);
		}
	};

	const sortedElements = [...elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

	return (
		<div className="shadow-lg border border-slate-300 relative">
			{editingId && (
				<textarea
					ref={textareaRef}
					value={textEditValue}
					onChange={handleTextAreaChange}
					onBlur={handleTextEditComplete}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTextEditComplete(); }
						if (e.key === "Escape") { handleTextEditComplete(); }
					}}
					style={textEditStyle}
				/>
			)}
			<Stage
				width={width}
				height={height}
				ref={stageRef}
				onMouseDown={handleStageMouseDown}
				onTouchStart={handleStageMouseDown}
				style={{ backgroundColor: "#ffffff" }}
			>
				<Layer>
					{sortedElements.map((el) => {

						// --- 1. Images, Backgrounds & QR Codes ---
						// ⭐️ UPDATED: Included 'qrCode' to render as an Image
						if (["image", "background", "qrCode"].includes(el.type)) {
							const imgObj = images.find((i) => i.id === el.id);
							if (imgObj) {
								const scaleX = el.width ? el.width / imgObj.image.width : 1;
								const scaleY = el.height ? el.height / imgObj.image.height : 1;
								return (
									<KonvaImage
										key={el.id}
										image={imgObj.image}
										x={el.x} y={el.y}
										// For QR Code, use explicit width/height if available, otherwise scale normally
										scaleX={el.type === 'qrCode' ? 1 : scaleX} scaleY={el.type === 'qrCode' ? 1 : scaleY}
										width={el.type === 'qrCode' ? el.width : imgObj.image.width}
										height={el.type === 'qrCode' ? el.height : imgObj.image.height}
										rotation={el.rotate ?? 0}
										opacity={el.opacity ?? 1}
										draggable={isEditable}
										perfectDrawEnabled={false}
										onClick={() => handleSelect(el.id)}
										onTap={() => handleSelect(el.id)}
										onDragMove={handleDragMove}
										onDragEnd={(e) => handleDragEnd(e, el.id)}
										onTransformEnd={(e) => handleTransformEnd(e, el.id)}
										crossOrigin="anonymous"
										ref={(node) => { if (node) itemsRef.current[el.id] = node; }}
									/>
								);
							}
							if (el.type === "background") {
								return (
									<Rect
										key={el.id}
										x={el.x} y={el.y}
										width={el.width} height={el.height}
										fill={el.backgroundColor ?? "#ffffff"}
										opacity={el.opacity ?? 1}
										draggable={isEditable}
										onClick={() => handleSelect(el.id)}
										onTap={() => handleSelect(el.id)}
										ref={(node) => { if (node) itemsRef.current[el.id] = node; }}
									/>
								);
							}
							return null;
						}

						// --- 2. Corner Frames (Images OR CSS) ---
						if (el.type === "cornerFrame") {
							const imgObj = images.find((i) => i.id === el.id);

							// 🟢 A. Image Corner (Generated by AI)
							if (el.imageUrl && imgObj) {
								let renderSize = el.width ?? 300;
								const minDim = Math.min(width, height);
								if (renderSize > minDim * 0.6) {
									renderSize = 300;
								}
								const offset = renderSize / 2;

								// Render 4 independent Images, but bound to the same logic
								// Note: refs are assigned with suffixes _0, _1, _2, _3 so Transformers can find them
								return (
									<Group key={el.id}>
										<KonvaImage
											ref={(node) => { if (node) itemsRef.current[`${el.id}_0`] = node; }}
											onClick={() => handleSelect(el.id)} onTap={() => handleSelect(el.id)}
											onTransformEnd={(e) => handleCornerTransformEnd(e, el.id)}
											image={imgObj.image} width={renderSize} height={renderSize} offsetX={offset} offsetY={offset} x={0} y={0} rotation={45} draggable={false}
										/>
										<KonvaImage
											ref={(node) => { if (node) itemsRef.current[`${el.id}_1`] = node; }}
											onClick={() => handleSelect(el.id)} onTap={() => handleSelect(el.id)}
											onTransformEnd={(e) => handleCornerTransformEnd(e, el.id)}
											image={imgObj.image} width={renderSize} height={renderSize} offsetX={offset} offsetY={offset} x={width} y={0} rotation={135} draggable={false}
										/>
										<KonvaImage
											ref={(node) => { if (node) itemsRef.current[`${el.id}_2`] = node; }}
											onClick={() => handleSelect(el.id)} onTap={() => handleSelect(el.id)}
											onTransformEnd={(e) => handleCornerTransformEnd(e, el.id)}
											image={imgObj.image} width={renderSize} height={renderSize} offsetX={offset} offsetY={offset} x={width} y={height} rotation={225} draggable={false}
										/>
										<KonvaImage
											ref={(node) => { if (node) itemsRef.current[`${el.id}_3`] = node; }}
											onClick={() => handleSelect(el.id)} onTap={() => handleSelect(el.id)}
											onTransformEnd={(e) => handleCornerTransformEnd(e, el.id)}
											image={imgObj.image} width={renderSize} height={renderSize} offsetX={offset} offsetY={offset} x={0} y={height} rotation={315} draggable={false}
										/>
									</Group>
								);
							}

							// B. CSS Corner (Default / Fallback)
							else {
								const cornerSize = el.width ?? 300;
								const offset = cornerSize / 2;
								const cornerColor = el.backgroundColor || "#D4AF37";
								const cornerProps = { width: cornerSize, height: cornerSize, fill: cornerColor, offsetX: offset, offsetY: offset };

								return (
									<Group key={el.id}>
										<Rect
											ref={(node) => { if (node) itemsRef.current[`${el.id}_0`] = node; }}
											onClick={() => handleSelect(el.id)} onTap={() => handleSelect(el.id)}
											onTransformEnd={(e) => handleCornerTransformEnd(e, el.id)}
											x={0} y={0} rotation={45} {...cornerProps} draggable={false}
										/>
										<Rect
											ref={(node) => { if (node) itemsRef.current[`${el.id}_1`] = node; }}
											onClick={() => handleSelect(el.id)} onTap={() => handleSelect(el.id)}
											onTransformEnd={(e) => handleCornerTransformEnd(e, el.id)}
											x={width} y={0} rotation={135} {...cornerProps} draggable={false}
										/>
										<Rect
											ref={(node) => { if (node) itemsRef.current[`${el.id}_2`] = node; }}
											onClick={() => handleSelect(el.id)} onTap={() => handleSelect(el.id)}
											onTransformEnd={(e) => handleCornerTransformEnd(e, el.id)}
											x={width} y={height} rotation={225} {...cornerProps} draggable={false}
										/>
										<Rect
											ref={(node) => { if (node) itemsRef.current[`${el.id}_3`] = node; }}
											onClick={() => handleSelect(el.id)} onTap={() => handleSelect(el.id)}
											onTransformEnd={(e) => handleCornerTransformEnd(e, el.id)}
											x={0} y={height} rotation={315} {...cornerProps} draggable={false}
										/>
									</Group>
								);
							}
						}

						// --- 3. Borders & Inner Frames ---
						if (["border", "innerFrame"].includes(el.type)) {
							const defaultStroke = el.type === "innerFrame" ? "transparent" : "#000000";
							const strokeWidth = el.borderWidth ?? 2;
							const dashArray = el.borderStyle === "dashed" ? [strokeWidth * 3, strokeWidth * 2] :
								el.borderStyle === "dotted" ? [strokeWidth, strokeWidth * 2] : [];

							return (
								<Rect
									key={el.id}
									x={el.x} y={el.y}
									width={el.width ?? 100} height={el.height ?? 100}
									fill={el.backgroundColor ?? "transparent"}
									stroke={el.borderColor ?? defaultStroke}
									strokeWidth={strokeWidth}
									dash={dashArray}
									draggable={isEditable}
									onClick={() => handleSelect(el.id)}
									onTap={() => handleSelect(el.id)}
									onDragMove={handleDragMove}
									onDragEnd={(e) => handleDragEnd(e, el.id)}
									onTransformEnd={(e) => handleTransformEnd(e, el.id)}
									ref={(node) => { if (node) itemsRef.current[el.id] = node; }}
								/>
							);
						}

						// --- 4. Text & Signatures ---
						if (["text", "signature"].includes(el.type)) {
							const effectiveAlign = el.type === "signature" ? "center" : el.textAlign === "center" ? "center" : el.textAlign === "right" ? "right" : "left";
							const elementWidth = el.width ?? 200;

							let xPos = el.x;
							if (effectiveAlign === "center") xPos = el.x - elementWidth / 2;
							else if (effectiveAlign === "right") xPos = el.x - elementWidth;

							const transformedText = (() => {
								const content = el.content || "";
								if (!el.textTransform || el.textTransform === "none") return content;
								const tt = el.textTransform as string;
								if (tt === "upper" || tt === "uppercase") return content.toUpperCase();
								if (tt === "lower" || tt === "lowercase") return content.toLowerCase();
								if (tt === "title" || tt === "capitalize") return content.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
								return content;
							})();

							if (editingId === el.id) return null;

							return (
								<Text
									key={el.id}
									text={transformedText}
									x={xPos} y={el.y}
									width={elementWidth}
									fontSize={el.fontSize ?? 16}
									fontFamily={el.fontFamily ?? "Arial"}
									fill={el.color ?? "#000000"}
									fontStyle={el.fontStyle ?? "normal"}
									fontVariant={el.fontWeight === "bold" ? "bold" : "normal"}
									textDecoration={el.textDecoration ?? ""}
									align={effectiveAlign}
									draggable={isEditable}
									perfectDrawEnabled={false}
									onClick={() => handleSelect(el.id)}
									onTap={() => handleSelect(el.id)}
									onDblClick={(e) => handleTextDblClick(el, e.target as Konva.Text)}
									onDblTap={(e) => handleTextDblClick(el, e.target as Konva.Text)}
									onDragMove={handleDragMove}

									onDragEnd={(e) => {
										setGuides([]);
										const visualLeft = e.target.x();
										const visualTop = e.target.y();
										let newStorageX = visualLeft;

										if (effectiveAlign === "center") newStorageX = visualLeft + (elementWidth / 2);
										else if (effectiveAlign === "right") newStorageX = visualLeft + elementWidth;

										const updates = { x: newStorageX, y: visualTop };
										if (onElementFinalUpdate) onElementFinalUpdate(el.id, updates);
										else onElementUpdate?.(el.id, updates);
									}}

									onTransformEnd={(e) => {
										const node = e.target;
										const sX = node.scaleX(); const sY = node.scaleY();
										node.scaleX(1); node.scaleY(1);
										const newWidth = Math.max(5, node.width() * sX);
										const newHeight = Math.max(5, node.height() * sY);

										const visualLeft = node.x(); const visualTop = node.y();
										let newStorageX = visualLeft;

										if (effectiveAlign === "center") newStorageX = visualLeft + (newWidth / 2);
										else if (effectiveAlign === "right") newStorageX = visualLeft + newWidth;

										const updates = { x: newStorageX, y: visualTop, width: newWidth, height: newHeight, rotation: node.rotation() };
										if (onElementFinalUpdate) onElementFinalUpdate(el.id, updates);
										else onElementUpdate?.(el.id, updates);
									}}
									ref={(node) => { if (node) itemsRef.current[el.id] = node; }}
								/>
							);
						}
						return null;
					})}

					{/* Snap Lines */}
					{guides.map((guide, i) => <Line key={i} points={guide.points} stroke="#ff00ff" strokeWidth={1} dash={[4, 4]} />)}

					{/* Transformers */}
					{activeSelectionIds.map((id) => {
						const node = itemsRef.current[id];
						if (!node) return null;
						return (
							<Transformer
								key={`tr-${id}`}
								nodes={[node]}
								boundBoxFunc={(oldBox, newBox) =>
									newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
								}
							/>
						);
					})}
				</Layer>
			</Stage>
		</div>
	);
}
>>>>>>> fc3e88fcbd0a45183e91a5abd415c1c25b49290b
