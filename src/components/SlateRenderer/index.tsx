import React, { useRef, useEffect } from 'react';
import { Slate } from '../../logic/Slate';
import { Node } from '../../logic/Node';
import { Position } from '../../logic/Slate';
import './index.scss';

interface SlateRendererProps {
  slate: Slate;
  width?: number;
  height?: number;
}

const GRID_SIZE = Slate.GRID_SIZE;
const NODE_WIDTH = 6 * GRID_SIZE;

// Colors
const COLORS = {
  background: '#1a1a1a',
  gridLine: '#2a2a2a',
  nodeBg: '#2d2d2d',
  nodeBorder: '#4a4a4a',
  nodeBorderLocked: '#ff6b6b',
  nodeBorderError: '#ff4444',
  titleBarBg: '#3d3d3d',
  statusBarBg: '#252525',
  configBarBg: '#3d3d3d',
  errorPortBg: '#3a2525',
  portBg: '#2d2d2d',
  portBorder: '#3a3a3a',
  textPrimary: '#e0e0e0',
  textSecondary: '#b0b0b0',
  textMuted: '#888888',
  textDim: '#666666',
  connection: '#4a9eff',
};

function calculateNodeHeight(node: Node): number {
  const inputPorts = node.flipped ? node.outputPorts : node.inputPorts;
  const outputPorts = node.flipped ? node.inputPorts : node.outputPorts;

  const titleBarRows = 1;
  const statusBarRows = 2;
  const inputPortRows = inputPorts.length;
  const outputPortRows = outputPorts.length;
  const errorPortRows = 1;
  const configBarRows = 1;
  const totalRows = titleBarRows + statusBarRows + inputPortRows + outputPortRows + errorPortRows + configBarRows;

  return totalRows * GRID_SIZE;
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = COLORS.gridLine;
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawNode(ctx: CanvasRenderingContext2D, node: Node, position: Position): void {
  const x = position.x;
  const y = position.y;
  const width = NODE_WIDTH;
  const height = calculateNodeHeight(node);

  const inputPorts = node.flipped ? node.outputPorts : node.inputPorts;
  const outputPorts = node.flipped ? node.inputPorts : node.outputPorts;

  // Draw node background with border
  ctx.save();
  drawRoundedRect(ctx, x, y, width, height, 4);
  ctx.fillStyle = COLORS.nodeBg;
  ctx.fill();

  // Border
  ctx.lineWidth = 2;
  if (node.error) {
    ctx.strokeStyle = COLORS.nodeBorderError;
    ctx.shadowColor = 'rgba(255, 68, 68, 0.5)';
    ctx.shadowBlur = 8;
  } else if (node.locked) {
    ctx.strokeStyle = COLORS.nodeBorderLocked;
  } else {
    ctx.strokeStyle = COLORS.nodeBorder;
  }
  ctx.stroke();
  ctx.restore();

  let currentY = y;

  // Title Bar
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + 4, currentY);
  ctx.lineTo(x + width - 4, currentY);
  ctx.quadraticCurveTo(x + width, currentY, x + width, currentY + 4);
  ctx.lineTo(x + width, currentY + GRID_SIZE);
  ctx.lineTo(x, currentY + GRID_SIZE);
  ctx.lineTo(x, currentY + 4);
  ctx.quadraticCurveTo(x, currentY, x + 4, currentY);
  ctx.closePath();
  ctx.fillStyle = COLORS.titleBarBg;
  ctx.fill();

  // Title bar border
  ctx.beginPath();
  ctx.moveTo(x, currentY + GRID_SIZE);
  ctx.lineTo(x + width, currentY + GRID_SIZE);
  ctx.strokeStyle = COLORS.nodeBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Icon
  ctx.font = '18px serif';
  ctx.fillStyle = COLORS.textPrimary;
  ctx.textBaseline = 'middle';
  ctx.fillText(node.icon, x + 8, currentY + GRID_SIZE / 2);

  // Title
  ctx.font = '600 14px sans-serif';
  ctx.fillStyle = COLORS.textPrimary;
  ctx.fillText(node.title, x + 36, currentY + GRID_SIZE / 2);

  currentY += GRID_SIZE;

  // Status Bar
  ctx.fillStyle = COLORS.statusBarBg;
  ctx.fillRect(x, currentY, width, GRID_SIZE * 2);
  ctx.beginPath();
  ctx.moveTo(x, currentY + GRID_SIZE * 2);
  ctx.lineTo(x + width, currentY + GRID_SIZE * 2);
  ctx.strokeStyle = COLORS.nodeBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '12px sans-serif';
  ctx.fillStyle = COLORS.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText(node.action.type, x + width / 2, currentY + GRID_SIZE);
  ctx.textAlign = 'left';

  currentY += GRID_SIZE * 2;

  // Input Ports
  for (let i = 0; i < inputPorts.length; i++) {
    const port = inputPorts[i];
    drawPort(ctx, x, currentY, width, port, 'input', node.reversed);
    currentY += GRID_SIZE;
  }

  // Output Ports
  for (let i = 0; i < outputPorts.length; i++) {
    const port = outputPorts[i];
    drawPort(ctx, x, currentY, width, port, 'output', node.reversed);
    currentY += GRID_SIZE;
  }

  // Error Port
  ctx.fillStyle = COLORS.errorPortBg;
  ctx.fillRect(x, currentY, width, GRID_SIZE);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = COLORS.textSecondary;
  ctx.textBaseline = 'middle';
  ctx.fillText('Error', x + 8, currentY + GRID_SIZE / 2);

  if (node.error) {
    ctx.fillStyle = COLORS.nodeBorderError;
    ctx.textAlign = 'right';
    ctx.fillText('!', x + width - 12, currentY + GRID_SIZE / 2);
    ctx.textAlign = 'left';
  }

  currentY += GRID_SIZE;

  // Config Bar
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, currentY);
  ctx.lineTo(x + width, currentY);
  ctx.lineTo(x + width, currentY + GRID_SIZE - 4);
  ctx.quadraticCurveTo(x + width, currentY + GRID_SIZE, x + width - 4, currentY + GRID_SIZE);
  ctx.lineTo(x + 4, currentY + GRID_SIZE);
  ctx.quadraticCurveTo(x, currentY + GRID_SIZE, x, currentY + GRID_SIZE - 4);
  ctx.closePath();
  ctx.fillStyle = COLORS.configBarBg;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, currentY);
  ctx.lineTo(x + width, currentY);
  ctx.strokeStyle = COLORS.nodeBorder;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Config buttons
  const buttons = [
    node.locked ? '\u{1F512}' : '\u{1F513}',
    node.flipped ? '\u2B06\uFE0F' : '\u2B07\uFE0F',
    node.reversed ? '\u2B05\uFE0F' : '\u27A1\uFE0F',
    '\u2753'
  ];

  ctx.font = '14px serif';
  ctx.fillStyle = COLORS.textMuted;
  ctx.textAlign = 'center';
  const buttonSpacing = width / 4;
  for (let i = 0; i < buttons.length; i++) {
    ctx.fillText(buttons[i], x + buttonSpacing * (i + 0.5), currentY + GRID_SIZE / 2);
  }
  ctx.textAlign = 'left';
}

