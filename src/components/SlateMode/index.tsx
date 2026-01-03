import React, { useMemo, useEffect } from 'react';
import { Slate } from '../../logic/Slate';
import { Node } from '../../logic/Node';
import { InfinityWell } from '../../logic/InfinityWell';
import { Clock } from '../../logic/Clock';
import { defaultActivityRegistry } from '../../activities';
import { SlateRenderer } from '../SlateRenderer';
import { InfinityWellView } from '../InfinityWellView';
import './index.scss';

export const SlateMode: React.FC = () => {
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

  // Create an Infinity Well with some example data
  const well = useMemo(() => {
    const newWell = new InfinityWell(100);

    // Add some example resources
    newWell.createResourceSlot('Gold', 1000, 50);
    newWell.createResourceSlot('Wood', 500, 250);
    newWell.createResourceSlot('Stone', 500, 100);

    // Add some example items
    newWell.createItemSlot('Speed Boost', 10, 3);
    newWell.createItemSlot('Capacity Upgrade', 5, 1);

    return newWell;
  }, []);

  // Create the Clock instance
  const clock = useMemo(() => {
    return new Clock(slate, well, defaultActivityRegistry, 1000);
  }, [slate, well]);

  // Start the clock when component mounts, stop when unmounts
  useEffect(() => {
    console.log('[SlateMode] Starting clock...');
    clock.start();

    // Cleanup: stop the clock when component unmounts
    return () => {
      console.log('[SlateMode] Stopping clock...');
      clock.stop();
    };
  }, [clock]);

  return (
    <div className="slate-mode">
      <div className="slate-mode-content">
        <div className="slate-mode-sidebar">
          <InfinityWellView well={well} />
        </div>
        <div className="slate-mode-main">
          <SlateRenderer slate={slate} />
        </div>
      </div>
    </div>
  );
};
