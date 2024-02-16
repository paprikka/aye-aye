import { Signal } from '@preact/signals'
import { LinkEntry } from './types'
import styles from './links.module.css'

export const Links = ({
    links,
    selectedLink,
}: {
    links: Signal<LinkEntry[]>
    selectedLink: Signal<LinkEntry | null>
}) => {
    return (
        <ul className={styles.container}>
            {links.value.map((link) => {
                return (
                    <li class={link.isIgnored ? styles.linkIsIgnored : ''}>
                        <button
                            className={`${styles.selectLink} ${
                                link === selectedLink.value
                                    ? styles.selectedLinkActive
                                    : ''
                            }`}
                            onClick={() => (selectedLink.value = link)}
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
