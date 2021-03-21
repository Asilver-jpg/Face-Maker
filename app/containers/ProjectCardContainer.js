import React from 'react';
import ProjectCard from "../components/projectCard.js"
import Navbar from "../components/navbar"
import LoadingScreen from  "../components/loadingScreen.js"
import "./container.css"

const URL = "http://localhost:3001"

export default class ProjectCardContainer extends React.Component {
    state = {
        projects: ""
    }
    componentDidMount() {
        fetch(`${URL}/projects`)
            .then(response => response.json())
            .then(data => this.setState({ projects: data }))
           
 
    }


    render() {
        const projects= this.state.projects
        let projectRender=""
        if(projects!==""){
            projectRender= this.state.projects.map((project) => {
                return <ProjectCard key={project.id} project={project}></ProjectCard>
                })
        }
        return (
            
            <div >
                <Navbar></Navbar>
                 <div class="projectCardContainer">
               {projects==="" ? <LoadingScreen/> : projectRender}
                </div>
            </div>
            )
        }
    }
    