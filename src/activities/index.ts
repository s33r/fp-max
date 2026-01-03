/**
 * Activities Module
 *
 * This module contains all activity implementations for nodes in the Alchemist's Slate.
 * Activities define the behavior of nodes and how they process bosuns.
 *
 * Available Activities:
 * - emit: Spawns bosuns from the Infinity Well (used by Source nodes)
 *
 * Future Activities:
 * - collect: Returns bosuns to the Infinity Well (Sink nodes)
 * - print: Displays bosuns for debugging (Printer nodes)
 * - split: Distributes bosuns across multiple outputs (Splitter nodes)
 * - merge: Combines bosuns from multiple inputs (Merger nodes)
 */

export * from './types';
export * from './emitActivity';

import { ActivityRegistry } from './types';
import { emitActivity } from './emitActivity';

/**
 * Default activity registry with all available activities
 */
export const defaultActivityRegistry: ActivityRegistry = {
  emit: emitActivity,
};
