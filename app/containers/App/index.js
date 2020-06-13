/*
 *
 * App
 *
 */

import React, { Component } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';

import Face from 'containers/Face/'
import Test from 'containers/Test'
import ProjectCardContainer from "../ProjectCardContainer"
import ProjectContainer from "../projectContainer"
import PortfolioContainer from "../portfolioContainer"
import NewContainer from "../newContainer"
import Login from "../../components/login"
import ColorPicker from "../../components/colorPicker"
import NotFound from 'containers/NotFound';


import './style.css';
import './styleM.css';

export default class App extends React.Component {
  render() {
    return (
  
      <div>
        
      <Route exact path='/' component={sessionStorage.getItem("username") ? ProjectCardContainer : Login }/>
      <Route exact path='/p' component={ColorPicker}/>
      <Route exact path='/project/:id' component={ProjectContainer}/>
      <Route exact path='/portfolio' component={PortfolioContainer}/>
      <Route exact path='/new' component={NewContainer}/>
      <Route exact path='/face' component={Face}/>
      <Route exact path='/test' component={Test}/>
      </div>
    )}
}

{/* <Route exact path='/game' component={GameContainer}/>
      <Route exact path='/' component={Home}/>
      <Route exact path='/how_to_play' component={HowToPlay}/>
      <Route exact path='/high_scores' component={ScoresContainer}/>
      <Route exact path="/players" component={PlayersContainer} /> */}
