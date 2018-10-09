# Hokus CMS

A CMS for Hugo to run in your computer. **No hosting fees are required**.

[![screenshot](https://www.hokus.io/img/home-video-placeholder.jpg)](https://www.hokus.io/)

For a quick preview, access our website and look for our **preview video**:
https://www.hokus.io/

**Alpha Warning**: Hokus is still a work in progress and some awesome features are not ready. 

## Features

See our features and understand why Hokus is a great tool for your Hugo websites:

* **Run in your computer.** Supported Platforms: Windows, Linux and macOS.
* **Free for commercial use.** Download our binaries today and use it for your own commercial purposes.
* **One click installer.** A breezy to install on your PC.
* **Dozen of ready to use UI components.** Crafted to handle many use cases and complex data hierarchy.
* **Clean UI.** Clearly understand what you are doing without any clutter or confusion. Open Source.
* **MIT license.** Copy, edit, share, redistribute.
* **Build User Interfaces Easily.** Just create a small configuration file (JSON, TOML and YAML are supported).

*Some of the features may be under development.*

## Current State

**You can use Hokus for some workflows right now**. It is fully ready to manage local Hugo websites (the folders can be shared in the same network or by a third party software, like Google Drive). Git integrations or AWS sync are not ready yet.

Start today, [download our binaries for Windows 10 (x64)](https://github.com/julianoappelklein/hokus/releases), install Hokus in your PC and set up a website within seconds by using our wizard.

Just keep in mind that **Hokus will be much more** in the future.

## Getting Started

* [Download the binaries - Windows 10 (x64)](https://github.com/julianoappelklein/hokus/releases). To run in Linux or Mac, see next topic below.
* Install it.
* Open Hokus.
* Configure a new website (at the moment, the only option is to point to a root of a local Hugo website - the Folder Source).
* A default configuration (hokus.yaml) will be placed at the root of your website. After this, open your website workspace and try to create a post.
* Tweek the config to sweet your needs. You can create more collections and singles.

## Basics

You'll have to learn some concepts before deep diving in Hokus. But don't worry, they are very easy to master.

### Website Configuration File

The website configuration file live under your *home/username/Hokus* folder.
You can have many websites, each having their own file. Like config.websiteone1.json, config.websiteone2.json...

A minimal website configuration looks like this:

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
        "path": "D:\\website-ouput-path\\"
      }
    }
  ]       
}
```

Note that your website configuration can be a JSON, YAML or a TOML file.

All the UI configuration and binding is set in another file: the workspace configuration file.

### Workspace Configuration File

The workspace configuration file must be placed at the root of your Hugo website. It should be versioned under the same version control system of your website.

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

Note that your workspace configuration can be a JSON, YAML or a TOML file.

### Fields

Collections and singles configurations have a property named "fields" where you must provide an array of field configurationss.

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

Some components have a property "fields" also (or just "field") allowing nesting and composition.

To see the components in action, you can access our [Forms Cookbook](http://formscookbook.hokus.io.s3-website-us-east-1.amazonaws.com/). For quick references, the Forms Cookbook is also included in the desktop app.

You can also refer to the source code to see all available properties in each component type.

### More Concepts

More concepts are yet to come, but with those already given, and looking into the Forms Cookbook, you are ready to use Hokus CMS.

## Running In Linux or Mac

You can download the source code and try to compile the project in your enviroment.

Keep in mind that some errors may occur.

## Help Wanted

Right now, Hokus is almost a one-man project. When I (Juliano Appel Klein) started to develop it, I was trying to create a simple tool to let customers edit their Hugo websites. But soon I figured out this was not a simple task.

I believe Hokus can become a great project. The Hugo community is large and there is a lack os simple tools to use.

If you want to contribute, please let me know.

## Vision

The desired workflow for Hokus is:

* Someone installs Hokus and opens it.
* A list of existent Hugo website templates ("Hokus-ready") are listed for selection.
* The user select the desired template and the website is downloaded.
* Right away, the user starts to create posts.
* The user selects a way to version the content and a place to publish it, just providing minimal configurations.

## Development Stack

* Node JS
* Electron
* React (using create-react-app)
* Flow
* Material UI for react
