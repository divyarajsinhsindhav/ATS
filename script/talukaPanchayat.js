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
                        generateButton(appDoc.id, appDoc.data());
                    });
                });
            });
        });
    }
});

// Function to generate a button for each application
function generateButton(applicationId, appDoc) {
    // Create a button element
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn btn-primary');
    button.textContent = `Application ID: ${applicationId} This Application pass to TalukaPanchayat`;

    // Append the button to a container (e.g., a div)
    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.appendChild(button);

    // Add a click event listener to the button
    button.addEventListener('click', () => {
        // Handle button click, e.g., show application details
        console.log(`Button clicked for Application ID: ${applicationId}`);
        console.log(appDoc);
    
        // Update the status field in the specific application document
        const applicationRef = db.collection('application').doc(applicationId);
    
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
            console.log(appDoc)
        })
        .catch(error => {
            console.error('Error updating application status:', error);
        });
    });
}
