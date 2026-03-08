/* 
502  File not supported!
This extension is not supported; only 'docx' and 'txt' extensions are supported.
------
501  No MCQs on the File!
The file you uploaded doesn't contain any multiple-choice questions. Please try again!
------
500  The server did not respond!
The Python script does not open! Try opening the Python script before parsing the file.
*/

export default function throwError(key) {
  const container = document.querySelector(".error-pop-up");
  const title = document.querySelector(".error-title");
  const desc = document.querySelector(".error-desc");
  const err = {
    502: {title: "File not supported!", desc: "This extension is not supported; only 'docx' and 'txt' extensions are supported."},
    501: {title: "No MCQs on the File!", desc: "The file you uploaded doesn't contain any multiple-choice questions. Please try again!"},
    500: {title: "The server did not respond!", desc: "The Python script does not open! Try opening the Python script before parsing the file."}
  };

  title.textContent = err[key].title;
  desc.textContent = err[key].desc;
  container.style.display = "block"

  const close_error = document.querySelector(".close-error");
  const close_btn_error = document.querySelector(".close-error-btn");
  const closeEvent = () => {
    container.style.display = "none";
    title.textContent = "";
    desc.textContent = "";
  }
  close_error.onclick = closeEvent;
  close_btn_error.onclick = closeEvent;
}