const {app, BrowserWindow} = require('electron')
  const path = require('path')
  const url = require('url')
  
  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 1200, height: 800})
  
    // and load the index.html of the app.
    //win.loadURL('index.html')
    win.loadURL(`file://${__dirname}/index.html?devtype=harmen`);   
  }
  
  app.on('ready', createWindow)
