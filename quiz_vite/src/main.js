let mainApp = document.querySelector(".app");
let question = document.querySelector(".quiz-area h4");
let title = document.querySelector(".title h1");
let count = document.querySelector(".info .total");
let options = document.querySelector(".options");
let indexText = document.querySelector(".now");

let clear = document.querySelector(".clear");
let button = document.querySelector("button");

let symbol = document.querySelector(".correct .symbol");
let text = document.querySelector(".correct .not-lucky");

let msg = document.querySelector(".msg");
let index = 0;
let correctNum = 0;
let state = "submit";

let review_question = {};
let question_state = {};
let user_choice_state_for_review = ""

function getQuestion(json_file) {
  let request = new XMLHttpRequest();

  request.open("GET", json_file, true);
  request.send();

  request.onreadystatechange = function () {
    if (this.status === 200 && this.readyState === 4) {
      let toObjTemp = JSON.parse(this.responseText);
      proccess(toObjTemp);
    }
  };
}

// -------------------------------
let stored = localStorage?.getItem("jsonToObjApp");
let obj;
if(stored !== null && stored !== undefined && stored !== "undefined"){
  obj = JSON.parse(stored);
  if (obj) {
    proccess(obj);
  }
} else {
  getQuestion("/quiz_questions_json.json");
}
// -------------------------------

function snacks(obj) {
  question.innerHTML = obj.question;

  const currQueIndex = Object.keys(obj.answers).length;
  let arr = [];
  for (let i = 1; i <= currQueIndex; i++) {
    let option = document.createElement("div");
    option.classList.add("option");

    let input = document.createElement("input");
    input.type = "radio";
    input.name = "question";
    input.id = `${i}`;

    let label = document.createElement("label");
    label.htmlFor = `${i}`;
    label.appendChild(document.createTextNode(obj.answers[i]));

    arr[i] = [];
    arr[i].push(input);
    arr[i].push(label);
  }

  arr = arr.sort(() => Math.random() - 0.5);
  arr.forEach(e => {
    let option = document.createElement("div");
    option.classList.add("option");
    options.appendChild(option);
    let input = e[0];
    let label = e[1];
    option.appendChild(input);
    option.appendChild(label);
  })
}

function reset() {
  options.innerHTML = "";
  question.innerHTML = "";
  msg.innerHTML = "";
  symbol.innerHTML = "";
  text.innerHTML = "";
}

