import React, { Component } from 'react';
import axios from 'axios';

class NodeViewWData extends Component {
  state = {
    uuid: this.props.uuid
  }
  loadNode(uuid) {
    var url = this.props.endpoint + '/node/' + this.props.type + '/' + uuid;
    axios.get(url)
      .then(result => {
        const formattedNodeData = this.formatNodeData(result.data.data);
        this.setState({
          rawNode: result.data.data,
          formattedNode: formattedNodeData
        });
        console.log('success:', result)
      })
      .catch(error => {
        this.setState({fetchFailed: true})
      });

  }

  formatNodeData(fetchedNode) {
    const formattedNodeData = {};
    
    if (fetchedNode) {
      formattedNodeData['renderable'] = {
        description: {
          label: 'Description',
          value: fetchedNode.attributes.body.value
        },
        completion_percent: {
          label: 'Completion %',
          value: fetchedNode.attributes.field_completion_percent
        },
        task_id: {
          label: 'Drupal ID',
          value: fetchedNode.attributes.drupal_internal__nid
        },
        title: {
          label: 'Title',
          value: fetchedNode.attributes.title
        },
      };
      formattedNodeData['uuid'] = fetchedNode.id;
      formattedNodeData['key'] = fetchedNode.id;
    };
    return formattedNodeData;
  }

  componentDidMount() {
    this.loadNode(this.state.uuid);
  }

  render() {
    const renderNode = [];
    if (this.state.formattedNode) {
      for (const field in this.state.formattedNode.renderable) {
        if (this.state.formattedNode.renderable.hasOwnProperty(field)) {
          const label = this.state.formattedNode.renderable[field].label;
          const value = this.state.formattedNode.renderable[field].value;
          renderNode.push(
            <div key={label + '-wrapper'}>
              <div key={label} className="label">{label}</div>
              <div key={label + '-val' + this.props.uuid} className="value">{value}</div>
            </div>
          );
        }
      }

      return (
        <div>
        {renderNode}
        </div>
      );
    }
    return "Loading...";
  }
}

export default NodeViewWData;
