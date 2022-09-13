import { Outlet } from 'react-router-dom';
import { Menu } from '@blueprintjs/core';
import { LinkMenuItem } from 'renderer/components/LinkButton';
import { useServiceAccountMapping } from 'renderer/hooks/useServiceAccountMapping';

const Library = () => {
  const services = useServiceAccountMapping();

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
        <Menu style={{ borderRadius: 0 }}>
          {Object.values(services).map((service) => (
            <LinkMenuItem
              key={service.id}
              to={service.id}
              text={service.name}
            />
          ))}
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

export default Library;
