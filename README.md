
## Development
You need to have NodeJS, the Node Package Manager and MongoDB installed on your machine.

Run `git clone https://github.com/mainzed/maus.git` to copy this repository to your local machine.

Run `npm install` to install all required frontend and backend packages.

If you haven't, fire up the MongoDB daemon by running `mongod`. Create a local MongoDB database
with the name "markdownstore" by running `mongo` (in a separate terminal window) and then `use markdownstore`.

Run `npm start` to start an express server on port 3000 that will serve the app. Delete the "/dist" folder if it exists or express will serve it instead.

Running `grunt test` will run the unit tests with karma.

## Deployment
Run `grunt build` for building (minification etc.) the app in the /dist folder.
Run `node server/server.js` to serve the API and the static /dist folder.
