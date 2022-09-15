import {
  Card,
  Elevation,
  Button,
  ButtonGroup,
  Tag,
  Intent,
  Spinner,
  SpinnerSize,
  Divider,
} from '@blueprintjs/core';
import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/hooks/store';
import {
  downloadItem,
  pullIncrementalUpdates,
} from 'renderer/services/crawlerManager';
import { toaster } from 'renderer/services/toaster';
import {
  DatabaseCacheItem,
  openItemFolder,
  pullServiceFolder,
} from 'renderer/store/database';

const loadingStatus = ['downloadpending', 'analyzing', 'downloading'];

const getHumanReadableStatus = (status: string | null): string => {
  return (
    {
      downloadpending: 'Pending',
      analyzing: 'Analyzing',
      downloading: 'Downloading',
      unknown: 'Unknown',
    }[status ?? 'unknown'] ?? 'Unknown'
  );
};

const ItemView = (props: {
  item: DatabaseCacheItem;
  serviceId: string;
  auth: Auth;
}) => {
  const { item, serviceId, auth } = props;
  const dispatch = useAppDispatch();
  const openFolder = () => {
    dispatch(openItemFolder(serviceId, item.itemAbstract));
  };
  const download = () => {
    downloadItem(serviceId, auth, item.itemAbstract);
  };
  return (
    <Card
      interactive
      elevation={Elevation.TWO}
      style={{
        marginTop: 8,
        padding: 4,
        flexDirection: 'row',
        display: 'flex',
      }}
    >
      {item.localThumbnail && (
        <img
          style={{
            maxHeight: 40,
            borderRadius: 4,
            overflow: 'hidden',
            marginRight: 8,
          }}
          src={item.localThumbnail}
          alt="thumbnail"
        />
      )}
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0 }}>
          <span style={{ fontWeight: 'normal', fontSize: '0.8em' }}>
            {item.itemAbstract.date}
          </span>{' '}
          {item.itemAbstract.title}
        </h4>
        <p style={{ margin: 0 }}>{item.itemAbstract.description}</p>
      </div>
      {item.status === 'persistpending' && (
        <div>
          <Tag>New</Tag>
        </div>
      )}
      {loadingStatus.includes(item.status ?? '') && (
        <div>
          <ButtonGroup>
            <Button
              text={
                getHumanReadableStatus(item.status) +
                (item.progress && item.progress.total > 0
                  ? ` (${item.progress.completed} / ${item.progress.total})`
                  : '')
              }
              intent={
                item.status !== 'downloadpending' ? Intent.PRIMARY : Intent.NONE
              }
              small
              disabled
              icon={
                <Spinner
                  intent={
                    item.status !== 'downloadpending'
                      ? Intent.PRIMARY
                      : Intent.NONE
                  }
                  size={SpinnerSize.SMALL}
                  value={
                    item.progress && item.progress.total > 0
                      ? item.progress.completed / item.progress.total
                      : undefined
                  }
                />
              }
            />
            <Button text="Open" icon="share" small onClick={openFolder} />
          </ButtonGroup>
        </div>
      )}
      {item.status === 'downloaded' && (
        <div>
          <ButtonGroup>
            <Button
              text="Downloaded"
              intent={Intent.SUCCESS}
              icon="download"
              small
              disabled
            />
            <Button text="Open" icon="share" small onClick={openFolder} />
          </ButtonGroup>
        </div>
      )}
      {item.status === 'failed' && (
        <div>
          <ButtonGroup>
            <Button
              text="Retry"
              icon="refresh"
              small
              intent={Intent.DANGER}
              onClick={download}
            />
            <Button text="Open" icon="share" small onClick={openFolder} />
          </ButtonGroup>
        </div>
      )}
      {item.status == null && (
        <div>
          <ButtonGroup>
            <Button text="Download" icon="download" small onClick={download} />
            <Button text="Open" icon="share" small onClick={openFolder} />
          </ButtonGroup>
        </div>
      )}
    </Card>
  );
};

export default ({ service, auth }: { service: Service; auth: Auth }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  const pullFromDisk = React.useCallback(async () => {
    setIsLoading(true);
    await dispatch(pullServiceFolder(service.id));
    setIsLoading(false);
  }, [dispatch, service.id]);
  React.useEffect(() => {
    pullFromDisk();
  }, [dispatch, pullFromDisk, service.id]);

  const [isPulling, setIsPulling] = React.useState(false);
  const pull = async () => {
    setIsPulling(true);
    await pullIncrementalUpdates(service.id, auth);
    setIsPulling(false);
  };

  const databaseServiceItems = useAppSelector(
    (state) => state.database.services[service.id]?.items ?? []
  );

  const enqueueAllUnscheduledItems = useCallback(async () => {
    const unscheduled = databaseServiceItems.filter(
      (item) => item.status == null
    );
    if (unscheduled.length === 0) {
      toaster.show({
        message: `No unscheduled items. Items has already been enqueued or try to pull updates from server.`,
        icon: 'warning-sign',
        intent: Intent.WARNING,
      });
      return;
    }
    toaster.show({
      message: `Enqueued ${unscheduled.length} items. Start downloading...`,
      icon: 'bring-data',
    });
    await Promise.all(
      unscheduled.map(async (item) => {
        await downloadItem(service.id, auth, item.itemAbstract);
      })
    );
    toaster.show({
      message: `${unscheduled.length} items downloaded.`,
      icon: 'tick',
      intent: Intent.SUCCESS,
    });
  }, [auth, databaseServiceItems, service.id]);

  return (
    <div>
      <div>
        <ButtonGroup>
          <Button icon="refresh" loading={isLoading} onClick={pullFromDisk}>
            Refresh
          </Button>
          <Divider />
          <Button
            icon="cloud-download"
            loading={isPulling}
            onClick={pull}
            disabled={isLoading}
          >
            Pull Incremental Updates
          </Button>
          {/* <Button icon="database" intent="warning" disabled>
            Rebuild Database
          </Button> */}
          <Divider />
          <Button
            icon="double-chevron-down"
            disabled={isLoading}
            onClick={enqueueAllUnscheduledItems}
          >
            Enqueue All Unscheduled Items
          </Button>
        </ButtonGroup>
      </div>
      {databaseServiceItems.map((item) => (
        <ItemView
          key={item.itemAbstract.id}
          item={item}
          serviceId={service.id}
          auth={auth}
        />
      ))}
    </div>
  );
};