import React from 'react';
import { Switch, Route } from "react-router-dom";
import Theme             from '../final/theme';
import NodeFormWDataPure          from '../final/NodeFormWDataPure';
import NodeForm          from '../final/NodeForm';
import Home              from '../final/Home';
import NodeList          from '../final/NodeList';
import NodeDataManager   from '../final/NodeDataManager';
import NodeView          from '../final/NodeViewWRenderProp';
import {DrupalContext}   from '../../index';
import FieldDisplay      from '../final/FieldDisplay';
import ErrorBoundary     from '../final/ErrorBoundary';
import DrupalParallelRequests from './DrupalParallelRequests';

const MainContent = (props) => {
  const theme = Theme();
  const style = props.style;

  return (
    <section id="main-content" style={{...theme.region, ...style}}>
      <ErrorBoundary>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/node/add" component={NodeForm}/>
          <Route exact path="/node/list" render={(props) =>{
            return <DrupalContext.Consumer>
              {({siteUrl, endpoint}) => {
                return <NodeDataManager key={'task'} endpoint={siteUrl+endpoint} nodeType={'task'}>
                {({nodes}) => <NodeList nodes={nodes}/>}
                </NodeDataManager>;
              }}
            </DrupalContext.Consumer>}
          }
          />
          <Route exact path="/node/:uuid" render={(props) =>
            <DrupalContext.Consumer>
              {({siteUrl, endpoint}) => {
                return <NodeDataManager key={props.match.params.uuid} {...props} endpoint={siteUrl+endpoint} nodeType={'task'}> 
                  {({node, inheritProps}) => {
                    return <NodeView node={node} {...inheritProps}
                      renderField={(fieldValue, fieldLabel) => {
                      return <FieldDisplay fieldLabel={fieldLabel} fieldValue={fieldValue}/>
                  }} />}}
                </NodeDataManager>;
              }}
            </DrupalContext.Consumer>
          }
          />
          <Route exact path="/node/:uuid/edit" render={(props) => {
            return <DrupalContext.Consumer>
              {({siteUrl, endpoint}) => {
                return <NodeFormWDataPure endpoint={siteUrl+endpoint} canManageNodes={true} {...props}/>;
              }}
            </DrupalContext.Consumer>
            }
          }
          />
          <Route exact path="/project/:uuid" render={(props) =>
            <DrupalContext.Consumer>
              {({siteUrl, endpoint}) => {
                return <DrupalParallelRequests key={props.match.params.uuid} {...props} endpoint={siteUrl} nodeType={'project'}> 
                  {({node, inheritProps}) => {
                    return <NodeView node={node} {...inheritProps}
                      renderField={(fieldValue, fieldLabel) => {
                      return <FieldDisplay fieldLabel={fieldLabel} fieldValue={fieldValue}/>
                  }} />}}
                </DrupalParallelRequests>;
              }}
            </DrupalContext.Consumer>
          }
          />
        </Switch>
      </ErrorBoundary>
      {props.children}
    </section>
  );
}
export default MainContent;
