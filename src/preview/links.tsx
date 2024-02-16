import { Signal, useSignalEffect } from '@preact/signals'
import { LinkEntry } from './types'
import styles from './links.module.css'
import { useEffect, useRef } from 'preact/hooks'

export const Links = ({
    links,
    selectedLink,
}: {
    links: Signal<LinkEntry[]>
    selectedLink: Signal<LinkEntry | null>
}) => {
    const containerEl = useRef<HTMLUListElement>(null)

    useSignalEffect(() => {
        if (!containerEl.current) return
        const index = links.value.indexOf(selectedLink.value)
        const targetEl = containerEl.current.children[index] as HTMLElement
        if (!targetEl) return
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })

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