function drawPort(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  port: { label: string; icon: string; isConnected: boolean },
  type: 'input' | 'output',
  reversed: boolean
): void {
  // Port background
  ctx.fillStyle = COLORS.portBg;
  ctx.fillRect(x, y, width, GRID_SIZE);

  // Port border
  ctx.beginPath();
  ctx.moveTo(x, y + GRID_SIZE);
  ctx.lineTo(x + width, y + GRID_SIZE);
  ctx.strokeStyle = COLORS.portBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '12px sans-serif';
  ctx.fillStyle = COLORS.textSecondary;
  ctx.textBaseline = 'middle';

  const indicatorSymbol = type === 'input'
    ? (port.isConnected ? '\u25CF' : '\u25CB')
    : (port.isConnected ? '\u25B2' : '\u25B3');

  const indicatorColor = port.isConnected ? COLORS.connection : COLORS.textDim;

  if (type === 'input') {
    if (reversed) {
      // Indicator on right, icon on left
      ctx.fillText(port.icon, x + 8, y + GRID_SIZE / 2);
      ctx.fillText(port.label, x + 32, y + GRID_SIZE / 2);
      ctx.fillStyle = indicatorColor;
      ctx.textAlign = 'right';
      ctx.fillText(indicatorSymbol, x + width - 8, y + GRID_SIZE / 2);
      ctx.textAlign = 'left';
    } else {
      // Indicator on left, icon after label
      ctx.fillStyle = indicatorColor;
      ctx.fillText(indicatorSymbol, x + 8, y + GRID_SIZE / 2);
      ctx.fillStyle = COLORS.textSecondary;
      ctx.fillText(port.icon, x + 28, y + GRID_SIZE / 2);
      ctx.fillText(port.label, x + 52, y + GRID_SIZE / 2);
    }
  } else {
    if (reversed) {
      // Indicator on left, icon on right
      ctx.fillStyle = indicatorColor;
      ctx.fillText(indicatorSymbol, x + 8, y + GRID_SIZE / 2);
      ctx.fillStyle = COLORS.textSecondary;
      ctx.fillText(port.label, x + 28, y + GRID_SIZE / 2);
      ctx.textAlign = 'right';
      ctx.fillText(port.icon, x + width - 8, y + GRID_SIZE / 2);
      ctx.textAlign = 'left';
    } else {
      // Icon on left, indicator on right
      ctx.fillText(port.icon, x + 8, y + GRID_SIZE / 2);
      ctx.fillText(port.label, x + 32, y + GRID_SIZE / 2);
      ctx.fillStyle = indicatorColor;
      ctx.textAlign = 'right';
      ctx.fillText(indicatorSymbol, x + width - 8, y + GRID_SIZE / 2);
      ctx.textAlign = 'left';
    }
  }
}

