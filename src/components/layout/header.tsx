interface HeaderProps {
    user: any
  }
  
  export function Header({ user }: HeaderProps) {
    return (
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user.email}
          </span>
        </div>
      </header>
    )
  }