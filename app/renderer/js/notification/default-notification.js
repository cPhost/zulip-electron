'use strict';

const { ipcRenderer } = require('electron');
const ConfigUtil = require('../utils/config-util');

const NativeNotification = window.Notification;
class BaseNotification extends NativeNotification {
	constructor(title, opts) {
		opts.silent = ConfigUtil.getConfigItem('silent') || false;
		super(title, opts);

		this.addEventListener('click', () => {
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
}

module.exports = BaseNotification;
