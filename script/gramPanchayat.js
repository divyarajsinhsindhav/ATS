auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not logged in, redirect to the login page
        window.location.replace("/auth/login.html");
    }
    if (user) {
        const application = db.collection('application');
        const talukaPanchayat = db.collection('talukaPanchayat');
        user = auth.currentUser;
        console.log(user.email);


        talukaPanchayat.get().then((talukaSnapshot) => {
            talukaSnapshot.forEach(talukaDoc => {
                const villages = talukaPanchayat.doc(talukaDoc.id).collection('villages');
                villages.get().then((villageSnapshot) => {
                    villageSnapshot.forEach(villageDoc => {
                        const villageId = villageDoc.id;
                        let incremental_id = 1;
                        // Query applications for the current village
                        application.where('applicationReceivedBy.Gram Panchayat', '==', true)
                            .where('village', '==', villageId)
                            .get()
                            .then((appSnapshot) => {
                                appSnapshot.forEach(appDoc => {
                                    const applicationId = appDoc.id;
                                    addTableRow(appDoc, incremental_id++);
                                    console.log(appDoc.id, '=>', appDoc.data());
                                    // Call the function to generate buttons
                                    // generateButton(applicationId, appDoc.data());
                                });
                            })
                            .catch(error => {
                                console.error('Error getting applications:', error);
                            });
                    });
                });
            });
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
    } else if ( badge.id === 'Closed by User') {
        badge.setAttribute('class', 'badge badge-danger');
    } else if (badge.id === 'Rejected') {
        badge.setAttribute('class', 'badge badge-warning');
    } else if (badge.id === 'On Hold') {
        badge.setAttribute('class', 'badge badge-info');
    } else if (badge.id === 'InProgress') {
        badge.setAttribute('class', 'badge badge-primary');
    } else {
        badge.setAttribute('class', 'badge text-white');
    }
    status.appendChild(badge);
    row.appendChild(status);


    const buttonCell = document.createElement('td'); // Create a new <td> for the button
    const buttonRow = document.createElement('td')

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#exampleModalCenter');
    button.textContent = 'View';
    button.classList.add('btn', 'btn-primary'); // Add the btn and btn-primary classes
    buttonCell.appendChild(button);


    buttonRow.appendChild(button);
    row.appendChild(buttonRow);


    row.setAttribute('id', `tbody ${doc.id}`)
    tbody.appendChild(row);

    button.addEventListener('click', function () {
        createModal(doc);
      });

};

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

function createModal(appDoc) {
    const timestamp = appDoc.data().timestamp;

    // Convert to milliseconds
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;

    // Create a Date object
    const date = new Date(milliseconds);

    // Convert to IST
    const options = { timeZone: 'Asia/Kolkata' };
    const istTime = date.toLocaleString('en-US', options);

    // Create a new modal
    const modalId = 'modal-' + appDoc.id;
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade', 'modal-xxl');
    modal.id = modalId;
    modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-fullscreen-lg">
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
                            <p>${appDoc.id}</p>
                        </div>
                        <div class="col">
                            <p class="fw-bold">Subject:</p>
                            <p>${appDoc.data().subject}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <p class="fw-bold">Applicant Name:</p>
                            <p>${appDoc.data().firstName} ${appDoc.data().lastName}</p>
                        </div>
                        <div class="col">
                            <p class="fw-bold">Applicant Email:</p>
                            <p>${appDoc.data().email}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <p class="fw-bold">Date:</p>
                            <p>${istTime}</p>
                        </div>
                        <div class="col">
                            <p class="fw-bold">Status:</p>
                            <p>${appDoc.data().status}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <p class="fw-bold">Description:</p>
                            <p>${appDoc.data().description}</p>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <p class="fw-bold">Document Link: </p>
                            <p><a href="${appDoc.data().fileUrl}">Click Here</a></p>
                        </div>
                    </div>
                    <-- Text Area -->
                    <div class="row mb-3" id="QueryStatusRow">
                        <div class="col">
                            <p class="fw-bold">Give Feedback/Suggestion/Instruction on Application:</p>
                            <textarea id="queryStatus" name="" rows="4" cols="50" style="max-width: 280px"></textarea>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col" id="appPass">
                            <button id="passApplication" class="btn btn-primary">Pass Application to Taluka Panchayat</button>
                        </div>
                        <div id="statusUpdate"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    // Clear existing content in the div element of textarea
    if (appDoc.data().status === 'Closed by User' || appDoc.data().status === 'Completed') {
        const QueryStatusRow = modal.querySelector('#QueryStatusRow');
        QueryStatusRow.setAttribute('hidden', 'true');
    }

    // Use querySelector to select the element by id
    const statusUpdateDiv = modal.querySelector('#statusUpdate');

    if (statusUpdateDiv) {
        // Element exists, proceed with appendChild
        const statusDiv1 = document.createElement('div');
        statusDiv1.setAttribute('class', 'btn-group btn-group-lg btn-group-toggle d-flex justify-content-center mt-3 mb-3');
        statusDiv1.setAttribute('id', `statusDiv_${appDoc.id}`);
        statusUpdateDiv.appendChild(statusDiv1);

        const statusOptions1 = ['Accepted', 'Rejected'];
        const statusOptions2 = ['InProgress', 'Completed'];
        const statusOptions3 = ['On Hold', 'Completed'];

        let statusOptions = [];

        if (appDoc.data().status === 'pending') {
            statusOptions = statusOptions1;
        } else if (appDoc.data().status === 'Accepted') {
            statusOptions = statusOptions2;
        } else if (appDoc.data().status === 'InProgress' || appDoc.data().status === 'On Hold' || appDoc.data().status === 'Closed by User') {
            statusOptions = statusOptions3;
        } else {
            statusOptions = null;
        }

        if (statusOptions) {
            statusOptions.forEach(option => {
                const button = document.createElement('button');
                button.id = `${appDoc.id}_${option}`;
                button.textContent = option;
                statusDiv1.appendChild(button);

                button.addEventListener('click', () => {
                    const status = button.textContent;
                    console.log(status);
                    const updateStatus = { status: status };
                    const applicationRef = db.collection('application').doc(appDoc.id);
                    applicationRef.update(updateStatus)
                        .then(() => {
                            console.log('Application status updated successfully');
                            console.log(updateStatus);
                            window.location.reload();
                        })
                        .catch(error => {
                            console.log('Application status update failed');
                            console.log(error);
                        });
                });
            });
        }
    } else {
        console.error('Element with id "statusUpdate" not found.');
    }

    // Add event listener to the button
    const passApplicationButton = modal.querySelector('#passApplication');
    passApplicationButton.addEventListener('click', () => {
        const applicationRef = db.collection('application').doc(appDoc.id);
        applicationRef.update({
            applicationForwardedTo: {
                'Gram Panchayat': false,
                'Taluka Panchayat': true,
                'Jilla Panchayat': false,
            },
            applicationReceivedBy: {
                'Gram Panchayat': false,
                'Taluka Panchayat': true,
                'Jilla Panchayat': false,
            },
            status: 'Application Forwarded to Jilla Panchayat',
        })
            .then(() => {
                console.log('Application status updated successfully');
                console.log(appDoc);
            })
            .catch(error => {
                console.error('Error updating application status:', error);
            });
    });
    
    if (appDoc.data().status === 'Closed By user' || appDoc.data().status === 'Rejected') {
        passApplicationButton.style.display = 'none';
    }

    // Append the modal directly to the body
    document.body.appendChild(modal);

    // Open the modal
    const modalInstance = new bootstrap.Modal(document.getElementById(modalId));
    modalInstance.show();
}