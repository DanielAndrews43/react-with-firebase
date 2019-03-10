import React, {Component} from 'react';
import {compose} from 'recompose';

import * as ROLES from '../../constants/roles';
import {withAuthorization} from '../Session';
import {withFirebase} from '../Firebase';

class AdminPage extends Component {
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
      <div>
        <h1>Admin</h1>
        <p>The admin page is accessible by signed in admins</p>

        {loading && <div>Loading...</div>}

        <UserList users={users} />
      </div>
    );
  }
}

const UserList = ({users}) => (
  <>
    {users.map(user => (
      <div key={user.uid}>
        <div>
          <strong>ID:</strong> {user.uid}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Username</strong> {user.username}
        </div>
      </div>
    ))}
  </>
);

const condition = authUser => (
  authUser && authUser.roles.includes(ROLES.ADMIN)
);

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage);