import { LayoutDashboard, Plus, LogOut, Dumbbell } from 'lucide-react';

interface SidebarProps {
  selectedTab: 'dashboard' | 'lesson';
  setSelectedTab: (tab: 'dashboard' | 'lesson') => void;
  onAddTechnique: () => void;
  onLogout: () => void;
  userEmail?: string | null;
}

export default function Sidebar({
  selectedTab,
  setSelectedTab,
  onAddTechnique,
  onLogout,
  userEmail
}: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 font-sans text-slate-700">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold uppercase tracking-wider text-slate-900 text-sm">
            Dojo Portal BJJ
          </span>
        </div>
      </div>

      {/* Main Navigation (Dashboard) */}
      <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        <button
          onClick={() => {
            setSelectedTab('dashboard');
          }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            selectedTab === 'dashboard'
              ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-blue-600" />
          <span>Painel Geral</span>
        </button>
      </div>

      {/* Bottom Actions (User details, Add technique button, Logout) */}
      <div className="p-4 border-t border-slate-200 space-y-3 shrink-0">
        <button
          onClick={onAddTechnique}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer text-xs uppercase tracking-wider shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Posição</span>
        </button>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col min-w-0 max-w-[150px]">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
              Usuário ativo
            </span>
            <span className="text-xs font-bold text-slate-700 truncate" title={userEmail || ''}>
              {userEmail || 'bjj_student@gmail.com'}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
