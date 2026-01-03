import { Activity, ActivityContext, ActivityResult } from './types';

/**
 * Emit Activity - Used by Source nodes
 *
 * This activity spawns bosuns from the Infinity Well and pushes them to output connections.
 *
 * According to the design document:
 * - Source nodes generate bosuns as long as the Infinity Well's bosun slot has quantity > 0
 * - Bosuns are created with an auto-generated name and unique ID
 * - The spawned bosun starts with a speed of 1 cell per second
 *
 * Behavior:
 * - Attempts to spawn a bosun from the Infinity Well
 * - If successful, distributes the bosun to available output connections
 * - Uses round-robin distribution when multiple outputs are available
 * - If no outputs are available or bosun cannot be spawned, returns failure
 */

/**
 * Tracks which output port was last used for round-robin distribution
 * Key is the node's unique identifier
 */
const lastUsedOutput = new Map<string, number>();

/**
 * Generates a unique key for a node to track its state
 */
function getNodeKey(context: ActivityContext): string {
  // Use node's title and position as a simple key
  // In a real implementation, nodes should have unique IDs
  return `${context.node.title}-${context.inputConnections.length}-${context.outputConnections.length}`;
}

/**
 * Emit activity implementation
 */
export const emitActivity: Activity = (context: ActivityContext): ActivityResult => {
  const { infinityWell, outputConnections, node } = context;

  // Check if we have any output connections
  if (outputConnections.length === 0) {
    return {
      success: false,
      error: 'No output connections available',
      bosunProcessed: 0
    };
  }

  // Attempt to spawn a bosun from the Infinity Well
  const bosun = infinityWell.spawnBosun();

  if (!bosun) {
    return {
      success: false,
      error: 'No bosuns available in Infinity Well',
      bosunProcessed: 0
    };
  }

  // Get the next output connection to use (round-robin distribution)
  const nodeKey = getNodeKey(context);
  const lastOutput = lastUsedOutput.get(nodeKey) ?? -1;
  const nextOutput = (lastOutput + 1) % outputConnections.length;
  lastUsedOutput.set(nodeKey, nextOutput);

  // Push the bosun to the selected output connection
  const targetConnection = outputConnections[nextOutput];
  targetConnection.push(bosun);

  return {
    success: true,
    bosunProcessed: 1,
    metadata: {
      bosunId: bosun.id,
      bosunName: bosun.name,
      outputPort: nextOutput,
      remainingBosuns: infinityWell.getBosunCount()
    }
  };
};

/**
 * Clears the round-robin state for a specific node
 * Useful when resetting or reinitializing the simulation
 */
export function clearEmitActivityState(nodeKey?: string): void {
  if (nodeKey) {
    lastUsedOutput.delete(nodeKey);
  } else {
    lastUsedOutput.clear();
  }
}

/**
 * Gets the current round-robin state for debugging
 */
export function getEmitActivityState(): Map<string, number> {
  return new Map(lastUsedOutput);
}
