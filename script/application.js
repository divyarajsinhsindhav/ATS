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
                        // Get the firstName, lastName, taluka, village, isVillager, phoneNumber, userId
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
        const file = document.getElementById('pdfFile').files[0];

        // Additional checks for subject, description, and where
        if (!subject || !description || !where || !file) {
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
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            const applicationID = docRef.id;
            const currentUserID = userIdValue; // Replace with your current user ID
            return uploadFile(file, applicationID, currentUserID, subject);
        })
        .then(() => {
            alert("Application submitted successfully!");
            window.location.replace("/user/deshboard.html");
        })
        .catch((error) => {
            console.error("Error adding document or uploading file:", error);
            alert("Error submitting application. Please try again later.");
        });
    });
};

const uploadFile = (file, applicationID, currentUserID) => {
    const storageRef = storage.ref();
    const fileName = `${applicationID}_${file.name}`;
    const fileRef = storageRef.child(fileName);

    // Upload the file
    return fileRef.put(file)
        .then(() => {
            console.log('Uploaded a file');

            // Update metadata after successful upload
            const newMetadata = {
                customMetadata: {
                    'applicationID': applicationID,
                    'userID': currentUserID,
                }
            };

            return fileRef.updateMetadata(newMetadata);
        })
        .then(() => {
            console.log('Updated metadata');
            //update the document with the file url
        })
        .then(() => {
            const url = `https://firebasestorage.googleapis.com/v0/b/ats-6786c.appspot.com/o/${fileName}?alt=media`;
            return db.collection('application').doc(applicationID).update({
                fileUrl: url
            });
        })
        .catch((error) => {
            console.error('Error uploading file or updating metadata:', error);
            throw error; // Propagate the error to the next catch block
        });
};

//offline Application
const userId = document.getElementById('userID').value;
const submitOffline = document.getElementById('submitOffline').value;
const descriptionOffline = document.getElementById('descriptionOffline').value;
const subjectOffline = document.getElementById('subjectOffline').value;
const emailOffline = document.getElementById('emailOffline').value;
const phoneNumberOffline = document.getElementById('phoneNumberOffline').value;
submitOffline.addEventListener('submit', () => {
    db.collection('application').add({
        subject: subjectOffline,
        description: descriptionOffline,
        email: emailOffline,
        taluka: talukaValue,
        village: villageValue,
        phoneNumber: phoneNumberOffline,
        userId: userId,
        isOffline: true,
        isOnline: false,
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
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .then(() => {
        alert("Application submitted successfully!");
    })
    .catch((error) => {
        alert("Error submitting application. Please try again later.", error);
    });
});

