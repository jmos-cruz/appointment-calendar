Calendar for meeting room appointments

The project has full backend implementation.

The frontend design was inspired by Google Calendar and the initial Javascript for creating calendars for each month was inspired by the calendar created by Behzad Ahmad https://www.educative.io/answers/how-to-create-an-animated-calendar-with-html-and-css

The backend was developed with Node.js - HTTP request handling using Express.js and database connectivity using Node.js MySQL driver.

New database entries are added via a POST handler, server-side, and appointments are shown in the view via fetch API.

Validations are done client-side to match with validations done on the database.
