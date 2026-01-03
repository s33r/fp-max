import { Bosun } from './Connection';

/**
 * Slot represents a storage location in the Infinity Well
 * Each slot has a quantity and a maximum capacity (cap)
 */
export interface Slot {
  quantity: number;
  cap: number;
}

/**
 * SlotCollection is a dictionary of named slots
 */
export interface SlotCollection {
  [key: string]: Slot;
}

/**
 * InfinityWell is a mystical dimension that stores the player's resources
 *
 * The Infinity Well stores three kinds of things:
 * - Bosuns: Creatures that carry items, resources and perform actions
 * - Resources: Consumed by Bosuns when they perform actions
 * - Items: Used by Bosuns to make them more effective at performing actions
 *
 * Each specific kind of resource or item has its own slot in the Infinity Well.
 * The amount of each slot is incremented or decremented as Bosuns add or remove
 * items from the Infinity Well. Each slot also has a maximum amount called a Cap.
 */
export class InfinityWell {
  private bosunSlot: Slot;
  private resources: SlotCollection;
  private items: SlotCollection;
  private nextBosunId: number;

  constructor(initialBosunCap: number = 100) {
    this.bosunSlot = {
      quantity: initialBosunCap,
      cap: initialBosunCap
    };
    this.resources = {};
    this.items = {};
    this.nextBosunId = 1;
  }

  // ============================================
  // Bosun Management
  // ============================================

  /**
   * Gets the current number of available bosuns
   */
  getBosunCount(): number {
    return this.bosunSlot.quantity;
  }

  /**
   * Gets the maximum number of bosuns
   */
  getBosunCap(): number {
    return this.bosunSlot.cap;
  }

  /**
   * Sets the bosun cap
   */
  setBosunCap(cap: number): void {
    this.bosunSlot.cap = Math.max(0, cap);
    // Clamp quantity to new cap
    if (this.bosunSlot.quantity > this.bosunSlot.cap) {
      this.bosunSlot.quantity = this.bosunSlot.cap;
    }
  }

  /**
   * Checks if a bosun can be spawned (quantity > 0)
   */
  canSpawnBosun(): boolean {
    return this.bosunSlot.quantity > 0;
  }

  /**
   * Spawns a new bosun from the Infinity Well
   * Returns the bosun if successful, null if no bosuns available
   */
  spawnBosun(): Bosun | null {
    if (!this.canSpawnBosun()) {
      return null;
    }

    this.bosunSlot.quantity--;

    const bosun: Bosun = {
      id: this.nextBosunId++,
      name: this.generateBosunName(),
      inventory: {},
      tooltip: ''
    };

    return bosun;
  }

  /**
   * Returns a bosun to the Infinity Well
   * Returns true if successful, false if at cap
   */
  returnBosun(bosun: Bosun): boolean {
    if (this.bosunSlot.quantity >= this.bosunSlot.cap) {
      return false;
    }

    this.bosunSlot.quantity++;
    return true;
  }

  /**
   * Generates a whimsical name for a bosun
   */
  private generateBosunName(): string {
    const prefixes = [
      'Pip', 'Bop', 'Zip', 'Fizz', 'Buzz', 'Whir', 'Twirl', 'Skip',
      'Flip', 'Snap', 'Pop', 'Zing', 'Blink', 'Spark', 'Glim', 'Flick'
    ];
    const suffixes = [
      'wick', 'snap', 'spark', 'gleam', 'shine', 'glow', 'flash', 'beam',
      'twinkle', 'shimmer', 'glitter', 'dazzle', 'sprout', 'bloom', 'puff', 'wisp'
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix}${suffix}`;
  }

  // ============================================
  // Resource Management
  // ============================================

  /**
   * Creates a new resource slot
   */
  createResourceSlot(key: string, cap: number, initialQuantity: number = 0): void {
    if (this.resources[key]) {
      throw new Error(`Resource slot '${key}' already exists`);
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
    // Clamp quantity to new cap
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
      throw new Error(`Resource slot '${key}' does not exist`);
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
   * Gets a copy of the resource slot
   */
  getResourceSlot(key: string): Slot | null {
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
      throw new Error(`Item slot '${key}' already exists`);
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
    // Clamp quantity to new cap
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
      throw new Error(`Item slot '${key}' does not exist`);
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
   * Gets a copy of the item slot
   */
  getItemSlot(key: string): Slot | null {
    const slot = this.items[key];
    return slot ? { ...slot } : null;
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Clears all resources and items (but not bosuns)
   */
  clearInventory(): void {
    this.resources = {};
    this.items = {};
  }

  /**
   * Resets the Infinity Well to its initial state
   */
  reset(initialBosunCap: number = 100): void {
    this.bosunSlot = {
      quantity: initialBosunCap,
      cap: initialBosunCap
    };
    this.resources = {};
    this.items = {};
    this.nextBosunId = 1;
  }

  /**
   * Gets a summary of the Infinity Well's contents
   */
  getSummary(): {
    bosuns: Slot;
    resources: SlotCollection;
    items: SlotCollection;
  } {
    return {
      bosuns: { ...this.bosunSlot },
      resources: { ...this.resources },
      items: { ...this.items }
    };
  }
}
