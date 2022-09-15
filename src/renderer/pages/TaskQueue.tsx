/* eslint-disable react/jsx-props-no-spreading */
import { Button, NonIdealState } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

const TaskQueue = () => {
  return (
    <div style={{ marginTop: 24, marginBottom: 36 }}>
      <NonIdealState title="Empty Queue" icon="inbox" />
    </div>
  );
};

export default function TaskQueueMenu() {
  return (
    <Popover2
      placement="bottom-end"
      content={
        <div style={{ maxHeight: 300, minWidth: 300, overflowY: 'auto' }}>
          <TaskQueue />
        </div>
      }
      renderTarget={({ isOpen, ref, ...p }) => (
        <Button
          {...p}
          className="bp4-minimal"
          icon="list"
          text="Task Queue"
          active={isOpen}
          elementRef={ref}
        />
      )}
    />
  );
}
