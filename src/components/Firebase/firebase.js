import app from 'firebase/app';
import auth from 'firebase/auth';

var config = {
  apiKey: "AIzaSyDqlwIWdPCryDxlqu-s6i-cxSD03n3mv6s",
  authDomain: "react-test-29480.firebaseapp.com",
  databaseURL: "https://react-test-29480.firebaseio.com",
  projectId: "react-test-29480",
  storageBucket: "react-test-29480.appspot.com",
  messagingSenderId: "457688720698"
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    this.auth = app.auth();
  }

  doCreateUserWithEmailAndPassword = (email, password) => (
    this.auth.createUserWithEmailAndPassword(email, password)
  );
  
  doSignInWithEmailAndPassword = (email, password) => (
    this.auth.signInWithEmailAndPassword(email, password)
  );

  doSignOut = () => (
    this.auth.signOut()
  );

  doPasswordReset = email => (
    this.auth.sendPasswordResetEmail(email)
  );

  doPasswordUpdate = password => (
    this.auth.currentUser.updatePassword(password)
  );
}

export default Firebase;