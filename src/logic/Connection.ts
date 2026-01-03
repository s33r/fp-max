import { Node } from './Node';
import { Bosun } from './Bosun';

/**
 * Connection represents a link between an output port on one node and an input port on another
 *
 * A connection is a first-in-first-out (FIFO) buffer that bosuns travel through.
 * - Output ports push bosuns onto their connection
 * - Input ports pull bosuns off of their connection
 */
export class Connection {
  sourceNode: Node;
  sourcePortIndex: number;
  targetNode: Node;
  targetPortIndex: number;
  queue: Bosun[];

  constructor(
    sourceNode: Node,
    sourcePortIndex: number,
    targetNode: Node,
    targetPortIndex: number
  ) {
    this.sourceNode = sourceNode;
    this.sourcePortIndex = sourcePortIndex;
    this.targetNode = targetNode;
    this.targetPortIndex = targetPortIndex;
    this.queue = [];

    // Validate connection rules
    this.validateConnection();

    // Mark ports as connected
    this.sourceNode.connectPort(false, sourcePortIndex);
    this.targetNode.connectPort(true, targetPortIndex);
  }

  /**
   * Validates that this connection follows the connection rules:
   * - Output ports can only connect to input ports
   * - Ports on the same node cannot be connected to each other
   * - Port indices must be valid
   */
  private validateConnection(): void {
    // Check if ports are on the same node
    if (this.sourceNode === this.targetNode) {
      throw new Error('Cannot connect ports on the same node');
    }

    // Check if source port index is valid
    if (this.sourcePortIndex < 0 || this.sourcePortIndex >= this.sourceNode.outputPorts.length) {
      throw new Error(`Invalid source port index: ${this.sourcePortIndex}`);
    }

    // Check if target port index is valid
    if (this.targetPortIndex < 0 || this.targetPortIndex >= this.targetNode.inputPorts.length) {
      throw new Error(`Invalid target port index: ${this.targetPortIndex}`);
    }

    // Check if ports are already connected
    if (this.sourceNode.outputPorts[this.sourcePortIndex].isConnected) {
      throw new Error(`Source port ${this.sourcePortIndex} is already connected`);
    }

    if (this.targetNode.inputPorts[this.targetPortIndex].isConnected) {
      throw new Error(`Target port ${this.targetPortIndex} is already connected`);
    }
  }

  /**
   * Pushes a bosun onto the connection (called by output port)
   */
  push(bosun: Bosun): void {
    this.queue.push(bosun);
  }

  /**
   * Pulls a bosun off the connection (called by input port)
   * Returns null if the queue is empty
   */
  pull(): Bosun | null {
    if (this.queue.length === 0) {
      return null;
    }
    return this.queue.shift() || null;
  }

  /**
   * Peeks at the next bosun without removing it
   * Returns null if the queue is empty
   */
  peek(): Bosun | null {
    if (this.queue.length === 0) {
      return null;
    }
    return this.queue[0];
  }

  /**
   * Returns the number of bosuns currently in the queue
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Checks if the queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Disconnects this connection and updates the ports
   */
  disconnect(): void {
    this.sourceNode.disconnectPort(false, this.sourcePortIndex);
    this.targetNode.disconnectPort(true, this.targetPortIndex);
    this.queue = [];
  }

  /**
   * Clears all bosuns from the queue without disconnecting
   */
  clear(): void {
    this.queue = [];
  }
}
