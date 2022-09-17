import { Alignment, Navbar } from '@blueprintjs/core';
import { LinkButton } from '../components/LinkButton';
import Logo from '../../../assets/icon.png';

export default function Menu() {
  return (
    <Navbar className="bp4-dark">
      <Navbar.Group align={Alignment.LEFT}>
        {/* <Navbar.Heading style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={Logo}
            alt="logo"
            style={{ height: 16, width: 16, marginRight: 8 }}
          />
          SWorD
        </Navbar.Heading>
        <Navbar.Divider /> */}
        <LinkButton
          to="library"
          className="bp4-minimal"
          icon="home"
          text="Library"
        />
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        {/* <TaskQueue /> */}
        <LinkButton
          to="preferences"
          className="bp4-minimal"
          icon="cog"
          text="Preferences"
        />
      </Navbar.Group>
    </Navbar>
  );
}
