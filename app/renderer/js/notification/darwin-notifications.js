'use strict';

const { ipcRenderer, remote } = require('electron');
const ConfigUtil = require('../utils/config-util');

function checkElements(...elements) {
	let status = true;
	elements.forEach(element => {
		if (element === null || element === undefined) {
			status = false;
		}
	});
	return status;
}

function customReply(reply) {
	// server does not support notification reply yet.
	const buttonSelector = '.messagebox #send_controls button[type=submit]';
	const messageboxSelector = '.selected_message .messagebox .messagebox-border .messagebox-content';
	const textarea = document.querySelector('#compose-textarea');
	const messagebox = document.querySelector(messageboxSelector);
	const sendButton = document.querySelector(buttonSelector);

	// sanity check for old server versions
	const elementsExists = checkElements(textarea, messagebox, sendButton);
	if (!elementsExists) {
		return;
	}

	textarea.value = reply;
	messagebox.click();
	sendButton.click();
}

let replyHandler;
let clickHandler;
const MacNotification = remote.getBuiltin('Notification');
class NodeNotification {
	constructor(title, opts) {
		const silent = ConfigUtil.getConfigItem('silent') || false;
		opts = Object.assign({
			hasReply: true,
			replyPlaceholder: 'Enter reply',
			title,
			silent
		}, opts);

		const notification = new MacNotification(opts);
		notification.on('click', () => {
			ipcRenderer.send('focus-app');
		});

		notification.on('reply', this.notificationHandler);
		notification.show();
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

	notificationHandler(event, response) {
		// clickHandler would always be set by
		// zulip website put in if incase its old server
		// or testing.
		if (clickHandler) {
			clickHandler();
		}

		if (replyHandler) {
			replyHandler(response);
			return;
		}

		customReply(response);
	}

	close() {
		return; // eslint-disable-line no-useless-return
	}
}

module.exports = MacNotification.isSupported() ? NodeNotification : false;
