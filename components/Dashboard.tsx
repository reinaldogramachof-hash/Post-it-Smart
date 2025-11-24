import React, { useMemo } from 'react';
import { Note, NoteType, UserProfile } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NOTE_TYPE_CONFIG } from '../constants';
import { Bot, Calendar, ArrowRight, Lock, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface DashboardProps {
  notes: Note[];
  userProfile: UserProfile;
  onViewReport: () => void;
  onOpenProfile: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ notes, userProfile, onViewReport, onOpenProfile }) => {

  const chartData = useMemo(() => {
    const last7Days = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('pt-BR', { weekday: 'short' });
    }).reverse();

    const data = last7Days.map(day => {
      const count = notes.filter(n => 
        new Date(n.timestamp).toLocaleDateString('pt-BR', { weekday: 'short' }) === day &&
        n.type === NoteType.EPISODE
      ).length;
      return { day, count };
    });
    return data;
  }, [notes]);

  // Recent high intensity notes
  const alerts = notes
    .filter(n => n.type === NoteType.EPISODE && (n.intensity || 0) >= 4)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 1);

  return (
    <div className="space-y-6 pb-24">
      
      {/* Welcome / Header / Profile Access */}
      <div 
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors group"
        onClick={onOpenProfile}
        title="Clique para acessar dados sensíveis (Senha requerida)"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800">
              {userProfile.name ? `Diário de ${userProfile.name}` : 'Olá, Família'}
            </h1>
            <Lock className="w-3 h-3 text-slate-300 group-hover:text-brand-500 transition-colors" />
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {notes.length === 0 
              ? "Toque para configurar o perfil."
              : `Você registrou ${notes.length} eventos recentemente.`}
          </p>
        </div>
        <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-white group-hover:text-brand-500 transition-all shadow-sm">
           <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* Critical Alert if exists */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900 text-sm">Sugestão de Atenção</h3>
            <p className="text-orange-800 text-xs mt-1">
              Detectamos um episódio de alta intensidade recente. Recomendamos revisar a estratégia de redução de estímulos.
            </p>
          </div>
        </div>
      )}

      {/* Mini Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-slate-800 text-sm">Frequência de Episódios</h2>
          <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">7 dias</span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#f43f5e' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Notes List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-semibold text-slate-800">Últimos Registros</h2>
          <Button variant="ghost" size="sm" onClick={onViewReport} className="text-brand-600">
            Ver Relatório <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {notes.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <p>Nenhuma nota ainda.</p>
          </div>
        )}

        {notes.slice(0, 5).map(note => {
          const Config = NOTE_TYPE_CONFIG[note.type];
          return (
            <div key={note.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${Config.color.split(' ')[0]}`}></div>
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${Config.color}`}>
                    {note.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {note.intensity && (
                   <span className="text-xs font-bold text-slate-400">Int: {note.intensity}/5</span>
                )}
              </div>

              <p className="text-slate-800 text-sm pl-2 mb-2 line-clamp-2">{note.text}</p>

              {/* AI Suggestion Snippet */}
              {note.aiAnalysis?.suggestion && (
                <div className="mt-3 ml-2 bg-slate-50 p-2 rounded-lg border border-slate-100 flex gap-2 items-start">
                  <Bot className="w-3 h-3 text-brand-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-600 italic">"{note.aiAnalysis.suggestion}"</p>
                </div>
              )}

              <div className="flex gap-2 ml-2 mt-2 flex-wrap">
                {note.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};