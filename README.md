Patient Management Web App

A simple web application built with React, TypeScript, and Vite to manage patient data using the Digistat Candidate API.

API

Base URL
https://mobile.digistat.it/CandidateApi

Swagger documentation
https://mobile.digistat.it/CandidateApi/swagger/index.html

Authentication (HTTP Basic):

User: test
Password: TestMePlease!

Data Model
Patient

ID (int)

FamilyName (string)

GivenName (string)

BirthDate (date)

Sex (string)

Parameters (array)

Parameter

ID (int)

Name (string)

Value (string)

Alarm (boolean)

Features
Patient Grid

Displays all patients using /Patient/GetList.

Columns:

Family Name

Given Name

Sex

Birth Date (human-readable)

Number of parameters

Alarm indicator (shown if any parameter has Alarm = true)

Grid supports:

Sorting

Filtering

Patient Details / Edit

Clicking a patient opens a detail/edit dialog showing:

Patient information

List of parameters (read-only grid)

Editable fields:

FamilyName

GivenName

Sex

Updates are saved via:

/Patient/Update

Run the Project

Install dependencies:

npm install


Start development server:

npm run dev


