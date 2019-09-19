import React, { Component } from 'react';
import NodeListItem from './NodeListItem';
//import withNodeData from './withNodeData';

class NodeList extends Component {
  getNodeListRows() {
    const nodeRows = [];
    let firstRow = true;
    for (const field in this.props.nodes) {
      if (this.props.nodes.hasOwnProperty(field)) {
        const node = this.props.nodes[field];
        if (firstRow) {
          nodeRows.push(
            <NodeListItem key={'first-row'} node={node} renderLabels={true}/>
          );
          firstRow = false;
        }
        nodeRows.push(
          <NodeListItem key={node.uuid} node={node} includeHeaderRow={firstRow}/>
        );
      }
    }
    return nodeRows;
  }

  render() {
    if (this.props.dataFetched || this.props.nodes) {
      const nodeListRows = this.getNodeListRows();
      return (
        <table style={{width: `100%`}}>
          {nodeListRows}
        </table>
      );
    }
    return 'Loading...';
  }
}

//const withDataNodeView = withNodeData('task')(NodeList);

//export default withDataNodeView;
export default NodeList;