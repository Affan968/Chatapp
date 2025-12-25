import { 
    auth, db, collection, addDoc, getDocs, getDoc, doc, 
    onAuthStateChanged, onSnapshot, query, where, orderBy, serverTimestamp 
} from "../config/configs.js";

let selectedFriendId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadMyFriends(user.uid);
    } else {
        window.location.href = "../login/login.html";
    }
});

// 1. Load Accepted Friends
async function loadMyFriends(currentUid) {
    console.log("running messages")
    const friendsListDiv = document.getElementById("friends-list");
    
    // Check accepted requests (jahan aap sender ho ya receiver)
    const q = query(collection(db, "friendRequests"), where("status", "==", "accepted"));
    
    onSnapshot(q, async (snapshot) => {
        friendsListDiv.innerHTML = "";
        if (snapshot.empty) friendsListDiv.innerHTML = "<p style='padding:15px;'>No friends yet.</p>";

        snapshot.forEach(async (requestDoc) => {
            const data = requestDoc.data();
            // Pata lagao friend ki ID kaunsi hai
            const friendId = data.from === currentUid ? data.to : data.from;
            
            if (data.from === currentUid || data.to === currentUid) {
                const friendSnap = await getDoc(doc(db, "users", friendId));
                const friendData = friendSnap.data();

                const div = document.createElement("div");
                div.className = "friend-item";
                div.innerHTML = `<strong>${friendData.name}</strong><br><small>${friendData.email}</small>`;
                div.onclick = () => startChat(friendId, friendData.name);
                friendsListDiv.appendChild(div);
            }
        });
    });
}

// 2. Start Chatting with a Friend
function startChat(friendId, friendName) {
    selectedFriendId = friendId;
    document.getElementById("chat-header").innerText = "Chatting with: " + friendName;
    document.getElementById("input-box").style.display = "flex";
    loadMessages(friendId);
}

// 3. Messages Load Karna (Real-time)
function loadMessages(friendId) {
    const msgContainer = document.getElementById("messages-container");
    const currentUid = auth.currentUser.uid;

    // Aise messages fetch karein jo aapke aur friend ke darmiyan hain
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));

    onSnapshot(q, (snapshot) => {
        msgContainer.innerHTML = "";
        snapshot.forEach((msgDoc) => {
            const msgData = msgDoc.data();
            
            // Filter: Sirf wo messages jo in do users ke hain
            if (
                (msgData.sender === currentUid && msgData.receiver === friendId) ||
                (msgData.sender === friendId && msgData.receiver === currentUid)
            ) {
                const div = document.createElement("div");
                div.className = msgData.sender === currentUid ? "my-msg" : "friend-msg";
                div.innerText = msgData.text;
                msgContainer.appendChild(div);
            }
        });
        msgContainer.scrollTop = msgContainer.scrollHeight;
    });
}

// 4. Message Send Karna
document.getElementById("send-btn").addEventListener("click", async () => {
    const input = document.getElementById("msg-input");
    const text = input.value.trim();

    if (text !== "" && selectedFriendId) {
        await addDoc(collection(db, "messages"), {
            sender: auth.currentUser.uid,
            receiver: selectedFriendId,
            text: text,
            timestamp: serverTimestamp()
        });
        input.value = "";
    }
});