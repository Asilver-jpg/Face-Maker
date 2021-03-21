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
      <Route exact path='/project/:id' component={sessionStorage.getItem("username") ? ProjectContainer : Login}/>
      <Route exact path='/portfolio' component={sessionStorage.getItem("username") ? PortfolioContainer : Login}/>
      <Route exact path='/new' component={sessionStorage.getItem("username") ? NewContainer : Login}/>
      <Route exact path='/test' component={Test}/>
      </div>
    )}
}

