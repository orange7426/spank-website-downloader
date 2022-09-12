import React from 'react';
import { useAppSelector } from 'renderer/hooks/store';

export default ({ service }: { service: Service }) => {
  const libraryLocation = useAppSelector(
    (state) => state.preferences.libraryLocation
  );
  const [list, setList] = React.useState<
    Array<{
      item: Item;
      localThumbnail: string | null;
      status: string | null;
    }>
  >([]);
  const pullServiceFolder = async () => {
    setList(
      await window.database.readServiceFolder(libraryLocation, service.id)
    );
  };
  React.useEffect(() => {
    pullServiceFolder();
  });

  return <div>{JSON.stringify(list)}</div>;
};
