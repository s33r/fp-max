import { Slate } from './Slate';
import { Node } from './Node';
import { Connection } from './Connection';
import { InfinityWell } from './InfinityWell';
import { ActivityRegistry, ActivityContext, ActivityResult } from '../activities/types';

/**
 * Clock manages the game simulation by ticking at regular intervals
 * and executing node activities in the correct order.
 *
 * On each tick:
 * 1. Activities are executed in topological order (sources first, then downstream)
 * 2. Each node's activity is run once per tick
 * 3. The order ensures data flows correctly through the network
 */
export class Clock {
  private slate: Slate;
  private infinityWell: InfinityWell;
  private activityRegistry: ActivityRegistry;
  private isRunning: boolean;
  private intervalId: number | null;
  private tickCount: number;
  private lastTickTime: number;
  private tickInterval: number; // milliseconds

  constructor(
    slate: Slate,
    infinityWell: InfinityWell,
    activityRegistry: ActivityRegistry,
    tickInterval: number = 1000 // Default: 1 second
  ) {
    this.slate = slate;
    this.infinityWell = infinityWell;
    this.activityRegistry = activityRegistry;
    this.isRunning = false;
    this.intervalId = null;
    this.tickCount = 0;
    this.lastTickTime = 0;
    this.tickInterval = tickInterval;
  }

  /**
   * Starts the clock ticking
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastTickTime = Date.now();

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, this.tickInterval);

    console.log(`[Clock] Started with ${this.tickInterval}ms interval`);
  }

  /**
   * Stops the clock
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log(`[Clock] Stopped after ${this.tickCount} ticks`);
  }

  /**
   * Executes one tick of the simulation
   */
  tick(): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastTickTime;
    this.lastTickTime = currentTime;
    this.tickCount++;

    console.log(`\n[Clock] Tick #${this.tickCount} (Δ${deltaTime}ms)`);

    // Get all nodes in topological order (sources to sinks)
    const nodeOrder = this.getTopologicalOrder();

