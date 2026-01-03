/**
 * Slot represents a storage location for resources or items
 * Each slot has a quantity and a maximum capacity (cap)
 */
export interface BosunSlot {
  quantity: number;
  cap: number;
}

/**
 * SlotCollection is a dictionary of named slots
 */
export interface BosunSlotCollection {
  [key: string]: BosunSlot;
}

/**
 * Bosun is a small creature that travels between nodes in the slate network
 *
 * According to the design document:
 * - Each bosun has a whimsical but automatically generated name
 * - Uniquely identified by an incremental number assigned when generated
 * - Created by Source nodes when the Infinity Well's bosun slot has quantity > 0
 * - Travel at a fixed speed measured in grid cells per second (starting at 1 cell/second)
 * - Have an inventory that functions like the Infinity Well but with lower caps
 * - Have a tooltip that starts blank but may be assigned by an activity
 */
export class Bosun {
  /**
   * Unique identifier for this bosun
   */
  readonly id: number;

  /**
   * Whimsical automatically generated name
   */
  readonly name: string;

  /**
   * Speed in grid cells per second (default: 1)
   */
  private speed: number;

  /**
   * Inventory of resources
   */
  private resources: BosunSlotCollection;

  /**
   * Inventory of items
   */
  private items: BosunSlotCollection;

  /**
   * Tooltip text that may be assigned by activities
   */
  private tooltipText: string;

  constructor(id: number, name: string, speed: number = 1) {
    this.id = id;
    this.name = name;
    this.speed = speed;
    this.resources = {};
    this.items = {};
    this.tooltipText = '';
  }

  // ============================================
  // Speed Management
  // ============================================

  /**
   * Gets the current speed in cells per second
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Sets the speed in cells per second
   */
  setSpeed(speed: number): void {
    this.speed = Math.max(0, speed);
  }

  /**
   * Increases the speed by the given amount
   */
  increaseSpeed(amount: number): void {
    this.speed += amount;
  }

  /**
   * Decreases the speed by the given amount (minimum 0)
   */
  decreaseSpeed(amount: number): void {
    this.speed = Math.max(0, this.speed - amount);
  }

  // ============================================
  // Resource Management
  // ============================================

  /**
   * Creates a new resource slot
   */
  createResourceSlot(key: string, cap: number, initialQuantity: number = 0): void {
    if (this.resources[key]) {
      throw new Error(`Resource slot '${key}' already exists on bosun ${this.name}`);
    }

    this.resources[key] = {
      quantity: Math.min(initialQuantity, cap),
      cap: cap
    };
  }

  /**
   * Gets the quantity of a resource
   */
  getResourceQuantity(key: string): number {
    return this.resources[key]?.quantity ?? 0;
  }

  /**
   * Gets the cap of a resource
   */
  getResourceCap(key: string): number {
    return this.resources[key]?.cap ?? 0;
  }

  /**
   * Sets the cap of a resource
   */
  setResourceCap(key: string, cap: number): void {
    if (!this.resources[key]) {
      this.createResourceSlot(key, cap);
      return;
    }

    this.resources[key].cap = Math.max(0, cap);
    if (this.resources[key].quantity > this.resources[key].cap) {
      this.resources[key].quantity = this.resources[key].cap;
    }
  }

  /**
   * Adds a quantity of a resource
   * Returns the amount actually added (may be less if at cap)
   */
  addResource(key: string, amount: number): number {
    if (!this.resources[key]) {
      throw new Error(`Resource slot '${key}' does not exist on bosun ${this.name}`);
    }

    const slot = this.resources[key];
    const available = slot.cap - slot.quantity;
    const toAdd = Math.min(amount, available);

    slot.quantity += toAdd;
    return toAdd;
  }

  /**
   * Removes a quantity of a resource
   * Returns the amount actually removed (may be less if insufficient)
   */
  removeResource(key: string, amount: number): number {
    if (!this.resources[key]) {
      return 0;
    }

    const slot = this.resources[key];
    const toRemove = Math.min(amount, slot.quantity);

    slot.quantity -= toRemove;
    return toRemove;
  }

  /**
   * Checks if there is enough of a resource
   */
  hasResource(key: string, amount: number): boolean {
    return this.getResourceQuantity(key) >= amount;
  }

  /**
   * Gets all resource keys
   */
  getResourceKeys(): string[] {
    return Object.keys(this.resources);
  }

  /**
   * Gets a copy of a resource slot
   */
  getResourceSlot(key: string): BosunSlot | null {
    const slot = this.resources[key];
    return slot ? { ...slot } : null;
  }

  // ============================================
  // Item Management
  // ============================================

  /**
   * Creates a new item slot
   */
  createItemSlot(key: string, cap: number, initialQuantity: number = 0): void {
    if (this.items[key]) {
      throw new Error(`Item slot '${key}' already exists on bosun ${this.name}`);
    }

    this.items[key] = {
      quantity: Math.min(initialQuantity, cap),
      cap: cap
    };
  }

