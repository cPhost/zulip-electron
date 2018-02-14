const isOnline = require('is-online');

class ReconnectUtil {
	constructor(serverManagerView) {
		this.serverManagerView = serverManagerView;
		this.alreadyReloaded = false;
	}

	clearState() {
		this.alreadyReloaded = false;
	}

	pollInternetAndReload() {
		const pollInterval = setInterval(function () {
      this._checkAndReload()
      .then(status => {
        if (status) {
          this.alreadyReloaded = true;
          clearInterval(pollInterval);
        }
      });
		}, 1500);
	}

	_checkAndReload() {
		if (!this.alreadyReloaded) {
			isOnline()
      .then(online => {
        if (online) {
          if (!this.alreadyReloaded) {
            this.serverManagerView.reloadView();
          }
          return Promise.resolve(true);
        }

        const errMsgHolder = document.querySelector('#description');
        errMsgHolder.innerHTML = `
                  <div>You internet connection does't seem to work properly!</div>
                  </div>Verify that it works and then click try again.</div>`;
        return Promise.resolve(false);
      });
		}
	}
}

module.exports = ReconnectUtil;
