// ==UserScript==
// @name         Jira get issue details
// @description  Adds a button to get all fields for the current issue using the Jira API
// @namespace    https://openuserjs.org/users/floodmeadows
// @copyright    2021, floodmeadows (https://openuserjs.org/users/floodmeadows)
// @license      MIT
// @version      0.2
// @include      https://jira.*.uk/browse/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  addLinkGetIssueDetails();
})();

function addLogMessage(message){
    return function(){
        console.log(message);
    }
}

function addLinkGetIssueDetails() {
  const newElement = document.createElement("a");
  newElement.setAttribute("href","#");
  newElement.setAttribute("class","aui-button toolbar-trigger issueaction-workflow-transition");
  newElement.setAttribute("style", "margin-left:10px");
  newElement.addEventListener("click", getIssueDetails);
  const text = document.createTextNode("Issue details");
  newElement.appendChild(text);
  const target = document.getElementById('opsbar-opsbar-admin');
  target.appendChild(newElement);
}

function getIssueDetails() {
    const issueKey = document.getElementById("key-val").childNodes[0].nodeValue;
    const currentUrl = new URL(document.URL);
    const jiraBaseUrl = currentUrl.protocol + '//' + currentUrl.host;
    const getIssueDetailsUrl = jiraBaseUrl + '/rest/api/latest/issue/' + issueKey;

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: headers
    };
    console.log("Issue details:")
    fetch(getIssueDetailsUrl, requestOptions)
        .then(response => console.log(response.text()))
        .catch(error => console.log('error: ', error));
}
