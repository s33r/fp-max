# SlateRenderer

A canvas-based renderer for the Alchemist's Slate.

## Purpose

The SlateRenderer component uses HTML Canvas to render the Alchemist's Slate, which is a 2D grid-based interface for designing alchemical machines. This approach provides better performance for complex slate designs with many nodes and connections.

## Features

- Renders the 32px grid background
- Draws nodes with title bar, status bar, ports, error port, and config bar
- Draws connections between nodes with queue length indicators
- Supports node states: locked, flipped, reversed, error
- Handles high DPI displays for crisp rendering

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| slate | Slate | required | The Slate instance to render |
| width | number | 1200 | Canvas width in pixels |
| height | number | 800 | Canvas height in pixels |

## Usage

```tsx
import { SlateRenderer } from '../SlateRenderer';
import { Slate } from '../../logic/Slate';

const MyComponent = () => {
  const slate = new Slate();
  // ... add nodes and connections to slate

  return <SlateRenderer slate={slate} width={1200} height={800} />;
};
```