  /**
   * Gets the quantity of an item
   */
  getItemQuantity(key: string): number {
    return this.items[key]?.quantity ?? 0;
  }

  /**
   * Gets the cap of an item
   */
  getItemCap(key: string): number {
    return this.items[key]?.cap ?? 0;
  }

  /**
   * Sets the cap of an item
   */
  setItemCap(key: string, cap: number): void {
    if (!this.items[key]) {
      this.createItemSlot(key, cap);
      return;
    }

    this.items[key].cap = Math.max(0, cap);
    if (this.items[key].quantity > this.items[key].cap) {
      this.items[key].quantity = this.items[key].cap;
    }
  }

  /**
   * Adds a quantity of an item
   * Returns the amount actually added (may be less if at cap)
   */
  addItem(key: string, amount: number): number {
    if (!this.items[key]) {
      throw new Error(`Item slot '${key}' does not exist on bosun ${this.name}`);
    }

    const slot = this.items[key];
    const available = slot.cap - slot.quantity;
    const toAdd = Math.min(amount, available);

    slot.quantity += toAdd;
    return toAdd;
  }

  /**
   * Removes a quantity of an item
   * Returns the amount actually removed (may be less if insufficient)
   */
  removeItem(key: string, amount: number): number {
    if (!this.items[key]) {
      return 0;
    }

    const slot = this.items[key];
    const toRemove = Math.min(amount, slot.quantity);

    slot.quantity -= toRemove;
    return toRemove;
  }

  /**
   * Checks if there is enough of an item
   */
  hasItem(key: string, amount: number): boolean {
    return this.getItemQuantity(key) >= amount;
  }

  /**
   * Gets all item keys
   */
  getItemKeys(): string[] {
    return Object.keys(this.items);
  }

  /**
   * Gets a copy of an item slot
   */
  getItemSlot(key: string): BosunSlot | null {
    const slot = this.items[key];
    return slot ? { ...slot } : null;
  }

  // ============================================
  // Tooltip Management
  // ============================================

  /**
   * Gets the current tooltip text
   */
  getTooltip(): string {
    return this.tooltipText;
  }

  /**
   * Sets the tooltip text
   */
  setTooltip(text: string): void {
    this.tooltipText = text;
  }

  /**
   * Clears the tooltip text
   */
  clearTooltip(): void {
    this.tooltipText = '';
  }

  // ============================================
  // Inventory Management
  // ============================================

  /**
   * Clears all resources and items from the inventory
   */
  clearInventory(): void {
    this.resources = {};
    this.items = {};
  }

  /**
   * Gets a summary of the bosun's inventory
   */
  getInventorySummary(): {
    resources: BosunSlotCollection;
    items: BosunSlotCollection;
  } {
    return {
      resources: { ...this.resources },
      items: { ...this.items }
    };
  }

  /**
   * Checks if the inventory is empty
   */
  isInventoryEmpty(): boolean {
    return Object.keys(this.resources).length === 0 && Object.keys(this.items).length === 0;
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Gets a string representation of this bosun
   */
  toString(): string {
    return `Bosun #${this.id} (${this.name}) - Speed: ${this.speed} cells/sec`;
  }

  /**
   * Gets a detailed description including inventory
   */
  getDetailedDescription(): string {
    let desc = this.toString();

    if (this.tooltipText) {
      desc += `\nTooltip: ${this.tooltipText}`;
    }

    const resourceKeys = Object.keys(this.resources);
    if (resourceKeys.length > 0) {
      desc += '\nResources:';
      resourceKeys.forEach(key => {
        const slot = this.resources[key];
        desc += `\n  - ${key}: ${slot.quantity}/${slot.cap}`;
      });
    }

    const itemKeys = Object.keys(this.items);
    if (itemKeys.length > 0) {
      desc += '\nItems:';
      itemKeys.forEach(key => {
        const slot = this.items[key];
        desc += `\n  - ${key}: ${slot.quantity}/${slot.cap}`;
      });
    }

    return desc;
  }

  /**
   * Creates a serializable representation of this bosun
   */
  serialize(): {
    id: number;
    name: string;
    speed: number;
    resources: BosunSlotCollection;
    items: BosunSlotCollection;
    tooltip: string;
  } {
    return {
      id: this.id,
      name: this.name,
      speed: this.speed,
      resources: { ...this.resources },
      items: { ...this.items },
      tooltip: this.tooltipText
    };
  }

  /**
   * Creates a Bosun from a serialized representation
   */
  static deserialize(data: {
    id: number;
    name: string;
    speed: number;
    resources: BosunSlotCollection;
    items: BosunSlotCollection;
    tooltip: string;
  }): Bosun {
    const bosun = new Bosun(data.id, data.name, data.speed);
    bosun.resources = { ...data.resources };
    bosun.items = { ...data.items };
    bosun.tooltipText = data.tooltip;
    return bosun;
  }
}
