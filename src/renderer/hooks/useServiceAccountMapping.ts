import React, { useEffect, useMemo } from 'react';
import _mapValues from 'lodash/mapValues';
import { useAppSelector } from './store';

export const useServiceAccountMapping = () => {
  const [availableServices, setAvailableServices] = React.useState<
    Record<string, Service>
  >({});
  const pullAvailableServices = async () => {
    setAvailableServices(await window.crawler.listAvailableServices());
  };
  React.useEffect(() => {
    pullAvailableServices();
  }, []);

  const accounts = useAppSelector((state) => state.accounts.accounts);

  return useMemo(() => {
    const results: Record<
      string,
      Service & { accounts: Array<{ username: string; password: string }> }
    > = _mapValues(availableServices, (service) => ({
      ...service,
      accounts: [],
    }));
    accounts.forEach((account) => {
      account.serviceIds.forEach((serviceId) => {
        results[serviceId]?.accounts?.push({
          username: account.username,
          password: account.password,
        });
      });
    });
    return results;
  }, [availableServices, accounts]);
};

export default useServiceAccountMapping;
