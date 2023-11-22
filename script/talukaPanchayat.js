auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not logged in, redirect to the login page
        window.location.replace("/auth/login.html");
    }
    if (user) {
        const talukaPanchayat = db.collection('talukaPanchayat');
        email = user.email;
        let taluka;  // Declare taluka variable to store its value

        talukaPanchayat.where('email', '==', email).get().then((snapshot) => {
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                taluka = doc.id;


                // Move the second query inside the loop
                const application = db.collection('application');
                application.where('applicationReceivedBy.Taluka Panchayat', '==', true)
                            .where('taluka', '==', taluka).get().then((snapshot) => {
                    // Handle the results of the second query
                    snapshot.forEach(appDoc => {
                        console.log(appDoc.id, '=>', appDoc.data());
                        // Process application document as needed
                        // generateButton(appDoc.id, appDoc.data());
                        addTableRow(appDoc);
                    });
                });
            });
        });
    }
});

const addTableRow = (doc) => {
    const tbody = document.getElementById('tbody');

    // Create a new 'row' element
    const row = document.createElement('tr');

    const srNo = document.createElement('th');
    srNo.innerText = '2';
    row.appendChild(srNo);
    
    const id = document.createElement('td')
    id.innerText = `${doc.id}`
    row.appendChild(id)
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
    const timestamp = doc.data().timestamp;

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
        <div class="modal-dialog modal-dialog-centered modal-xl">
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
                            <p class="fw-bold">Document Link:</p>
                            <p>${doc.data().fileUrl}</p>
                        </div>
                        <div class="row mb-3" id="button ${doc.id}">
                            <!-- The status update button will be appended here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Generate and append the status update button
    // generateButton(doc, doc.id);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    // button.setAttribute('id', 'passApplication');
    button.setAttribute('class', 'btn btn-primary');
    button.textContent = `Pass Application to Jilla Panchayat`;
    const container = document.getElementById("button " + doc.id);
    container.appendChild(button);

    // Add a click event listener to the button
    button.addEventListener('click', () => {
        // Handle button click, e.g., show application details
        console.log(`Button clicked for Application ID: ${doc.id}`);
        console.log(doc);

        // Update the status field in the specific application document
        const applicationRef = db.collection('application').doc(doc.id);

        applicationRef.update({
            applicationForwardedTo: {
                'Gram Panchayat': false,
                'Taluka Panchayat': false,
                'Jilla Panchayat': true,
            },
            applicationReceivedBy: {
                'Gram Panchayat': false,
                'Taluka Panchayat': false,
                'Jilla Panchayat': true,
            },
            status: 'Application Forwarded to Jilla Panchayat',
        })
        .then(() => {
            console.log('Application status updated successfully');
            console.log(doc);
        })
        .catch(error => {
            console.error('Error updating application status:', error);
        });
    });

    // Append the modal directly to the body
    document.body.appendChild(modal);

    // Open the modal
    const modalInstance = new bootstrap.Modal(document.getElementById(modalId));
    modalInstance.show();
}


// function generateButton(doc, targetElementId) {
//     // Create a button element
//     const button = document.createElement('button');
//     button.setAttribute('type', 'button');
//     // button.setAttribute('id', 'passApplication');
//     button.setAttribute('class', 'btn btn-primary');
//     button.textContent = `Pass Application to Jilla Panchayat`;

//     // Append the button to the specified container
//     const container = document.getElementById(targetElementId);
//     container.appendChild(button);

//     // Add a click event listener to the button
//     button.addEventListener('click', () => {
//         // Handle button click, e.g., show application details
//         console.log(`Button clicked for Application ID: ${doc.id}`);
//         console.log(doc);

//         // Update the status field in the specific application document
//         const applicationRef = db.collection('application').doc(doc.id);

//         applicationRef.update({
//             applicationForwardedTo: {
//                 'Gram Panchayat': false,
//                 'Taluka Panchayat': false,
//                 'Jilla Panchayat': true,
//             },
//             applicationReceivedBy: {
//                 'Gram Panchayat': false,
//                 'Taluka Panchayat': false,
//                 'Jilla Panchayat': true,
//             },
//             status: 'Application Forwarded to Jilla Panchayat',
//         })
//         .then(() => {
//             console.log('Application status updated successfully');
//             console.log(doc);
//         })
//         .catch(error => {
//             console.error('Error updating application status:', error);
//         });
//     });
// }
