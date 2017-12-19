'use strict';

const { ipcRenderer } = require('electron');
const path = require('path');
const notifier = require('node-notifier');
const ConfigUtil = require('../utils/config-util');

const NativeNotification = window.Notification;
const appId = 'org.zulip.zulip-electron';
const icon = path.join(__dirname, '../../../resources/Icon.ico');
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
const holder = {};
class NodeNotification {
	constructor(title, opts) {
		const sound = ConfigUtil.getConfigItem('silent') || false;
		holder.title = title;
		holder.opts = opts;
		holder.sound = sound;

		notifier.notify({
			appName: appId,
			message: opts.body,
			reply: true,
			title,
			sound,
			icon
		}, this.notificationHandler);

		notifier.on('click', () => {
			ipcRenderer.send('focus-app');
		});
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

	notificationHandler(error, response, metadata) {
		if (error) {
			console.log(error);
			// fallback
			const { title, opts, sound } = holder;
			opts.silent = sound;
			const notification = new NativeNotification(title, opts);
			notification.addEventListener('click', () => {
				ipcRenderer.send('focus-app');
			});
			return;
		}

		// clickHandler would always be set by
		// zulip website put in if incase its old server
		// or testing.
		if (clickHandler) {
			clickHandler();
		}

		const reply = metadata.activationValue;
		if (response === 'replied') {
			if (replyHandler) {
				replyHandler(reply);
				return;
			}

			customReply(reply);
		}
	}

	close() {
		return; // eslint-disable-line no-useless-return
	}
}

module.exports = NodeNotification;
