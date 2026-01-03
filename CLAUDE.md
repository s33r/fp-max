# Project Description

This project is an incremental-crafting game. The full game design document is located at `DESIGN.md`. Always read this file when making changes.

# Workflow

When working on a request follow this process:
- Complete the request
- Commit
- Push

# Project Organization

Conceptually the project is divided into:

| Element                 | Directory         | Purpose
|-------------------------|-------------------|-----------------------------------------------------
| UI Components - Library | `src/components/` | React components that provide the user interface for the project.
| UI Components - Utility | `src/helpers`     | React components that are used for testing and starting up the project.
| Game Logic              | `src/logic`       | Classes and functions that are used for running game logic.
| Game Data               | `src/data`        | Immutable classes that represent data loaded from json data files.
| Game Resources          | `src/resources`   | Place to keep json data files, images or other multimedia used by the game.

## Components

Each component must have its own directory. When creating a new component ensure that it has:
1. a `readme.md` file that describes the purpose of the component
2. a `index.tsx` file that has the react component itself.
3. a `index.scss` file that has the styles for the component.

Components display but do not handle any actual game logic.