function drawConnection(
  ctx: CanvasRenderingContext2D,
  sourcePosition: Position,
  targetPosition: Position,
  queueLength: number
): void {
  const sourceX = sourcePosition.x + NODE_WIDTH;
  const sourceY = sourcePosition.y + GRID_SIZE * 2;
  const targetX = targetPosition.x;
  const targetY = targetPosition.y + GRID_SIZE * 2;

  ctx.beginPath();
  ctx.moveTo(sourceX, sourceY);
  ctx.lineTo(targetX, targetY);
  ctx.strokeStyle = COLORS.connection;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw queue length if not empty
  if (queueLength > 0) {
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = COLORS.connection;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(queueLength.toString(), midX, midY);
    ctx.textAlign = 'left';
  }
}

export const SlateRenderer: React.FC<SlateRendererProps> = ({
  slate,
  width = 1200,
  height = 800
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear and draw grid
    drawGrid(ctx, width, height);

    const nodes = slate.getAllNodes();

    // Draw connections first (below nodes)
    for (const connection of slate.connections) {
      let sourcePosition: Position | null = null;
      let targetPosition: Position | null = null;

      for (const { node, position } of nodes) {
        if (node === connection.sourceNode) {
          sourcePosition = position;
        }
        if (node === connection.targetNode) {
          targetPosition = position;
        }
      }

      if (sourcePosition && targetPosition) {
        drawConnection(ctx, sourcePosition, targetPosition, connection.getQueueLength());
      }
    }

    // Draw nodes
    for (const { node, position } of nodes) {
      drawNode(ctx, node, position);
    }
  }, [slate, width, height]);

  return (
    <div className="slate-renderer">
      <canvas ref={canvasRef} />
    </div>
  );
};
