// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfOft8VnMgNQ2p7cdlGwhWzuYN4rGhAas",
  authDomain: "iot-attendancetracker.firebaseapp.com",
  databaseURL:
    "https://iot-attendancetracker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iot-attendancetracker",
  storageBucket: "iot-attendancetracker.appspot.com",
  messagingSenderId: "380794626121",
  appId: "1:380794626121:web:b8e7c9baabe316d6a69f98",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import {
  getDatabase,
  ref,
  get,
  set,
  child,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase();
let scannedUsers = [];
const dbref = ref(db);

const userTable = document.getElementById("userTable");
const btnDownload = document.getElementById("btnDownload");
const tableBody = document.getElementById("tableBody");
const btnClear = document.getElementById("btnClear");
const txtSearch = document.getElementById("txtSearch");

function LoadData() {
  get(child(dbref, "Data/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const UserID = snapshot.val().ID;
        if (scannedUsers.includes(UserID))
          console.log("User already checked in!");
        else {
          scannedUsers.push(UserID);
          localStorage.setItem("Users", JSON.stringify(scannedUsers));
          LoadUser(UserID);
        }
      }
    })
    .catch((error) => {
      alert("Not found" + error);
    });
}

function LoadUser(UserID) {
  get(child(dbref, "Users/" + UserID))
    .then((snapshot) => {
      if (snapshot.exists()) {
        tableBody.innerHTML += `
        <tr>
        <td> <img src="${
          snapshot.val().Image
        }" alt="&#128100;"></td>
            <td>${snapshot.val().Index}</td>
            <td>${snapshot.val().FirstName}</td>
            <td>${snapshot.val().LastName}</td>
            <td>${new Date().toLocaleTimeString()}</td>
            <td><textarea name="" id="" cols="30" rows="5"></textarea></td>
        </tr>`;
        sortTable();
      } else {
        alert("No data found");
        clearTable();
      }
    })
    .catch((error) => {
      alert("Not found" + error);
    });
}

function filterUsers() {

  var storedUsers = JSON.parse(localStorage.getItem('Users'));

  const filterValue = document.getElementById("txtSearch").value.toLowerCase();
  if (filterValue.length === 0) {
    tableBody.innerHTML="";
    for (let i = 0; i < storedUsers.length; i++) {
          LoadUser(storedUsers[i]);
    }
  }
  if (filterValue.length > 0) 
  {
    for (let i = 0; i < storedUsers.length; i++) {
      get(child(dbref, "Users/" + storedUsers[i])).then((snapshot) => {
        const firstName = snapshot.val().FirstName.toLowerCase();
        const lastName = snapshot.val().LastName.toLowerCase();
        const index = snapshot.val().Index.toLowerCase();
       if (index.includes(filterValue))
       {
         tableBody.innerHTML="";
         LoadUser(storedUsers[i]);
       }
      });
    }
  }
}

function sortTable() {
  var rows, switching, i, x, y, shouldSwitch;

  switching = true;

  while (switching) {
    switching = false;
    rows = userTable.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;

      x = rows[i].getElementsByTagName("td")[1];
      y = rows[i + 1].getElementsByTagName("td")[1];
      if (x.innerText.slice(2) > y.innerText.slice(2)) {
        shouldSwitch = true;
        break;
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

function RemoveID() {
  remove(ref(db, "Data/"))
    .then(() => {})
    .catch((error) => {
      console.log("Couldnt remove");
    });
}
function downloadTable() {
  
  var text = "";

 
  for (var i = 0; i < userTable.rows.length; i++) {
    for (var j = 0; j < userTable.rows[i].cells.length; j++) {
      if (userTable.rows[i].cells[j].querySelector("textarea")) {
   
        text +=
          userTable.rows[i].cells[j].querySelector("textarea").value + "\t";
      } else {
 
        text += userTable.rows[i].cells[j].innerText + "\t";
      }
    }
   
    text += "\n";
  }

  
  var blob = new Blob([text], { type: "text/plain;charset=utf-8" });

  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "table_data.txt";
  a.click();
  clearTable();
}
function clearTable() {
  tableBody.innerHTML = "";
  RemoveID();
  localStorage.removeItem("Users");
  scannedUsers = [];
}

window.addEventListener("load", function () {
  if (this.localStorage.length > 0) {
    var retrievedArray = JSON.parse(this.localStorage.getItem("Users"));
    for (let i = 0; i < retrievedArray.length; i++) {
      LoadUser(retrievedArray[i]);
    }
    //scannedUsers = [];
    RemoveID();
  }
});
btnDownload.addEventListener("click", downloadTable);
btnClear.addEventListener("click", clearTable);
txtSearch.addEventListener('input', filterUsers);
LoadData();
window.setInterval(LoadData, 200);
