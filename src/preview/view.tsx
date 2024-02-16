import { useComputed, useSignal } from '@preact/signals'
import { render } from 'preact'
import { useEffect } from 'preact/hooks'
import { Dialog } from './dialog'
import { SharingFormat, formatShareableLinks } from './format-shareable-links'
import { linksFromDOM } from './links-from-dom'
import { QuitButton } from './quit-button'
import { ShareContent } from './share-content'
import { LinkEntry, PageDescription } from './types'
import styles from './view.module.css'
import { Links } from './links'

const getHTMLContent = (): Promise<LinkEntry[]> =>
    new Promise((resolve) => {
        window.addEventListener(
            'message',
            (event) => {
                resolve(linksFromDOM(event.data as PageDescription))
            },
            { once: true }
        )

        window.parent.postMessage('ayeaye::ready', '*')
    })

export const init = () => {
    function App() {
        useEffect(() => {
            getHTMLContent().then((newLinks) => {
                links.value = newLinks
            })
        }, [])
        const links = useSignal<LinkEntry[]>([])
        const selectedLink = useSignal<LinkEntry | null>(null)
        const shareableLinks = useComputed(() => {
            return links.value.filter((link) => !link.isIgnored)
        })

        const isShareSheetVisible = useSignal(false)
        const sharingFormat = useSignal<SharingFormat>('links')
        const formattedShareText = useComputed(() => {
            if (!isShareSheetVisible.value) return ''
            return formatShareableLinks(
                sharingFormat.value,
                shareableLinks.value
            )
        })

        const isCopyToastVisible = useSignal(false)

        return (
            <div className={styles.container}>
                <nav className={styles.links}>
                    <Links links={links} selectedLink={selectedLink} />
                </nav>

                <div className={styles.preview}>
                    {selectedLink.value ? (
                        <iframe src={selectedLink.value.href}></iframe>
                    ) : (
                        <p>Select a link to preview</p>
                    )}
                </div>

                <div className={styles.topBar}></div>
                <div className={styles.navBar}>
                    <button class={styles.button}>←</button>
                    <button
                        class={styles.button}
                        onClick={() => {
                            isShareSheetVisible.value = true
                        }}
                    >
                        Share
                    </button>
                    <button class={styles.button}>→</button>
                </div>

                <Dialog title='Share' isVisible={isShareSheetVisible}>
                    <ShareContent
                        isCopyToastVisible={isCopyToastVisible}
                        formattedShareText={formattedShareText}
                        sharingFormat={sharingFormat}
                    />
                </Dialog>

                <QuitButton />
            </div>
        )
    }

    const root = document.getElementById('root')
    render(<App />, root!)
}
