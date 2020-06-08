/*
 *
 * App
 *
 */

import React, { Component } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';

import Face from 'containers/Face/'
import Test from 'containers/Test'
import NotFound from 'containers/NotFound';


import './style.css';
import './styleM.css';

export default class App extends React.Component {
  render() {
    return (
  
      <div>
     
      <Route exact path='/' component={Face}/>
      <Route exact path='/test' component={Test}/>
      </div>
    )}
}

{/* <Route exact path='/game' component={GameContainer}/>
      <Route exact path='/' component={Home}/>
      <Route exact path='/how_to_play' component={HowToPlay}/>
      <Route exact path='/high_scores' component={ScoresContainer}/>
      <Route exact path="/players" component={PlayersContainer} /> */}
