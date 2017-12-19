'use strict';

const {
  remote: { app }
} = require('electron');

const DarwinNotification = require('./darwin-notifications');
const DefaultNotification = require('./default-notification');

// From https://github.com/felixrieseberg/electron-windows-notifications#appusermodelid
// On windows 8 we have to explicitly set the appUserModelId otherwise notification won't work.
const appId = 'org.zulip.zulip-electron';
app.setAppUserModelId(appId);

window.Notification = DefaultNotification;
if (process.platform === 'darwin') {
	window.Notification = DarwinNotification;
}
