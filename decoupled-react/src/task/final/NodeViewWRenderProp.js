import React from 'react';
//import withNodeData from '../final/withNodeData';

const NodeView = (props) => {
  if (props.node) {
    const renderNode = [];
    if (props.node) {
      for (const field in props.node.renderable) {
        if (props.node.renderable.hasOwnProperty(field)) {
          renderNode.push(
            <React.Fragment key={field}>
              {props.renderField(props.node.renderable[field].value, props.node.renderable[field].label)}
            </React.Fragment>
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
  return "Loading...";
}

export default NodeView;
//const withDataNodeView = withNodeData('task')(NodeView);

//export default withDataNodeView;
