import React, {Component} from 'react';

import { AuthUserContext, withAuthorization } from '../Session';
import { PasswordForgetForm } from '../PasswordForget';
import { PasswordChangeForm } from '../PasswordChange';
import { withFirebase } from '../Firebase';

const SIGN_IN_METHODS = [
  {
    id: 'password',
    provider: null,
  },
  {
    id: 'google.com',
    provider: 'googleProvider',
  },
  {
    id: 'facebook.com',
    provider: 'facebookProvider',
  },
  {
    id: 'twitter.com',
    provider: 'twitterProvider',
  }, 
];

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <h1>Account: {authUser.email}</h1>
        <PasswordForgetForm/>
        <PasswordChangeForm/>
        <LoginManagement authUser={authUser} />
      </div>
    )}
  </AuthUserContext.Consumer>
)

class DefaultLoginToggle extends Component {
  constructor(props) {
    super(props);

    this.state = {
      passwordOne: '',
      passwordTwo: ''
    };
  }

  onSubmit = event => {
    event.preventDefault();

    this.props.onLink(this.state.passwordOne);
    this.setState({
      passwordOne: '',
      passwordTwo: ''
    });
  }

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  render() {
    const {
      isEnabled,
      onlyOneLeft,
      signInMethod,
      onLink,
      onUnlink
    } = this.props;

    const {
      passwordOne,
      passwordTwo
    } = this.state;

    const isInvalid = passwordOne === passwordTwo || passwordOne === '';

    return isEnabled ? (
      <button
        type="button"
        onClick={() => this.unLink(signInMethod.id)}
        disabled={onlyOneLeft}
      >
        Deactivate {signInMethod.id}
      </button>
    ) : (
      <form onSubmit={this.onSubmit}>
        <input 
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="New Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm New Password"
        />

        <button disabled={isInvalid} type="submit">
          Link {signInMethod.id}
        </button>
      </form>
    );
  }
}

const SocialLoginToggle = ({
  isEnabled,
  onlyOneLeft,
  signInMethod,
  onLink,
  onUnlink
}) => (
  isEnabled ? (
    <button 
      type="button" 
      onClick={() => onUnlink(signInMethod.id)}
      disabled={onlyOneLeft}
    >
      Deactivate {signInMethod.id}
    </button>
  ) : (
    <button 
      type="button"
      onClick={() => onLink(signInMethod.provider)}
    >
      Link {signInMethod.id}
    </button>
  )
);

class LoginManagementBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSignInMethods: [],
      error: null
    };
  }

  componentDidMount() {
    this.fetchSignInMethods();
  }
  
  fetchSignInMethods = () => {
    this.props.firebase.auth
    .fetchSignInMethodsForEmail(this.props.authUser.email)
    .then(activeSignInMethods => {
      this.setState({
        activeSignInMethods,
        error: null
      })
    })
    .catch(error => {
      this.setState({
        error
      });
    })
  }

  onSocialLoginLink = provider => {
    this.props.firebase.authUser
    .linkWithPopup(this.props.firebase[provider])
    .then(this.fetchSignInMethods)
    .catch(error => {
      this.setState({
        error
      })
    });
  }

  onDefaultLoginLink = password => {
    const credential = this.props.firebase.emailAuthProvider(
      this.props.authUser.email,
      password
    );

    this.props.firebase.auth.currentUser
    .linkAndRetrieveDataWithCredential(credential)
    .then(this.fetchSignInMethods)
    .catch(error => {
      this.setState({
        error
      })
    })
  }

  onUnlink = providerId => {
    this.props.firebase.authUser
    .unlink(providerId)
    .then(this.fetchSignInMethods)
    .catch(error => {
      this.setState({
        error
      });
    });
  }
  
  render() {
    const {
      activeSignInMethods,
      error
    } = this.state;

    return (
      <div>
        Sign in methods:
        {SIGN_IN_METHODS.map(signInMethod => {
          const onlyOneLeft = activeSignInMethods.length === 1;
          const isEnabled = activeSignInMethods.includes(signInMethod.id);

          return (
            <div key={signInMethod.id}>
              {signInMethod.id === 'password' ? (
                <DefaultLoginToggle
                  isEnabled={isEnabled}
                  onlyOneLeft={onlyOneLeft}
                  signInMethod={signInMethod}
                  onLink={this.onDefaultLoginLink}
                  onUnlink={this.onUnlink}
                />
              ) : (
                <SocialLoginToggle
                  isEnabled={isEnabled}
                  onlyOneLeft={onlyOneLeft}
                  signInMethod={signInMethod}
                  onLink={this.onSocialLoginLink}
                  onUnlink={this.onUnlink}
                />
              )}
            </div>
          );
        })}
        {error && error.message}
      </div>
    );
  }
}

const condition = authUser => !!authUser;

const LoginManagement = withFirebase(LoginManagementBase);

export default withAuthorization(condition)(AccountPage);