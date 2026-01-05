// history sidebar:
let history = document.querySelector(".history");
let sidebar_hide = document.querySelector(".sidebar-icon");
let sidebar_show = document.querySelector(".sidebar-show");
const globalMenu = document.getElementById("global-menu");

document.addEventListener('click', e => {
  if (sidebar_hide.contains(e.target)) {
    history.style.transform = "translateX(-100%)";
    sidebar_show.style.transform = "translate(0)";
    sidebar_show.classList.remove("showed");
    globalMenu.classList.remove("active");
    return;
  }

  if (sidebar_show.contains(e.target)) {
    sidebar_show.classList.add("showed")
    sidebar_show.style.transform = "translateX(-200%)";
    history.style.transform = "translateX(0)";
    return;
  }

  if (!e.target.closest(".options-menu") && !e.target.closest(".item-svg")) {
    globalMenu.classList.remove("active");
  }

  if (!globalMenu.contains(e.target) && !history.contains(e.target)) {
    history.style.transform = "translateX(-100%)";
    sidebar_show.style.transform = "translate(0)";
    sidebar_show.classList.remove("showed");
  }
});

history.onscroll = () => {
  globalMenu.classList.remove("active");
}

const DB_NAME = "QuizHistory";
const STORE_NAME = "QuizHistory";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function displayData() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const data = getAllRequest.result;
      const sortedData = data.reverse();
      renderList(sortedData);
    };

    // ------
    getAllRequest.onerror = (e) => console.error("getAll error:", e.target.error);
    tx.oncomplete = () => db.close();
    tx.onerror = (e) => {
      console.error("Transaction error (history):", e.target.error);
      db.close();
    };
    // ------
  } catch(err) {
    console.error("openDB error (history):", err);
  }
}

function renderList(items) {
  const pinned = document.querySelector(".item-pinned");
  const recent = document.querySelector(".item-recent");

  const pinnedItems = items.filter(item => item.pin === true);
  const recentItems = items.filter(item => !item.pin);

  const createItemHTML = (item) => `
    <div class="item" data-id="${item.id}">
      <div class="item-text">${escapeHtml(JSON.parse(item.text)[0]["question"])}</div>
      <div class="parent_dot">
        <div class="item-svg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5514 8C4.5514 8.63513 4.03653 9.15 3.4014 9.15C2.76628 9.15 2.2514 8.63513 2.2514 8C2.2514 7.36487 2.76628 6.85 3.4014 6.85C4.03653 6.85 4.5514 7.36487 4.5514 8Z" fill="#000"></path><path d="M9.14754 8C9.14754 8.63513 8.63267 9.15 7.99754 9.15C7.36242 9.15 6.84754 8.63513 6.84754 8C6.84754 7.36487 7.36242 6.85 7.99754 6.85C8.63267 6.85 9.14754 7.36487 9.14754 8Z" fill="#000"></path><path d="M13.7486 8C13.7486 8.63513 13.2337 9.15 12.5986 9.15C11.9634 9.15 11.4486 8.63513 11.4486 8C11.4486 7.36487 11.9634 6.85 12.5986 6.85C13.2337 6.85 13.7486 7.36487 13.7486 8Z" fill="#000"></path></svg>
        </div>
      </div>
    </div>
  `;
  pinned.innerHTML = pinnedItems.map(createItemHTML).join('');
  recent.innerHTML = recentItems.map(createItemHTML).join('');
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

displayData();


async function showQuiz(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        if (getRequest.result && getRequest.result.text !== "") {
          resolve(getRequest.result.text);
        } else {
          resolve(null);
        }
      };
      getRequest.onerror = () => reject("error in db");
    };
  });
}

const historyContainer = document.querySelector(".item-recent");
let currentTargetId = null;

