import styles from './quit-button.module.css'

export const QuitButton = () => {
    return (
        <button
            className={styles.container}
            onClick={() => {
                window.parent.postMessage('ayeaye::quit', '*')
            }}
            aria-label='quit'
        ></button>
    )
}
