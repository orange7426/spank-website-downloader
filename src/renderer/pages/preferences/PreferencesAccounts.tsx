/* eslint-disable no-nested-ternary */
/* eslint-disable react/button-has-type */
import {
  add as addAccountAction,
  remove as removeAccountAction,
} from 'renderer/store/accounts';
import { useAppSelector, useAppDispatch } from 'renderer/hooks/store';
import {
  Button,
  DialogStep,
  MultistepDialog,
  Classes,
  FormGroup,
  InputGroup,
  Switch,
  Spinner,
  Icon,
  Intent,
} from '@blueprintjs/core';
import React, { useEffect } from 'react';
import classNames from 'classnames';

function AddAccountDialog(props: React.ComponentProps<typeof MultistepDialog>) {
  const { ...rest } = props;

  const dispatch = useAppDispatch();

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [availableServices, setAvailableServices] = React.useState<
    Record<string, Service>
  >({});
  const pullAvailableServices = async () => {
    setAvailableServices(await window.crawler.listAvailableServices());
  };
  useEffect(() => {
    pullAvailableServices();
  }, []);

  const [selectedServices, setSelectedServices] = React.useState<
    Record<string, string | undefined>
  >({});
  const toggleService = (serviceId: string) => {
    if (selectedServices[serviceId] != null) {
      const s = { ...selectedServices };
      delete s[serviceId];
      setSelectedServices(s);
      return;
    }
    setSelectedServices({ ...selectedServices, [serviceId]: 'selected' });
  };

  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const verifyAccount = async () => {
    setIsVerifying(true);
    const cachedSelectedServices = { ...selectedServices };
    const results = await Promise.all(
      Object.keys(selectedServices).map(async (serviceId) => {
        cachedSelectedServices[serviceId] = 'verifying';
        setSelectedServices({ ...cachedSelectedServices });
        const siteVerified = await window.crawler.verifyAccount(
          serviceId,
          username,
          password
        );
        cachedSelectedServices[serviceId] = siteVerified ? 'success' : 'failed';
        setSelectedServices({ ...cachedSelectedServices });
        return siteVerified;
      })
    );
    if (results.every((r) => r)) setVerified(true);
    setIsVerifying(false);
  };

  const submit = (event: React.SyntheticEvent<HTMLElement, Event>) => {
    dispatch(
      addAccountAction({
        account: {
          username,
          password,
          serviceIds: Object.keys(selectedServices),
        },
      })
    );
    rest.onClose?.(event);
  };

  return (
    <MultistepDialog
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      usePortal
      icon="plus"
      title="Add New Account"
      finalButtonProps={{ disabled: verified !== true, onClick: submit }}
    >
      <DialogStep
        id="account"
        panel={
          <div className={classNames(Classes.DIALOG_BODY)}>
            <FormGroup
              label="Username"
              labelFor="text-input"
              labelInfo="(required)"
            >
              <InputGroup
                id="text-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </FormGroup>
            <FormGroup
              label="Password"
              labelFor="text-input"
              labelInfo="(required)"
            >
              <InputGroup
                id="text-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormGroup>
          </div>
        }
        title="Account"
      />
      <DialogStep
        id="sites"
        panel={
          <div className={classNames(Classes.DIALOG_BODY)}>
            <p>Select websites the account is for</p>
            <>
              {Object.values(availableServices).map((service) => (
                <Switch
                  key={service.id}
                  checked={selectedServices[service.id] != null}
                  label={service.name}
                  onChange={() => toggleService(service.id)}
                />
              ))}
            </>
          </div>
        }
        title="Sites"
      />
      <DialogStep
        id="confirm"
        panel={
          <div>
            {Object.entries(selectedServices).map(([serviceId, status]) => (
              <div key={serviceId}>
                <span>{availableServices[serviceId].name}</span>
                {status === 'verifying' ? (
                  <Spinner size={10} />
                ) : status === 'success' ? (
                  <Icon icon="tick" />
                ) : status === 'failed' ? (
                  <Icon icon="cross" />
                ) : null}
              </div>
            ))}
            <Button
              disabled={isVerifying}
              text="Verify"
              onClick={verifyAccount}
            />
          </div>
        }
        title="Confirm"
      />
    </MultistepDialog>
  );
}

const PreferencesAccounts = () => {
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] =
    React.useState(false);

  const dispatch = useAppDispatch();

  const accounts = useAppSelector((state) => state.accounts.accounts);

  const removeAccount = (index: number) => {
    dispatch(
      removeAccountAction({
        index,
      })
    );
  };

  return (
    <div>
      <Button
        icon="plus"
        text="Add Account"
        onClick={() => setIsAddAccountDialogOpen(true)}
      />
      <AddAccountDialog
        isOpen={isAddAccountDialogOpen}
        onClose={() => setIsAddAccountDialogOpen(false)}
      />

      {accounts.map((account, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`${account.username}-${index}`}>
          <span>Username: {account.username}</span>,
          <span>Password: {account.password}</span>,
          <span>Services: {account.serviceIds}</span>
          <Button
            icon="delete"
            minimal
            intent={Intent.DANGER}
            onClick={() => removeAccount(index)}
          />
        </div>
      ))}
    </div>
  );
};

export default PreferencesAccounts;