    // Execute each node's activity
    for (const { id, node } of nodeOrder) {
      this.executeNodeActivity(id, node, currentTime, deltaTime);
    }
  }

  /**
   * Manually execute a single tick (useful for testing/debugging)
   */
  singleTick(): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastTickTime;
    this.lastTickTime = currentTime;
    this.tickCount++;

    this.tick();
  }

  /**
   * Executes the activity for a specific node
   */
  private executeNodeActivity(
    nodeId: string,
    node: Node,
    currentTime: number,
    deltaTime: number
  ): void {
    const activityType = node.action.type;
    const activity = this.activityRegistry[activityType];

    if (!activity) {
      console.warn(`[Clock] No activity registered for type '${activityType}' (node: ${node.title})`);
      return;
    }

    // Get input and output connections for this node
    const inputConnections = this.getInputConnections(node);
    const outputConnections = this.getOutputConnections(node);

    // Build activity context
    const context: ActivityContext = {
      node,
      infinityWell: this.infinityWell,
      inputConnections,
      outputConnections,
      currentTime,
      deltaTime
    };

    // Execute the activity
    try {
      const bosunsBefore = this.infinityWell.getBosunCount();
      const result: ActivityResult = activity(context);
      const bosunsAfter = this.infinityWell.getBosunCount();

      if (!result.success) {
        // Only log errors that aren't just "no bosuns available"
        if (result.error && !result.error.includes('No bosuns available')) {
          console.log(`[Clock] ${node.title}: ${result.error}`);
        }
      } else {
        console.log(`[Clock] ${node.title}: Processed ${result.bosunProcessed} bosun(s) [Well: ${bosunsBefore} → ${bosunsAfter}]`);
      }
    } catch (error) {
      console.error(`[Clock] Error executing activity for ${node.title}:`, error);
      // Set node error state
      node.error = {
        message: 'Activity execution failed',
        details: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Gets input connections for a node
   */
  private getInputConnections(node: Node): Connection[] {
    return this.slate.connections.filter(conn => conn.targetNode === node);
  }

  /**
   * Gets output connections for a node
   */
  private getOutputConnections(node: Node): Connection[] {
    return this.slate.connections.filter(conn => conn.sourceNode === node);
  }

  /**
   * Gets nodes in topological order (sources first, then downstream)
   * Uses breadth-first search to ensure proper execution order
   * Prevents running the same activity twice in one tick (cycle detection)
   */
  private getTopologicalOrder(): Array<{ id: string; node: Node }> {
    const allNodes = this.slate.getAllNodes();
    const visited = new Set<string>();
    const result: Array<{ id: string; node: Node }> = [];

    // Build adjacency map (node -> downstream nodes)
    const adjacencyMap = new Map<string, string[]>();
    for (const { id } of allNodes) {
      adjacencyMap.set(id, []);
    }

    // Populate adjacency map based on connections
    for (const connection of this.slate.connections) {
      const sourceId = this.getNodeId(connection.sourceNode);
      const targetId = this.getNodeId(connection.targetNode);

      if (sourceId && targetId) {
        const downstream = adjacencyMap.get(sourceId);
        if (downstream) {
          downstream.push(targetId);
        }
      }
    }

    // Find source nodes (nodes with no inputs)
    const sourceNodes = allNodes.filter(({ id, node }) => {
      const inputConns = this.getInputConnections(node);
      return inputConns.length === 0;
    });

    // BFS from all source nodes
    const queue: string[] = [];

    // Add all source nodes to the queue
    for (const { id } of sourceNodes) {
      queue.push(id);
      visited.add(id);
    }

    // Process nodes in breadth-first order
    while (queue.length > 0) {
      const nodeId = queue.shift()!;

      const nodeData = this.slate.nodes.get(nodeId);
      if (!nodeData) {
        continue;
      }

      // Add this node to result
      result.push({
        id: nodeId,
        node: nodeData.node
      });

      // Add downstream nodes to queue (if not already visited)
      const downstream = adjacencyMap.get(nodeId) || [];
      for (const downstreamId of downstream) {
        if (!visited.has(downstreamId)) {
          visited.add(downstreamId);
          queue.push(downstreamId);
        }
        // If already visited, this is a cycle - skip to prevent duplicate execution
      }
    }

    // Handle any remaining unvisited nodes (disconnected from sources)
    for (const { id } of allNodes) {
      if (!visited.has(id)) {
        const nodeData = this.slate.nodes.get(id);
        if (nodeData) {
          result.push({
            id,
            node: nodeData.node
          });
        }
      }
    }

    return result;
  }

  /**
   * Gets the ID of a node
   */
  private getNodeId(node: Node): string | null {
    for (const [id, nodeData] of this.slate.nodes.entries()) {
      if (nodeData.node === node) {
        return id;
      }
    }
    return null;
  }

  /**
   * Gets the current tick count
   */
  getTickCount(): number {
    return this.tickCount;
  }

  /**
   * Checks if the clock is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Gets the tick interval in milliseconds
   */
  getTickInterval(): number {
    return this.tickInterval;
  }

  /**
   * Sets the tick interval (takes effect after restart)
   */
  setTickInterval(interval: number): void {
    if (interval < 100) {
      throw new Error('Tick interval must be at least 100ms');
    }

    this.tickInterval = interval;

    // If running, restart with new interval
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Resets the clock (stops it and resets tick count)
   */
  reset(): void {
    this.stop();
    this.tickCount = 0;
    this.lastTickTime = 0;
  }

  /**
   * Gets a summary of the clock state
   */
  getSummary(): {
    isRunning: boolean;
    tickCount: number;
    tickInterval: number;
    nodeCount: number;
    connectionCount: number;
  } {
    return {
      isRunning: this.isRunning,
      tickCount: this.tickCount,
      tickInterval: this.tickInterval,
      nodeCount: this.slate.getNodeCount(),
      connectionCount: this.slate.getConnectionCount()
    };
  }
}
