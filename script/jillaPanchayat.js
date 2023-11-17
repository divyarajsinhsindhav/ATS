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
                        addTableRow(doc);
                    });
                }
            });
        }
    }
});

function addTableRow(doc) {
}
