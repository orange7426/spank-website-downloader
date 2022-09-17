import { Outlet } from 'react-router-dom';
import { Menu } from '@blueprintjs/core';
import { LinkMenuItem } from 'renderer/components/LinkButton';

const Preferences = () => {
  // TODO: auto nav to general page
  return (
    <div
      style={{
        flexDirection: 'row',
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <div
        className="bp4-dark"
        style={{
          alignSelf: 'stretch',
          flexDirection: 'row',
          display: 'flex',
        }}
      >
        <Menu>
          <LinkMenuItem to="general" text="General" />
          <LinkMenuItem to="accounts" text="Accounts" />
        </Menu>
      </div>
      <div
        style={{
          alignSelf: 'stretch',
          flex: 1,
          padding: 8,
          overflowY: 'scroll',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Preferences;
