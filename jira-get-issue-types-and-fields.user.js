// ==UserScript==
// @name         Jira get issue types and fields
// @description  Adds a button to get the list of issue types, and the fields for a chosen type
// @namespace    https://openuserjs.org/users/floodmeadows
// @copyright    2021, floodmeadows (https://openuserjs.org/users/floodmeadows)
// @license      MIT
// @version      0.2
// @include      https://jira.tools.tax.service.gov.uk/browse/*
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */

(function () {
    'use strict';

    addLinkGetIssueTypes();
    addLinkGetAllFields();
})();

function addLinkGetIssueTypes() {
    const newElement = document.createElement("a");
    newElement.setAttribute("href", "#");
    newElement.setAttribute("class", "aui-button toolbar-trigger issueaction-workflow-transition");
    newElement.addEventListener("click", getIssueTypes);
    //newElement.addEventListener("click", getIssueFieldsForIssueType);
    const text = document.createTextNode("Get issue types");
    newElement.appendChild(text);
    const target = document.getElementById('opsbar-transitions_more');
    target.parentNode.appendChild(newElement);
}

function getIssueTypes() {
    //https://jira.tools.tax.service.gov.uk/rest/api/2/issue/createmeta/{projectIdOrKey}/issuetypes
    const issueTypesUrl = 'https://jira.tools.tax.service.gov.uk/rest/api/2/issue/createmeta/HMA/issuetypes';

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: headers
    };

    fetch(issueTypesUrl, requestOptions)
        .then(response => console.log(response.text()))
        .catch(error => console.log('error', error));

    /* Output includes...
          {
             "self":"https://jira.tools.tax.service.gov.uk/rest/api/2/issuetype/5",
             "id":"5",
             "description":"The sub-task of the issue",
             "iconUrl":"https://jira.tools.tax.service.gov.uk/secure/viewavatar?size=xsmall&avatarId=10916&avatarType=issuetype",
             "name":"Sub-task",
             "subtask":true
          },
          {
             "self":"https://jira.tools.tax.service.gov.uk/rest/api/2/issuetype/7",
             "id":"7",
             "description":"Created by Jira Software - do not edit or delete. Issue type for a user story.",
             "iconUrl":"https://jira.tools.tax.service.gov.uk/secure/viewavatar?size=xsmall&avatarId=10915&avatarType=issuetype",
             "name":"Story",
             "subtask":false
          },
    */

}

function addLinkGetAllFields() {
    const newElement = document.createElement("a");
    newElement.setAttribute("href", "#");
    newElement.setAttribute("class", "aui-button toolbar-trigger issueaction-workflow-transition");
    newElement.addEventListener("click", getAllFields);
    const text = document.createTextNode("Get all fields");
    newElement.appendChild(text);
    const target = document.getElementById('opsbar-transitions_more');
    target.parentNode.appendChild(newElement);
}

function getAllFields() {
    //--- Get standard info ---//
    const currentUrl = new URL(document.URL);
    const jiraBaseUrl = currentUrl.protocol + '//' + currentUrl.host;
    const getStoryPointsFieldsUrl = jiraBaseUrl + '/rest/api/latest/field';

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: headers
    };

    fetch(getStoryPointsFieldsUrl, requestOptions)
        .then(response => console.log(response.text()))
        .catch(error => console.log('error', error));
}

function addLinkGetStoryPointsFields() {
    const newElement = document.createElement("a");
    newElement.setAttribute("href", "#");
    newElement.setAttribute("class", "aui-button toolbar-trigger issueaction-workflow-transition");
    newElement.addEventListener("click", getStoryPointsFields);
    const text = document.createTextNode("Get story points fields");
    newElement.appendChild(text);
    const target = document.getElementById('opsbar-transitions_more');
    target.parentNode.appendChild(newElement);
}

