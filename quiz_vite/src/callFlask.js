import throwError from "./errorHandle";

const filePathToFlask = document.getElementById("file");
const loading = document.querySelector(".mother-of-loading");
const dialog_window = document.querySelector("dialog");

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

filePathToFlask.addEventListener("change", async () => {
  const file = filePathToFlask.files[0];
  if (!file) return;
  dialog_window.close();

  loading.style.display = "block";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const fileExtansion = file.name.toLowerCase();
    if (!fileExtansion.endsWith(".docx") && !fileExtansion.endsWith(".txt")) {
      throwError(502);
      return;
    }

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throwError(500);
      throw new Error("Upload failed");
    }

    const data = await res.json();
    if (!data.content || data.content.length === 0) {
      throwError(501);
      return
    };

    // indexedDB
    if(data.content) {
      const db = await openDB();

      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const addRequest = store.put({ text: JSON.stringify(data.content), pin: false });
        
      addRequest.onsuccess = () => {
        console.log("Retrieved from DB:", addRequest.result);
        window.localStorage.setItem("jsonToObjApp", JSON.stringify(data.content)) //LS
        location.reload();
      };
      // --------
      addRequest.onerror = (e) => {
        console.error("Add error:", e.target.error);
      };

      tx.oncomplete = () => {
        db.close();
      };

      tx.onerror = (e) => {
        console.error("Transaction error (callFlask):", e.target.error);
        db.close();
      };
      // --------
    }
  } catch (err) {
    throwError(500);
    console.error("(callFlask): ", err);
  } finally {
    loading.style.display = "none";

    filePathToFlask.value = "";
  }
});
