import {
  Card,
  Elevation,
  Button,
  ButtonGroup,
  Tag,
  Intent,
  Spinner,
} from '@blueprintjs/core';
import React from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/hooks/store';
import { enqueueDownloadItem } from 'renderer/services/crawlerManager';
import { openItemFolder, pullServiceFolder } from 'renderer/store/database';

const ItemView = (props: {
  item: {
    itemAbstract: ItemAbstract;
    localThumbnail: string | null;
    status: string | null;
  };
  serviceId: string;
  auth: Auth;
}) => {
  const { item, serviceId, auth } = props;
  const dispatch = useAppDispatch();
  const openFolder = () => {
    dispatch(openItemFolder(serviceId, item.itemAbstract));
  };
  const download = () => {
    enqueueDownloadItem(serviceId, auth, item.itemAbstract);
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
      {item.status === 'downloadpending' && (
        <div>
          <ButtonGroup>
            <Button
              text="Pending"
              intent={Intent.PRIMARY}
              icon="download"
              small
              disabled
            />
            <Button text="Open" icon="share" small onClick={openFolder} />
          </ButtonGroup>
        </div>
      )}
      {item.status === 'downloading' && (
        <div>
          <ButtonGroup>
            <Button
              text="Downloading"
              intent={Intent.PRIMARY}
              icon="download"
              small
              loading
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
