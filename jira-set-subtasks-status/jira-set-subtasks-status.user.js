// ==UserScript==
// @namespace    https://openuserjs.org/users/floodmeadows
// @name         Jira set sub-tasks' status
// @description  Adds a button to set the status of all sub-tasks to be the same as the main story / issue
// @author       floodmeadows
// @copyright    2021, floodmeadows (https://openuserjs.org/users/floodmeadows)
// @license      MIT
// @version      0.2.0
// @include      https://jira.*.uk/browse/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    addLinkApplyStatusToSubtasks();
})();

function addLinkApplyStatusToSubtasks() {
    const mainIssueStatus = document.getElementById("status-val").childNodes[1].innerHTML;
    const newElement = document.createElement("a");
    newElement.setAttribute("href", "#");
    newElement.setAttribute("class", "aui-button toolbar-trigger issueaction-workflow-transition");
    newElement.setAttribute("style", "margin-left:10px");
    newElement.addEventListener("click", checkSubtasksStatuses);
    const text = document.createTextNode('Set sub-tasks\' status to "' + mainIssueStatus + '"');
    newElement.appendChild(text);
    const target = document.getElementById('opsbar-transitions_more');
    target.parentNode.appendChild(newElement);
}

function checkSubtasksStatuses() {
    const baseGetIssueUrl = 'https://jira.tools.tax.service.gov.uk/rest/api/latest/issue/';
    const issueKey = document.getElementById("key-val").childNodes[0].nodeValue;
    const getIssueDetailsUrl = baseGetIssueUrl + issueKey;

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    const fields = 'key,summary,subtasks,status'
    const url = getIssueDetailsUrl + '?fields=' + fields
    console.log(url)

    var requestOptions = {
        method: 'GET',
        headers: headers
    };

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(
            json => {
                const mainTicketStatusName = json.fields.status.name
                for (const [_, subtask] of Object.entries(json.fields.subtasks)) {
                    const subtaskStatusName = subtask.fields.status.name
                    if (subtaskStatusName != mainTicketStatusName) {
                        console.log(subtask.key + ' needs to be moved to ' + mainTicketStatusName)
                        updateStatus(subtask.key, mainTicketStatusName)
                    } else {
                        console.log(subtask.key + ' already has the correct status')
                    }
                }
            }
        )
        .catch(error => console.log('error', error));
}

function updateStatus(key, statusName) {
    const apiUrl = `https://jira.tools.tax.service.gov.uk/rest/api/latest/issue/${key}/transitions`

    var headers = new Headers();
    headers.append("Authorization", "Basic " + btoa(myJiraUserName + ":" + myJiraPassword));
    headers.append("Content-Type", "application/json");

    const transitionId = transitionIdFromStatusName(statusName)
    var body = JSON.stringify({ "transition": { "id": transitionId } });

    var requestOptions = {
        method: 'POST',
        headers: headers,
        body: body
    };

    fetch(apiUrl, requestOptions)
        .then(response => console.log(response.text()))
        .catch(error => console.log('error', error));
}

function transitionIdFromStatusName(statusName) {
    if (statusName === 'Backlog') return '11'
    else if (statusName === 'Done') return '41'
    else if (statusName === 'Blocked') return '51'
    else if (statusName === 'In Dev') return '61'
    else if (statusName === 'Ready for Dev') return '71'
    else if (statusName === 'In PR') return '81'
    else if (statusName === 'In Test') return '91'
    else if (statusName === 'Ready for Release') return '101'
    else if (statusName === 'To Do') return '111'
    else if (statusName === 'In Analysis') return '121'
    else if (statusName === 'Ready for Refinement') return '141'
    else if (statusName === "Won't Fix") return '161'
    else if (statusName === 'In Progress') return '171'
    else if (statusName === 'Prioritised') return '181'
    else if (statusName === 'Ready for Test') return '191'
    else if (statusName === 'UI Test') return '211'
    else if (statusName === 'UI Tests PR') return '221'
    else if (statusName === 'Bugs for Prioritisation') return '231'
    else if (statusName === 'Technical Stories for Prioritisation') return '251'
    else if (statusName === 'Features for Prioritisation') return '261'
    else if (statusName === 'Test Debt for Prioritisation') return '271'
    else return 0
}
