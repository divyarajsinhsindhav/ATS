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

    const button = document.createElement('td')
    const buttonRow = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#exampleModalCenter');
    button.textContent = 'View';

    button.appendChild(buttonRow);
    row.appendChild(button);

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
    modal.classList.add('modal', 'fade', 'modal-xl');
    modal.id = modalId;
    modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-fullscreen-lg"> <!-- Change to modal-fullscreen-lg for full-screen on larger screens -->
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
                        <div class="col">
                            <button id="closeApplication" class="btn btn-danger">Close Application</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    `;

    // Append the modal directly to the body
    document.body.appendChild(modal);

    // Open the modal
    const modalInstance = new bootstrap.Modal(document.getElementById(modalId));
    modalInstance.show();
    

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

