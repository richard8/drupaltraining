import React from 'react';
import Theme from './theme';
import { Link } from "react-router-dom";

const Header = (props) => {
  const theme = Theme();
  return (
    <header id="App-header" style={{...theme.borderStyle, ...theme.region, ...props.style}}>
      <div>
        {props.children}
      </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/node/add">Node Add</Link>
        <Link to="/node/list">All Nodes</Link>
        <Link to="/project/0ebfd4e3-f486-4261-851f-158003555cb7">Project Info</Link>
      </nav>
    </header>);
}

export default Header;
