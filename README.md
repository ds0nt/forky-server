# Forky Server


**Forky** is a collaborative visualization tool.  I'm hosting it at [http://forky.io](http://forky.io). It goes up and down as there are only a handful of users.


You can run a Forky Server in the cloud, on your pc, or on 'hackable' hardware, and possibly elsewhere.

#### Prerequisites

 - A Mongo Database
 - A Rethink Database
 - A system with node.js

Personally, I use **docker** for mongo and rethinkdb as it requires the zero configuration, and keeps my mind free from database horrors. I just run it on Ubuntu because it's most familiar to me.


#### Install Dependencies

```bash
npm install # you will need linux building tools I think
```


#### Configure Server Using Config File

This is the preferred method for local deployments for development, or for running it as a hard app.
```bash
vim config/default.js # it is self explanitory
```


#### Configure Server Using Environment Variables

This method is preferred for server deployments, and overrides the settings in the config file. This will override the config file options.
```bash
cat config/custom-environment-variables.js # prints vars involved

# and to run you would do something like
export FORKY_PORT=8080
```

#### Start the Server

```
 $ node index.js
```
