// ==UserScript==
// @name         Jira create related tickets
// @namespace    https://openuserjs.org/users/floodmeadows
// @description  Adds buttons to create a linked iOS or Microservices ticket based on an existing Android ticket. The name of the new story will be based on the name of the current story; it will have a "relates to" link to the current story; the Component will be set to "iOS" or "Microservices"; it will be linked to the same epic and have the same state and assignee as the current story.
// @copyright    2021, floodmeadows (https://openuserjs.org/users/floodmeadows)
// @license      MIT
// @version      0.1
// @include      https://jira.*.uk/browse/*
// @updateURL    https://openuserjs.org/meta/floodmeadows/Jira_create_related_tickets.meta.js
// @downloadURL  https://openuserjs.org/install/floodmeadows/Jira_create_related_tickets.user.js
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */

//--- Customise these to your Jira project ----//
const customFieldForEpicLink = "customfield_10008"; // see https://stackoverflow.com/questions/24385644/jira-api-get-epic-for-issue
//---------------------------------------------//

const debug = false;

(function () {
    'use strict';

    addButton("Create iOS ticket","iOS","Android","iOS"); // button text, component, text to search for at end of current story name, text to replace it with in new story
    addButton("Create Services ticket","Microservices","Android","Services");
})();

function addButton(buttonText,component,searchStringInCurrentStoryName,replaceStringInNewStoryName) {
    const newElement = document.createElement("a");
    newElement.setAttribute("href", "#");
    newElement.setAttribute("class", "aui-button toolbar-trigger issueaction-workflow-transition");
    newElement.addEventListener("click", function () { createIssue(component,searchStringInCurrentStoryName,replaceStringInNewStoryName); });
    const text = document.createTextNode(buttonText);
    newElement.appendChild(text);
    const target = document.getElementById('opsbar-opsbar-admin');
    target.appendChild(newElement);
}

function createIssue(component,searchStringInCurrentStoryName,replaceStringInNewStoryName) {
    //--- Get standard info ---//
    const currentUrl = new URL(document.URL);
    const jiraBaseUrl = currentUrl.protocol + '//' + currentUrl.host;
    const createIssueUrl = jiraBaseUrl + '/rest/api/latest/issue';
    const addLinkUrl = jiraBaseUrl + '/rest/api/latest/issueLink';

    // Parse the Jira project key out of the current URL. e.g. if the current issue key is "ABC-1234" then the project key will be ABC.
    const pathArr = location.pathname.split("/");
    const jiraProjectKey = pathArr[pathArr.length-1].split("-")[0];

    const currentIssueKey = document.getElementById("key-val").childNodes[0].nodeValue;
    const currentIssueSummary = document.getElementById("summary-val").childNodes[0].nodeValue;
    const newIssueSummary = newIssueSummaryFromCurrentIssueName(currentIssueSummary,searchStringInCurrentStoryName,replaceStringInNewStoryName);

    const newIssueDescription = `See ${currentIssueKey} for details.`;

    const currentIssueTypeName = document.getElementById('type-val').childNodes[2].nodeValue.trim();
    const issueTypeId = issueTypeIdFromName(currentIssueTypeName);

    const currentIssueEpicLink = document.getElementById(`${customFieldForEpicLink}-val`).children[0].attributes.href.nodeValue.substring(8);

    const currentIssueState = document.getElementById('opsbar-transitions_more').children[0].innerHTML;
    const newIssueTransitionName = currentIssueState;

    const currentIssueAssignee = document.getElementById('assignee-val').children[0].attributes.rel.value;
    var newIssueAssignee;
    if( currentIssueAssignee === undefined ) {
        newIssueAssignee = "";
    } else {
        newIssueAssignee = currentIssueAssignee;
    }
    //---------------------------//

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var jsonToCreateNewIssue = "";
    jsonToCreateNewIssue = JSON.stringify({
        "fields": {
            "project": {
                "key": jiraProjectKey
            },
            "summary": newIssueSummary,
            "description": newIssueDescription,
            "issuetype": {
                "id": issueTypeId
            },
            "components": [{
                "name": component
            }],
//            "labels": [
//                ""
//            ],
            "customfield_10008": currentIssueEpicLink,
            "assignee": {
                "name": newIssueAssignee
            }
        }
    });
    if (debug) console.log(jsonToCreateNewIssue);

    var requestOptions = {
        method: 'POST',
        headers: headers,
        body: jsonToCreateNewIssue
    };

    fetch(createIssueUrl, requestOptions)
        .then(response => {
            const jsonPromise = response.json()
                .then(data => {
                    const newIssue = data;
                    const newIssueKey = newIssue.key;
                    console.log(newIssueKey);

                    var jsonToAddLink = "";
                    jsonToAddLink = JSON.stringify({
                        "type": {
                            "name": "Relates",
                            "inward": "relates to",
                            "outward": "relates to"
                        },
                        "inwardIssue": {
                            "key": currentIssueKey
                        },
                        "outwardIssue": {
                            "key": newIssueKey
                        }
                    });

                    requestOptions = {
                        method: 'POST',
                        headers: headers,
                        body: jsonToAddLink
                    };

                    fetch(addLinkUrl, requestOptions)
                        .then(response => {
                            console.log(response.text());
                            const updateIssueUrl = `${jiraBaseUrl}/rest/api/latest/issue/${newIssueKey}/transitions`;

                            var jsonToUpdateStatus = "";
                            jsonToUpdateStatus = JSON.stringify({
                                "transition": {
                                    "id": issueTransitionIdFromName(newIssueTransitionName),
                                    "name": newIssueTransitionName
                                }
                            });

                            requestOptions = {
                                method: 'POST',
                                headers: headers,
                                body: jsonToUpdateStatus
                            };

                            fetch(updateIssueUrl, requestOptions)
                            .then(response => {
                                console.log(response.text());
                                if(!debug) window.location.assign(currentUrl);
                            })
                            .catch(error => console.log('error', error));

                        })
                        .catch(error => console.log('error', error));
                });
        })
        .catch(error => console.log('error', error));
}

