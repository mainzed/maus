# mean-markdown

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.15.1.

## Development
You need to have NodeJS and the Node Package Manager and MongoDB installed on your machine.

Run `git clone https://github.com/mainzed/maus.git` to copy this repository to your local machine.
Run `npm install` to install all required NodeJS packages and `bower install` to download
all required frontend libraries. You may need to install bower globally first running `npm install bower -g`.  

If you haven't, fire up the MongoDB daemon by running `mongod`. Create a local MongoDB database
with the name "markdownstore" by running `mongo` (in a separate terminal window) and then `use markdownstore`.
Run `node server/server.js` to start an express server on port 3000 that will conncet to the created store and provide the api for the AngularJS app.

Run `grunt serve` to start a grunt development server on port 9000 that serves
the AngularJS app.

Running `grunt test` will run the unit tests with karma.

## Deployment
Run `grunt build` for building (minification etc.) the app in the /dist folder.
Run `node server.js` to serve the API and the static /dist folder.
