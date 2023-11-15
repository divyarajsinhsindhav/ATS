const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyB1tYl-xc9TxzaBg3LTY1UoP99Y3ht8E8M",
    authDomain: "ats-6786c.firebaseapp.com",
    projectId: "ats-6786c",
    storageBucket: "ats-6786c.appspot.com",
    messagingSenderId: "648235604391",
    appId: "1:648235604391:web:6a8c5264dcde206aaabe82",
    measurementId: "G-DPSB8JMER5"
});

const db = firebaseApp.firestore()
db.settings({ timestampInSnapshot: true })
const auth = firebaseApp.auth();
