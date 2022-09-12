/* eslint-disable jsx-a11y/label-has-associated-control */

import { Button } from '@blueprintjs/core';
import { useAppDispatch, useAppSelector } from 'renderer/hooks/store';
import { selectAndUpdateLibraryLocation } from 'renderer/store/preferences';

const PreferencesGeneral = () => {
  const dispatch = useAppDispatch();
  const libraryLocation = useAppSelector(
    (state) => state.preferences.libraryLocation
  );
  const selectLibraryLocation = () => {
    dispatch(selectAndUpdateLibraryLocation());
  };
  return (
    <div>
      <label className="bp4-label">
        Library Location: {libraryLocation}
        <Button onClick={selectLibraryLocation} text="Browse" />
      </label>
    </div>
  );
};

export default PreferencesGeneral;
