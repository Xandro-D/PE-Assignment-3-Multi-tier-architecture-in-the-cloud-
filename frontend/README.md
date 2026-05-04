# Notetaker Frontend (Vanilla HTML/JS/CSS)

A lightweight, dependency-free frontend for the Notetaker API built with vanilla JavaScript and Bootstrap CSS.

## Features

- **No build tools required** - Just open in a browser!
- **User authentication** - Register and login
- **CRUD operations** - Create, read, update, and delete notes
- **Responsive design** - Works on desktop, tablet, and mobile
- **Bootstrap 5** - Beautiful, modern UI
- **Local storage** - Persists authentication tokens and cached notes

## Getting Started

1. Make sure the Notetaker API is running on `http://localhost:8000`
2. Open `index.html` in your web browser
3. Create an account or login with existing credentials
4. Start managing your notes!

## File Structure

- `index.html` - Main HTML file with all page sections
- `js/app.js` - All JavaScript logic (API calls, navigation, state management)
- `css/styles.css` - Custom styling
- `README.md` - This file

## How It Works

The app is a single-page application (SPA) that dynamically shows/hides different views:

1. **Auth View** - Login/Register page
2. **Notes List View** - Dashboard showing all notes
3. **Create Note View** - Form to create new notes
4. **Edit Note View** - Form to edit existing notes

All API communication happens through the `app.js` file, which handles:
- User registration and login
- Token management
- Note CRUD operations
- Error handling

## API Integration

The frontend connects to `http://localhost:8000` and expects the Notetaker API to be running.

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- Fetch API
- LocalStorage

## No Dependencies

This frontend requires NO npm packages or build process:
- Bootstrap CSS is loaded from CDN
- Everything else is vanilla JavaScript

## How to Deploy

Simply copy all files to a web server or static hosting service like GitHub Pages, Netlify, or Vercel.

## Development

No development server needed! Just edit the files and refresh your browser.
