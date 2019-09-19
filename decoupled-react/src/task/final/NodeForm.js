import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';

// Receives node via prop. Can update node fields, view only.
class NodeForm extends Component {
  state = {
    node: {
      title: 'this is a title',
      id: this.props.match.params.nid,
      ...this.props.node
    }
  }

  updateField(event) {
    this.setState({
      node: {
        ...this.state.node,
        [event.target.name]: event.target.value
      }
    });
  }

  getFormFieldComponents() {
    const nodeFormFields = [];
    for (const field in this.state.node) {
      if (this.state.node.hasOwnProperty(field)) {
        const fieldValue = this.state.node[field];
        nodeFormFields.push(
          <TextField
            id={field}
            name={field}
            label={field}
            value={fieldValue}
            key={field}
            onChange={(event) => this.updateField(event)}
          />
        )
      }
    }
    return nodeFormFields;
  }

  render() {
    const nodeFormFields = this.getFormFieldComponents();
    return (
    <form noValidate autoComplete="off">
      { nodeFormFields }
      <Button variant="contained" size="small">
        <SaveIcon />
        Save
      </Button>
    </form>
    );
  }
}

export default NodeForm;
