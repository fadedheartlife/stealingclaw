import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import Trading from './components/Trading';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path='/' exact component={Login} />
          <Route path='/dashboard' component={Dashboard} />
          <Route path='/wallet' component={Wallet} />
          <Route path='/trading' component={Trading} />
          <Route path='/admin' component={AdminPanel} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;