//Dropdown for taluka and village
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

    // Add an event listener to the taluka select element to update the village list when the taluka is changed
    talukaDropdown.addEventListener("change", updateVillageList);
});

//create account using email and password
const signUp = () => {
    const email = document.getElementById('email_').value;
    const password = document.getElementById('password_').value;

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

//Save Data into firestore database 
//Collection -> citizen
const saveData = (userUID) => {
    const emailInput = document.getElementById('email_').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const taluka = document.getElementById('taluka').value;
    const village = document.getElementById('village').value;
    if (village === '-----') {
        var isVillager = false;
    } else {
        var isVillager = true;
    }
    const passwordInput = document.getElementById('password').value;

    db.collection('citizen')
        .doc(userUID)
        .set({
            userId: userUID,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: emailInput,
            gender: gender,
            taluka: taluka,
            isVillager: isVillager,
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

