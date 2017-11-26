const test = require('tape')
const setup = require('./setup')
// const SetupSpellChecker = require('../app/renderer/js/spellchecker')

// SetupSpellChecker
test('spellchecker', function (t) {
  t.timeoutAfter(50e3)
  setup.resetTestDataDir()

  function getMochaResults () {
    return window.mochaResults
  }

  const app = setup.createApp()
  setup.waitForLoad(app, t)
  // .then(() => app.client.windowByIndex(1)) // focus on webview
    // .then(() => app.electron.webFrame.setSpellCheckProvider('en-US', true, {
    //   spellCheck(text) {
    //     return !(require('spellchecker').isMisspelled(text))
    //   }
    // }))
    // .then(() => app.electron.remote.getGlobal('foo'))
    // .then((x) => console.log(x))

    // focus on webview
    // .then(() => app.client.setValue('.setting-input-value', 'chat.zulip.org'))
    // .then(() => app.client.click('.server-save-action'))
    // .then(() => app.client.execute(getMochaResults).then((data) => {
    //   return Boolean(data.value)
    // }))
    .then(() => setup.wait(5000))
    // .then(() => app.client.windowByIndex(0)) // Switch focus back to main win
    // .then(() => app.client.windowByIndex(1)) // Switch focus back to org webview
    // .then(() => app.client.waitForExist('//*[@id="id_username"]'))
    .then(() => setup.endTest(app, t),
          (err) => setup.endTest(app, t, err || 'error'))
})

