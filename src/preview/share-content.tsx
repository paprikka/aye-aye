import { Signal } from '@preact/signals'
import styles from './share-content.module.css'
import { SharingFormat } from './format-shareable-links'
import { share } from './share'

export const ShareContent = ({
    isCopyToastVisible,
    formattedShareText,
    sharingFormat,
}: {
    isCopyToastVisible: Signal<boolean>
    formattedShareText: Signal<string>
    sharingFormat: Signal<SharingFormat>
}) => {
    return (
        <div className={styles.container}>
            <textarea value={formattedShareText}></textarea>
            <button
                autoFocus
                className={styles.button}
                onClick={() => {
                    isCopyToastVisible.value = true
                    share(formattedShareText.value).then(() => {
                        setTimeout(() => {
                            isCopyToastVisible.value = false
                        }, 2000)
                    })
                }}
            >
                {isCopyToastVisible.value ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <select
                value={sharingFormat.value}
                onChange={(e) =>
                    (sharingFormat.value = e.currentTarget
                        .value as SharingFormat)
                }
            >
                <option value='links'>Links only</option>
                <option value='links-and-titles'>Links and titles</option>
                <option value='markdown'>Markdown</option>
            </select>
        </div>
    )
}
