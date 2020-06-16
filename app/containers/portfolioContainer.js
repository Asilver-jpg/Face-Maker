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
        console.log(this.state.user)

        fetch(`${URL}/users/${sessionStorage.getItem("user_id")}`)
            .then(response => response.json())
            .then(data => this.setState({ user: data }))
            .then(res=> console.log(this.state.user.user_name))
            
 
    }


    render() {
        let projectRender=""
        const user= this.state.user
        if(user!==""){
        projectRender= this.state.user.projects.map((project) => {
            return <ProjectCard name={this.state.user.user_name} key={project.id} project={project}></ProjectCard>
                 })
                }

        return (
            <div >
                
                 <Navbar></Navbar>
                 <div class="projectCardContainer">
                 {user=== "" ? <LoadingScreen/>: projectRender}
                 </div>
                
            </div>
            )
        }
    }
    