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
      
 
    }


    render() {
        const projectRender= this.state.user.projects.map((project) => {
            return <ProjectCard key={project.id} project={project}></ProjectCard>
                 })
        const user= this.state.user
        console.log(user)
        return (
            <div>
                
                 <Navbar></Navbar>
                 {user=== "" ? <LoadingScreen/>: projectRender}
           
                }
            </div>
            )
        }
    }
    