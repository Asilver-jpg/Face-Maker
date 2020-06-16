import React from 'react';
import history from '../components/history'
import Navbar from '../components/navbar';

const URL = "http://localhost:3001"

export default class NewContainer extends React.Component {
    state = {
        title: ""
    }

    handleTitleChange = event => {
        this.setState({ title: event.target.value })
    }

    handleSubmit = (event) => {
        event.preventDefault()
  
                        let project = {
                            name: this.state.title,
                            views: 0,
                            user_id: sessionStorage.getItem("user_id"),
                            date: new Date(),
                            project_img:""
                        }

                        this.postNewProject(project)
                        this.getLastMadeProject()
           
            }//method ends here
    postNewProject =(proj)=>{
        fetch(`${URL}/projects`, {
            method: 'POST', // or 'PUT'
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(proj)
          })
          .then(response => response.json())
          .then(data => {
            console.log('Success:', data);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
    }

    getLastMadeProject = () =>{
        fetch(`${URL}/projects`)
        .then(resp=>resp.json())
        .then(data=>{
            this.redirectTo(data[data.length-1].id)
        })
    }

    redirectTo=(str)=>{
      
        history.push(`project/${str.toString()}`)
    }


    render() {
        return (
            <div>
           <Navbar></Navbar>
            <div id="login">
                <h1 id="loginTitle">FaceMaker</h1>
                <form onSubmit={event => this.handleSubmit(event)}>
                    <label>
                        Project Name:
                 <input type="text" name="name" onChange={event => this.handleTitleChange(event)} value={this.state.title} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>

            </div>
            </div>
        )
    }
}
