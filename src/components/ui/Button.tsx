import type { ButtonHTMLAttributes, Ref } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ref,
  ...rest
}: ButtonProps) {
  const variantClass = variant === 'primary' ? styles.primary : styles.secondary
  const classes = className
    ? `${styles.button} ${variantClass} ${className}`
    : `${styles.button} ${variantClass}`

  return <button ref={ref} type={type} className={classes} {...rest} />
}
