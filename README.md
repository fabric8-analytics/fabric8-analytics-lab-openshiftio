# Project Fabric8-Analytics-lab-openshiftio

*Note on naming: The Fabric8-Analytics project has evolved from 2 different projects called "cucos" and "bayesian". We're currently in process of renaming the modules and updating documentation. Until that is completed, please consider "cucos" and "bayesian" to be synonyms of "Fabric8-Analytics".*

## Overview
Fabric8-Analytics-lab-openshiftio contains the UI code for accessing Bayesian services standalone

### Backend API
Make sure you setup the necessary connections to the backend. You can run it locally by setting these environment variables:

* `export FABRIC8_STACK_API_URL="http://bayesian-api-bayesian.dev.rdu2c.fabric8.io/api/v1/"`

in your .bash_profile and reload the shell.

### VS Code
Run `ext install EditorConfig` to read the `.editorconfig` file

### To start
Run `npm start`. This will start the UI with livereload enabled.


### Deploy
Run `npm run build:prod`. This will trigger build.

Run `docker build --rm -t <username>/<name> .`

Run `docker push <username>/<name>`

Use above docker image to create a project in Openshift.
