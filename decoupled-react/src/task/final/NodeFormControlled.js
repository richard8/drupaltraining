import React from 'react';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import withNodeData from './withNodeData';

const getFormFieldComponents = (node, updateValue) => {
  const nodeFormFields = [];
  for (const field in node.renderable) {
    if (node.renderable.hasOwnProperty(field)) {
      const fieldValue = node.renderable[field].value;
      const fieldLabel = node.renderable[field].label;
      nodeFormFields.push(
        <TextField
          id={field}
          name={field}
          label={fieldLabel}
          value={fieldValue}
          key={field}
          disabled={node.renderable[field].readOnly}
          onChange={(event) => updateValue(event)}
        />
      )
    }
  }
  return nodeFormFields;
}

const NodeFormControlled = ({ node, updateValue }) => {
  if (node) {
    const nodeFormFields = getFormFieldComponents(node, updateValue);
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
  return "Loadings..";
}


const withDataNodeForm = withNodeData('task')(NodeFormControlled);

export default withDataNodeForm;
