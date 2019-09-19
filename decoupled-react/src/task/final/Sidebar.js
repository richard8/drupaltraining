import Theme, {darkTheme} from '../final/theme';
import React, { Component } from 'react';

class Sidebar extends Component {
  render() {
    const theme = Theme();
    return <aside id="main-sidebar" style={{...theme.region, ...darkTheme().styles, ...this.props.style}}>{this.props.children}</aside>;
  }
}

export default Sidebar;
