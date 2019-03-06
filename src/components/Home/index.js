import React from 'react';

import {withAuthorization} from '../Session';

const HomePage = () => (
  <div>
    <h1>Home Page</h1>
    <p>Only accessible by those who are logged in</p>
  </div>
)

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);