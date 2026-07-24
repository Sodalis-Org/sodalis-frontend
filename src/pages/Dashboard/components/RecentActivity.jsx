import { Bell } from 'lucide-react'
import { NOTIF_ICONS } from '../../../lib/notifications'
import { timeAgo } from '../../../lib/time'

export default function RecentActivity({ notifications }) {
  return (
    <section>
      <h2 className="text-base font-bold text-foreground mb-3">Activité récente</h2>

      {notifications.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm p-6 text-center">
          <Bell size={28} aria-hidden="true" className="mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Aucune activité récente</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif, i) => (
            <div
              key={notif.id ?? notif._id ?? i}
              className="bg-card rounded-2xl shadow-sm p-3.5 flex items-start gap-3"
            >
              <span aria-hidden="true" className="text-lg leading-none mt-0.5 shrink-0">
                {NOTIF_ICONS[notif.type] ?? '📣'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{notif.message}</p>
                {notif.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
