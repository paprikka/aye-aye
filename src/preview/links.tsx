import { Signal, useSignalEffect } from '@preact/signals'
import { useRef } from 'preact/hooks'
import { Button } from './button'
import styles from './links.module.css'
import { LinkEntry } from './types'

export const Links = ({
    links,
    selectedLink,
    onLoadAllLinks,
}: {
    links: Signal<LinkEntry[]>
    selectedLink: Signal<LinkEntry | null>
    onLoadAllLinks: () => void
}) => {
    const containerEl = useRef<HTMLUListElement>(null)

    useSignalEffect(() => {
        if (!selectedLink.value) return
        if (!containerEl.current) return
        const index = links.value.indexOf(selectedLink.value)
        const targetEl = containerEl.current.children[index] as HTMLElement
        if (!targetEl) return
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })

    if (links.value.length === 0) {
        return (
            <div class={styles.noLinksPlaceholder}>
                <h3>No links found</h3>
                <p>
                    I tried to be clever and ignore potentially useless links.
                    <br />
                    Click the button below to load all links.
                </p>
                <br />
                <Button onClick={onLoadAllLinks}>
                    Stop being clever, load all links
                </Button>
            </div>
        )
    }

    return (
        <ul className={styles.container} ref={containerEl}>
            {links.value.map((link) => {
                return (
                    <li
                        class={link.isIgnored ? styles.linkIsIgnored : ''}
                        data-active={
                            selectedLink.value === link ? true : undefined
                        }
                    >
                        <button
                            className={`${styles.selectLink} ${
                                link === selectedLink.value
                                    ? styles.selectedLinkActive
                                    : ''
                            }`}
                            onClick={(e) => {
                                const elementRect =
                                    e.currentTarget.getBoundingClientRect()
                                const isElementAboveFold = elementRect.top < 0
                                const isElementBelowFold =
                                    elementRect.bottom > window.innerHeight

                                if (isElementAboveFold || isElementBelowFold) {
                                    e.currentTarget.scrollIntoView()
                                }
                                selectedLink.value = link
                            }}
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
    )
}
