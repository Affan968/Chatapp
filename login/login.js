<<<<<<< HEAD
import { auth, signInWithEmailAndPassword } from "../config/configs.js";

window.signinpage = function(event) {
    event.preventDefault(); // Form reload hone se rokta hai

    // Inputs ki values get karein
    let loginemail = document.getElementById("email").value;
    let loginpassword = document.getElementById("password").value;
    let loginBtn = document.getElementById("signinnow");

    // Button ko disable karein taaki multiple clicks na hon
    loginBtn.innerText = "Signing in...";
    loginBtn.disabled = true;

    signInWithEmailAndPassword(auth, loginemail, loginpassword)
    .then((userCredential) => {
        // Successful Login
        const user = userCredential.user;
        console.log("Login Success:", user);
        
        // Dashboard page par bhejein
        window.location.replace("../Dashboard/dashboard.html");
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        // Button wapas enable karein
        loginBtn.innerText = "Sign in now";
        loginBtn.disabled = false;

        // User ko error dikhayein
        alert("Error: " + errorMessage);
        console.error("Login Error:", errorCode, errorMessage);
    });
=======
import { auth, signInWithEmailAndPassword } from "../config/config.js"

window.signinpage=async function(event){
    event.preventDefault()
    const signinBtn=document.getElementById("signinnow")
    let email=document.getElementById("email").value
    let password=document.getElementById("password").value
    signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
    window.location.href="./facebook/facebook.html"
    console.log(user,"user")
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });

 

  signinBtn.addEventListener("click",signinpage)

>>>>>>> b853f791e6e776f6bee3fffade066b4ab3b30668
}