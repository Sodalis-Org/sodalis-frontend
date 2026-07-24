import { Star, Heart } from 'lucide-react'
import { clsx } from 'clsx'
import Avatar from '../../../components/Avatar'

export default function TopColocs({ members }) {
  const ranked = [...members].sort((a, b) => (b.harmony_score + b.karma_score) - (a.harmony_score + a.karma_score))

  return (
    <section>
      <h2 className="text-base font-bold text-foreground mb-3">Top Colocs</h2>
      <div className="flex flex-col gap-2">
        {ranked.map((member, i) => (
          <div key={member.id} className="bg-card rounded-2xl shadow-sm p-3.5 flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar name={member.name} size="sm" />
              <span
                aria-hidden="true"
                className={clsx(
                  'absolute -top-1 -left-1 w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center',
                  i === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {i + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                {member.role === 'ADMIN' && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium shrink-0">Admin</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground shrink-0">
              <span className="flex items-center gap-1"><Star size={11} aria-hidden="true" className="text-primary" />{member.harmony_score}</span>
              <span className="flex items-center gap-1"><Heart size={11} aria-hidden="true" className="text-accent-foreground" />{member.karma_score}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
