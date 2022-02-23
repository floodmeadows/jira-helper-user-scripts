// ==UserScript==
// @name         Jira add descriptive link
// @namespace    https://openuserjs.org/users/floodmeadows
// @description  Adds a copyable link with issue name and key, ready for pasting into messages etc.
// @copyright    2021, floodmeadows (https://openuserjs.org/users/floodmeadows)
// @license      MIT
// @version      0.2.0
// @include      https://jira.*.uk/browse/*
// @updateURL    https://openuserjs.org/meta/floodmeadows/jira-add-descriptive-link.meta.js
// @downloadURL  https://openuserjs.org/src/scripts/floodmeadows/jira-add-descriptive-link.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    addLink();
})();

function addLink() {
    const issueKey = document.getElementById("key-val").childNodes[0].nodeValue;
    const issueName = document.getElementById("summary-val").childNodes[0].nodeValue;
    const newElement = document.createElement("div");
    const h = '<a href="' + document.URL + '">' + issueKey + ' (' + issueName + ')</a>';
    newElement.innerHTML = h;
    const target = document.getElementById('summary-val');
    target.parentNode.appendChild(newElement);
}
