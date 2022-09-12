import { Button, NonIdealState, Spinner } from '@blueprintjs/core';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useServiceAccountMapping } from 'renderer/hooks/useServiceAccountMapping';

const ServiceHeader = ({ service }: { service: Service }) => {
  return (
    <div
      style={{
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <h1>{service.name}</h1>
      {service.logo == null ? null : (
        <img style={{ maxHeight: 60 }} src={service.logo} alt="logo" />
      )}
    </div>
  );
};

const Empty = ({ service }: { service: Service }) => {
  return (
    <NonIdealState
      icon="user"
      title="No Account"
      description={`No account has been found for ${service.name}. Add your account in preferences to continue.`}
    />
  );
};

const LibraryService = () => {
  const services = useServiceAccountMapping();
  const { serviceId } = useParams();

  const service = React.useMemo(
    () => services[serviceId ?? ''] ?? null,
    [services, serviceId]
  );

  if (service == null) {
    return <Spinner />;
  }

  return (
    <div>
      <ServiceHeader service={service} />
      {service.accounts.length === 0 ? <Empty service={service} /> : null}
    </div>
  );
};

export default LibraryService;
