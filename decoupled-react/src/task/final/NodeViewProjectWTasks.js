import React from 'react';
import NodeList from '../final/NodeList'
import FieldDisplay from './FieldDisplay';
//import withNodeData from '../final/withNodeData';

const NodeViewProjectWTasks = (props) => {
  if (props.project) {
    console.log(props.project, 'yepper')
    const renderNode = [];
      for (const field in props.project.renderable) {
        if (props.project.renderable.hasOwnProperty(field)) {
          renderNode.push(
            <React.Fragment key={field}>
              <FieldDisplay fieldLabel={props.project.renderable[field].label} fieldValue={props.project.renderable[field].value}/>
            </React.Fragment>
          );
        }
      }

//      const renderNodeTasks = <NodeList nodes={props.project_tasks} />;
      return (
        <div>
        <h2>Project Information</h2>
          {renderNode}
          <h3>Tasks for project</h3>
          <div className="task-list">
            <NodeList nodes={props.project_tasks}/>
          </div>
        </div>
      );
  }
  return "Loading...";
}

export default NodeViewProjectWTasks;
//const withDataNodeView = withNodeData('task')(NodeView);

//export default withDataNodeView;
