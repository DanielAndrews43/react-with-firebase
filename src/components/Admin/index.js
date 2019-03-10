import React, {Component} from 'react';
import {compose, renderComponent} from 'recompose';
import { Switch, Route, Link } from 'react-router-dom';

import { withAuthorization, withEmailVerification } from '../Session';
import {withFirebase} from '../Firebase';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

const AdminPage = () => (
  <div>
    <h1>Admin</h1>
    <p>The admin page is accessible by signed in admins</p>

    <Switch>
      <Route exact path={ROUTES.ADMIN_DETAILS} component={UserItem} />
      <Route exact path={ROUTES.ADMIN} component={UserList} />
    </Switch>
  </div>
);

const UserInfo = props => (
  <>
    <div>
      <strong>ID:</strong> {props.user.uid}
    </div>
    <div>
      <strong>Email:</strong> {props.user.email}
    </div>
    <div>
      <strong>Username</strong> {props.user.username}
    </div>
  </>
);

class UserListBase extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      loading: false,
      users: []
    }
  }
  
  componentDidMount() {
    this.setState({
      loading: true
    })
  
    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val();
      
      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key
      }))
  
      this.setState({
        loading: false,
        users: usersList
      });
    });
  }
  
  componentWillUnmount() {
    this.props.firebase.users().off();
  }
  
  render() {
    const {
      users,
      loading
    } = this.state;

    return (
      <>
        <h2>Users</h2>

        {loading && <div>Loading...</div>}

        {users.map(user => (
          <div key={user.uid}>
            <UserInfo user={user} />
            <div>
              <Link
                to={{
                  pathname: `${ROUTES.ADMIN}/users/${user.uid}`,
                  state: { user }
                }}
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </>
    );
  }
}

class UserItemBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      loading: false,
      ...props.location.state
    }
  }

  componentDidMount() {
    if (this.state.user) {
      return;
    }

    this.setState({
      loading: true
    });

    this.props.firebase
    .user(this.props.match.params.id)
    .on('value', snapshot => {
      let dbUser = snapshot.val();
      dbUser.uid = this.props.match.params.id;

      this.setState({  
        user: dbUser,
        loading: false
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.user(this.props.match.params.id).off();
  }

  onSendPasswordResetEmail = () => {
    this.props.firebase.doPasswordReset(this.state.user.email);
  };
  
  render() {
    const {
      user,
      loading
    } = this.state;

    return (
      <div>
        <h2>User ({ this.props.match.params.id })</h2>

        {loading && <div>Loading...</div>}

        {user && <UserInfo user={user}/>}
        <button
          type="button"
          onClick={this.onSendPasswordResetEmail}
        >
          Send Password Reset
        </button>
      </div>
    );
  }
}

const condition = authUser => (
  authUser && authUser.roles.includes(ROLES.ADMIN)
);

const UserList = withFirebase(UserListBase);
const UserItem = withFirebase(UserItemBase);

export default compose(
  withEmailVerification,
  withAuthorization(condition)
)(AdminPage);