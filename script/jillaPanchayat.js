auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not logged in, redirect to the login page
        window.location.replace("/auth/login.html");
    }
    if (user) {
        const application = db.collection('application');

        let currentQuery = application.where('applicationReceivedBy.Jilla Panchayat', '==', true);

        let incremental_id = 1;
        // Create a query against the collection.
            application.orderBy('timestamp', 'asc')
            .where('applicationReceivedBy.Jilla Panchayat', '==', true).get().then((snapshot) => {
                if (snapshot.empty) {
                    console.log('No matching documents.');
                    return;
                } else {
                    snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    // Process application document as needed
                    // statusUpdate(doc);
                    addTableRow(doc, incremental_id++);
            });
                }
            });
    }
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
        badge.setAttribute('class', 'badge text-primary');
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


    buttonCell.appendChild(button); // Append the button to the new <td>
    row.appendChild(buttonCell);
    buttonRow.appendChild(button);
    row.appendChild(buttonRow);

    row.setAttribute('id', `tbody ${doc.id}`)
    tbody.appendChild(row);

    button.addEventListener('click', function () {
        createModal(doc);
      });

};

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

        

        if (appDoc.data().status === 'Application Forwarded to Jilla Panchayat' || appDoc.data().status === 'pending') {
            statusOptions = statusOptions1;
        } else if (appDoc.data().status === 'Accepted') {
            statusOptions = statusOptions2;
        } else if (appDoc.data().status === 'InProgress' || appDoc.data().status === 'On Hold') {
            statusOptions = statusOptions3;
        }  else {
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
                    const queryStatus = document.getElementById('queryStatus').value;
                    const updateStatus = { status: status, feedback: queryStatus };
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


const statusUpdateHTML = (doc) => {
    const statusUpdateDiv = document.getElementById('statusUpdate');

    // Create and append Application ID
    const applicationId = document.createElement('h3');
    applicationId.textContent = `Application ID: ${doc.id}`;
    statusUpdateDiv.appendChild(applicationId);

    // Create and append Current Status
    const currentStatus = document.createElement('h3');
    currentStatus.textContent = `Current Status: ${doc.data().status}`;
    statusUpdateDiv.appendChild(currentStatus);

    // Create and append Status Label
    const statusLabel = document.createElement('label');
    statusLabel.setAttribute('for', 'status');
    statusLabel.textContent = 'Status';
    statusUpdateDiv.appendChild(statusLabel);

    // Create and append Status Div
    const statusDiv = document.createElement('div');
    statusDiv.setAttribute('id', `statusDiv_${doc.id}`);
    statusUpdateDiv.appendChild(statusDiv);
}

const statusUpdate = (doc) => {
    statusUpdateHTML(doc);
    const statusDiv = document.getElementById(`statusDiv_${doc.id}`);

    const statusOptions1 = ['Accepted', 'Rejected'];
    const statusOptions2 = ['InProgress', 'Completed'];
    const statusOptions3 = ['On Hold', 'Completed'];

    // Clear existing content
    statusDiv.innerHTML = '';

    if (doc.data().status === 'Application Forwarded to Jilla Panchayat' || doc.data().status === 'pending') {
        statusOptions1.forEach(option => {
            const button = document.createElement('button');
            button.id = `${doc.id}_${option}`; // Set a unique ID for each button
            button.textContent = option;
            statusDiv.appendChild(button);
        });
    } else if (doc.data().status === 'Accepted') {
        statusOptions2.forEach(option => {
            const button = document.createElement('button');
            button.id = `${doc.id}_${option}`; // Set a unique ID for each button
            button.textContent = option;
            statusDiv.appendChild(button);
        });
    } else if (doc.data().status === 'In Progress' || doc.data().status === 'On Hold') {
        statusOptions3.forEach(option => {
            const button = document.createElement('button');
            button.id = `${doc.id}_${option}`; // Set a unique ID for each button
            button.textContent = option;
            statusDiv.appendChild(button);
        });
    } else if (doc.data().status === 'Closed by User' || doc.data().status === 'Rejected');
    const statusButtons = statusDiv.querySelectorAll('button');
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            const status = button.textContent;
            console.log(status); 
                const updateStatus = {
                    status: status,
                };
                const applicationRef = db.collection('application').doc(doc.id);
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
};






