const appForm = document.getElementById("appform");
const userText = document.getElementById("usertext");
const outputText = document.getElementById("output");

//----------------const/let---------------------------
const storageKey = "form-state";

let data = {
  currentText: "",
};
let moveObjects = null;
let coordsOfMovingObjX = null;
let coordsOfMovingObjY = null;
let isMoving = false;
let currentObj = null;
let marginObj = 4;

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
      data.currentText = parsedData.currentText;
    }
  } catch (error) {
    console.error("get err", error.message);
  }
}

function createMarkup(data) {
  const markup = data
    .map(
      (item) =>
        `<span class="movable-element below" draggable=true>${item}</span>`
    )
    .join("");

  outputText.insertAdjacentHTML("afterbegin", markup);
}

function getCoords(obj) {
  let coords = obj.getBoundingClientRect();
  coordsOfMovingObjX = coords.left;
  coordsOfMovingObjY = coords.top;
}

let currentDroppable = null;

function addListenerOnLetter() {
  moveObjects = document.querySelectorAll(".movable-element");

  moveObjects.forEach(function (obj) {
    getCoords(obj);
    obj.style.left = coordsOfMovingObjX + "px";
    obj.style.top = coordsOfMovingObjY + "px";
  });

  moveObjects.forEach(function (obj) {
    obj.style.position = "absolute";
  });

  moveObjects.forEach(function (obj) {
    let shiftX = 0;
    let shiftY = 0;

    function checkMovableBelow(e) {
      obj.style.visibility = "hidden";
      let objBelow = document.elementFromPoint(e.clientX, e.clientY);
      obj.style.visibility = "visible";

      if (!objBelow) return;

      let movableBelow = objBelow.closest(".below");

      if (currentDroppable != movableBelow) {
        if (currentDroppable) {
          leaveDroppable(currentDroppable);
        }
        currentDroppable = movableBelow;
        if (currentDroppable) {
          enterDroppable(currentDroppable);
        }
      }
    }

    function moveAt(e) {
      isMoving = true;
      obj.style.left = e.pageX - shiftX + "px";
      obj.style.top = e.pageY - shiftY + "px";

      checkMovableBelow(e);
    }

    function onMouseup(e) {
      document.removeEventListener("mousemove", moveAt);
      isMoving = false;
      obj.style.cursor = "grab";
      obj.style.zIndex = 0;
      obj.classList.add("below");

      if (!currentObj) return;
      currentObj.style.left = coordsOfMovingObjX - marginObj + "px";
      currentObj.style.top = coordsOfMovingObjY - marginObj + "px";
      leaveDroppable(currentObj);
    }

    obj.addEventListener("mousedown", function (e) {
      if (isMoving) {
        document.addEventListener("mouseup", onMouseup);
      } else {
        getCoords(obj);
        obj.style.cursor = "grabbing";
        obj.classList.remove("below");
        obj.style.zIndex = 10;
        shiftX = e.clientX - obj.getBoundingClientRect().left;
        shiftY = e.clientY - obj.getBoundingClientRect().top;
        document.removeEventListener("mouseup", onMouseup);
        document.addEventListener("mousemove", moveAt);
      }
    });
  });
}

function enterDroppable(obj) {
  obj.style.background = "yellow";
  currentObj = obj;
}

function leaveDroppable(obj) {
  obj.style.background = "";
  currentObj = null;
}

function cancelDragstart() {
  if (!moveObjects) return;

  moveObjects.ondragstart = function () {
    return false;
  };
}