function validation(correct, answer) {
  user_choice_state_for_review = "";
  if (state === "submit") {
    button.textContent = "Submit answer";
  }

  let q = document.getElementsByName("question");
  q = Array.from(q).filter((e) => {
    if (e.checked === true) return e.id;
  });

  if (q.length == 0) {
    msg.innerHTML =
      "<b>*</b> Please select an answer before submitting your response.";
    msg.style.color = "#ff040e";
  } else {
    let disabled = document.getElementsByName("question");
    disabled.forEach((e) => {
      e.setAttribute("disabled", "");
    });

    if (state === "submit") {
      state = "next";
      button.textContent = "Next Question";
    }

    clear.removeEventListener("click", clearFunc);
    msg.innerHTML = "";
    if (correct === q[0].id) {
      correctNum++;
      msg.innerHTML =
        '<div class="check-mark"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" fill="#2fa22f"></path> </g></svg></div> <b>Great job!</b> That’s correct.';
      msg.style.color = "#2fa22f";
      symbol.innerHTML = "";
      text.innerHTML = "";
      user_choice_state_for_review = 1; 
    }
    else if (correct === "0") {
      correctNum++;
      msg.innerHTML = '<svg class="no-mark" width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM12 17.75C12.4142 17.75 12.75 17.4142 12.75 17V11C12.75 10.5858 12.4142 10.25 12 10.25C11.5858 10.25 11.25 10.5858 11.25 11V17C11.25 17.4142 11.5858 17.75 12 17.75ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z" fill="cornflowerblue"></path> </g></svg> You did not specify correct answer in your document!';
      msg.style.color = "cornflowerblue";
      symbol.innerHTML = "";
      text.innerHTML = "";
      user_choice_state_for_review = 1;
    } else {
      msg.innerHTML =
        '<div class="xmark"><svg fill="#ff040e" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve" stroke="#ff0000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_28_"> <path id="XMLID_29_" d="M165,0C120.926,0,79.492,17.163,48.328,48.327c-64.334,64.333-64.334,169.011-0.002,233.345 C79.49,312.837,120.926,330,165,330c44.072,0,85.508-17.163,116.672-48.328c64.334-64.334,64.334-169.012,0-233.345 C250.508,17.163,209.072,0,165,0z M239.246,239.245c-2.93,2.929-6.768,4.394-10.607,4.394c-3.838,0-7.678-1.465-10.605-4.394 L165,186.213l-53.033,53.033c-2.93,2.929-6.768,4.394-10.607,4.394c-3.838,0-7.678-1.465-10.605-4.394 c-5.859-5.857-5.859-15.355,0-21.213L143.787,165l-53.033-53.033c-5.859-5.857-5.859-15.355,0-21.213 c5.857-5.857,15.355-5.857,21.213,0L165,143.787l53.031-53.033c5.857-5.857,15.355-5.857,21.213,0 c5.859,5.857,5.859,15.355,0,21.213L186.213,165l53.033,53.032C245.104,223.89,245.104,233.388,239.246,239.245z"></path> </g> </g></svg></div> <b>Oops</b>, That’s incorrect. The right answer is:';
      msg.style.color = "#ff040e";
      symbol.innerHTML = '<div class="check-mark"><svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" fill="#2fa22f"></path> </g></svg></div>';
      user_choice_state_for_review = 0;
      if (text.childNodes.length < 1)
        text.appendChild(document.createTextNode(answer));
    }
  }
}

function clearFunc() {
  document.getElementsByName("question").forEach((e) => {
    e.checked = false;
  });
  msg.innerHTML = "";
}

let addBtn = document.querySelector(".add");
let popup = document.querySelector("dialog");
addBtn.onclick = () => {
  popup.showModal();
}

function proccess(toObjTemp) {
  count.innerHTML = toObjTemp.length;
  indexText.innerHTML = 1;

  let toObj = Object.values(toObjTemp).sort(() => Math.random() - 0.5);

  reset();
  snacks(toObj[index]);

  clear.addEventListener("click", clearFunc);

  button.onclick = () => {
    question_state = {};
    clear.addEventListener("click", clearFunc);

    if (state === "submit") {
      validation(
        toObj[index].correct,
        toObj[index].answers[toObj[index].correct]
      );

      const color = user_choice_state_for_review === 0 ? "#ff362b34": user_choice_state_for_review === 1 ? "#2bff412e" : "";
      question_state = {"object": toObj[index], "color": color};
      review_question[index+1] = question_state;

    } else if (state === "next") {
      index++;
      if (index < toObj.length) {
        reset();
        snacks(toObj[index]);
        indexText.innerHTML = index + 1;
        state = "submit";
        button.textContent = "Submit answer";
      } else {
        button.remove();

        title.innerHTML = "Quiz Finished!";
        mainApp.innerHTML = `<div class="result">You scored ${correctNum} out of ${toObj.length}</div`;
        if (correctNum === toObj.length || correctNum >= Math.round(toObj.length * 0.8)) {
          mainApp.innerHTML += `
                <div class="temp">
                    <span>&#x1F600; Excellent! You really know your stuff.</span>
                </div>`;
        } else if (correctNum === 0) {
          mainApp.innerHTML += `
                <div class="temp">
                    <span>&#x1F622; Keep learning! You’ll do better next time.</span>
                </div>`;
        } else {
          mainApp.innerHTML += `
                <div class="temp">
                    <span>&#x1F611; Not bad! A little more practice and you’ll ace it.</span>
                </div>`;
        }

        if (correctNum !== toObj.length) {
          mainApp.innerHTML += "<span class='review-title'>Review your mistakes:</span>";
          review_window(review_question, mainApp);
        } else {
          document.querySelector(".temp").innerHTML += "<br><div><span class='review-title'>You deserve to play with me! </span><span class='game'> let's play!</span></div>";
          document.querySelector(".game").addEventListener("click", () => {
            document.querySelector(".watch").click();
          });
        }

        let bR = document.createElement("button");
        bR.innerHTML = "Retry Quiz";
        bR.classList.add("retry-btn")
        mainApp.appendChild(bR);
        bR.onclick = () => {
          location.reload();
        };
      }
    }
  };
}

