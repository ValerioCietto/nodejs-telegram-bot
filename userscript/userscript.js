// ==UserScript==
// @name         Dumper
// @namespace    http://tampermonkey.net/
// @version      2024-05-01
// @description  Dumper
// @author       Monterenzio
// @match        https://dumper.118er.it/prov/sxvywkui
// @icon         https://www.google.com/s2/favicons?sz=64&domain=118er.it
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  console.log("hello world!");
  $.getJSON("https://dumper.118er.it/downloadJSON/1", function (data) {
    console.log(JSON.stringify(data));
    // send data with stringified json
    // $.post("http://localhost:13000/data", { dati: JSON.stringify(data) });
    $.ajax({
      url: "http://localhost:13000/data",
      type: "POST",
      contentType: "application/json", // This line is crucial!
      data: JSON.stringify({ dati: JSON.stringify(data) }),
      success: function (response) {
        console.log("Server response:", response);
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
      },
    });
  });
  // Your code here...
})();
