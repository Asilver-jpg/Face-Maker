import React from 'react'
import { Link } from 'react-router-dom'
import ScoreListing from '../components/ScoreListing'


class ScoresContainer extends React.Component {
  state = {
    scores: [],
    users: []
  }
  componentDidMount(){
    Promise.all([
      fetch(`http://localhost:3001/api/v1/scores`)
        .then(response => response.json()),
      fetch(`http://localhost:3001/api/v1/users`)
        .then(response => response.json())
    ])
    .then(([scores, users]) => this.setState({ scores, users }))
  }
  getUsername = (userId) => {
    let found = this.state.users.find(user => user.id === userId)
    return found.user_name
  }
  render() {
    const sortedScores = this.state.scores.sort((a,b) => a.value > b.value? -1 :1)

    // console.log("ScoresContainer State=>", this.state.scores)

    return(
      <div className="scoreContainer">
        <h1><u>High Scores</u></h1>
        <div className='card-container'>
          <ul>
        {sortedScores.map(score => 
        <li>
        <ScoreListing
          key={score.id}
          name={this.getUsername(score.user_id)}
          value={score.value}
          
        />
          </li>)}
          </ul>
      
        </div>
    
      </div>
    )
  }
}
export default ScoresContainer