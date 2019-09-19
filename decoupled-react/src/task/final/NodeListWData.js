import React, { Component } from 'react';
import axios from 'axios';
import NodeListItem from './NodeListItem';

class NodeList extends Component {
  state = {
  }

  loadNodes() {
    var url = this.props.endpoint + '/node/task';
    // axios fetches the data for us. If successful, it calls "setAllTaskData"
    // If unsuccessful, it sets the state "fetchFailed" to true.
    axios.get(url)
      .then(result => {
        const formattedNodeData = this.formatNodeData(result.data.data);
        this.setState({nodes: formattedNodeData});
        console.log('success:', result)
      })
      .catch(error => {
        console.log(url);
        this.setState({fetchFailed: true})
      });
  }

  formatNodeData(fetchedNodes) {
    console.log(fetchedNodes, 'all of them');
    const formattedNodeData = {};
    
    if (fetchedNodes) {
      fetchedNodes.map((nodeData,index) => {
        // I'm using Drupal's uuid as the 'key/property' name
        // This makes it easy for me to tell what task each element is for.
        formattedNodeData[nodeData.id] = {
          renderable: {
            description: {
              label: 'Description',
              value: nodeData.attributes.body.value
            },
            completion_percent: {
              label: 'Completion %',
              value: nodeData.attributes.field_completion_percent
            },
            task_id: {
              label: 'Drupal ID',
              value: nodeData.attributes.drupal_internal__nid
            },
            title: {
              label: 'Title',
              value: nodeData.attributes.title
            },
          },
          uuid: nodeData.id,
          index: index
        }
      });
    }
    return formattedNodeData;
  }

  getNodeListRows() {
    const nodeRows = [];
    let firstRow = true;
    for (const field in this.state.nodes) {
      if (this.state.nodes.hasOwnProperty(field)) {
        const node = this.state.nodes[field];
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

  componentDidMount() {
    this.loadNodes();
  }

  render() {
    const nodeListRows = this.getNodeListRows();
    if (this.state.nodes) {
      return (
        <table style={{width: `100%`}}>
          {nodeListRows}
        </table>
      );        
    }
    return 'Loading..';
  }
}

export default NodeList;
