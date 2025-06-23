## Running React on Replit

[React](https://reactjs.org/) is a popular JavaScript library for building user interfaces.

[Vite](https://vitejs.dev/) is a blazing fast frontend build tool that includes features like Hot Module Reloading (HMR), optimized builds, and TypeScript support out of the box.

Using the two in conjunction is one of the fastest ways to build a web app.

### Getting Started
- Hit run
- Edit [App.jsx](#src/App.jsx) and watch it live update!

By default, Replit runs the `dev` script, but you can configure it by changing the `run` field in the [configuration file](#.replit). Here are the vite docs for [serving production websites](https://vitejs.dev/guide/build.html)

### Typescript

Just rename any file from `.jsx` to `.tsx`. You can also try our [TypeScript Template](https://replit.com/@replit/React-TypeScript)

### Environment Variables

Create a `.env` file in the project root and define your Firebase settings:

```
VITE_FIREBASE_API_KEY=<your api key>
VITE_FIREBASE_AUTH_DOMAIN=<your auth domain>
VITE_FIREBASE_PROJECT_ID=<your project id>
VITE_FIREBASE_STORAGE_BUCKET=<your storage bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your sender id>
VITE_FIREBASE_APP_ID=<your app id>
```

These values are loaded in `src/App.jsx` via `import.meta.env`.

