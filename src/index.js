"use strict";

const appForm = document.getElementById("appform");
const userText = document.getElementById("usertext");
const outputText = document.getElementById("output");
const resetBtn = document.getElementById("formbtn-reset");

//----------------const/let---------------------------
const storageKey = "form-state";

let data = {
  currentText: "",
  textArr: [],
  lastAddedText: [],
};
let movableObjects = null;
let coordsOfMovingObjX = null;
let coordsOfMovingObjY = null;
let shiftX = 0;
let shiftY = 0;
let shiftX2 = 0;
let shiftY2 = 0;
let isMoving = false;
let currentObj = null;
const marginObj = 4;
let currentDroppable = null;

//----------------call func---------------------------
getSerializedData();

//----------------EventListeners---------------------------
userText.addEventListener("input", _.throttle(setCurrentText, 500));
appForm.addEventListener("submit", onSubmit);
resetBtn.addEventListener("click", onReset);

//----------------functions---------------------------

function onSubmit(e) {
  e.preventDefault();
  let { currentText } = data;

  if (currentText.trim() === "") {
    alert("The field must be filled");
    return;
  }

  const arr = currentText.split("");
  data.lastAddedText = [...arr];
  data.textArr.push(...arr);

  try {
    data.currentText = "";
    setSerializedData();
  } catch {
    console.error("set err", error.message);
  }

  createMarkup(data.lastAddedText);
  addListenerOnLetter();
  e.currentTarget.reset();
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
      data.textArr = parsedData.textArr;

      if (parsedData.textArr && parsedData.textArr.length !== 0) {
        createMarkup(parsedData.textArr);
        addListenerOnLetter();
      }
    }
  } catch (error) {
    console.error("get err", error.message);
  }
}

function setSerializedData() {
  const serializedData = JSON.stringify(data);
  localStorage.setItem(storageKey, serializedData);
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

function addListenerOnLetter() {
  movableObjects = document.querySelectorAll(".movable-element");

  setAbsolutePosition();

  movableObjects.forEach(function (obj) {
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
        shiftX2 = e.clientX - obj.getBoundingClientRect().right;
        shiftY2 = e.clientY - obj.getBoundingClientRect().bottom;
        document.removeEventListener("mouseup", onMouseup);
        document.addEventListener("mousemove", onMousemove);
      }
    });

    function onMousemove(e) {
      isMoving = true;
      obj.style.left = e.pageX - shiftX + "px";
      obj.style.top = e.pageY - shiftY + "px";

      checkMovableBelow(e);
    }

    function onMouseup() {
      document.removeEventListener("mousemove", onMousemove);
      isMoving = false;
      obj.style.cursor = "grab";
      obj.style.zIndex = 0;
      obj.classList.add("below");

      if (!currentObj) return;
      currentObj.style.left = coordsOfMovingObjX - marginObj + "px";
      currentObj.style.top = coordsOfMovingObjY - marginObj + "px";
      leaveDroppable(currentObj);
    }

    function checkMovableBelow(e) {
      obj.style.visibility = "hidden";
      let leftX = e.clientX - shiftX + marginObj;
      let rightX = e.clientX - shiftX2 + marginObj;
      let topY = e.clientY - shiftY + marginObj;
      let bottomY = e.clientY - shiftY2 + marginObj;

      let cursorBelow = document.elementFromPoint(e.clientX, e.clientY);
      let leftTopBelow = document.elementFromPoint(leftX, topY);
      let rightTopBelow = document.elementFromPoint(rightX, topY);
      let rightBottomBelow = document.elementFromPoint(rightX, bottomY);
      let leftBottomBelow = document.elementFromPoint(leftX, bottomY);
      obj.style.visibility = "visible";

      if (!cursorBelow) return;

      let movableBelow = cursorBelow.closest(".below");
      let movableBelowElem1 = leftTopBelow.closest(".below");
      let movableBelowElem2 = rightTopBelow.closest(".below");
      let movableBelowElem3 = rightBottomBelow.closest(".below");
      let movableBelowElem4 = leftBottomBelow.closest(".below");

      if (
        currentDroppable != movableBelow ||
        currentDroppable != movableBelowElem1 ||
        currentDroppable != movableBelowElem2 ||
        currentDroppable != movableBelowElem3 ||
        currentDroppable != movableBelowElem4
      ) {
        if (currentDroppable) {
          leaveDroppable(currentDroppable);
        }

        if (currentDroppable != movableBelow) {
          currentDroppable = movableBelow;
        } else if (currentDroppable != movableBelowElem1) {
          currentDroppable = movableBelowElem1;
        } else if (currentDroppable != movableBelowElem2) {
          currentDroppable = movableBelowElem2;
        } else if (currentDroppable != movableBelowElem3) {
          currentDroppable = movableBelowElem3;
        } else if (currentDroppable != movableBelowElem4) {
          currentDroppable = movableBelowElem4;
        }

        if (currentDroppable) {
          enterDroppable(currentDroppable);
        }
      }
    }
  });
}

function setAbsolutePosition() {
  movableObjects.forEach(function (obj) {
    getCoords(obj);
    obj.style.left = coordsOfMovingObjX + "px";
    obj.style.top = coordsOfMovingObjY + "px";
  });

  movableObjects.forEach(function (obj) {
    obj.style.position = "absolute";
  });
}

function getCoords(obj) {
  let coords = obj.getBoundingClientRect();
  coordsOfMovingObjX = coords.left;
  coordsOfMovingObjY = coords.top;
}

function enterDroppable(obj) {
  obj.style.background = "yellow";
  currentObj = obj;
}

function leaveDroppable(obj) {
  obj.style.background = "";
  currentObj = null;
  currentDroppable = null;
}

function cancelDragstart() {
  if (!movableObjects) return;

  movableObjects.ondragstart = function () {
    return false;
  };
}

function onReset() {
  outputText.innerHTML = "";
  data.currentText = "";
  data.textArr = [];
  localStorage.removeItem(storageKey);
}
