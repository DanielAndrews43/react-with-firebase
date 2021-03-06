import React from 'react';
import { Link } from 'react-router-dom';

import SignOutButton from '../SignOut';
import {AuthUserContext} from '../Session';
import * as ROUTES from '../../constants/routes';
import * as ROLES from '../../constants/roles';
import { auth } from 'firebase';


const Navigation = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <>
        <Link to={ROUTES.LANDING}>Landing</Link>
        {
          authUser
            ? (
              <>
                <Link to={ROUTES.HOME}>Home</Link>
                <Link to={ROUTES.ACCOUNT}>Account</Link>
                {authUser.roles.includes(ROLES.ADMIN) &&
                  <Link to={ROUTES.ADMIN}>Admin</Link>
                }
                <SignOutButton/>
              </>
            ) : (
              <Link to={ROUTES.SIGN_IN}>Sign In</Link>
            )
        }
      </>
    )}
  </AuthUserContext.Consumer>
);

export default Navigation;