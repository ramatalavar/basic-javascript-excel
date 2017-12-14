"use strict";

var Storage = (function() {
  function get(key) {
    return localStorage.getItem(key);
  }

  function set(key, value) {
    localStorage.setItem(key, value);
  }

  return {
    get,
    set
  };
})();

var rows = parseInt(Storage.get("rows") || 6);
var cols = parseInt(Storage.get("cols") || 6);
var tableData = JSON.parse(Storage.get("spreadsheet")) || [];

function initiateExcelSheet() {
  createHeader();
  createTBody();
  // get initial row count and create rows
  for(var i=1; i <= rows; i++) {
    addRow(i);
  }
}

// create table header
var createHeader = function() {
  var header = document.querySelector("table").createTHead();
  var row = header.insertRow(0);
  for (var i = 0; i < cols; i++) {
    var letter = String.fromCharCode("A".charCodeAt(0)+i-1);
    row.insertCell(-1).innerHTML = letter;
  }
}

// create table body
var createTBody = function() {
  document.querySelector("table").createTBody();
}


// insert new column
var insertColumn = function() {
  cols +=1
  localStorage.setItem("cols", cols);
  var header = document.querySelector("table thead").rows.item(0);
  var letter = String.fromCharCode("A".charCodeAt(0)+cols-2);
  header.insertCell(-1).innerHTML = letter;
  for (var i = 1; i <= rows; i++) {
    var row = document.querySelector("table").rows.item(i);
    var value = localStorage.getItem(letter+i) === null ?  "" : localStorage.getItem(letter+i);
    row.insertCell(-1).innerHTML = "<input id='" + letter+i + "' value='" + value + "'/>";
    attachEvents(letter+i);
  }
}

// delete column
var deleteColumn = function() {
  cols -=1;
  var header = document.querySelector("table thead").rows.item(0);
  header.deleteCell(cols);
  for (var i = 1; i <= rows; i++) {
    var row = document.querySelector("table").rows.item(i);
    row.deleteCell(cols);
    if (tableData[i-1]) {
      tableData[i-1][cols-1] = "";
    }
  }
  Storage.set("cols", cols);
  Storage.set("spreadsheet", JSON.stringify(tableData));
}

// insert row event handler
var insertRow = function() {
  rows += 1;
  Storage.set("rows", rows);
  addRow(rows);
}

// add row to the table body
var addRow = function(rowNum) {
  rowNum = rowNum;
  var row = document.querySelector("table tbody").insertRow(-1);
  for (var j = 1; j <= cols; j++) {
    var cellData = tableData[rowNum-1] ? tableData[rowNum-1][j-2] ? tableData[rowNum-1][j-2] : "" : "";
    var letter = String.fromCharCode("A".charCodeAt(0)+j-1);
    var elemId = letter+rowNum;
    var input = "<input id='" + elemId + "' value='" + cellData + "' row='" + rowNum +"' col='" + (j-1) + "'/>"
    row.insertCell(-1).innerHTML = j > 1 ? input : rowNum;
    if (!tableData[rowNum-1]) {
      tableData[rowNum-1] = [];
    }
    attachEvents(elemId);
  }
}

// delete rows
var deleteRow = function() {
  document.querySelector("table").deleteRow(rows);
  tableData.pop();
  rows -= 1;
  Storage.set("rows", rows);
  Storage.set("spreadsheet", JSON.stringify(tableData));
}

// attach events to input
var attachEvents = function(eleId) {
  var ele = document.getElementById(eleId);
  if (ele) {
    ele.onfocus = function(ev) {
      if (tableData[ev.target.getAttribute("row")-1]) {
        ev.target.value = tableData[ev.target.getAttribute("row")-1][ev.target.getAttribute("col")-1] || "";
      } else {
        tableData[ev.target.getAttribute("row")-1] = [];
        ev.target.value = "";
      }

    };

    ele.onblur = function(ev) {
      tableData[ev.target.getAttribute("row")-1][ev.target.getAttribute("col")-1] = ev.target.value;
      Storage.set("spreadsheet", JSON.stringify(tableData));
    }
  }
}

// sort
var sortAsc = function() {
  tableData.sort(function([a], [b]) {
    return a < b ? -1 : a > b ? 1 : 0;
  });
  document.querySelector('table thead').innerHTML = "";
  document.querySelector('table tbody').innerHTML = "";
  initiateExcelSheet();
}

var sortDsc = function() {
  tableData.sort(function([a], [b]) {
    return a < b ? 1 : a > b ? -1 : 0;
  });
  document.querySelector('table thead').innerHTML = "";
  document.querySelector('table tbody').innerHTML = "";
  initiateExcelSheet();
}

document.body.addEventListener('onload', initiateExcelSheet());
