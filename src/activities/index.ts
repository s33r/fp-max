/**
 * Activities Module
 *
 * This module contains all activity implementations for nodes in the Alchemist's Slate.
 * Activities define the behavior of nodes and how they process bosuns.
 *
 * Available Activities:
 * - emit: Spawns bosuns from the Infinity Well (used by Source nodes)
 * - collect: Returns bosuns and their inventory to the Infinity Well (used by Sink nodes)
 * - print: Displays bosun information to console for debugging (used by Printer nodes)
 *
 * Future Activities:
 * - split: Distributes bosuns across multiple outputs (Splitter nodes)
 * - merge: Combines bosuns from multiple inputs (Merger nodes)
 */

export * from './types';
export * from './emitActivity';
export * from './collectActivity';
export * from './printActivity';

import { ActivityRegistry } from './types';
import { emitActivity } from './emitActivity';
import { collectActivity } from './collectActivity';
import { printActivity } from './printActivity';

/**
 * Default activity registry with all available activities
 */
export const defaultActivityRegistry: ActivityRegistry = {
  emit: emitActivity,
  collect: collectActivity,
  print: printActivity,
};