function review_window(list, mainApp) {
  const fragment = document.createDocumentFragment();

  Object.entries(list).forEach(([key, value]) => {
    const review_q = document.createElement("div");
    review_q.classList.add("review-q");
    review_q.style.backgroundColor = `${value.color}`;
    review_q.style.color = value.color === "#ff362b34" ? "#f44336" : "#4caf50";
    const index = key;
    review_q.dataset.value = index;
    const lable = document.createElement("span");
    lable.classList.add("lable");
    const symbol = value.color === "#ff362b34" 
    ? '<svg fill="#f44336" height="18px" width="18px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330 330" xml:space="preserve" stroke="#f44336"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_28_"> <path id="XMLID_29_" d="M165,0C120.926,0,79.492,17.163,48.328,48.327c-64.334,64.333-64.334,169.011-0.002,233.345 C79.49,312.837,120.926,330,165,330c44.072,0,85.508-17.163,116.672-48.328c64.334-64.334,64.334-169.012,0-233.345 C250.508,17.163,209.072,0,165,0z M239.246,239.245c-2.93,2.929-6.768,4.394-10.607,4.394c-3.838,0-7.678-1.465-10.605-4.394 L165,186.213l-53.033,53.033c-2.93,2.929-6.768,4.394-10.607,4.394c-3.838,0-7.678-1.465-10.605-4.394 c-5.859-5.857-5.859-15.355,0-21.213L143.787,165l-53.033-53.033c-5.859-5.857-5.859-15.355,0-21.213 c5.857-5.857,15.355-5.857,21.213,0L165,143.787l53.031-53.033c5.857-5.857,15.355-5.857,21.213,0 c5.859,5.857,5.859,15.355,0,21.213L186.213,165l53.033,53.032C245.104,223.89,245.104,233.388,239.246,239.245z"></path> </g> </g></svg>'
    : '<svg width="23px" height="23px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" fill="#2fa22f"></path> </g></svg>';
    lable.innerHTML = `${symbol}<div>Question ${index}</div>`
    review_q.appendChild(lable)
    fragment.appendChild(review_q);
  });
  const review = document.createElement("div");
  review.classList.add("reviews");
  review.appendChild(fragment);
  mainApp.appendChild(review);

  const review_q_ele = document.querySelectorAll(".review-q");
  const pop_window = document.querySelector(".review-pop-up");
  const pop_container = document.querySelector(".pop-up-container");
  review_q_ele.forEach((ele) => {
    ele.addEventListener("click", () => {
      const mcq_selected = list[ele.getAttribute("data-value")];
      const question_text = mcq_selected.object.question;
      const oprtions_obj = mcq_selected.object.answers;
      const correct = mcq_selected.object.correct;

      const question_ele = document.createElement("div");
      question_ele.textContent = question_text;

      const ul_fragment = document.createDocumentFragment();
      Object.entries(oprtions_obj).forEach(([k, v]) => {
        const li = document.createElement("li");
        li.textContent = v;
        ul_fragment.appendChild(li);
      });
      const answers_ele = document.createElement("ul");
      answers_ele.appendChild(ul_fragment);

      const correct_ele = document.createElement("div");
      correct_ele.textContent = correct !== "0" ? `Correct Answer is ${correct}.` : "No correct answer found in your document!";

      pop_container.innerHTML = "";
      pop_container.appendChild(question_ele);
      pop_container.appendChild(answers_ele);
      pop_container.appendChild(correct_ele);
      pop_window.style.display = "block";
    });
  });

  const pop_close = document.querySelector(".close-pop-up");
  pop_close.onclick = () => {
    pop_window.style.display = "none";
    pop_container.innerHTML = "";
  }
}
