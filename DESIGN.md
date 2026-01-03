# IdyllWyld Game Design

## Introduction
In **IdyllWyld** players take on the role of a newly apprenticed alchemist. The player and their master _Merlin_ are sent to the small village of _Wyldend_ but before they can arrive, _Merlin_ is killed by highwaymen. But could simple robbers really kill someone like Merlin? The player continues on to the village which is desperate for assistance. The player must aid the village with their alchemical skills while investigating the fate of their former master. As he story unfolds the player will meet a colorful cast of characters, build machines to improve _Wyldend_, discover the fate of _Merlin_ and to finally unravel the mystery of the kingdom of _Idyll_.

### Basic Elements
- The player's trusty _Alchemist's Slate_, a tool for designing alchemical machines that automate the crafting of anything from the basic elements.
- The player's spirit companion _Wayf_ who will provide advice and help as well as companionship
- The mystic _Infinity Well_, another dimension that can hold the resources that will be produced with the _Alchemist's Slate_
- The village of _Wyldend_ which changes and improves as the player builds more machines.
- The kingdom of _Idyll_ which is wrapped in intrigue over the strange behavior of its new ruler.
- The people of _Wyldend_, _Idyll_ and parts unknown who will interact with the player in conversation and provide missions to complete.


### Basic Gameplay
IdyllWyld is a incremental crafting game with strong role playing and story telling elements.

The core gameplay loop is:
1. Converse with characters to discover the plot, the lore, and to acquire missions.
2. Design machines on the _Alchemist's Slate_ to fulfill missions.
3. Monitor and improve the design of existing machines to better complete future missions.
4. Complete missions and go back to step 1.

The game is divided into five main sections and the player can toggle between them at will.

- The _Alchemist's Slate Mode_ allows the player to design crafting plans for machines that produce the items needed to complete missions.
- The _Status Mode_ allows the player to view missions, _Wyldend_, _Idyll_, the _Infinity Well_ (their inventory) and production status of running machines.
- The _Conversation Mode_ allows the player to have dialog with various characters like their assistant _Wayf_
- The _Library Mode_ allows the player to view gameplay information and help texts.
- The _Menu Mode_ allows the player to save, load, quit, and configure the game. The player can also view credits and update notes about the game.

# The Infinity Well
The _Infinity Well_ stores three kinds of things:
- _Bosuns_: Bosuns carry items, resources and preform actions.
- _Resources_: Resources are consumed by Bosuns when the preform actions.
- _Items_: Items are used by Bosuns to make them more effective at preforming different cations.

Each specific kind of resource or item has its own slot in the Infinity Well. The amount of each slot is incremented or decremented as Bosuns add or remove items from the Infinity Well. Each slot also has a maximum amount called a _Cap_. the maximum can be different for each slot.

# The Alchemist's Slate

The _Alchemist's Slate_, often referred to as the "slate" is a tool for designing alchemical machines. A design is a directed graph of _Nodes_ and _Connections_. The slate arranges _Nodes_ and _Connections_ on a 2d grid.

The slate has a grid where each cell is 32px. Nodes snap to the edges of this grid. Connections snap to the center of the cell.

_Bosuns_ travel between nodes.


## Nodes
A node consists of the following properties:

| Property     | Description
|--------------|------------
| Title        | The user friendly title of the node. Generally one or two words that describe what the node does.
| Icon         | A 24x24px icon for the Node.
| Description  | A longer description of how the node works, what it does and how to use it.
| Tooltip      | A one sentence summary of the description.
| Flipped      | If true, then the nodes Outputs are shown above its Inputs.
| Reversed     | If true, then the nodes Outputs are shown on the left side and its Inputs are shown on the right.
| Input Ports  | The list of ports that can accept input connections from other nodes
| Output Ports | The list of ports that can accept output connections from other nodes
| Locked       | If true, then this node cannot be moved by the player.
| Inventory    | The items that are currently stored in this node.
| Error        | If something breaks in the node, for example an invalid item was added to the Node's inventory, then the Error condition is set with information about what caused the problem
| Action       | Defines the activity that the bosun will do when it reaches the node.