function newIssueSummaryFromCurrentIssueName(currentIssueSummary,searchString,replaceString) {
    var newIssueName = "";
    if( currentIssueSummary.endsWith(searchString) || currentIssueSummary.endsWith(searchString+')') || currentIssueSummary.endsWith(searchString+']') ) {
		var pos = currentIssueSummary.lastIndexOf(searchString)
        var currentIssueNameBeforePlatformName = currentIssueSummary.substring(0,pos)
        var currentIssueNameAfterPlatformName = currentIssueSummary.substring(pos+searchString.length,currentIssueSummary.length)
        newIssueName = currentIssueNameBeforePlatformName + replaceString + currentIssueNameAfterPlatformName;
    } else {
        newIssueName = `${currentIssueSummary} (${replaceString})`;
    }
    return newIssueName;
}

function issueTypeIdFromName(name) {

    //Todo: make a call to /rest/api/2/issue/createmeta/{projectIdOrKey}/issuetypes and look up the issueTypeId from the response, rather than having the list hard coded here
    const issueTypeIds = new Map([
        ["Bug", "1"],
        ["Technical Story", "10"],
        ["Documentation", "10000"],
        ["UX/UR", "11000"],
        ["Tech-debt", "11301"],
        ["Spike", "12"],
        ["Technical Debt", "13"],
        ["UI Story", "14"],
        ["New Feature", "2"],
        ["Task", "3"],
        ["Improvement", "4"],
        ["Sub-task", "5"],
        ["Epic", "6"],
        ["Story", "7"],
        ["Technical task", "8"]
    ]);
    // The values are specified as text, not integers, because that's how Jira returns them.
    // To get these values for your instance of Jira, you can use https://openuserjs.org/scripts/floodmeadows/Jira_get_issue_types

    if( issueTypeIds.has(name) ) {
        return issueTypeIds.get(name);
    } else {
        console.log("Error: No issue type ID in lookup table for current issue type (" + name + ").");
        return false;
    }
}

function issueTransitionIdFromName(name) {

    const issueTransitionIds = new Map([
        ["Backlog", "11"],
        ["Done", "41"],
        ["In Dev", "61"],
        ["Ready for Dev", "71"],
        ["In PR", "81"],
        ["In Test", "91"],
        ["Ready for Release", "101"],
        ["To Do", "111"],
        ["In Analysis", "121"],
        ["Ready for Refinement", "141"],
        ["Won't Fix", "161"],
        ["In Progress", "171"],
        ["Ready for Test", "191"],
        ["In Review", "261"],
        ["Reporting", "321"],
        ["To be Prioritised", "331"]
    ]);
    // To get these values for your instance of Jira, you can use https://openuserjs.org/scripts/floodmeadows/Jira_get_issue_transitions

    if( issueTransitionIds.has(name) ) {
        return issueTransitionIds.get(name);
    } else {
        console.log("Error: No transition ID for '" + name + "'");
        return false;
    }
}