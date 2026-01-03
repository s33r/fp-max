/**
 * Port represents a connection point on a Node
 */
export interface Port {
  label: string;
  icon: string;
  isConnected: boolean;
}

/**
 * Action defines the activity that a bosun will perform when it reaches the node
 */
export interface Action {
  type: string;
  // Additional properties will be defined based on specific action types
}

/**
 * Inventory stores items/resources with quantity and cap
 */
export interface Inventory {
  [key: string]: {
    quantity: number;
    cap: number;
  };
}

/**
 * Error information for when something breaks in the node
 */
export interface NodeError {
  message: string;
  details?: string;
}

/**
 * Node represents a single node in the Alchemist's Slate graph
 *
 * A node consists of:
 * - Visual properties (title, icon, description)
 * - Layout properties (flipped, reversed, locked)
 * - Connection ports (input and output)
 * - Internal state (inventory, error)
 * - Behavior (action)
 */
export class Node {
  title: string;
  icon: string;
  description: string;
  tooltip: string;
  flipped: boolean;
  reversed: boolean;
  inputPorts: Port[];
  outputPorts: Port[];
  locked: boolean;
  inventory: Inventory;
  error: NodeError | null;
  action: Action;

  constructor(
    title: string,
    icon: string,
    description: string,
    tooltip: string,
    action: Action,
    inputPortCount: number = 0,
    outputPortCount: number = 0
  ) {
    this.title = title;
    this.icon = icon;
    this.description = description;
    this.tooltip = tooltip;
    this.flipped = false;
    this.reversed = false;
    this.inputPorts = this.createPorts(inputPortCount);
    this.outputPorts = this.createPorts(outputPortCount);
    this.locked = false;
    this.inventory = {};
    this.error = null;
    this.action = action;
  }

  /**
   * Creates an array of ports
   */
  private createPorts(count: number): Port[] {
    const ports: Port[] = [];
    for (let i = 0; i < count; i++) {
      ports.push({
        label: `Port ${i + 1}`,
        icon: '',
        isConnected: false
      });
    }
    return ports;
  }

  /**
   * Toggles the locked state of the node
   */
  toggleLocked(): void {
    this.locked = !this.locked;
  }

  /**
   * Toggles the flipped state of the node
   * When flipped, outputs are shown above inputs
   */
  toggleFlipped(): void {
    this.flipped = !this.flipped;
  }

  /**
   * Toggles the reversed state of the node
   * When reversed, outputs are on the left and inputs are on the right
   */
  toggleReversed(): void {
    this.reversed = !this.reversed;
  }

  /**
   * Sets an error on the node
   */
  setError(message: string, details?: string): void {
    this.error = { message, details };
  }

  /**
   * Clears any error on the node
   */
  clearError(): void {
    this.error = null;
  }

  /**
   * Adds an item to the node's inventory
   */
  addToInventory(itemKey: string, quantity: number, cap: number = Infinity): void {
    if (!this.inventory[itemKey]) {
      this.inventory[itemKey] = { quantity: 0, cap };
    }

    const newQuantity = this.inventory[itemKey].quantity + quantity;
    if (newQuantity > this.inventory[itemKey].cap) {
      this.setError(`Inventory overflow`, `Cannot add ${quantity} ${itemKey}, would exceed cap of ${this.inventory[itemKey].cap}`);
      return;
    }

    this.inventory[itemKey].quantity = newQuantity;
  }

  /**
   * Removes an item from the node's inventory
   */
  removeFromInventory(itemKey: string, quantity: number): boolean {
    if (!this.inventory[itemKey] || this.inventory[itemKey].quantity < quantity) {
      this.setError(`Insufficient inventory`, `Cannot remove ${quantity} ${itemKey}, only ${this.inventory[itemKey]?.quantity || 0} available`);
      return false;
    }

    this.inventory[itemKey].quantity -= quantity;
    return true;
  }

  /**
   * Connects a port
   */
  connectPort(isInput: boolean, portIndex: number): void {
    const ports = isInput ? this.inputPorts : this.outputPorts;
    if (portIndex >= 0 && portIndex < ports.length) {
      ports[portIndex].isConnected = true;
    }
  }

  /**
   * Disconnects a port
   */
  disconnectPort(isInput: boolean, portIndex: number): void {
    const ports = isInput ? this.inputPorts : this.outputPorts;
    if (portIndex >= 0 && portIndex < ports.length) {
      ports[portIndex].isConnected = false;
    }
  }
}
