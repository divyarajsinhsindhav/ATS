auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not logged in, redirect to the login page
        window.location.replace("/auth/login.html");
    }
    if (user) {
        currentUserID = user.uid;
        email = user.email; // Set the email variable here.
        console.log("Current user's email: " + email);

        // Reference to the users collection
        const usersCollection = db.collection('citizen');

        // Query the users collection based on the user's email
        usersCollection.where('email', '==', email).get()
            .then((snapshot) => {
                if (snapshot.empty) {
                    console.log('No user details found for the current user');
                } else {
                    snapshot.forEach(doc => {
                        console.log('User document ID:', doc.id);
                        console.log('User document data:', doc.data());
                        // Add logic to use the user details as needed
                        // For example, update UI elements with user information
                    });
                    const application = db.collection('application');

                    // `currentUserID` is valid, so you can proceed with the Firestore query.
                    application.where('userId', '==', currentUserID).get()
                        .then((snapshot) => {
                            if (snapshot.empty) {
                                console.log('No documents found in the subcollection');
                            } else {
                                snapshot.forEach(doc => {
                                    console.log('Subdocument ID:', doc.id);
                                    console.log('Subdocument data:', doc.data());
                                });
                            }
                        })
                        .catch((error) => {
                            console.error('Error getting subdocuments:', error);
                        });
                }
            })
            .catch((error) => {
                console.error('Error getting user details:', error);
            });
    }
});

