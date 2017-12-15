"use strict";

// storage module
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

// excel module
var Excel = (function() {
  function createHeader() {
    var header = document.querySelector("table").createTHead();
    var row = header.insertRow(0);
    for (var i = 0; i < cols; i++) {
      var letter = String.fromCharCode("A".charCodeAt(0)+i-1);
      row.insertCell(-1).innerHTML = letter;
    }
  }

  function createTBody() {
    document.querySelector("table").createTBody();
  }

  function addRow(rowNum) {
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
      Excel.attachEvents(elemId);
    }
  }

  function addColumn() {
    cols +=1
    localStorage.setItem("cols", cols);
    var header = document.querySelector("table thead").rows.item(0);
    var letter = String.fromCharCode("A".charCodeAt(0)+cols-2);
    header.insertCell(-1).innerHTML = letter;
    for (var i = 1; i <= rows; i++) {
      var row = document.querySelector("table").rows.item(i);
      debugger;
      var cellData = tableData[i] ? tableData[i][cols-1] ? tableData[i][cols-1] : "" : "";
      // var value = localStorage.getItem(letter+i) === null ?  "" : localStorage.getItem(letter+i);
      var elemId = letter+i;
      row.insertCell(-1).innerHTML = "<input id='" + elemId + "' value='" + cellData + "' row='" + i +"' col='" + (cols-1) + "'/>";
      Excel.attachEvents(elemId);
    }
  }

  function deleteRow() {
    document.querySelector("table").deleteRow(rows);
    tableData.pop();
    rows -= 1;
    Storage.set("rows", rows);
    Storage.set("spreadsheet", JSON.stringify(tableData));
  }

  function deleteColumn() {
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

  function attachEvents(eleId) {
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

  return {
    createHeader,
    createTBody,
    addRow,
    addColumn,
    deleteRow,
    deleteColumn,
    attachEvents
  };
})();

// init module
var prepareExcel = (function() {
  function init() {
    document.getElementById('add-row').addEventListener('click', function(ev) {
      ev.preventDefault();
      rows += 1;
      Storage.set("rows", rows);
      Excel.addRow(rows);
    });

    document.getElementById('delete-row').addEventListener('click', function(ev) {
      ev.preventDefault();
      Excel.deleteRow();
    });

    document.getElementById('add-col').addEventListener('click', function(ev) {
      ev.preventDefault();
      Excel.addColumn();
    });

    document.getElementById('delete-col').addEventListener('click', function(ev) {
      ev.preventDefault();
      Excel.deleteColumn();
    });

    document.getElementById('sort-asc').addEventListener('click', function(ev) {
      ev.preventDefault();
      tableData.sort(function([a], [b]) {
        return a < b ? -1 : a > b ? 1 : 0;
      });
      document.querySelector('table thead').innerHTML = "";
      document.querySelector('table tbody').innerHTML = "";
      createTabeleData();
    });

    document.getElementById('sort-dsc').addEventListener('click', function(ev) {
      ev.preventDefault();
      tableData.sort(function([a], [b]) {
        return a < b ? 1 : a > b ? -1 : 0;
      });
      document.querySelector('table thead').innerHTML = "";
      document.querySelector('table tbody').innerHTML = "";
      createTabeleData();
    });

    createTabeleData();
  }

  function createTabeleData() {
    Excel.createHeader();
    Excel.createTBody();
    for(var i=1; i <= rows; i++) {
      Excel.addRow(i);
    }
  }

  return {
    init
  };
})();

document.body.addEventListener('onload', prepareExcel.init());
