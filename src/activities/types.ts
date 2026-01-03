import { Node } from '../logic/Node';
import { Bosun } from '../logic/Bosun';
import { InfinityWell } from '../logic/InfinityWell';
import { Connection } from '../logic/Connection';

/**
 * ActivityContext provides the context needed for activities to execute
 * Activities need access to the node, connections, and the Infinity Well
 */
export interface ActivityContext {
  /** The node executing the activity */
  node: Node;

  /** The Infinity Well for spawning/collecting bosuns and managing resources */
  infinityWell: InfinityWell;

  /** Input connections to pull bosuns from */
  inputConnections: Connection[];

  /** Output connections to push bosuns to */
  outputConnections: Connection[];

  /** Current game time in milliseconds (for timing-based activities) */
  currentTime: number;

  /** Delta time since last update in milliseconds */
  deltaTime: number;
}

/**
 * ActivityResult describes what happened during an activity execution
 */
export interface ActivityResult {
  /** Whether the activity successfully executed */
  success: boolean;

  /** Optional error message if the activity failed */
  error?: string;

  /** Number of bosuns processed */
  bosunProcessed?: number;

  /** Additional metadata about the execution */
  metadata?: Record<string, unknown>;
}

/**
 * Activity is a function that executes node behavior
 * Activities pull bosuns from input connections, transform them, and push to outputs
 * Some activities interact with the Infinity Well instead of connections
 */
export type Activity = (context: ActivityContext) => ActivityResult;

/**
 * ActivityRegistry maps activity type names to their implementations
 */
export type ActivityRegistry = {
  [activityType: string]: Activity;
};
