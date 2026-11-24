# 🐞 BugBoard

A full-stack, Kanban-style bug tracker. Add bugs, then move them from **To Do** to **In Progress** to **Fixed**.

**Version 1 (frontend only) live demo:** https://dhanusrinithyalakshmi.github.io/bugboard/

## Features

- Add, edit, and delete bugs with a title, description, and priority (Low, Medium, High)
- Drag and drop cards between columns
- Search by title and filter by priority
- Live bug count in each column
- Responsive layout
- Bugs stored permanently in MongoDB through a REST API

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (DOM, Fetch API, Drag and Drop API)
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas with Mongoose
- **Tools:** Git, GitHub

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/bugs` | Get all bugs |
| POST | `/api/bugs` | Add a bug |
| PUT | `/api/bugs/:id` | Edit or move a bug |
| DELETE | `/api/bugs/:id` | Delete a bug |

## How to Run Locally

1. Clone the repository and switch to this branch:
   `git clone https://github.com/dhanusrinithyalakshmi/bugboard.git`
   `cd bugboard`
   `git checkout version-2`
2. Install dependencies: `npm install`
3. Create a free cluster on MongoDB Atlas and copy its connection string.
4. Create a `.env` file in the project folder:
   `MONGODB_URI=your_connection_string_here`
5. Start the server: `npm start`
6. Open http://localhost:3000

## Screenshots

![BugBoard](screenshot.png)

## What I Learned

- Building a REST API with Express
- Connecting a Node.js app to MongoDB with Mongoose
- Keeping secrets out of GitHub with environment variables
- Moving a frontend from localStorage to a server and database
- Debugging with the browser console and terminal logs

## Future Improvements

- User login and bug assignment
- Comments on each bug
- Deploying the full app online