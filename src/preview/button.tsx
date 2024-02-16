import { ComponentChildren } from 'preact'
import styles from './button.module.css'
export const Button = ({
    onClick,
    disabled,
    children,
}: {
    onClick: () => void
    disabled?: boolean
    children: ComponentChildren
}) => {
    return (
        <button
            className={styles.container}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    )
}
