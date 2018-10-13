# Hokus CMS

<img src="https://www.hokus.io/img/logo-dark.svg" alt="Hokus CMS" width="120"/>

A CMS for Hugo to run on your computer. **No hosting fees are required**.

[![screenshot](https://www.hokus.io/img/home-video-placeholder.jpg)](https://www.hokus.io/)

For a quick preview, access our website and look for our **preview video**:
https://www.hokus.io/

**Alpha Warning**: Hokus is still a work in progress and some awesome features are not yet ready. 

## Features

Take a look at our features and understand why Hokus is a great tool for your Hugo websites:

* **Runs on your computer.** Supported Platforms: Windows, Linux and macOS.
* **Free for commercial use.** Download our binaries today and use it for your own commercial purposes.
* **One click installer.** It's a breeze to install on your PC.
* **Dozen of ready to use UI components.** Crafted to handle many use cases and complex data hierarchy.
* **Clean UI.** Clearly see what you are doing without any clutter or confusion. Open Source.
* **MIT license.** Copy, edit, share, redistribute.
* **Build User Interfaces Easily.** Just create a small configuration file (JSON, TOML and YAML are supported).

*Some features may be under development.*

## Current State

**You can use Hokus for some workflows right now**. It is fully ready to manage local Hugo websites (the folders can be shared in the same network or by third party software like Google Drive). Git integrations or AWS sync are not ready yet.

Start today, [download our binaries for Windows 10 (x64)](https://github.com/julianoappelklein/hokus/releases), install Hokus on your PC and set up a website within seconds by using our wizard.

Just keep in mind that **Hokus will be much more** in the future.

## Getting Started

*To run on Linux or Mac, see topic below.*

* [Download the binaries - Windows 10 (x64)](https://github.com/julianoappelklein/hokus/releases). 
* Install by running the executable file _\(hokus-cms-setup-0.2.1-winx64.exe\)_
* Open Hokus.
* Configure a new website _(at the moment, the only option is to point to a root of a local Hugo website - the Folder Source)_.
* A default configuration file (hokus.yaml) will be placed at the root of your website. After this, open your website workspace and try to create a post.
* Tweak the configuration file to suit your needs. You can create multiple collections and singles.

## Basics

You'll have to learn some concepts before diving deep into Hokus. But don't worry, they are very easy to master.

### Website Configuration File

The website configuration files are stored in your *home/username/Hokus* folder.
You can have multiple websites, each having their own configuration file. _\(Like config.websiteone1.json, config.websiteone2.json...\)_

A minimal website configuration file looks like this:

```
{   
  "name": "Hokus Website", /* your website friendly name */
  "key": "hokus-website", /* your website unique key */
  "source": { /* where your website workspaces will come from */
    "type": "folder", /* every source has a type but for now we only have the folder type */
    "path": "D:/Projects/hokus-website/" /* an absolute path to your website folder */
  },
  "publish": [ /* configurations used to server your workspaces to use with Hugo executable */
    {
      "key": "default",
      "config": {
        "type": "folder",
        "path": "D:\\website-output-path\\"
      }
    }
  ]       
}
```

Note that your website configuration can be stored as a JSON, YAML or TOML file.

### Workspace Configuration File

All the UI configurations and bindings are set in the workspace configuration file.

* The workspace configuration file must be placed at the root of your Hugo website.
* It should be versioned under the same vcs _\(version control system\)_ as your website.

Here is where the UI configuration happens.

For a minimal configuration file, see the default workspace configuration (which is auto created when you open a workspace without configuration), slightly changed:

```
{
  "hugover": "0.35",
  "serve":[
    "key":"default",
    "config":"config.toml"
  ],
  "build":[
    "key":"default",
    "config":"config.toml"
  ],
  "collections":[
    {
      "key": "posts", /* a unique key */
      "title": "Posts", /* a friendly title for your menu item */
      "folder": "content/posts/", /* relative path to a list of page bundles */
      "extension": "md", /* md|html|json|toml|yaml */
      "dataformat": "yaml", /* yaml|json|toml */
      "itemtitle": "Post", /* a title for a single item of the collection */
      "fields": /* here you will set up your UI binded to the collection */
      [
        { "type":"info", "content":"# Info\nYou can write custom instructions here." },
        { "key":"title", "title":"Title", "type":"string" },
        { "key":"mainContent", "title":"Content", "type":"markdown" },
        { "key":"pubdate", "title":"Pub Date", "type":"date" },
        { "key":"draft", "title":"Draft", "type":"boolean" },
        { "key":"bundle-manager", "type":"bundle-manager", "resourcetype":"img", "path":"imgs", "extensions: ["png","jpg","gif"], "fields":[
            { "key":"title", "title":"Title", "type":"string" },
            { "key":"description", "title":"Description", "type":"string", "multiLine":true }
          ]
        }
      ]
    }
  ],
  "singles":[
    {
      "key": "mainConfig", /* a unique key */
      "title": "Main Config", /* a friendly title for your menu item */
      "file": "config.yaml", /* a relative path to your file. "somePath/yourfilename.(md|html|json|toml|yaml)" */
      "fields":[
        { "key":"title", "title":"Site Title", "type":"string" }
        { "key":"params", "title":"Params", "type":"nest", fields: [
          //... more fields
        ]}
      ]
    }
  ]
}
```

Note that your workspace configuration can be stored as a JSON, YAML or TOML file.

### Fields

Collections and singles configurations have a property named "fields" where you must provide an array of field configurations.

Each field must use one of the available Hokus components by setting a "type" property. The current types list is below:

* accordion
* boolean
* bundle-manager
* chips
* code-editor
* date
* leaf-array
* hidden
* markdown
* nest
* number
* readonly
* section
* select
* string

Some components have a "field" or "fields" property, allowing for nesting and composition.

To see the components in action, you can access our [Forms Cookbook](http://formscookbook.hokus.io.s3-website-us-east-1.amazonaws.com/). For quick reference. _\(the Forms Cookbook is also included in the desktop app.\)_

You can also refer to the source code to see all available properties for each component type.

### More Concepts

More concepts are yet to come, but with those already given, and by looking into the Forms Cookbook, you should now be ready to use Hokus CMS.

## Building on Linux

There isn't an official release for Linux yet, but you can download the source code and try to compile the project in your environment.

Keep in mind that some errors may occur.

The following steps were reported to work on Ubuntu 18.04:

- Install NodeJS: ```sudo apt-get install nodejs```
- Install NPM: ```sudo apt-get install npm```
- Install libssl-dev: ```sudo apt-get install libssl-dev```
- Set the current directory to the root directory. ```cd hokus```
- Run: ```sudo npm install --build-from-source```
- Run: ```npm run dist-linux```

## Building on macOS

We are looking for candidates to help with that. Be the first.

## Help Wanted

Right now, Hokus is almost a one-man project. When I (Juliano Appel Klein) started to develop it, I was trying to create a simple tool to let customers edit their Hugo websites. But soon I figured out this was not a simple task.

I believe Hokus can become a great project. The Hugo community is large and there is a lack os simple tools to use.

If you want to contribute, please let me know. You can [create an issue](https://github.com/julianoappelklein/hokus/issues) or reach me through the website [contact page](https://www.hokus.io/contact/).

## Vision

The desired workflow for Hokus is:

* Someone installs Hokus and opens it.
* A list of existent Hugo website templates ("Hokus-ready") are listed for selection.
* The user select the desired template and the website is downloaded.
* Right from the start, the user can create posts without hassle.
* The user selects a way to version the content and a place to publish it, just providing minimal configurations.

## Development Stack

* Node JS
* Electron
* React (using create-react-app)
* Flow
* Material UI for react