## Ports

Each node has between 0-4 input ports and 0-4 output ports.

It also has a single Error port.

Each port has only accepts certain connections according to the following rules:
- Output ports can only connect to input ports.
- Input ports can only connect to output ports.
- Ports only accept a single connection.
- Ports on the same node cannot be connected to each other.


## Connection

A connection links an input on one node to an output on another. It is a first-in-first out buffer.

Output ports push bosuns onto their connection.
Input ports pull bosuns off of their connection.

## Activities
Each node has an activity. Activities typically pull bosuns off of their input queue, transform them in some way and then push the altered bosun on to the output queue.
Some activities pull or push bosuns from the Infinity Well instead of connections.

## Bosuns

A bosun is a small creature that travels between nodes. Each bosun has a whimsical but automatically generated name but is uniquely identified by an incremental number that is assigned when it is generated. bosuns are created by _Source_ nodes. Source nodes generate bosuns as long as the Infinity Pool's bosun slot has a quantity greater than 0.

Bosuns travel at a fixed speed through the network of nodes and connections. this speed is measured in grid cells per second. The starting speed is 1cs or one cell per second.

Bosuns have an inventory which functions the same way as the Infinity Well, but the caps for each slot are much lower.
Bosuns have a tooltip which starts out as blank, but may be assigned by an activity.


## Visual Design


### Node
Each Node is a rectangle who's height and width is divisible by the grid size of 32px.

It is a vertical stack of rectangles that looks like this:

| Row          | Height | Description
|--------------|--------|--------------
| Title Bar    | 1      | The icon first and then the title are left aligned.
| Status Bar   | 2      | The status indicator for the node's current activity.
| Input Ports  | 1 each | The input ports one row per port. Swaps with Output ports when node is flipped.
| Output Ports | 1 each | The output ports, one row per port. Swaps with Input ports when node is flipped.
| Error Port   | 1      | the output port for errors.
| Config Bar   | 1      | Four buttons, toggle locked, toggle flipped, toggle reversed, help


### Ports
Each port consists of three elements
An icon, a label and a connection indicator.

For input ports, the icon is on the right of the title and the connection indicator is on the left of the title by default
For output ports, the icon is on the left of the title and the connection indicator is on the right of the title by default.

The title fills all remaining space between the icon and the connection indicator.

The connection indicator is a small blue circle.
The connection indicator is a small red triangle.

the connection indicator is empty when not connected and filled in when connected.


## Node Types
There are several node types, this lists the basic ones to get started with making the game.

| Title             |  Inputs | Outputs | Action
|-------------------|---------|---------|-----------------
| Source x1         | 0       | 1       | Emits bosuns
| Source x2         | 0       | 2       | Emits bosuns
| Source x3         | 0       | 3       | Emits bosuns
| Source x4         | 0       | 4       | Emits bosuns
| Sink x1           | 1       | 0       | Collects bosuns
| Sink x2           | 2       | 0       | Collects bosuns
| Sink x3           | 3       | 0       | Collects bosuns
| Sink x4           | 4       | 0       | Collects bosuns
| Printer           | 1       | 1       | Displays all bosuns that bass through it
| Error Printer     | 1       | 0       | Displays errors
| Splitter x2       | 1       | 2       | Splits bosuns evenly across outputs
| Splitter x3       | 1       | 3       | Splits bosuns evenly across outputs
| Splitter x4       | 1       | 4       | Splits bosuns evenly across outputs
| Smart Splitter x2 | 1       | 2       | Splits bosuns evenly across outputs with filters to direct bosuns to particular outputs
| Smart Splitter x3 | 1       | 3       | Splits bosuns evenly across outputs with filters to direct bosuns to particular outputs
| Smart Splitter x4 | 1       | 4       | Splits bosuns evenly across outputs with filters to direct bosuns to particular outputs
| Merger x2         | 2       | 1       | Merges bosuns into one input
| Merger x3         | 3       | 1       | Merges bosuns into one input
| Merger x4         | 4       | 1       | Merges bosuns into one input