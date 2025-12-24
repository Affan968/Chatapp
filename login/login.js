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

}