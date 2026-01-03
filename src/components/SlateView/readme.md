# SlateView Component

## Purpose
The SlateView component renders the Alchemist's Slate - a visual interface for designing alchemical machines using a directed graph of nodes and connections.

## Features
- Renders nodes on a 32px grid system
- Displays connections between nodes as lines
- Shows node ports, titles, icons, and status
- Supports node flipping and reversing
- Displays locked state indicators
- Shows bosuns traveling through connections
- Renders error states

## Props
- `slate: Slate` - The slate object to render

## Usage
```tsx
import { SlateView } from './components/SlateView';
import { Slate } from './logic/Slate';

const slate = new Slate();
// Add nodes and connections...

<SlateView slate={slate} />
```
