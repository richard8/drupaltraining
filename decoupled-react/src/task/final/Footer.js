import React from 'react';
import Theme from './theme';

const Footer = (props) => {
  const theme = Theme();
  return (
  <footer style={{...theme.borderStyle, ...theme.region, ...props.style}}>
    {props.children}
  </footer>);
}

export default Footer;
