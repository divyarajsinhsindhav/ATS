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
                    let incremental_id = 1;

                    // `currentUserID` is valid, so you can proceed with the Firestore query.
                    application.where('userId', '==', currentUserID).get()
                        .then((snapshot) => {
                            if (snapshot.empty) {
                                console.log('No documents found in the subcollection');
                            } else {
                                snapshot.forEach(doc => {
                                    console.log('Subdocument ID:', doc.id);
                                    console.log('Subdocument data:', doc.data());
                                    addTableRow(doc, incremental_id++);
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

const addApplication = document.querySelector('#addApplication');
addApplication.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.replace("../user/application.html");
});

const addTableRow = (doc, incremental_id) => {
    const tbody = document.getElementById('tbody');

    const row = document.createElement('tr');

    const srNo = document.createElement('th');
    srNo.innerText = incremental_id;
    row.appendChild(srNo);

    const id = document.createElement('td');
    id.innerText = `${doc.id}`;
    row.appendChild(id);

    const subject = document.createElement('td');
    subject.innerText = `${doc.data().subject}`;
    row.appendChild(subject);

    const dateTime = document.createElement('td');
    // Assuming ts is the Timestamp object
    const timestamp = doc.data().timestamp

    // Convert to milliseconds
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;

    // Create a Date object
    const date = new Date(milliseconds);

    // Convert to IST
    const options = { timeZone: 'Asia/Kolkata' };
    const istTime = date.toLocaleString('en-US', options);

    dateTime.innerText = `${istTime}`
    row.appendChild(dateTime);

    const status = document.createElement('td');
    const badge = document.createElement('label');
    badge.innerText = doc.data().status.toUpperCase();
    badge.setAttribute('id', doc.data().status);
    if (badge.id === 'Accepted' || badge.id === 'Completed') {
        badge.setAttribute('class', 'badge badge-success');
    } else if (badge.id === 'Closed') {
        badge.setAttribute('class', 'badge badge-danger');
    } else {
        badge.setAttribute('class', 'badge text-primary')
    }
    status.appendChild(badge);
    row.appendChild(status);

    const buttonRow = document.createElement('td')
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#exampleModalCenter');
    button.textContent = 'View';

    buttonRow.appendChild(button);
    row.appendChild(buttonRow);

    row.setAttribute('id', `tbody ${doc.id}`)
    tbody.appendChild(row);

    button.addEventListener('click', function () {
        createModal(doc);
      });

};

function createModal(doc) {

    const timestamp = doc.data().timestamp

    // Convert to milliseconds
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;

    // Create a Date object
    const date = new Date(milliseconds);

    // Convert to IST
    const options = { timeZone: 'Asia/Kolkata' };
    const istTime = date.toLocaleString('en-US', options);

    // Create a new modal
    const modalId = 'modal-' + doc.id;
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade', 'modal-xxl');
    modal.id = modalId;
    modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-fullscreen-xl"> <!-- Change to modal-fullscreen-lg for full-screen on larger screens -->
        <div class="modal-content">
            <div class="modal-header bg-primary text-light">
                <h1 class="modal-title fs-5">APPLICATION DETAIL</h1>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="container-fluid">
                    <div class="row mb-3">
                        <div class="col">
                            <p class="fw-bold">Application ID:</p>
                            <p>${doc.id}</p>
                        </div>
                        <div class="col">
                            <p class="fw-bold">Subject:</p>
                            <p>${doc.data().subject}</p>
                        </div>
                    </div>
                    <!-- Add more rows for additional details -->
                    <div class="row mb-3">
                        <div class="col">
                            <p class="fw-bold">Date:</p>
                            <p>${istTime}</p>
                        </div>
                        <div class="col">
                            <p class="fw-bold">Status:</p>
                            <p>${doc.data().status}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col" id="closeAppCol">
                            <button id="closeApplication" class="btn btn-danger">Close Application</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    if (doc.data().status === 'Accepted' || doc.data().status === 'Completed' || doc.data().status === 'Closed' || doc.data().status === 'Closed by User' || doc.data().status === 'Rejected') {
        const closeAppCol = modal.querySelector('#closeAppCol');
        closeAppCol.setAttribute('hidden', 'true');  
    }

    // Add a click event listener to the button
    const closeApplicationButton = modal.querySelector('#closeApplication');
    closeApplicationButton.addEventListener('click', () => {
        closeApp(doc.id);
    });


    // Append the modal directly to the body
    document.body.appendChild(modal);

    // Open the modal
    const modalInstance = new bootstrap.Modal(document.getElementById(modalId));
    modalInstance.show();
    
    const closeApplicationButton = document.getElementById('closeApplication');
    closeApplicationButton.addEventListener('click', () => {
        // Perform actions when the "Close Application" button is clicked
        // For example, you can update the Firestore document status here
        closeApplication(doc.id);
        // Close the modal
        modalInstance.hide();
    });
}

    
const logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            alert("logged out successfully.")
            window.location.assign("/auth/login.html");
        })
        .catch((error) => {
            console.error("Logout error:", error);
        });
});

function closeApplication(applicationId) {
    const applicationRef = db.collection('application').doc(applicationId);

    // Update the status to 'Closed' or perform any other necessary updates
    applicationRef.update({
        status: 'Closed By user'
    })
    .then(() => {
        console.log('Application closed successfully!');
        // You can update the UI or perform additional actions here

// Assuming you have a global function closeApp
function closeApp(applicationId) {
    db.collection('application').doc(applicationId).update({
        status: 'Closed by User'
    })
    .then(() => {
        console.log('Application closed successfully');
        alert('Application closed successfully');
        window.location.reload();
    })
    .catch((error) => {
        console.error('Error closing application:', error);
    });
}

}
