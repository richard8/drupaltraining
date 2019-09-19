import React from 'react';
import Theme from './theme';
import NodeViewWData from './NodeViewWData';

const App = () => {
  const theme = Theme();
  return (
    <div className="App" style={theme.styles}>
      <NodeViewWData uuid={'05da694e-931e-4087-8152-9c3475d7fcaa'} type="article" endpoint={'http://drupaltraining.ddev.site:81/jsonapi'} />
    </div>
  );
}

export default App;
