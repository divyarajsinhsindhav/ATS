auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not logged in, redirect to the login page
        window.location.replace("/auth/login.html");
    }
    if (user) {
        const application = db.collection('application');
        const talukaPanchayatApplication = document.getElementById('talukaPanchayatApplication');
        const gramPanchayatApplication = document.getElementById('gramPanchayatApplication');
        const jillaPanchayatApplication = document.getElementById('jillaPanchayatApplication');

        let currentQuery = application.where('applicationReceivedBy.Jilla Panchayat', '==', true);

        jillaPanchayatApplication.addEventListener('click', () => {
            currentQuery = application.where('applicationReceivedBy.Jilla Panchayat', '==', true);
            executeQuery(currentQuery);
        });

        talukaPanchayatApplication.addEventListener('click', () => {
            currentQuery = application.where('applicationReceivedBy.Taluka Panchayat', '==', true);
            executeQuery(currentQuery);
        });

        gramPanchayatApplication.addEventListener('click', () => {
            currentQuery = application.where('applicationReceivedBy.Gram Panchayat', '==', true);
            executeQuery(currentQuery);
        });

        // Initial query execution
        executeQuery(currentQuery);


        function executeQuery(query) {
            query.get().then((snapshot) => {
                if (snapshot.empty) {
                    console.log('No matching documents.');
                    return;
                } else {
                    snapshot.forEach(doc => {
                    console.log(doc.id, '=>', doc.data());
                    // Process application document as needed
                    statusUpdate(doc);
            });
                }
            });
        }
    }
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
    const statusOptions3 = ['On Hold', 'Completed', 'Closed'];

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
    } else if (doc.data().status === 'Closed' || doc.data().status === 'Rejected');
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






