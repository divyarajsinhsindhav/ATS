const submit_data = document.getElementById('submit-data');
const forgetEmail = document.querySelector('.forgetemail');

submit_data.addEventListener("click", () => {
    auth.sendPasswordResetEmail(forgetEmail.value)
        .then(() => {
            forgetEmail.value = ""; // corrected to reset the input value

            swal("Your Password has been reset!", "Please check your email");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, '=>', errorMessage);
            swal("Sorry!", "Please enter correct email!");
        });
});
