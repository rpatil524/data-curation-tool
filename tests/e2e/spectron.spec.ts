import testWithSpectron from 'vue-cli-plugin-electron-builder/lib/testWithSpectron'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.should()
chai.use(chaiAsPromised)

describe('Application launch', function () {
  this.timeout(120000)

  let app: any
  let stopServe: any

  before(() => {
    return testWithSpectron().then((instance: any) => {
      app = instance.app
      stopServe = instance.stopServe
    })
  })

  before(() => {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
  })

  after(() => {
    if (app && app.isRunning()) {
      return stopServe()
    }
  })

  it('Should check the number of windows', () => {
    return app.client.getWindowCount().should.eventually.equal(3)
  })

  // TODO: Update using spectron switchWindow()
  it('Should check background invisible windows titles', () => {
    return app.client.getWindowCount().then(async windowCount => {
      const windowPromiseList = []
      for (let i = 0; i < windowCount; i++) {

        const window = app.client.windowByIndex(i)
        const title = await window.browserWindow.getTitle()
        const isVisible = await window.browserWindow.isVisible()

        windowPromiseList.push(new Promise(resolve => {
          resolve({title, isVisible})
        }))
      }

      return (new Promise(resolve => {
        resolve(
          Promise.all(windowPromiseList)
            .then(res => {
              return res.filter((_) => _.title.startsWith('bg') && _.isVisible === false).length
            })
        )
      })).should.eventually.equal(windowCount - 1)
    })
  })

})
