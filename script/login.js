const signIn = () => {
    const userRole = document.getElementById('role').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    switch (userRole) {
        case 'jillaPanchayat':
            jillaPanchayatLogin(email, password);
            break;
        case 'talukaPanchayat':
            talukaLogin(email, password);
            break;
        case 'gramPanchayat':
            gramPanchayatLogin(email, password);
            break;
        case 'citizen':
            citizenLogin(email, password);
            break;
        default:
            alert('Invalid user role');
            break;
    }
};

const jillaPanchayatLogin = (inputEmail, password) => {
    const authCollection = db.collection('jillaPanchayat');

    authCollection.doc('Auth').get()
        .then((doc) => {
            const superAdmin = doc.data().email;

            if (inputEmail === superAdmin) {
                return signInWithEmailAndPassword(inputEmail, password, "/admin/jillaPanchayat.html");
            } else {
                alert("Emails do not match. Please enter the correct email.");
            }
        })
        .catch((error) => {
            handleAuthError(error);
        });
};

const talukaLogin = (inputEmail, password) => {
    const authCollection = db.collection('talukaPanchayat');

    authCollection.get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                const taluka = doc.id;
                const superAdmin = doc.data().email;

                if (inputEmail === superAdmin) {
                    signInWithEmailAndPassword(inputEmail, password, `/admin/talukaPanchayat.html`);
                }
            });
        })
        .catch((error) => {
            handleAuthError(error);
        });
};

const gramPanchayatLogin = (inputEmail, password) => {
    const talukaPanchayatCollection = db.collection('talukaPanchayat');

    talukaPanchayatCollection.get()
        .then((talukaSnapshot) => {
            const promises = [];
            talukaSnapshot.forEach((talukaDoc) => {
                const taluka = talukaDoc.id;
                const villagesCollection = talukaPanchayatCollection.doc(taluka).collection('villages');

                villagesCollection.get()
                    .then((villageSnapshot) => {
                        villageSnapshot.forEach((villageDoc) => {
                            const village = villageDoc.id;
                            const superAdmin = villageDoc.data().email;

                            if (inputEmail === superAdmin) {
                                promises.push(signInWithEmailAndPassword(inputEmail, password, `/admin/gramPanchayat.html`));
                            }
                        });
                    })
                    .catch((error) => {
                        console.error(`Error querying villages for ${taluka}:`, error);
                        return Promise.reject(error);
                    });
            });
            return Promise.all(promises);
        })
        .catch((error) => {
            handleAuthError(error);
        });
};

const citizenLogin = (inputEmail, password) => {
    const authCollection = db.collection('citizen');

    return authCollection.where('email', '==', inputEmail).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                alert("No user found with the provided email.");
            } else {
                querySnapshot.forEach((doc) => {
                    const citizen = doc.data().email;

                    if (inputEmail === citizen) {
                        return auth.signInWithEmailAndPassword(inputEmail, password)
                            .then((response) => {
                                console.log(response.user);
                                window.location.assign("/user/deshboard.html");
                            })
                            .catch((error) => {
                                alert(error.message);
                                console.log(error.code);
                                console.log(error.message);
                            });
                    } else {
                        alert("Emails do not match. Please enter the correct email.");
                    }
                });
            }
        })
        .catch((error) => {
            console.error("Error querying Firestore for Citizen:", error);
        });
}

const signInWithEmailAndPassword = (email, password, redirectPath) => {
    return auth.signInWithEmailAndPassword(email, password)
        .then((response) => {
            console.log(response.user);
            window.location.assign(redirectPath);
        })
        .catch((error) => {
            handleAuthError(error);
        });
};

const handleAuthError = (error) => {
    // Handle specific authentication errors here
    if (error.code === 'auth/user-not-found') {
        alert('User not found. Please check your email.');
    } else if (error.code === 'auth/wrong-password') {
        alert('Wrong password. Please try again.');
    } else {
        alert(error.message); // Handle other errors
    }
    console.error("Authentication error:", error.code, error.message);
};

// Panel Shifting for Sign up and Sign in
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

document.addEventListener("DOMContentLoaded", function() {
    const taluka = document.getElementById("select-taluka");
    const village = document.getElementById("select-village");

    // Village data by city
    const villagesData = {
        "dhoraji": ["Motivavdi", "Zanzmer", "Bhukhi", "Supedi", "Toraniya", "Nani Parabadi", "Moti Marad", "Hadmatiya", "Patanvav", "Bhader", "Jamnavad"],
        "gondal": ["Mungavavdi", "Ribda", "Ambardi", "Gundasara", "Pipaliya", "Bharudi", "Daliya", "Hadamtala", "Kolithad", "Lunivav", "Garnala"],
        "jamkandorna": ["Chavandi", "Dadar", "Kanavadala", "Rajpara", "Thordi", "Vavdi", "Belda", "Hariyasan", "Balapar", "Boriya", "Mota Bhadra"],
        "jasdan": ["Bogharavadar", "Rangpar", "Veraval", "Virpar", "Bhadala", "Barvala", "Parevala", "Kamalapur", "Lilapur", "Kothi", "Kalasar", "Virnagar"],
        "jetpur": ["Umrali", "Mevasa", "Virpur", "Rabarika", "Panchpipla", "Derdi", "Pedhla", "Kagvad", "Thana Galol", "Amrapar", "Kharachiya", "Arab Timbdi"],
        "rajkot": ["Kankot", "Tramba", "Vajdi", "Badpar", "Bedi", "Anandpar", "Halenda", "Kothariya", "Kherdi", "Jhiyana", "Sardhar", "Navagam"],
        "kotda sangani": ["Noghanchora", "Anida", "Ambaliala", "Devaliya", "Haamatala", "Juna Rajpipla", "Khokhri", "Manekvada", "Navi Mengani", "Satapar", "Thordi"],
        "lodhika": ["Abhepar", "Balsar", "Chandli", "Chibhda", "Devgam", "Haripar Pal", "Kangashiyali", "Pardi", "Rataiya", "Taravada", "Und Khijadiya", "Vagudad"],
        "upleta": ["Arni", "Bhankh", "Chikhalia", "Dumiyani", "Gadhala", "Gadhethal", "Hariyasan", "Kerala", "Kharachia", "Kolki", "Navapara", "Tanasva"],
    };

    // Function to populate the village list based on the selected city
    function updateVillageList() {
        const selectedCity = taluka.value;
        const villages = villagesData[selectedCity] || [];

        // Clear the existing village list
        village.innerHTML = '';

        // Populate the village list with villages for the selected city
        villages.forEach(function(villageName) {
            const listItem = document.createElement("option");
            listItem.textContent = villageName;
            listItem.value = villageName; // Set the value for the option (if needed)
            village.appendChild(listItem);
        });
    }

    // Initial population of the village list
    updateVillageList();

    // Add an event listener to the city select element to update the village list
    taluka.addEventListener("change", updateVillageList);
});