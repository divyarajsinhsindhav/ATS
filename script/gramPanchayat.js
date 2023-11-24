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
    } else if (badge.id === 'Closed') {
        badge.setAttribute('class', 'badge badge-danger');
    } else {
        badge.setAttribute('class', 'badge text-primary')
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
    const myModal = 'modal-' + doc.id;
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade', 'modal-xxl');
    modal.id = myModal;
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
                    <div class="col">
                        <button id="closeApplication" class="btn btn-danger">Close Application</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


    `;

    const closeApplication = document.getElementById('closeApplication');

    

    // Append the modal directly to the body
    document.body.appendChild(modal);

    // Open the modal
    const modalInstance = new bootstrap.Modal(document.getElementById(myModal));
    modalInstance.show();
    

}