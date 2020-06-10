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
            .then(data => this.setState({ projects: data }))
            .then(data => console.log(this.state.projects))
 
    }


    render() {
        return (
            <div>
                {this.state.projects.map((project) => {
                    return <ProjectCard key={project.id} project={project}></ProjectCard>
                    })
                }
            </div>
            )
        }
    }
    