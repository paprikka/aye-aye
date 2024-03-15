import { useComputed, useSignal, useSignalEffect } from '@preact/signals'
import { render } from 'preact'
import { useEffect } from 'preact/hooks'
import { Button } from './button'
import { Dialog } from './dialog'
import { SharingFormat, formatShareableLinks } from './format-shareable-links'
import { Links } from './links'
import { FilterID, linksFromDOM } from './links-from-dom'
import { QuitButton } from './quit-button'
import { ShareContent } from './share-content'
import { LinkEntry, PageDescription } from './types'
import styles from './view.module.css'
import { usePersistence } from './persistence'

let cachedPageDescription: PageDescription | null = null
const getHTMLContent = (
    filter: FilterID
): Promise<{
    links: LinkEntry[]
    pageURL: string
}> =>
    new Promise((resolve) => {
        if (cachedPageDescription) {
            resolve({
                links: linksFromDOM(cachedPageDescription, filter),
                pageURL: cachedPageDescription.baseURL,
            })

            return
        }

        window.addEventListener(
            'message',
            (event) => {
                // TODO: handle invalid event types
                cachedPageDescription = event.data as PageDescription
                resolve({
                    links: linksFromDOM(cachedPageDescription, filter),
                    pageURL: cachedPageDescription.baseURL,
                })
            },
            { once: true }
        )

        window.parent.postMessage('ayeaye::ready', '*')
    })

export const init = () => {
    function App() {
        useEffect(() => {
            loadLinks('readability')
        }, [])

        const persistence = usePersistence()

        const loadLinks = (filter: FilterID) => {
            getHTMLContent(filter).then((content) => {
                const newLinks = content.links
                links.value = newLinks

                persistence.init(content.pageURL)
                const ignoredLinkdIDs = persistence.load()

                links.value = newLinks.map((newLink) => {
                    if (!ignoredLinkdIDs.has(newLink.href)) return newLink
                    return { ...newLink, isIgnored: true }
                })

                if (!newLinks.length) return
                selectedLink.value = links.value[0]
            })
        }

        const links = useSignal<LinkEntry[]>([])
        const selectedLink = useSignal<LinkEntry | null>(null)
        const shareableLinks = useComputed(() => {
            return links.value.filter((link) => !link.isIgnored)
        })

        const ignoredLinks = useComputed(() => {
            return links.value.filter((link) => link.isIgnored)
        })

        ignoredLinks.subscribe((newValue) => {
            if (!persistence.isActive.value) return
            persistence.save(newValue)
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

        const gotoPrev = () => {
            if (!selectedLink.value) return
            const prevIndex = links.value.indexOf(selectedLink.value) - 1
            selectedLink.value =
                links.value[prevIndex] || links.value[links.value.length - 1]
        }

        const gotoNext = () => {
            if (!selectedLink.value) return
            const nextIndex = links.value.indexOf(selectedLink.value) + 1
            selectedLink.value = links.value[nextIndex] || links.value[0]
        }

        const canGoToNext = useComputed(() => {
            return (
                selectedLink.value &&
                links.value.includes(selectedLink.value) &&
                links.value.indexOf(selectedLink.value) !==
                    links.value.length - 1
            )
        })

        const canGoToPrev = useComputed(() => {
            return (
                selectedLink.value &&
                links.value.includes(selectedLink.value) &&
                links.value.indexOf(selectedLink.value) !== 0
            )
        })

        const frameLoadingState = useSignal<'loading' | 'complete' | 'idle'>(
            'idle'
        )

        // TODO: remove, this looks shady
        useSignalEffect(() => {
            if (!selectedLink.value) return
            frameLoadingState.value = 'loading'
        })

        const isHelpVisible = useSignal(false)

        return (
            <div className={styles.container}>
                <nav className={styles.links}>
                    <Links
                        onLoadAllLinks={() => loadLinks('allLinks')}
                        links={links}
                        selectedLink={selectedLink}
                    />
                </nav>

                <div className={styles.preview}>
                    {selectedLink.value ? (
                        <iframe
                            onLoad={() => {
                                frameLoadingState.value = 'complete'
                            }}
                            src={selectedLink.value.href}
                        ></iframe>
                    ) : (
                        <p>Select a link to preview</p>
                    )}

                    {selectedLink.value && (
                        <div className={styles.openInNewWindowButton}>
                            <Button
                                onClick={() => {
                                    if (!selectedLink.value) return
                                    window.open(
                                        selectedLink.value.href,
                                        '_blank'
                                    )
                                }}
                            >
                                Open in new tab ↗
                            </Button>
                        </div>
                    )}

                    {frameLoadingState.value === 'loading' ? (
                        <div className={styles.loadingSpinner} />
                    ) : null}
                </div>

                <div className={styles.topBar}></div>
                <div className={styles.navBar}>
                    <Button disabled={!canGoToPrev.value} onClick={gotoPrev}>
                        ←
                    </Button>
                    <Button
                        onClick={() => {
                            isShareSheetVisible.value = true
                        }}
                    >
                        Share
                    </Button>
                    <Button disabled={!canGoToNext.value} onClick={gotoNext}>
                        →
                    </Button>
                    <Button onClick={() => (isHelpVisible.value = true)}>
                        ?
                    </Button>
                </div>

                <Dialog title='Share' isVisible={isShareSheetVisible}>
                    <ShareContent
                        isCopyToastVisible={isCopyToastVisible}
                        formattedShareText={formattedShareText}
                        sharingFormat={sharingFormat}
                    />
                </Dialog>

                <QuitButton />

                <Dialog title='Help' isVisible={isHelpVisible}>
                    <div style='max-width: 20rem'>
                        {' '}
                        <h3>No links found</h3>
                        <p>
                            I try to be clever and ignore potentially useless
                            links. This generally works well, but in some
                            messier sites it can cause issues.
                            <br />
                            Click the button below to load all links.
                        </p>
                        <Button onClick={() => loadLinks('allLinks')}>
                            Stop being clever, load all links
                        </Button>
                        <h3>Still having issues?</h3>
                        <a
                            href={`mailto:hello@sonnet.io?body=${
                                encodeURIComponent(
                                    cachedPageDescription?.baseURL || ''
                                ) + ' is broken.'
                            }`}
                        >
                            {' '}
                            Report a broken page
                        </a>
                        <br />
                        <br />
                        <br />
                        {'❤️'}
                    </div>
                </Dialog>
            </div>
        )
    }

    const root = document.getElementById('root')
    render(<App />, root!)
}
