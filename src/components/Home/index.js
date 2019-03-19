import React, { Component } from 'react';
import { compose } from 'recompose';

import { withAuthorization, withEmailVerification, AuthUserContext } from '../Session';
import { withFirebase } from '../Firebase';

class HomePage extends Component {
  constructor(props) {
    super(props);
    
    this.setState({
      users: []
    })
  }

  componentDidMount() {
    this.firebase.users().on('value', snapshot => {
      this.setState({
        users: snapshot.val()
      })
    })
  }

  componentWillUnmount() {
    this.firebase.users().off()
  }

  render() {
    return (
      <div>
        <h1>Home Page</h1>
        <p>Only accessible by those who are logged in</p>
        <Messages user={this.state.users}/>
      </div>
    );
  }
}

class MessagesBase extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      messages: [],
      text: '',
      limit: 5
    }
  }

  onChange = event => {
    this.setState({ text: event.target.value });
  }

  onCreateMessage = (event, authUser) => {
    this.firebase.messages().push({ 
      text: this.state.text,
      userId: authUser.uid,
      createdAt: this.props.firebase.serverValue.TIMESTAMP
    })

    this.setState({ text: '' });

    event.preventDefault();
  }

  onRemoveMessage = uid => {
    this.firebase.message(uid).remove();
  }

  onEditMessage = (message, text) => {
    this.firebase.message(message.uid).set({
      ...message,
      text,
      editedAt: this.props.firebase.serverValue.TIMESTAMP
    })
  }

  componentDidMount() {
    this.onListenForMessages()
  }

  onNextPage = () => {
    this.setState(
      state => ({ limit: state.limit + 5 }),
      this.onListenForMessages
    )
  }

  onListenForMessages = () => {
    this.setState({ loading: true });

    this.firebase.messages()
    .orderByChild('createdAt')
    .limitToLast(this.state.limit)
    .on('value', snapshot => {
      let messageObj = snapshot.val();

      if (messageObj) {
        const messageList = Object.keys(messageObj).map(key => ({
          ...messageObj[key],
          uid: key,
        }))
        this.setState({ loading: false, messages: messageList });
      } else {
        this.setState({ loading: false, messages: null });
      }
    })
  }

  componentWillUnmount() {
    this.firebase.messages().off();
  }
  
  render() {
    const { text, messages, loading } = this.state
    const { users } = this.props;

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {loading && <div>Loading...</div>}

            {!loading && messages && (
              <button type="button" onClick={this.onNextPage}>
                More
              </button>
            )}

            {messages ? (
              <MessageList 
                messages={messages.map(message => ({
                  ...message,
                  user: users
                    ? users[message.userId]
                    : { userId: message.userId }
                }))}
                onRemoveMessage={this.onRemoveMessage}
                onEditMessage={this.onEditMessage}
              />
            ) : (
              <div>There are no messages</div>
            )}

            <form onSubmit={event => this.onCreateMessage(event, authUser)}>
              <input
                type="text"
                value={text}
                onChange={this.onChange}
              />
              <button type="submit">Send</button>
            </form>
            
          </div>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const MessageList = ({ messages, onRemoveMessage, onEditMessage }) => (
  <div>
    {messages.map(message => (
      <MessageItem
        key={message.uid}
        message={message}
        onRemoveMessage={onRemoveMessage}
        onEditMessage={onEditMessage}
      />
    ))}
  </div>
);

class MessageItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      editText: this.props.message.text
    }
  }

  onToggleEditMode = () => {
    this.setState(state => ({
      editMode: !state.editMode,
      editText: this.props.message.text
    }))
  }

  onChange = event => {
    this.setState({ editText: event.target.value });
  }

  onSave = () => {
    this.props.onEditMessage(this.props.message, this.state.editText);

    this.setState({ editMode: false });
  }

  render() {
    const { message, onRemoveMessage } = this.props;
    const { editMode, editText } = this.state;

    return (
      <div>
        {editMode ? (
          <div>
            <input
              type="text"
              value={editText}
              onChange={this.onChange}
            />
            <button type="button" onClick={this.onSave}>Save</button>
            <button type="button" onClick={this.onToggleEditMode}>Reset</button>
          </div>
        ) : (
          <div>
            <strong>{message.user.username || message.user.userId}</strong>
            {message.text} {message.editedAt && <div>(Edited)</div>}
            <button type="button" onClick={() => onRemoveMessage(message.uid)}>
              Delete
            </button>
            <button type="button" onClick={this.onToggleEditMode}>Edit</button>
          </div>
        )}
      </div>
    )
  }
}

const Messages = withFirebase(MessagesBase)

const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withEmailVerification,
  withAuthorization(condition)
)(HomePage);