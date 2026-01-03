import { Activity, ActivityContext, ActivityResult } from './types';

/**
 * Collect Activity - Used by Sink nodes
 *
 * This activity collects bosuns from input connections and returns them to the Infinity Well,
 * along with all resources and items in their inventory.
 *
 * According to the design document:
 * - Sink nodes collect bosuns and return them to the Infinity Well
 * - Bosuns carry resources and items that should be transferred back to the well
 *
 * Behavior:
 * - Pulls bosuns from input connections (round-robin when multiple inputs)
 * - Transfers all resources from the bosun's inventory to the Infinity Well
 * - Transfers all items from the bosun's inventory to the Infinity Well
 * - Returns the bosun to the Infinity Well (increments bosun count)
 * - Reports what was collected for tracking purposes
 */

/**
 * Tracks which input port was last used for round-robin collection
 * Key is the node's unique identifier
 */
const lastUsedInput = new Map<string, number>();

/**
 * Generates a unique key for a node to track its state
 */
function getNodeKey(context: ActivityContext): string {
  // Use node's title and position as a simple key
  // In a real implementation, nodes should have unique IDs
  return `${context.node.title}-${context.inputConnections.length}-${context.outputConnections.length}`;
}

/**
 * Collect activity implementation
 */
export const collectActivity: Activity = (context: ActivityContext): ActivityResult => {
  const { infinityWell, inputConnections } = context;

  // Check if we have any input connections
  if (inputConnections.length === 0) {
    return {
      success: false,
      error: 'No input connections available',
      bosunProcessed: 0
    };
  }

  // Try to pull a bosun from input connections using round-robin
  const nodeKey = getNodeKey(context);
  const lastInput = lastUsedInput.get(nodeKey) ?? -1;

  let bosun = null;
  let usedInputIndex = -1;

  // Try each input connection starting from the next one in round-robin order
  for (let i = 0; i < inputConnections.length; i++) {
    const inputIndex = (lastInput + 1 + i) % inputConnections.length;
    const connection = inputConnections[inputIndex];

    bosun = connection.pull();
    if (bosun) {
      usedInputIndex = inputIndex;
      lastUsedInput.set(nodeKey, inputIndex);
      break;
    }
  }

  // If no bosun was available on any input
  if (!bosun) {
    return {
      success: false,
      error: 'No bosuns available on input connections',
      bosunProcessed: 0
    };
  }

  // Track what we're collecting
  const collectedResources: Record<string, number> = {};
  const collectedItems: Record<string, number> = {};

  // Transfer all resources from bosun to Infinity Well
  const resourceKeys = bosun.getResourceKeys();
  for (const key of resourceKeys) {
    const quantity = bosun.getResourceQuantity(key);
    if (quantity > 0) {
      // Ensure the resource slot exists in the Infinity Well
      if (infinityWell.getResourceCap(key) === 0) {
        // Create a slot if it doesn't exist (with a reasonable default cap)
        infinityWell.createResourceSlot(key, 10000, 0);
      }

      // Transfer the resource
      const added = infinityWell.addResource(key, quantity);
      collectedResources[key] = added;

      // Remove from bosun (even if not all was added due to cap)
      bosun.removeResource(key, quantity);
    }
  }

  // Transfer all items from bosun to Infinity Well
  const itemKeys = bosun.getItemKeys();
  for (const key of itemKeys) {
    const quantity = bosun.getItemQuantity(key);
    if (quantity > 0) {
      // Ensure the item slot exists in the Infinity Well
      if (infinityWell.getItemCap(key) === 0) {
        // Create a slot if it doesn't exist (with a reasonable default cap)
        infinityWell.createItemSlot(key, 1000, 0);
      }

      // Transfer the item
      const added = infinityWell.addItem(key, quantity);
      collectedItems[key] = added;

      // Remove from bosun (even if not all was added due to cap)
      bosun.removeItem(key, quantity);
    }
  }

  // Return the bosun to the Infinity Well
  const returned = infinityWell.returnBosun(bosun);

  if (!returned) {
    return {
      success: false,
      error: 'Failed to return bosun to Infinity Well (at capacity)',
      bosunProcessed: 0,
      metadata: {
        bosunId: bosun.id,
        bosunName: bosun.name,
        collectedResources,
        collectedItems,
        note: 'Inventory was transferred but bosun could not be returned'
      }
    };
  }

  return {
    success: true,
    bosunProcessed: 1,
    metadata: {
      bosunId: bosun.id,
      bosunName: bosun.name,
      inputPort: usedInputIndex,
      collectedResources,
      collectedItems,
      currentBosunCount: infinityWell.getBosunCount()
    }
  };
};

/**
 * Clears the round-robin state for a specific node
 * Useful when resetting or reinitializing the simulation
 */
export function clearCollectActivityState(nodeKey?: string): void {
  if (nodeKey) {
    lastUsedInput.delete(nodeKey);
  } else {
    lastUsedInput.clear();
  }
}

/**
 * Gets the current round-robin state for debugging
 */
export function getCollectActivityState(): Map<string, number> {
  return new Map(lastUsedInput);
}
