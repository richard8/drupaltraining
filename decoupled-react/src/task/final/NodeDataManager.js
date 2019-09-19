import React from 'react';
import axios from 'axios';
import NodeView from './NodeViewWRenderProp';

class NodeDataManager extends React.Component {
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

  loadNode(nodeType, uuid) {
    let autosavedNode = localStorage.getItem('node-' + uuid);
    if (autosavedNode && false) {
      autosavedNode = JSON.parse(autosavedNode);
      this.setState({
        node: autosavedNode,
        dataFetched: true
      });
      return;
    }

    var url = this.props.endpoint + '/node/' + nodeType + '/' + uuid;
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


  loadTaskThenProjectThenPM(uuid) {
    var url = this.props.endpoint + '/node/task/' + uuid;
    axios.get(url)
      .then(result => {
        const formattedNodeData = this.formatNodeData(result.data.data);
        this.setState({
          node: formattedNodeData,
          dataFetched: true});
        console.log('success:', result)
        return axios.get(this.props.endpoint + '/node/task/' + result.data.data.relationships.field_project.data.id);
      })
      .then(result => {
        console.log('success2:', result)
        let node = this.state.node;
        node.renderable.project = {
          label: "Project",
          value: result.data.data.attributes.title
        };
        this.setState({
          node: node
        });

        return axios.get(this.props.endpoint + '/user/user/' + result.data.data.relationships.field_project_manager.data.id);
      })
      .then(result => {
        console.log('success3:', result)
        let node = this.state.node;
        node.renderable.project_manager = {
          label: "PM",
          value: result.data.data.attributes.name
        };
        this.setState({
          node: node
        });
      })
      .catch(error => {
        this.setState({fetchFailed: true})
      });
  }

  loadTaskIncludeProjectAndPM(uuid) {
    console.log(uuid, 'here uuid')
    var url = this.props.endpoint + '/node/task/' + uuid + '?include=field_project.field_project_manager';
    axios.get(url)
      .then(result => {
        const formattedNodeData = this.formatNodeData(result.data.data);
        formattedNodeData.renderable.project = {
          label: "Project",
          value: result.data.included[0].attributes.title
        };
        formattedNodeData.renderable.project_manager = {
          label: "PM",
          value: result.data.included[1].attributes.name
        };
        this.setState({
          node: formattedNodeData,
          dataFetched: true}
        );
        return axios.get(this.props.endpoint + '/node/task/' + result.data.data.relationships.field_project.data.id);
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
    if (this.props.noAutoload) {
      // The user wants to call the loadNode(s) method themselves.
      return;
    }
    // Otherwise, we will get it.
    const uuid = this.props.nodeUuid || (this.props.match && this.props.match.params && this.props.match.params.uuid);
    if (uuid) {
      this.loadTaskIncludeProjectAndPM(uuid);
    }
    else {
      this.loadAllNodes(this.props.nodeType);
    }
  }

  render() {
    const changeNodeLocal = this.changeNode.bind(this);
    const loadNode = this.loadNode.bind(this);

    const renderPropParameters = { changeNodeLocal, loadNode, ...this.state, inheritProps: this.props };

    if (this.state.dataFetched) {
      return (
        this.props.children(renderPropParameters)
      )
    }
    // if (this.state.node) {
    //   return (
    //     <div>
    //       <NodeView node={this.state.node} />
    //     </div>
    //   )
    // }
    return 'Loading..'
  }
}

export default NodeDataManager;
