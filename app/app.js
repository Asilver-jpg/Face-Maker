import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import history from "./components/history"

import '!file-loader?name=[name].[ext]!./favicon.ico';
import '!file-loader?name=[name].[ext]!./manifest.json';

import App from 'containers/App';

ReactDOM.render((
  <Router history={history}>
    <App className='App'/>
  </Router>
), document.getElementById('app'));

if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install(); // eslint-disable-line global-require
}
