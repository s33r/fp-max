import React, { useRef, useEffect } from 'react';
import { Slate } from '../../logic/Slate';
import { Node } from '../../logic/Node';
import { Connection } from '../../logic/Connection';
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

/**
 * Calculate the Y position for an output port on a node
 */
function getOutputPortY(node: Node, portIndex: number, nodeY: number): number {
  const titleBarRows = 1;
  const statusBarRows = 2;

  // When flipped, outputs come before inputs (they swap positions)
  // When not flipped, outputs come after inputs
  let rowOffset: number;
  if (node.flipped) {
    // Outputs shown first (after title and status)
    rowOffset = titleBarRows + statusBarRows + portIndex;
  } else {
    // Inputs shown first, then outputs
    const inputPortRows = node.inputPorts.length;
    rowOffset = titleBarRows + statusBarRows + inputPortRows + portIndex;
  }

  // Return the center Y of the port row
  return nodeY + rowOffset * GRID_SIZE + GRID_SIZE / 2;
}

/**
 * Calculate the Y position for an input port on a node
 */
function getInputPortY(node: Node, portIndex: number, nodeY: number): number {
  const titleBarRows = 1;
  const statusBarRows = 2;

  // When flipped, inputs come after outputs (they swap positions)
  // When not flipped, inputs come before outputs
  let rowOffset: number;
  if (node.flipped) {
    // Outputs shown first, then inputs
    const outputPortRows = node.outputPorts.length;
    rowOffset = titleBarRows + statusBarRows + outputPortRows + portIndex;
  } else {
    // Inputs shown first (after title and status)
    rowOffset = titleBarRows + statusBarRows + portIndex;
  }

  // Return the center Y of the port row
  return nodeY + rowOffset * GRID_SIZE + GRID_SIZE / 2;
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
  connection: Connection,
  sourcePosition: Position,
  targetPosition: Position
): void {
  const sourceNode = connection.sourceNode;
  const targetNode = connection.targetNode;

  // Calculate X positions based on reversed state
  // Output ports are on the right by default, left when reversed
  const sourceX = sourceNode.reversed
    ? sourcePosition.x
    : sourcePosition.x + NODE_WIDTH;

  // Input ports are on the left by default, right when reversed
  const targetX = targetNode.reversed
    ? targetPosition.x + NODE_WIDTH
    : targetPosition.x;

  // Calculate Y positions based on port indices
  const sourceY = getOutputPortY(sourceNode, connection.sourcePortIndex, sourcePosition.y);
  const targetY = getInputPortY(targetNode, connection.targetPortIndex, targetPosition.y);

  // Draw connection with right-angle bends
  // Path: source -> horizontal out -> vertical -> horizontal in -> target
  ctx.beginPath();
  ctx.strokeStyle = COLORS.connection;
  ctx.lineWidth = 2;

  // Calculate the midpoint X for the vertical segment
  const midX = (sourceX + targetX) / 2;

  // Snap midX to grid center for cleaner look
  const snappedMidX = Math.round(midX / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;

  ctx.moveTo(sourceX, sourceY);
  ctx.lineTo(snappedMidX, sourceY);  // Horizontal from source
  ctx.lineTo(snappedMidX, targetY);  // Vertical segment
  ctx.lineTo(targetX, targetY);       // Horizontal to target
  ctx.stroke();

  // Draw queue length if not empty
  const queueLength = connection.getQueueLength();
  if (queueLength > 0) {
    // Position the label on the vertical segment
    const labelY = (sourceY + targetY) / 2;

    // Draw background for better readability
    ctx.fillStyle = COLORS.background;
    const textWidth = ctx.measureText(queueLength.toString()).width;
    ctx.fillRect(snappedMidX - textWidth / 2 - 4, labelY - 8, textWidth + 8, 16);

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = COLORS.connection;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(queueLength.toString(), snappedMidX, labelY);
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
        drawConnection(ctx, connection, sourcePosition, targetPosition);
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
