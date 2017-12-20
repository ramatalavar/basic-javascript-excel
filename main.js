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
      var charCode = "A".charCodeAt(0)+i-1;
      var letter = String.fromCharCode(charCode);
      var td = row.insertCell(-1);
      td.innerHTML = letter;
      td.setAttribute("id", letter+i);
      if (charCode > 64) {
        td.className = "header";
        td.setAttribute("index", i);
        addHeaderEvents(letter+i);
      }
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
      attachEvents(elemId);
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
      var cellData = tableData[i] ? tableData[i][cols-1] ? tableData[i][cols-1] : "" : "";
      var elemId = letter+i;
      row.insertCell(-1).innerHTML = "<input id='" + elemId + "' value='" + cellData + "' row='" + i +"' col='" + (cols-1) + "'/>";
      attachEvents(elemId);
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

  var addHeaderEvents = function(eleId) {
    var ele = document.getElementById(eleId);
    if(ele) {
      ele.addEventListener("click", function(ev) {
        var prevEles = [].slice.call(document.querySelectorAll('.header.asc, .header.dsc'));
        prevEles.forEach(function(prevele) {
          prevele.classList.remove('asc');
          prevele.classList.remove('dsc');
        });
        var target = ev.target;
        var sortType = target.getAttribute("sort");
        if (!sortType || sortType === "dsc") {
          sortType = "asc";
          target.classList.remove("dsc");
        } else {
          sortType = "dsc";
          target.classList.remove("asc");
        }
        target.setAttribute("sort", sortType);
        target.classList.add(sortType);
        sortColumns(target.getAttribute("index"), sortType);
      });
    }
  }

  var sortColumns = function(index, sortType) {
    index -= 1;
    tableData.sort(function(a, b) {
      if (sortType === "asc") {
        return a[index] < b[index] ? -1 : a[index] > b[index] ? 1 : 0;
      } else {
        return a[index] < b[index] ? 1 : a[index] > b[index] ? -1 : 0;
      }
    });
    document.querySelector('table tbody').innerHTML = "";
    reloadTabeleData();
  }

  var reloadTabeleData = function() {
    for(var i=1; i <= rows; i++) {
      Excel.addRow(i);
    }
  }

  return {
    createHeader,
    createTBody,
    addRow,
    addColumn,
    deleteRow,
    deleteColumn
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

    (function createTabeleData() {
      Excel.createHeader();
      Excel.createTBody();
      for(var i=1; i <= rows; i++) {
        Excel.addRow(i);
      }
    })();
  }

  function destroy() {
    var buttons = [].slice.call(document.getElementsByTagName('button'));
    buttons.forEach((button) => {
      button.removeEventListener("click", function(ev) {
        // do some thing when event listeners removed
      });
    });
  }

  return {
    init,
    destroy
  };
})();
// init the excel and attach events
document.body.addEventListener('onload', prepareExcel.init());
//turn off the events
document.body.addEventListener('onbeforeunload', prepareExcel.destroy());
