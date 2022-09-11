import React from 'react';
import { useNavigate, useLocation, useResolvedPath } from 'react-router-dom';
import { Button, MenuItem } from '@blueprintjs/core';

export const LinkButton = (
  props: React.ComponentProps<typeof Button> & { to: string }
) => {
  const { to, ...rest } = props;

  const navigate = useNavigate();

  const location = useLocation();
  const path = useResolvedPath(to);

  const locationPathname = location.pathname.toLowerCase();
  const toPathname = path.pathname.toLowerCase();

  const isActive =
    locationPathname === toPathname ||
    (locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === '/');

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Button {...rest} active={isActive} onClick={() => navigate(to)} />;
};

export const LinkMenuItem = (
  props: React.ComponentProps<typeof MenuItem> & { to: string }
) => {
  const { to, ...rest } = props;

  const navigate = useNavigate();

  const location = useLocation();
  const path = useResolvedPath(to);

  const locationPathname = location.pathname.toLowerCase();
  const toPathname = path.pathname.toLowerCase();

  const isActive =
    locationPathname === toPathname ||
    (locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === '/');

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <MenuItem {...rest} selected={isActive} onClick={() => navigate(to)} />
  );
};
