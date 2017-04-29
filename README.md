Before you start
=================

Backend API
-----------

Make sure you setup the necessary connections to the backend. You can run it locally by setting these environment variables:

* `export FABRIC8_STACK_API_URL="https://recommender.api.prod-preview.openshift.io/api/v1/"`

in your .bash_profile and reload the shell.

VS Code
-------

Run `ext install EditorConfig` to read the `.editorconfig` file

To start
---------

Run `npm start`. This will start the UI with livereload enabled.


Deploy
---------

Run `npm run build:prod`. This will trigger build.

Run `docker build --rm -t <username>/<name> .`

Run `docker push <username>/<name>`

Use above docker image to create a project in Openshift.
