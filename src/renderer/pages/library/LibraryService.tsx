import {
  Button,
  ButtonGroup,
  Divider,
  NonIdealState,
  Spinner,
} from '@blueprintjs/core';
import React from 'react';
import { useParams } from 'react-router-dom';
import LibraryTable from 'renderer/components/LibraryTable';
import { useServiceAccountMapping } from 'renderer/hooks/useServiceAccountMapping';
import crawlerManager from 'renderer/services/crawlerManager';

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

  if (service.accounts.length === 0) {
    return (
      <div>
        <ServiceHeader service={service} />
        <Empty service={service} />
      </div>
    );
  }

  //  TODO: Auto retry on multiple accounts
  const account = service.accounts[0];

  const pull = () => {
    crawlerManager.pullIncrementalUpdates(service.id, account);
  };

  return (
    <div>
      <ServiceHeader service={service} />
      <div>
        <ButtonGroup>
          <Button icon="cloud-download" onClick={pull}>
            Pull Incremental Updates
          </Button>
          <Button icon="database" intent="warning" disabled>
            Rebuild Database
          </Button>
          <Divider />
          <Button icon="double-chevron-down" disabled>
            Enqueue All Unscheduled Items
          </Button>
        </ButtonGroup>
      </div>
      <LibraryTable service={service} />
    </div>
  );
};

export default LibraryService;
