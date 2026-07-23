import { clsx } from 'clsx'
import { getInitials, getAvatarColorClass } from '../lib/avatar'

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export default function Avatar({ name, size = 'md' }) {
  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-semibold shrink-0',
        getAvatarColorClass(name),
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
      )}
    >
      {getInitials(name)}
    </div>
  )
}