function getStoryPointsFields() {
    //--- Get standard info ---//
    const currentUrl = new URL(document.URL);
    const jiraBaseUrl = currentUrl.protocol + '//' + currentUrl.host;

    // Parse the Jira project key out of the current URL. e.g. if the current issue key is "ABC-1234" then the project key will be ABC.
    const pathArr = location.pathname.split("/");
    const jiraProjectKey = pathArr[pathArr.length-1].split("-")[0];

//    const getStoryPointsFieldsUrl = jiraBaseUrl + '/rest/api/latest/field/search';
    const getStoryPointsFieldsUrl = jiraBaseUrl + '/rest/api/latest/customFields';

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: headers
    };

    fetch(getStoryPointsFieldsUrl, requestOptions)
        .then(response => console.log(response.text()))
        .catch(error => console.log('error', error));
}

function getIssueFieldsForIssueType() {
    //--- Get standard info ---//
    const currentUrl = new URL(document.URL);
    const jiraBaseUrl = currentUrl.protocol + '//' + currentUrl.host;

    // Parse the Jira project key out of the current URL. e.g. if the current issue key is "ABC-1234" then the project key will be ABC.
    const pathArr = location.pathname.split("/");
    const jiraProjectKey = pathArr[pathArr.length-1].split("-")[0];

    const getIssueFieldsUrl = `${jiraBaseUrl}/rest/api/latest/issue/createmeta/${jiraProjectKey}/issuetypes/5`;

    var headers = new Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: headers
    };

    fetch(getIssueFieldsUrl, requestOptions)
        .then(response => console.log(response.text()))
        .catch(error => console.log('error', error));

    /* Response included:
    // required fields: issuetype, parent, project, reporter, summary

          {
             "required":true,
             "schema":{
                "type":"issuetype",
                "system":"issuetype"
             },
             "name":"Issue Type",
             "fieldId":"issuetype",
             "hasDefaultValue":false,
             "operations":[
             ],
             "allowedValues":[
                {
                   "self":"https://jira.tools.tax.service.gov.uk/rest/api/2/issuetype/5",
                   "id":"5",
                   "description":"The sub-task of the issue",
                   "iconUrl":"https://jira.tools.tax.service.gov.uk/secure/viewavatar?size=xsmall&avatarId=10916&avatarType=issuetype",
                   "name":"Sub-task",
                   "subtask":true,
                   "avatarId":10916
                }
             ]
          },
          {
             "required":true,
             "schema":{
                "type":"issuelink",
                "system":"parent"
             },
             "name":"Parent",
             "fieldId":"parent",
             "hasDefaultValue":false,
             "operations":[
                "set"
             ]
          },
          {
             "required":true,
             "schema":{
                "type":"project",
                "system":"project"
             },
             "name":"Project",
             "fieldId":"project",
             "hasDefaultValue":false,
             "operations":[
                "set"
             ],
             "allowedValues":[
                {
                   "self":"https://jira.tools.tax.service.gov.uk/rest/api/2/project/18800",
                   "id":"18800",
                   "key":"HMA",
                   "name":"HMRC Mobile App",
                   "projectTypeKey":"software",
                   "avatarUrls":{
                      "48x48":"https://jira.tools.tax.service.gov.uk/secure/projectavatar?pid=18800&avatarId=21003",
                      "24x24":"https://jira.tools.tax.service.gov.uk/secure/projectavatar?size=small&pid=18800&avatarId=21003",
                      "16x16":"https://jira.tools.tax.service.gov.uk/secure/projectavatar?size=xsmall&pid=18800&avatarId=21003",
                      "32x32":"https://jira.tools.tax.service.gov.uk/secure/projectavatar?size=medium&pid=18800&avatarId=21003"
                   }
                }
             ]
          },
          {
             "required":true,
             "schema":{
                "type":"user",
                "system":"reporter"
             },
             "name":"Reporter",
             "fieldId":"reporter",
             "autoCompleteUrl":"https://jira.tools.tax.service.gov.uk/rest/api/latest/user/search?username=",
             "hasDefaultValue":false,
             "operations":[
                "set"
             ]
          },
          {
             "required":true,
             "schema":{
                "type":"string",
                "system":"summary"
             },
             "name":"Summary",
             "fieldId":"summary",
             "hasDefaultValue":false,
             "operations":[
                "set"
             ]
          },
    */
}
