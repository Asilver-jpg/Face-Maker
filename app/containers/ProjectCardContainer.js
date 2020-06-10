import React from 'react';
import ProjectCard from "../components/projectCard.js"
const URL = "http://localhost:3001"

export default class ProjectCardContainer extends React.Component {
    state = {
        projects: ""
    }
    componentDidMount() {
        fetch(`${URL}/projects`)
            .then(response => response.json())
            .then(data => this.setState({ profiles: data }))
    }


    render() {
        return (
            <div>
                {this.state.projects.map((project) => {
                    return <ProjectCard project={project}></ProjectCard>
                    })
                }
            </div>
            )
        }
    }
    