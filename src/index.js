const appForm = document.getElementById("appform");
const userText = document.getElementById("usertext");
const outputText = document.getElementById("output");

//----------------const/let---------------------------
const storageKey = "form-state";

let data = {
  currentText: "",
};

let moveObjects = null;

let isMoving = false;

//----------------call func---------------------------
getSerializedData();

//----------------EventListeners---------------------------
userText.addEventListener("input", _.throttle(setCurrentText, 1000));
appForm.addEventListener("submit", onSubmit);

//----------------functions---------------------------

function onSubmit(e) {
  e.preventDefault();
  let text = data.currentText;

  if (data.currentText.trim() === "") {
    alert("The field must be filled");
    return;
  }

  text = userText.value;

  const arr = text.split("");

  createMarkup(arr);

  addListenerOnLetter();
  e.currentTarget.reset();
  localStorage.removeItem(storageKey);
}

function setCurrentText() {
  try {
    data.currentText = userText.value;
    const serializedData = JSON.stringify(data);
    localStorage.setItem(storageKey, serializedData);
  } catch {
    console.error("set err", error.message);
  }
}

function getSerializedData() {
  try {
    let getData = localStorage.getItem(storageKey);
    if (getData === null) {
      return (getData = undefined);
    } else {
      const parsedData = JSON.parse(getData);
      userText.value = parsedData.currentText;
    }
  } catch (error) {
    console.error("get err", error.message);
  }
}

function createMarkup(data) {
  const markup = data
    .map(
      (item) => `<span class="movable-element" draggable=true>${item}</span>`
    )
    .join("");

  outputText.insertAdjacentHTML("afterbegin", markup);
}

function addListenerOnLetter() {
  moveObjects = document.querySelectorAll(".movable-element");

  moveObjects.forEach(function (obj) {
    getCoords(obj);
  });

  moveObjects.forEach(function (obj) {
    obj.style.position = "absolute";
  });

  moveObjects.forEach(function (obj) {
    let shiftX = 0;
    let shiftY = 0;

    function moveAt(e) {
      isMoving = true;
      obj.style.left = e.pageX - shiftX + "px";
      obj.style.top = e.pageY - shiftY + "px";
    }

    obj.addEventListener("mousedown", function (e) {
      if (isMoving) {
        document.addEventListener("mouseup", function () {
          document.removeEventListener("mousemove", moveAt);
          isMoving = false;
          obj.style.cursor = "grab";
        });
      } else {
        obj.style.cursor = "grabbing";
        shiftX = e.clientX - obj.getBoundingClientRect().left;
        shiftY = e.clientY - obj.getBoundingClientRect().top;
        document.addEventListener("mousemove", moveAt);
      }
    });
  });
}

function getCoords(elem) {
  let coords = elem.getBoundingClientRect();

  elem.style.left = coords.left + "px";
  elem.style.top = coords.top + "px";
}
