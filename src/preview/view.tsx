import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import styles from './view.module.css'
import { linksFromDOM } from './links-from-dom'
import { LinkEntry, PageDescription } from './types'
import { useComputed, useSignal } from '@preact/signals'
import { Dialog } from './dialog'
import { SharingFormat, formatShareableLinks } from './format-shareable-links'
import { share } from './share'
import { ShareContent } from './share-content'
import { QuitButton } from './quit-button'

const getHTMLContent = (): Promise<LinkEntry[]> =>
    new Promise((resolve) => {
        window.addEventListener(
            'message',
            (event) => {
                resolve(linksFromDOM(event.data as PageDescription))
            },
            { once: true },
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
                shareableLinks.value,
            )
        })

        const isCopyToastVisible = useSignal(false)

        return (
            <div className={styles.container}>
                <nav className={styles.links}>
                    <ul>
                        {links.value.map((link) => {
                            return (
                                <li
                                    class={
                                        link.isIgnored
                                            ? styles.linkIsIgnored
                                            : ''
                                    }
                                >
                                    <button
                                        className={`${styles.selectLink} ${
                                            link === selectedLink.value
                                                ? styles.selectedLinkActive
                                                : ''
                                        }`}
                                        onClick={() =>
                                            (selectedLink.value = link)
                                        }
                                    >
                                        {link.text}
                                    </button>

                                    <input
                                        type='checkbox'
                                        aria-label={
                                            link.isIgnored
                                                ? 'Unignore this link'
                                                : 'Ignore this link'
                                        }
                                        checked={!link.isIgnored}
                                        onChange={() => {
                                            // set the link to be ignored
                                            link.isIgnored = !link.isIgnored
                                            links.value = [...links.value]
                                        }}
                                        className={styles.ignoreLink}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                <div className={styles.preview}>
                    {selectedLink.value ? (
                        <iframe src={selectedLink.value.href}></iframe>
                    ) : (
                        <p>Select a link to preview</p>
                    )}
                </div>

                <button
                    class={styles.shareLinksButton}
                    onClick={() => {
                        isShareSheetVisible.value = true
                    }}
                >
                    Copy {shareableLinks.value.length} links
                </button>

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
