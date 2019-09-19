import React from 'react';
import axios from 'axios';
import NodeViewProjectWTasks from '../final/NodeViewProjectWTasks';

class DrupalParallelRequests extends React.Component {
  state = {
    dataFetched: false,
  };

  formatProjectTaskData(projectTaskData) {
    const projectData = JSON.parse(projectTaskData.project.body);
    const projectTasksData = JSON.parse(projectTaskData["project-tasks"].body);

    const tasks = [];
    projectTasksData.data.map((taskData, index) => {
      tasks.push(
        {
          renderable: {
            description: {
              label: 'Task Description',
              value: taskData.attributes.body && taskData.attributes.body.value
            },
            completion_percent: {
              label: 'Completion %',
              value: taskData.attributes.field_completion_percent
            },
            task_id: {
              label: 'Drupal ID',
              value: taskData.attributes.drupal_internal__nid,
              readOnly: true
            },
            title: {
              label: 'Title',
              value: taskData.attributes.title
            },
        }
      }
      );
    });

    return {
      project: {
        renderable: {
          id: {
            label: 'Drupal UUID',
            value: projectData.data.id,
            readOnly: true
          },
          title: {
            label: 'Title',
            value: projectData.data.attributes.title
          },
        },
        uuid: projectData.data.id
      },
      project_tasks: tasks
    };
  }

  loadProjectAndTasksParallel(uuid) {
    const subrequests = [
      {
        requestId: 'project',
        action: 'view',
        uri: '/api/node/project/' + uuid + '?include=field_project_manager',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/vnd.application+json"
        }
      },
      {
        requestId: 'project-tasks',
        action: 'view',
        uri: '/api/node/task?filter[field_project.id]=' + uuid,
        headers: {
          "Content-Type": "application/json",
          "Accept":  "application/vnd.application+json"
        }
      }
    ];
    var url = this.props.endpoint + '/subrequests?_format=json';
    axios.post(url, JSON.stringify(subrequests), {headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }})
      .then(result => {
        const formattedProjectWTaskData = this.formatProjectTaskData(result.data);
        this.setState({
          data: formattedProjectWTaskData,
          dataFetched: true
        });
        console.log('success:', result)
      })
      .catch(error => {
        console.log('failed');
        this.setState({fetchFailed: true})
      });
  }

  componentDidMount() {
    const uuid = this.props.projectUuid || (this.props.match && this.props.match.params && this.props.match.params.uuid);
    if (uuid) {
      this.loadProjectAndTasksParallel(uuid);
    }
  }

  render() {
    if (this.state.dataFetched) {
      const project = this.state.data.project;
      const project_tasks = this.state.data.project_tasks;
  
      return <NodeViewProjectWTasks project={project} project_tasks={project_tasks} renderField={this.props.renderField} />;
    }
    return 'Loading..'
  }
}

export default DrupalParallelRequests;
