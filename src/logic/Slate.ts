import { Node } from './Node';
import { Connection } from './Connection';

/**
 * Position represents a location on the slate grid
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Slate represents the Alchemist's Slate - a tool for designing alchemical machines
 *
 * The slate is a 2D grid where:
 * - Each cell is 32px
 * - Nodes snap to the edges of the grid
 * - Connections snap to the center of cells
 * - Bosuns travel between nodes through connections
 */
export class Slate {
  static readonly GRID_SIZE = 32;

  nodes: Map<string, { node: Node; position: Position }>;
  connections: Connection[];
  nextNodeId: number;

  constructor() {
    this.nodes = new Map();
    this.connections = [];
    this.nextNodeId = 0;
  }

  /**
   * Adds a node to the slate at the specified position
   * Position is automatically snapped to the grid
   */
  addNode(node: Node, x: number, y: number): string {
    const nodeId = `node_${this.nextNodeId++}`;
    const snappedPosition = this.snapToGrid(x, y);

    this.nodes.set(nodeId, {
      node,
      position: snappedPosition
    });

    return nodeId;
  }

  /**
   * Removes a node from the slate
   * Also removes all connections involving this node
   */
  removeNode(nodeId: string): boolean {
    const nodeData = this.nodes.get(nodeId);
    if (!nodeData) {
      return false;
    }

    // Remove all connections involving this node
    this.connections = this.connections.filter(connection => {
      const shouldRemove =
        this.getNodeId(connection.sourceNode) === nodeId ||
        this.getNodeId(connection.targetNode) === nodeId;

      if (shouldRemove) {
        connection.disconnect();
      }

      return !shouldRemove;
    });

    this.nodes.delete(nodeId);
    return true;
  }

  /**
   * Gets a node by its ID
   */
  getNode(nodeId: string): Node | null {
    const nodeData = this.nodes.get(nodeId);
    return nodeData ? nodeData.node : null;
  }

  /**
   * Gets the position of a node
   */
  getNodePosition(nodeId: string): Position | null {
    const nodeData = this.nodes.get(nodeId);
    return nodeData ? nodeData.position : null;
  }

  /**
   * Moves a node to a new position (if not locked)
   * Position is automatically snapped to the grid
   */
  moveNode(nodeId: string, x: number, y: number): boolean {
    const nodeData = this.nodes.get(nodeId);
    if (!nodeData) {
      return false;
    }

    if (nodeData.node.locked) {
      return false;
    }

    nodeData.position = this.snapToGrid(x, y);
    return true;
  }

  /**
   * Creates a connection between two nodes
   */
  addConnection(
    sourceNodeId: string,
    sourcePortIndex: number,
    targetNodeId: string,
    targetPortIndex: number
  ): Connection | null {
    const sourceNodeData = this.nodes.get(sourceNodeId);
    const targetNodeData = this.nodes.get(targetNodeId);

    if (!sourceNodeData || !targetNodeData) {
      return null;
    }

    try {
      const connection = new Connection(
        sourceNodeData.node,
        sourcePortIndex,
        targetNodeData.node,
        targetPortIndex
      );

      this.connections.push(connection);
      return connection;
    } catch (error) {
      // Connection validation failed
      console.error('Failed to create connection:', error);
      return null;
    }
  }

  /**
   * Removes a connection from the slate
   */
  removeConnection(connection: Connection): boolean {
    const index = this.connections.indexOf(connection);
    if (index === -1) {
      return false;
    }

    connection.disconnect();
    this.connections.splice(index, 1);
    return true;
  }

  /**
   * Gets all connections for a specific node
   */
  getNodeConnections(nodeId: string): Connection[] {
    const nodeData = this.nodes.get(nodeId);
    if (!nodeData) {
      return [];
    }

    return this.connections.filter(connection =>
      connection.sourceNode === nodeData.node ||
      connection.targetNode === nodeData.node
    );
  }

  /**
   * Snaps a position to the grid
   */
  private snapToGrid(x: number, y: number): Position {
    return {
      x: Math.round(x / Slate.GRID_SIZE) * Slate.GRID_SIZE,
      y: Math.round(y / Slate.GRID_SIZE) * Slate.GRID_SIZE
    };
  }

  /**
   * Gets the ID of a node
   */
  private getNodeId(node: Node): string | null {
    for (const [id, nodeData] of this.nodes.entries()) {
      if (nodeData.node === node) {
        return id;
      }
    }
    return null;
  }

  /**
   * Clears all nodes and connections from the slate
   */
  clear(): void {
    // Disconnect all connections
    this.connections.forEach(connection => connection.disconnect());
    this.connections = [];
    this.nodes.clear();
    this.nextNodeId = 0;
  }

  /**
   * Gets all nodes as an array
   */
  getAllNodes(): Array<{ id: string; node: Node; position: Position }> {
    const result: Array<{ id: string; node: Node; position: Position }> = [];
    for (const [id, nodeData] of this.nodes.entries()) {
      result.push({
        id,
        node: nodeData.node,
        position: nodeData.position
      });
    }
    return result;
  }

  /**
   * Gets the total number of nodes
   */
  getNodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Gets the total number of connections
   */
  getConnectionCount(): number {
    return this.connections.length;
  }
}
