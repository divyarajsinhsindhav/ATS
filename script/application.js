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
                        // Add logic to use the user details as needed
                        //Get the firstName, lastName, taluka, village, isVillager, phoneNumber, userId
                        isVillager = doc.data().isVillager;
                        
                        const  userID = document.getElementById('userId').value = doc.data().userId;
                        const firstname = document.getElementById('firstName').value = doc.data().firstName;
                        const lastname = document.getElementById('lastName').value = doc.data().lastName;
                        const email_ = document.getElementById('email').value = doc.data().email;
                        const phonenumber = document.getElementById('phoneNumber').value = doc.data().phoneNumber;
                        const village_ = document.getElementById('village').value = doc.data().village;
                        const taluka_ = document.getElementById('taluka').value = doc.data().taluka;
                        application(firstname, lastname, email_, phonenumber, village_, taluka_, userID);
                    });
                    
                    const where = document.getElementById('where');
                    if (isVillager === true) {
                        where.innerHTML = `<option value="gramPanchayat">Gram Panchayat</option>` + where.innerHTML;
                    } 

                }
            })
            .catch((error) => {
                console.error('Error getting user details:', error);
            });
    }
});

const application = (firstname, lastname, email_, phonenumber, village_, taluka_, userID) => {
    //Submit the application
    const submit = document.getElementById('submit');
    submit.addEventListener('click', function (event) {
        event.preventDefault();
        const subject = document.getElementById('subject').value;
        const description = document.getElementById('description').value;
        const where = document.getElementById('where').value;

        // Additional checks for subject, description, and where
        if (!subject || !description || !where) {
            alert('Please fill in all fields');
            return;
        }

        let isGramPanchayat;
        let isTalukaPanchayat;
        let isJillaPanchayat;

        if (where == 'gramPanchayat') {
            isGramPanchayat = true;
            isTalukaPanchayat = false;
            isJillaPanchayat = false;
        } else if (where == 'talukaPanchayat') {
            isTalukaPanchayat = true;
            isGramPanchayat = false;
            isJillaPanchayat = false;
        } else if (where == 'jillaPanchayat') {
            isJillaPanchayat = true;
            isGramPanchayat = false;
            isTalukaPanchayat = false;
        }

        // Extract values from input elements
        const emailValue = email_;
        const firstNameValue = firstname;
        const lastNameValue = lastname;
        const talukaValue = taluka_;
        const villageValue = village_;
        const phoneNumberValue = phonenumber;
        const userIdValue = userID;

        // Add all the application details to the database, including the updated status
        db.collection('application').add({
            subject: subject,
            description: description,
            email: emailValue,
            firstName: firstNameValue,
            lastName: lastNameValue,
            taluka: talukaValue,
            village: villageValue,
            phoneNumber: phoneNumberValue,
            userId: userIdValue,
            isOffline: false,
            isOnline: true,
            status: 'pending',
            applicationReceivedBy: {
                'Gram Panchayat': isGramPanchayat,
                'Taluka Panchayat': isTalukaPanchayat,
                'Jilla Panchayat': isJillaPanchayat
            },
            applicationForwardedTo: {
                'Gram Panchayat': false,
                'Taluka Panchayat': false,
                'Jilla Panchayat': false
            },
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            window.location.replace("/user/deshboard.html");
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
            alert("Error submitting application. Please try again later.");
        });
    });
};


