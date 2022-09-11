import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import { Alignment, Button, Navbar } from '@blueprintjs/core';

const Hello = () => {
  return (
    <div>
      <Button intent="success" text="button content" />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Navbar className="bp4-dark">
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>SWorD</Navbar.Heading>
          <Navbar.Divider />
          <Button className="bp4-minimal" icon="home" text="Home" />
          <Button className="bp4-minimal" icon="document" text="Files" />
        </Navbar.Group>
      </Navbar>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
