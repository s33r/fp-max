import React, { useMemo } from 'react';
import { Slate } from '../../logic/Slate';
import { Node } from '../../logic/Node';
import { SlateView } from '../SlateView';
import './index.scss';

export const SlateExample: React.FC = () => {
  const slate = useMemo(() => {
    const newSlate = new Slate();

    // Create a Source node (emits bosuns)
    const sourceNode = new Node(
      'Source x1',
      '🌊',
      'Emits bosuns from the Infinity Well at a regular interval',
      'Emits bosuns',
      { type: 'emit' },
      0, // no inputs
      1  // 1 output
    );
    sourceNode.outputPorts[0].label = 'Output';

    // Create a Printer node (displays bosuns that pass through)
    const printerNode = new Node(
      'Printer',
      '🖨️',
      'Displays all bosuns that pass through it for debugging purposes',
      'Displays bosuns',
      { type: 'print' },
      1, // 1 input
      1  // 1 output
    );
    printerNode.inputPorts[0].label = 'Input';
    printerNode.outputPorts[0].label = 'Output';

    // Create a Sink node (collects bosuns)
    const sinkNode = new Node(
      'Sink x1',
      '🗑️',
      'Collects bosuns and returns them to the Infinity Well',
      'Collects bosuns',
      { type: 'collect' },
      1, // 1 input
      0  // no outputs
    );
    sinkNode.inputPorts[0].label = 'Input';

    // Add nodes to the slate at different positions
    const sourceId = newSlate.addNode(sourceNode, 100, 100);
    const printerId = newSlate.addNode(printerNode, 400, 100);
    const sinkId = newSlate.addNode(sinkNode, 700, 100);

    // Connect the nodes: Source -> Printer -> Sink
    newSlate.addConnection(sourceId, 0, printerId, 0);
    newSlate.addConnection(printerId, 0, sinkId, 0);

    return newSlate;
  }, []);

  return (
    <div className="slate-example">
      <div className="slate-example-header">
        <h1>Alchemist's Slate - Example</h1>
        <p>A simple demonstration with three connected nodes: Source → Printer → Sink</p>
      </div>
      <div className="slate-example-content">
        <SlateView slate={slate} />
      </div>
    </div>
  );
};
