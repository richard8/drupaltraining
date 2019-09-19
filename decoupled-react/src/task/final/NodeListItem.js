import React from 'react';
import Theme from './theme';
import { Link } from "react-router-dom";

const NodeListItem = ({node, renderLabels = false}) => {
  const renderableFields = [];
  const theme = Theme();
  let value = 'value';
  let actions = <td><Link to={'/node/' + node.uuid}>View</Link> | <Link to={'/node/' + node.uuid + '/edit'}>Edit</Link></td>;
  if (renderLabels) {
    value = 'label';
    actions = <td key={node.uuid}> </td>;
  }
  for (const field in node.renderable) {
    if (node.renderable.hasOwnProperty(field)) {
      renderableFields.push(
        <td key={field + node.uuid}>{node.renderable[field][value]}</td>
      );
    }
  }

  if (renderLabels) {
    return <thead><tr className={value}>{actions}{renderableFields}</tr></thead>;
  }
  return <tbody><tr className={value}>{actions}{renderableFields}</tr></tbody>;
}

export default NodeListItem;
