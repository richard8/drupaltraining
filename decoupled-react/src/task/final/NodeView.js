import React from 'react';
import withNodeData from './withNodeData';

const NodeView = ({dataFetched, node}) => {
  if (!dataFetched) {
    return "Loading...";
  }

  const renderNode = [];
  if (node) {
    for (const field in node.renderable) {
      if (node.renderable.hasOwnProperty(field)) {
        renderNode.push(
          <>
            <div className="label">{node.renderable[field].label}</div>
            <div className="value">{node.renderable[field].value}</div>
          </>
        );
      }
    }

    return (
      <div>
      {renderNode}
      </div>
    );
  }
}

const withDataNodeView = withNodeData('task')(NodeView);

export default withDataNodeView;