history.addEventListener("click", async (e) => {
  const dotBtn = e.target.closest(".item-svg");
  const item = e.target.closest(".item");

  if (dotBtn) {
    e.stopPropagation(); // stop bubble quickly

    currentTargetId = item.dataset.id; // save id

    // position of the button
    const rect = dotBtn.getBoundingClientRect();
    globalMenu.style.top = `${rect.bottom - 12}px`;
    globalMenu.style.left = `${rect.left + 20}px`;
    globalMenu.classList.add("active");
    return;
  }

  // load quiz
  if (item) {
    const quizText = await showQuiz(Number(item.dataset.id));
    if (quizText != "") {
      window.localStorage.setItem("jsonToObjApp", quizText)
      location.reload();
    }
  }
});

// menu options (delete/pin)
globalMenu.addEventListener("click", (e) => {
    if(e.target.id === "menu-delete-btn") {
      deleteItem(currentTargetId)
    }
    else if(e.target.id === "menu-pin-btn") {
      togglePin(currentTargetId);
    }
    else if(e.target.id === "menu-download-btn") {
      downloading(currentTargetId);
    }
    // Close menu
    globalMenu.classList.remove("active");
});


// function deleteItem(id) {
//   const request = indexedDB.open(DB_NAME, DB_VERSION);

//   request.onsuccess = (e) => {
//     const db = e.target.result;
//     const transaction = db.transaction(STORE_NAME, "readwrite");
//     const store = transaction.objectStore(STORE_NAME);

//     const deleteRequest = store.delete(Number(id));

//     deleteRequest.onsuccess = () => {
//       console.log(`Item ${id} has been deleted`);
//       displayData(); // auto refresh history
//     };
//   };
// }

function deleteItem(id) {
  openDB().then(db => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const deleteReq = store.delete(Number(id));

    deleteReq.onsuccess = () => {
      console.log(`Item ${id} has been deleted`);
      displayData();
    };
    deleteReq.onerror = (e) => console.error("delete error", e.target.error);

    tx.oncomplete = () => db.close();
    tx.onerror = (e) => { console.error("tx error", e.target.error); db.close(); };
  }).catch(console.error);
}

// The worst function I have ever made so far :(
async function downloading(id) {
  const jsonContext = await showQuiz(Number(id));
  const safeJson = JSON.stringify(jsonContext).replace(/<\/script>/g, '<\\/script>');
  let all_file;
  const rest = `
const stored = ${safeJson};stored&&proccess(JSON.parse(stored));
</script>
</body>
</html>
`;

  fetch("./dontDeleteme.txt")
    .then((res) => res.text())
    .then((text) => {
      all_file = `${text}${rest}`;
      const blob = new Blob([all_file], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "quiz.html";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log("downloaded ✔")
    })
    .catch((e) => console.error(e));
}

// function togglePin(id) {
//   const request = indexedDB.open(DB_NAME, DB_VERSION);

//   request.onsuccess = (e) => {
//     const db = e.target.result;
//     const transaction = db.transaction(STORE_NAME, "readwrite");
//     const store = transaction.objectStore(STORE_NAME);

//     const getRequest = store.get(Number(id));

//     getRequest.onsuccess = () => {
//       const data = getRequest.result;

//       if (data) {
//         data.pin = !data.pin;
//         const updateRequest = store.put(data);

//         updateRequest.onsuccess = () => {
//           console.log("Pin updated...");
//           displayData();
//         };
//       } else {
//         console.error("There is no db with this id!!!!");
//       }
//     };
//   };
// }

function togglePin(id) {
  openDB().then(db => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(Number(id));

    getRequest.onsuccess = () => {
      const data = getRequest.result;
      if (data) {
        data.pin = !data.pin;
        const updateRequest = store.put(data);

        updateRequest.onsuccess = () => {
          console.log("Pin updated...");
          displayData();
        };
        updateRequest.onerror = (e) => console.error("update error", e.target.error);
      } else {
        console.error("No record with this id:", id);
      }
    };
    getRequest.onerror = (e) => console.error("get error", e.target.error);

    tx.oncomplete = () => db.close();
    tx.onerror = (e) => { console.error("tx error", e.target.error); db.close(); };
  }).catch(console.error);
}