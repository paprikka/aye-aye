;(async () => {
    const make = () => {
        const frame = document.createElement('iframe')
        frame.classList.add(`ayeaye__frame`)
        frame.allow = 'clipboard-write'
        frame.src = chrome.runtime.getURL('preview.html')

        const dialogElement = document.createElement('dialog')
        dialogElement.classList.add('ayeaye__dialog')

        dialogElement.appendChild(frame)
        document.body.appendChild(dialogElement)

        const onPreviewMessage = (event: MessageEvent) => {
            console.log({ event })
            if (event.data === 'ayeaye::quit') {
                api.dispose()
            }
            if (event.data === 'ayeaye::ready') {
                const html = document.querySelector('body')!.innerHTML
                frame.contentWindow!.postMessage(
                    {
                        htmlContent: html,
                        baseURL: window.location.href,
                    },
                    '*',
                )
            }
        }

        const api = {
            show: () => {
                window.addEventListener('message', onPreviewMessage)
                dialogElement.showModal()
            },
            hide: () => {
                dialogElement.close()
            },
            dispose: () => {
                // we could use {once: true} in addEventListener, but this way we can
                // support lifereload when testing the page without setting up an entire
                // test env.
                window.removeEventListener('message', onPreviewMessage)
                api.hide()
                dialogElement.remove()
            },
        }

        return api
    }

    if ('ayeaye' in window) {
        ;(window as any).ayeaye.dispose()
    }

    ;(window as any).ayeaye = make()
    ;(window as any).ayeaye.show()
})()
