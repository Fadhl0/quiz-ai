let allCells;
const foz = [
  ["0", "1", "2"],
  ["3", "4", "5"],
  ["6", "7", "8"],
  ["0", "3", "6"],
  ["1", "4", "7"],
  ["2", "5", "8"],
  ["0", "4", "8"],
  ["2", "4", "6"]
];

let attempt = 0;
let square = [];
let remain = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];

let movement = async (e) => {
  const cellValue = e.target.dataset.xo;
  if (cellValue !== undefined && !e.target.textContent && attempt < 5) {
    e.target.textContent = "x"
    square[cellValue] = "x"
    remainFilter(cellValue);
    await isWinner();
    play(false);
    await sleep(500);
    botMove();
    await isWinner();
    play(true);
  } else if (attempt === 5) {
    resetBoard();
    document.querySelector(".temp").innerHTML = `
      <div style='font-size:70px;'>Enough! &#129320;</div>
      <div style='font-size:33px;'> Go back to Study NOW...</div>
    `;
    setTimeout(() => {
      location.reload();
    }, 5000);
  }
}

async function isWinner() {
  for (const path of foz) {
    const [a, b, c] = path;
    if(square[a] && square[a] === square[b] && square[a] === square[c]) {
      console.log("Winner "+square[a]);
      attempt++;
      play(false);
      [a, b, c].forEach(index => allCells[index].classList.add('winner-blink'));
      await sleep(3000);
      resetBoard();
      return true;
    }
  }
  if (remain.length === 0) {
    play("false");
    await sleep(1000);
    square = [];
    allCells.forEach(td => td.textContent = "");
    resetBoard();
    return true;
  };
  return false;
}

function resetBoard() {
  square = [];
  allCells.forEach(td => {
    td.textContent = "";
    td.classList.remove('winner-blink');
  });
  remain = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  play(true);
}

async function sleep(time) {
  return await new Promise(resolve => setTimeout(resolve, time));
}

function play(bool) {
  bool ? allCells.forEach(td => td.addEventListener("click", movement))
  : allCells.forEach(td => td.removeEventListener("click", movement));
}

function getRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function remainFilter(cellValue) {
  const index = remain.indexOf(cellValue);
  if (index > -1) {
    remain.splice(index, 1);
  }
}

function botMove() {
  if (remain.length === 0) return;
  const move = getRandom(remain); 
  const targetCell = allCells[+move];
  const cellValue = targetCell.dataset.xo;

  if (cellValue !== undefined) {
    targetCell.textContent = "o";
    square[cellValue] = "o";
    remainFilter(cellValue);
  }
}

document.querySelector(".watch").addEventListener("click", () => {
  const temp_ele = document.querySelector(".temp");
  temp_ele.innerHTML = `
  <div class="tic-tac-to">
    <table>
      <tr>
        <td name="0" data-xo="0"></td>
        <td name="1" data-xo="1"></td>
        <td name="2" data-xo="2"></td>
      </tr>
      <tr>
        <td name="3" data-xo="3"></td>
        <td name="4" data-xo="4"></td>
        <td name="5" data-xo="5"></td>
      </tr>
      <tr>
        <td name="6" data-xo="6"></td>
        <td name="7" data-xo="7"></td>
        <td name="8" data-xo="8"></td>
      </tr>
    </table>
  </div>
  `;
  allCells = document.querySelectorAll("td");
  play(true);
})