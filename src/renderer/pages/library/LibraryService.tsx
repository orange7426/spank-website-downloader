import {
  Button,
  ButtonGroup,
  Divider,
  NonIdealState,
  Spinner,
} from '@blueprintjs/core';
import React from 'react';
import { useParams } from 'react-router-dom';
import LibraryTable from 'renderer/pages/library/LibraryTable';
import { useServiceAccountMapping } from 'renderer/hooks/useServiceAccountMapping';
import { pullIncrementalUpdates } from 'renderer/services/crawlerManager';

const ServiceHeader = ({ service }: { service: Service }) => {
  const openWebsite = () => {
    window.crawler.openWebpage(service.website);
  };

  return (
    <div
      style={{
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <div>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>{service.name}</h1>
        <ButtonGroup>
          <Button text="Open Website" icon="share" onClick={openWebsite} />
        </ButtonGroup>
      </div>
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

  return (
    <div>
      <ServiceHeader service={service} />
      <Divider />
      <LibraryTable service={service} auth={account} />
    </div>
  );
};

export default LibraryService;
