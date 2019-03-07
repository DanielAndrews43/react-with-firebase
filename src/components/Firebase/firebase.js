import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

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
    this.db = app.database();
  }

  /* Auth API */

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


  /* User API */

  user = uid => (
    this.db.ref(`users/${uid}`)
  );

  users = () => (
    this.db.ref('users')
  );

  /* Merge Auth & DB User API */

  onAuthUserListener = (next, fallback) => {
    return this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
        .once('value')
        .then(snapshot => {
          const dbUser = snapshot.val();

          if (!dbUser.roles) {
            dbUser.roles = [];
          }

          authUser = {
            uid: authUser.uid,
            email: authUser.email,
            ...dbUser
          };

          next(authUser);
        })
      } else {
        fallback();
      }
    })
  }
}

export default Firebase;