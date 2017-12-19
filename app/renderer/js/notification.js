'use strict';

const { remote } = require('electron');

const path = require('path');
const notifier = require('node-notifier');

const ConfigUtil = require(__dirname + '/utils/config-util.js');
const { app } = remote;

// From https://github.com/felixrieseberg/electron-windows-notifications#appusermodelid
// On windows 8 we have to explicitly set the appUserModelId otherwise notification won't work.
app.setAppUserModelId('org.zulip.zulip-electron');
const icon = path.join(__dirname, '../../resources/Icon.ico');

function checkElements(a, b) {
	let status = true;
	[a, b].forEach(element => {
		if (element === null || element === undefined) {
			status = false;
		}
	});
	return status;
}

let replyHandler;
let clickHandler;
class baseNotification {
	constructor(title, opts) {
		notifier.notify({
			message: opts.body,
			reply: true,
			title,
			icon
		}, this.notificationHandler);
	}

	static requestPermission() {
		return; // eslint-disable-line no-useless-return
	}

	// Override default Notification permission
	static get permission() {
		return ConfigUtil.getConfigItem('showNotification') ? 'granted' : 'denied';
	}

	set onreply(handler) {
		replyHandler = handler;
	}

	get onreply() {
		return replyHandler;
	}

	set onclick(handler) {
		clickHandler = handler;
	}

	get onclick() {
		return clickHandler;
	}

	static addEventListener(type, handler) {
		if (type === 'reply') {
			replyHandler = handler;
		}

		if (type === 'click') {
			clickHandler = handler;
		}
	}

	notificationHandler(error, response, metadata) {
		if (error) {
			return;
		}

		clickHandler();
		const reply = metadata.activationValue;
		if (response === 'replied') {
			if (replyHandler) {
				replyHandler(reply);
				return;
			}

			// server does not support notification reply yet.
			const buttonSelector = '.messagebox #send_controls button[type=submit]';
			const messageboxSelector = '.selected_message .messagebox .messagebox-border .messagebox-content';
			const textarea = document.querySelector('#compose-textarea');
			const messagebox = document.querySelector(messageboxSelector);
			const sendButton = document.querySelector(buttonSelector);

			// sanity check for old server versions
			const elementsExists = checkElements(textarea, sendButton);
			if (!elementsExists) {
				return;
			}

			textarea.value = reply;
			messagebox.click();
			sendButton.click();
		}
	}

	close() {
		return; // eslint-disable-line no-useless-return
	}
}

window.Notification = baseNotification;
