# InfinityWellView

A component for displaying the current state of the Infinity Well.

## Purpose

The InfinityWellView displays the player's inventory stored in the Infinity Well, including:
- Bosuns (available/cap)
- Resources (each with quantity/cap)
- Items (each with quantity/cap)

The component uses standard HTML markup styled to match the visual aesthetic of the Alchemist's Slate (dark theme with similar colors and spacing).

## Props

| Prop | Type | Description |
|------|------|-------------|
| well | InfinityWell | The InfinityWell instance to display |

## Usage

```tsx
import { InfinityWellView } from '../InfinityWellView';
import { InfinityWell } from '../../logic/InfinityWell';

const MyComponent = () => {
  const well = new InfinityWell();

  // Add some resources
  well.createResourceSlot('gold', 1000, 50);
  well.createResourceSlot('wood', 500, 100);

  return <InfinityWellView well={well} />;
};
```

## Features

- Displays bosun availability with progress bar
- Lists all resources with quantity/cap and progress bars
- Lists all items with quantity/cap and progress bars
- Shows empty state message when no resources/items exist
- Scrollable when content exceeds available height
