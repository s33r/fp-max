# Activities

This directory contains all activity implementations for nodes in the Alchemist's Slate.

## What are Activities?

Activities define the behavior of nodes in the slate network. Each node has an associated activity that determines what happens when bosuns reach that node. Activities can:

- Pull bosuns from input connections
- Transform bosuns (modify inventory, tooltip, etc.)
- Push bosuns to output connections
- Interact with the Infinity Well to spawn or collect bosuns
- Consume or produce resources

## Structure

- `types.ts` - Core type definitions for activities
- `index.ts` - Activity registry and exports
- `emitActivity.ts` - Source node activity (spawns bosuns)
- `collectActivity.ts` - Sink node activity (collects bosuns and inventory)

## Implemented Activities

### Emit Activity
**Used by**: Source nodes (Source x1, Source x2, Source x3, Source x4)

**Behavior**:
- Spawns bosuns from the Infinity Well
- Distributes bosuns to output connections using round-robin
- Decrements the Infinity Well's bosun count
- Fails if no bosuns are available or no output connections exist

**Parameters**: None

### Collect Activity
**Used by**: Sink nodes (Sink x1, Sink x2, Sink x3, Sink x4)

**Behavior**:
- Pulls bosuns from input connections using round-robin
- Transfers all resources from bosun's inventory to the Infinity Well
- Transfers all items from bosun's inventory to the Infinity Well
- Returns the bosun to the Infinity Well (increments bosun count)
- Auto-creates resource/item slots in the Infinity Well if they don't exist
- Reports collected resources and items in metadata

**Parameters**: None

**Note**: If the Infinity Well is at capacity for bosuns, the inventory is still transferred but the bosun itself cannot be returned.

## Planned Activities

- **Print**: Logs bosun information for debugging (Printer nodes)
- **Split**: Distributes bosuns across outputs (Splitter nodes)
- **Smart Split**: Filters bosuns to specific outputs (Smart Splitter nodes)
- **Merge**: Combines bosuns from multiple inputs (Merger nodes)

## Adding New Activities

1. Create a new file `[activityName]Activity.ts`
2. Export an activity function matching the `Activity` type
3. Add the activity to the registry in `index.ts`
4. Update this README with documentation

## Example Activity

```typescript
import { Activity, ActivityContext, ActivityResult } from './types';

export const myActivity: Activity = (context: ActivityContext): ActivityResult => {
  const { node, infinityWell, inputConnections, outputConnections } = context;

  // Your activity logic here

  return {
    success: true,
    bosunProcessed: 1,
    metadata: { /* optional metadata */ }
  };
};
```
