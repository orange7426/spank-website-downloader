import {
  Card,
  Elevation,
  Button,
  ButtonGroup,
  Tag,
  Intent,
  Spinner,
  SpinnerSize,
} from '@blueprintjs/core';
import React from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/hooks/store';
import { downloadItem } from 'renderer/services/crawlerManager';
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

  const databaseServiceItems = useAppSelector(
    (state) => state.database.services[service.id]?.items ?? []
  );

  return (
    <div>
      {isLoading && <Spinner />}
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
