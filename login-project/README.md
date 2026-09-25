# Login Project

A small starter with a static frontend and an Express API.

## Run locally

From this directory, install the backend dependencies and start the development server:

```sh
npm --prefix backend install
npm run dev
```

Open `http://localhost:3000` for the home page or `http://localhost:3000/login.html` for the sign-in form.

The sign-in endpoint is `POST /api/auth/login`. It validates that email and password are present, then returns `501 Not Implemented`: credential verification, user storage, and session management are intentionally not configured in this scaffold.
