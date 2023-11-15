 document.addEventListener("DOMContentLoaded", function () {
    const talukaDropdown = document.getElementById("taluka");
    const villageDropdown = document.getElementById("village");

    // Fetch talukas from Firestore and populate the taluka dropdown
    db.collection('talukaPanchayat')
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                const talukaName = doc.id;
                const talukaOption = document.createElement("option");
                talukaOption.textContent = talukaName;
                talukaOption.value = talukaName;
                talukaDropdown.appendChild(talukaOption);
            });

            // Initial population of the village list based on the first taluka
            updateVillageList();
        })
        .catch((error) => {
            console.error('Error fetching talukas:', error);
        });

    // Function to populate the village list based on the selected taluka
    function updateVillageList() {
        const selectedTaluka = talukaDropdown.value;

        // Clear the existing village list
        villageDropdown.innerHTML = '';
        
        // Fetch villages from Firestore based on the selected taluka
        db.collection('talukaPanchayat')
            .doc(selectedTaluka)
            .collection('villages')
            .get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    const villageName = doc.id;
                    const villageOption = document.createElement("option");
                    villageOption.textContent = villageName;
                    villageOption.value = villageName;
                    villageDropdown.appendChild(villageOption);
                });
            })
            .catch((error) => {
                console.error(`Error fetching villages for ${selectedTaluka}:`, error);
            });
    }

    // Add an event listener to the taluka select element to update the village list
    talukaDropdown.addEventListener("change", updateVillageList);
});


const signUp = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((response) => {
            const userUID = response.user.uid;
            saveData(userUID);
        })
        .catch((error) => {
            alert(error.message);
            console.log(error.code);
            console.log(error.message);
        });
}

const saveData = (userUID) => {
    const emailInput = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const taluka = document.getElementById('taluka').value;
    const village = document.getElementById('village').value;
    const passwordInput = document.getElementById('password').value;

    db.collection('citizen')
        .doc(userUID)
        .set({
            userId: userUID,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: emailInput,
            taluka: taluka,
            village: village,
            password: passwordInput
        })
        .then(() => {
            window.location.assign("/auth/login.html");
        })
        .catch((error) => {
            alert(error.message);
        });
}
