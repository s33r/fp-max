import React from 'react';
import { InfinityWell } from '../../logic/InfinityWell';
import './index.scss';

interface InfinityWellViewProps {
  well: InfinityWell;
}

interface SlotDisplayProps {
  label: string;
  quantity: number;
  cap: number;
  icon?: string;
}

const SlotDisplay: React.FC<SlotDisplayProps> = ({ label, quantity, cap, icon }) => {
  const percentage = cap > 0 ? (quantity / cap) * 100 : 0;

  return (
    <div className="slot-display">
      <div className="slot-header">
        {icon && <span className="slot-icon">{icon}</span>}
        <span className="slot-label">{label}</span>
      </div>
      <div className="slot-bar">
        <div
          className="slot-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="slot-values">
        <span className="slot-quantity">{quantity}</span>
        <span className="slot-separator">/</span>
        <span className="slot-cap">{cap}</span>
      </div>
    </div>
  );
};

export const InfinityWellView: React.FC<InfinityWellViewProps> = ({ well }) => {
  const summary = well.getSummary();
  const resourceKeys = well.getResourceKeys();
  const itemKeys = well.getItemKeys();

  return (
    <div className="infinity-well-view">
      <div className="well-header">
        <span className="well-icon">🌀</span>
        <span className="well-title">Infinity Well</span>
      </div>

      <div className="well-section">
        <div className="section-header">
          <span className="section-title">Bosuns</span>
        </div>
        <div className="section-content">
          <SlotDisplay
            label="Available"
            quantity={summary.bosuns.quantity}
            cap={summary.bosuns.cap}
            icon="👤"
          />
        </div>
      </div>

      {resourceKeys.length > 0 && (
        <div className="well-section">
          <div className="section-header">
            <span className="section-title">Resources</span>
          </div>
          <div className="section-content">
            {resourceKeys.map(key => {
              const slot = well.getResourceSlot(key);
              if (!slot) return null;
              return (
                <SlotDisplay
                  key={key}
                  label={key}
                  quantity={slot.quantity}
                  cap={slot.cap}
                  icon="📦"
                />
              );
            })}
          </div>
        </div>
      )}

      {itemKeys.length > 0 && (
        <div className="well-section">
          <div className="section-header">
            <span className="section-title">Items</span>
          </div>
          <div className="section-content">
            {itemKeys.map(key => {
              const slot = well.getItemSlot(key);
              if (!slot) return null;
              return (
                <SlotDisplay
                  key={key}
                  label={key}
                  quantity={slot.quantity}
                  cap={slot.cap}
                  icon="🔧"
                />
              );
            })}
          </div>
        </div>
      )}

      {resourceKeys.length === 0 && itemKeys.length === 0 && (
        <div className="well-empty">
          <span className="empty-message">No resources or items yet</span>
        </div>
      )}
    </div>
  );
};
