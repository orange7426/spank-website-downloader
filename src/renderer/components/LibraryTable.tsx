import { Card, Elevation, Button, ButtonGroup } from '@blueprintjs/core';
import React from 'react';
import { useAppDispatch, useAppSelector } from 'renderer/hooks/store';
import { pullServiceFolder } from 'renderer/store/database';

const ItemView = (props: {
  item: {
    item: Item;
    localThumbnail: string | null;
    status: string | null;
  };
}) => {
  const { item } = props;
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
      <div>
        <ButtonGroup>
          <Button text="Download" icon="download" small disabled />
          <Button text="Open" icon="share" small disabled />
        </ButtonGroup>
      </div>
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
        <ItemView key={item.item.id} item={item} />
      ))}
    </div>
  );
};
