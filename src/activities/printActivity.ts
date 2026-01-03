import { Activity, ActivityContext, ActivityResult } from './types';

/**
 * Print Activity - Used by Printer nodes
 *
 * This activity prints bosun information to the console for debugging purposes,
 * then passes the bosun through to the output connection.
 *
 * According to the design document:
 * - Printer nodes display all bosuns that pass through them for debugging
 *
 * Behavior:
 * - Pulls a bosun from input connections (round-robin when multiple inputs)
 * - Logs detailed information about the bosun to the console
 * - Pushes the bosun to output connections (round-robin when multiple outputs)
 * - Acts as a pass-through node for observing bosun flow
 */

/**
 * Tracks which input/output ports were last used for round-robin distribution
 * Key is the node's unique identifier
 */
const lastUsedInput = new Map<string, number>();
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
 * Formats bosun information for console output
 */
function formatBosunInfo(bosun: any): string {
  const lines: string[] = [];

  lines.push(`╭─────────────────────────────────────────────────`);
  lines.push(`│ BOSUN #${bosun.id}: ${bosun.name}`);
  lines.push(`├─────────────────────────────────────────────────`);
  lines.push(`│ Speed: ${bosun.getSpeed()} cells/second`);

  // Display tooltip if present
  const tooltip = bosun.getTooltip();
  if (tooltip) {
    lines.push(`│ Tooltip: ${tooltip}`);
  }

  // Display resources
  const resourceKeys = bosun.getResourceKeys();
  if (resourceKeys.length > 0) {
    lines.push(`│ Resources:`);
    resourceKeys.forEach(key => {
      const quantity = bosun.getResourceQuantity(key);
      const cap = bosun.getResourceCap(key);
      lines.push(`│   • ${key}: ${quantity}/${cap}`);
    });
  }

  // Display items
  const itemKeys = bosun.getItemKeys();
  if (itemKeys.length > 0) {
    lines.push(`│ Items:`);
    itemKeys.forEach(key => {
      const quantity = bosun.getItemQuantity(key);
      const cap = bosun.getItemCap(key);
      lines.push(`│   • ${key}: ${quantity}/${cap}`);
    });
  }

  // Show empty inventory if no resources or items
  if (resourceKeys.length === 0 && itemKeys.length === 0) {
    lines.push(`│ Inventory: (empty)`);
  }

  lines.push(`╰─────────────────────────────────────────────────`);

  return lines.join('\n');
}

/**
 * Print activity implementation
 */
export const printActivity: Activity = (context: ActivityContext): ActivityResult => {
  const { inputConnections, outputConnections, node } = context;

  // Check if we have any input connections
  if (inputConnections.length === 0) {
    return {
      success: false,
      error: 'No input connections available',
      bosunProcessed: 0
    };
  }

  // Check if we have any output connections
  if (outputConnections.length === 0) {
    return {
      success: false,
      error: 'No output connections available',
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

  // Print the bosun information to console
  console.log(`\n[Printer: ${node.title}] Bosun detected:`);
  console.log(formatBosunInfo(bosun));

  // Get the next output connection to use (round-robin distribution)
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
      inputPort: usedInputIndex,
      outputPort: nextOutput,
      speed: bosun.getSpeed(),
      tooltip: bosun.getTooltip(),
      resourceCount: bosun.getResourceKeys().length,
      itemCount: bosun.getItemKeys().length
    }
  };
};

/**
 * Clears the round-robin state for a specific node
 * Useful when resetting or reinitializing the simulation
 */
export function clearPrintActivityState(nodeKey?: string): void {
  if (nodeKey) {
    lastUsedInput.delete(nodeKey);
    lastUsedOutput.delete(nodeKey);
  } else {
    lastUsedInput.clear();
    lastUsedOutput.clear();
  }
}

/**
 * Gets the current round-robin state for debugging
 */
export function getPrintActivityState(): {
  inputs: Map<string, number>;
  outputs: Map<string, number>;
} {
  return {
    inputs: new Map(lastUsedInput),
    outputs: new Map(lastUsedOutput)
  };
}
