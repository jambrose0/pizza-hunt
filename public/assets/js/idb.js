let db;

const request = indexedDB.open("pizza_hunt", 1);

//creates storage system
request.onupgradeneeded = function (event) {
  const db = event.target.result;

  db.createObjectStore("new_pizza", { autoIncrement: true });
};

//succesful pizza upload
request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadPizza();
  }
};

//on error
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

//saves pizza on submit when no internet
function saveRecord(record) {
  const transaction = db.transaction(["new_pizza"], "readwrite");

  const pizzaObjectStore = transaction.objectStore("new_pizza");

  pizzaObjectStore.add(record);
}

function uploadPizza() {
  const transaction = db.transaction(["new_pizza"], "readwrite");

  const pizzaObjectStore = transaction.objectStore("new_pizza");

  const getAll = pizzaObjectStore.getAll();

  //upon succesful getAll
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/pizzas", {
        method: "POST",
        body: JSON.stringify.apply(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["new_pizza"], "readwrite");

          const pizzaObjectStore = transaction.objectStore("new_pizza");

          pizzaObjectStore.clear();

          alert("All saved pizza has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

//listen for app coming back online
window.addEventListener("online", uploadPizza);
