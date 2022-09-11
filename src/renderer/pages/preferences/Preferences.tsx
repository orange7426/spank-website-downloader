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
      }}
    >
      <div>
        <Menu>
          <LinkMenuItem to="general" text="General" />
          <LinkMenuItem to="accounts" text="Accounts" />
        </Menu>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Preferences;
