import React from 'react';
import ProjectCard from "../components/projectCard.js"
import Navbar from "../components/navbar"
import LoadingScreen from  "../components/loadingScreen.js"
const URL = "http://localhost:3001"
export default class PortfolioContainer extends React.Component {
    state = {
        user: ""
    }
    componentDidMount() {
        fetch(`${URL}/users/${sessionStorage.getItem("user_id")}`)
            .then(response => response.json())
            .then(data => this.setState({ user: data }))
            .then(data => console.log(this.state.user))
 
    }


    render() {
        const projectRender= this.state.user.projects.map((project) => {
            return <ProjectCard key={project.id} project={project}></ProjectCard>
                 })
        
        return (
            <div>
                
                 <Navbar></Navbar>
                 {this.state.user==="" ? <LoadingScreen/>: projectRender}
           
                }
            </div>
            )
        }
    }
    