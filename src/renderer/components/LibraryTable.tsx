import {
  Card,
  Elevation,
  Button,
  ButtonGroup,
  Tag,
  Intent,
} from '@blueprintjs/core';
import React from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/hooks/store';
import { openItemFolder, pullServiceFolder } from 'renderer/store/database';

const ItemView = (props: {
  item: {
    item: Item;
    localThumbnail: string | null;
    status: string | null;
  };
  serviceId: string;
}) => {
  const { item, serviceId } = props;
  const dispatch = useAppDispatch();
  const openFolder = () => {
    dispatch(openItemFolder(serviceId, item.item));
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
            {item.item.date}
          </span>{' '}
          {item.item.title}
        </h4>
        <p style={{ margin: 0 }}>{item.item.description}</p>
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
            <Button text="Download" icon="download" small />
            <Button text="Open" icon="share" small onClick={openFolder} />
          </ButtonGroup>
        </div>
      )}
    </Card>
  );
};

export default ({ service }: { service: Service }) => {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(pullServiceFolder(service.id));
  }, [dispatch, service.id]);

  const items = useAppSelector(
    (state) => state.database.services[service.id]?.items ?? []
  );

  return (
    <div>
      {items.map((item) => (
        <ItemView key={item.item.id} item={item} serviceId={service.id} />
      ))}
    </div>
  );
};
