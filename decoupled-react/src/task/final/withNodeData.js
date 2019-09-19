import React from 'react';
import axios from 'axios';

const withNodeData = (nodeType, nodeUuid = null) => (NodeComponent) => {
  class NodeDataProvider extends React.Component {
    state = {
      dataFetched: false
    }

    formatNodeData(nodeData) {
      return {
        renderable: {
          description: {
            label: 'Description',
            value: nodeData.attributes.body && nodeData.attributes.body.value
          },
          completion_percent: {
            label: 'Completion %',
            value: nodeData.attributes.field_completion_percent
          },
          task_id: {
            label: 'Drupal ID',
            value: nodeData.attributes.drupal_internal__nid,
            readOnly: true
          },
          title: {
            label: 'Title',
            value: nodeData.attributes.title
          },
        },
        uuid: nodeData.id
      };
    }

    formatNodeDataArray(fetchedNodes) {
      const formattedNodeData = {};

      if (fetchedNodes) {
        fetchedNodes.map((nodeData,index) => {
          formattedNodeData[nodeData.id] = this.formatNodeData(nodeData);
          formattedNodeData[nodeData.id].index = index;
        });
      }
      return formattedNodeData;
    }

    loadAllNodes(nodeType) {
      var url = this.props.endpoint + '/node/' + nodeType;
      axios.get(url)
        .then(result => {
          const formattedNodeData = this.formatNodeDataArray(result.data.data);
          this.setState({
            nodes: formattedNodeData,
            dataFetched: true
          });
          console.log('success:', result)
        })
        .catch(error => {
          this.setState({fetchFailed: true})
        });
    }

    loadNode(nodeType, nodeUuid) {
      var url = this.props.endpoint + '/node/' + nodeType + '/' + nodeUuid;
      axios.get(url)
        .then(result => {
          const formattedNodeData = this.formatNodeData(result.data.data);
          this.setState({
            node: formattedNodeData,
            dataFetched: true});
          console.log('success:', result)
        })
        .catch(error => {
          this.setState({fetchFailed: true})
        });
    }

    changeNode(event) {
      const changedNode = {...this.state.node};
      changedNode.renderable[event.target.name].value = event.target.value;
      this.setState({
        node: changedNode
      });
      localStorage.setItem('node-' + changedNode.uuid, JSON.stringify(changedNode));
      console.log(event.target.name, event.target.value);
    }

    componentDidMount() {
      let uuid = nodeUuid;
      if (this.props.match) {
        if (this.props.match.params) {
          if (this.props.match.params.uuid) {
            uuid = this.props.match.params.uuid;
          }
        }
      }
      if (uuid) {
        let autosavedNode = localStorage.getItem('node-' + uuid);
        if (autosavedNode) {
          autosavedNode = JSON.parse(autosavedNode);
          this.setState({
            node: autosavedNode,
            dataFetched: true
          }
          );
          return;
        }
        this.loadNode(nodeType, uuid);
        return;
      }
      else {
        this.loadAllNodes(nodeType);
        return;
      }
    }

    render() {
      const additionalProps = {};
      if (this.props.canManageNodes) {
        additionalProps.updateValue = this.changeNode.bind(this);
        additionalProps.loadNode = this.loadNode.bind(this);
      }

      return <NodeComponent {...additionalProps} {...this.props} {...this.state}  />
    }
  }
  return NodeDataProvider;
}

export default withNodeData;
