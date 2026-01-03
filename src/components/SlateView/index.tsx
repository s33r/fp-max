import React from 'react';
import { Slate } from '../../logic/Slate';
import { Node } from '../../logic/Node';
import { Connection } from '../../logic/Connection';
import { Position } from '../../logic/Slate';
import './index.scss';

interface SlateViewProps {
  slate: Slate;
}

interface NodeViewProps {
  nodeId: string;
  node: Node;
  position: Position;
}

interface ConnectionViewProps {
  connection: Connection;
  sourcePosition: Position;
  targetPosition: Position;
}

const NodeView: React.FC<NodeViewProps> = ({ nodeId, node, position }) => {
  const inputPorts = node.flipped ? node.outputPorts : node.inputPorts;
  const outputPorts = node.flipped ? node.inputPorts : node.outputPorts;

  // Calculate node height based on number of rows
  const titleBarRows = 1;
  const statusBarRows = 2;
  const inputPortRows = inputPorts.length;
  const outputPortRows = outputPorts.length;
  const errorPortRows = 1;
  const configBarRows = 1;
  const totalRows = titleBarRows + statusBarRows + inputPortRows + outputPortRows + errorPortRows + configBarRows;
  const height = totalRows * Slate.GRID_SIZE;

  // Minimum width for nodes
  const width = 6 * Slate.GRID_SIZE;

  return (
    <div
      className={`slate-node ${node.reversed ? 'reversed' : ''} ${node.locked ? 'locked' : ''} ${node.error ? 'error' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      {/* Title Bar */}
      <div className="node-title-bar">
        <span className="node-icon">{node.icon}</span>
        <span className="node-title">{node.title}</span>
      </div>

      {/* Status Bar */}
      <div className="node-status-bar">
        <div className="status-indicator">
          {node.action.type}
        </div>
      </div>

      {/* Input Ports */}
      {inputPorts.map((port, index) => (
        <div key={`input-${index}`} className={`node-port input-port ${node.reversed ? 'reversed' : ''}`}>
          {!node.reversed && (
            <div className={`connection-indicator ${port.isConnected ? 'connected' : ''}`}>
              {port.isConnected ? '●' : '○'}
            </div>
          )}
          <span className="port-icon">{port.icon}</span>
          <span className="port-label">{port.label}</span>
          {node.reversed && (
            <div className={`connection-indicator ${port.isConnected ? 'connected' : ''}`}>
              {port.isConnected ? '●' : '○'}
            </div>
          )}
        </div>
      ))}

      {/* Output Ports */}
      {outputPorts.map((port, index) => (
        <div key={`output-${index}`} className={`node-port output-port ${node.reversed ? 'reversed' : ''}`}>
          {!node.reversed && (
            <span className="port-icon">{port.icon}</span>
          )}
          <span className="port-label">{port.label}</span>
          {!node.reversed && (
            <div className={`connection-indicator ${port.isConnected ? 'connected' : ''}`}>
              {port.isConnected ? '▲' : '△'}
            </div>
          )}
          {node.reversed && (
            <>
              <div className={`connection-indicator ${port.isConnected ? 'connected' : ''}`}>
                {port.isConnected ? '▲' : '△'}
              </div>
              <span className="port-icon">{port.icon}</span>
            </>
          )}
        </div>
      ))}

      {/* Error Port */}
      <div className="node-port error-port">
        <span className="port-label">Error</span>
        <div className="connection-indicator">
          {node.error ? '!' : ''}
        </div>
      </div>

      {/* Config Bar */}
      <div className="node-config-bar">
        <button className="config-button" title="Toggle Locked">
          {node.locked ? '🔒' : '🔓'}
        </button>
        <button className="config-button" title="Toggle Flipped">
          {node.flipped ? '⬆️' : '⬇️'}
        </button>
        <button className="config-button" title="Toggle Reversed">
          {node.reversed ? '⬅️' : '➡️'}
        </button>
        <button className="config-button" title="Help">
          ❓
        </button>
      </div>
    </div>
  );
};

const ConnectionView: React.FC<ConnectionViewProps> = ({ connection, sourcePosition, targetPosition }) => {
  // Calculate the center point of nodes for connection line
  const nodeWidth = 6 * Slate.GRID_SIZE;
  const sourceX = sourcePosition.x + nodeWidth;
  const sourceY = sourcePosition.y + (Slate.GRID_SIZE * 2); // Approximate vertical position
  const targetX = targetPosition.x;
  const targetY = targetPosition.y + (Slate.GRID_SIZE * 2);

  // Calculate SVG viewBox to contain the line
  const minX = Math.min(sourceX, targetX);
  const minY = Math.min(sourceY, targetY);
  const maxX = Math.max(sourceX, targetX);
  const maxY = Math.max(sourceY, targetY);
  const width = maxX - minX;
  const height = maxY - minY;

  // Adjust coordinates relative to viewBox
  const relativeSourceX = sourceX - minX;
  const relativeSourceY = sourceY - minY;
  const relativeTargetX = targetX - minX;
  const relativeTargetY = targetY - minY;

  return (
    <svg
      className="slate-connection"
      style={{
        position: 'absolute',
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      <line
        x1={relativeSourceX}
        y1={relativeSourceY}
        x2={relativeTargetX}
        y2={relativeTargetY}
        stroke="#4a9eff"
        strokeWidth="2"
      />
      {/* Show queue length if not empty */}
      {connection.getQueueLength() > 0 && (
        <text
          x={(relativeSourceX + relativeTargetX) / 2}
          y={(relativeSourceY + relativeTargetY) / 2}
          fill="#4a9eff"
          fontSize="12"
          textAnchor="middle"
        >
          {connection.getQueueLength()}
        </text>
      )}
    </svg>
  );
};

export const SlateView: React.FC<SlateViewProps> = ({ slate }) => {
  const nodes = slate.getAllNodes();

  return (
    <div className="slate-view">
      <div className="slate-grid">
        {/* Render all connections */}
        {slate.connections.map((connection, index) => {
          // Find positions of source and target nodes
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

          if (!sourcePosition || !targetPosition) {
            return null;
          }

          return (
            <ConnectionView
              key={`connection-${index}`}
              connection={connection}
              sourcePosition={sourcePosition}
              targetPosition={targetPosition}
            />
          );
        })}

        {/* Render all nodes */}
        {nodes.map(({ id, node, position }) => (
          <NodeView
            key={id}
            nodeId={id}
            node={node}
            position={position}
          />
        ))}
      </div>
    </div>
  );
};
