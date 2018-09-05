# Hokus CMS

A CMS for Hugo to run in your computer.

For a quick preview, access our website and look for our **preview video**:
https://www.hokus.io/

**Alpha Warning**: Hokus is still a work in progress and some important features are not ready. 

## Features

See our features (copied from our website) and understand why Hokus is a great tool for your Hugo websites:

* Run in your computer.
* Supported Platforms: Windows, Linux and macOS. Free for commercial use.
* Download our binaries today and use it for your own commercial purposes. One click installer.
* A breezy to install on your PC. Dozen of ready to use components.
* Crafted to handle many use cases and complex data hierachy. Clean UI.
* Clearly understand what you are doing without any clutter or confusion. Open Source.
* MIT license. Copy, edit, share, redistribute. Build User Interfaces Easily.
* Just create a small configuration file (JSON, TOML and YAML are supported).

## Current State

Hokus is not ready to use, but you can [download our binaries right now](https://s3.amazonaws.com/hokus.io/hokus-cms-win-x64.exe) to try it and then understand what problems Hokus propose to solve.

## Getting Started

* [Download the binaries (only for Windows)](https://s3.amazonaws.com/hokus.io/hokus-cms-win-x64.exe) (to run in Linux or Mac, see below).
* Install it.
* Open Hokus.
* Configure a new website (at the moment, the only option is to point to a root of a local Hugo website - the Folder Source).
* A default configuration (hokus.yaml) will be placed at the root of your website. After this, you are ready to create a post.
* Tweek the config to sweet your needs. You can create more collections and singles.

## Running In Linux or Mac

You can download the source code and compile the project in your enviroment.
If you want, you could send me the compiled binaries for sharing.

## Help Wanted

Right now, Hokus is a one-man project. When I (Juliano Appel Klein) started to develop it, I was trying to create a simple tool to let customers edit their Hugo websites. But soon I figured out this was not a simple task.

I believe Hokus can become a great project. The Hugo community is large and there is a lack os simple tools to use.

If you want to contribute, please let me know.

## Vision

The foreseen workflow for Hokus is:

* Someone installs Hokus and opens it.
* A list of existent Hugo website templates ("Hokus-ready") are listed for selection.
* The user select the desired template and the website is downloaded
* The user can create posts, right away.
* The user select a way to version the content and a place to publish it, just providing minimal configurations.

## Development Stack

* Node JS
* Electron
* React (using create-react-app)
* Flow
* Material UI for react