import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Button } from './Button';
import { Lock, Save, X, User, Calendar, FileText, Pill, ShieldAlert } from 'lucide-react';

interface ChildProfileProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

export const ChildProfile: React.FC<ChildProfileProps> = ({ profile, onSave, onClose }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState<UserProfile>(profile);

  useEffect(() => {
    // If no PIN is set (first time), unlock automatically to set it up
    if (!profile.securityPin) {
      setIsUnlocked(true);
    }
  }, [profile.securityPin]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === profile.securityPin || (!profile.securityPin && pinInput === '0000')) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError('PIN incorreto.');
      setPinInput('');
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (formData.securityPin.length < 4) {
      alert("Por favor, defina um PIN com pelo menos 4 dígitos.");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Área Protegida</h2>
          <p className="text-sm text-slate-500 mb-6">Digite o PIN para acessar os dados sensíveis.</p>
          
          <form onSubmit={handleUnlock}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-32 text-center text-3xl tracking-widest font-bold border-b-2 border-slate-300 focus:border-brand-500 focus:outline-none py-2 mb-4 text-slate-800"
              placeholder="••••"
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
            
            <div className="flex gap-2 justify-center mt-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Acessar</Button>
            </div>
            
            {/* Helper for MVP */}
            {!profile.securityPin && (
              <p className="text-xs text-slate-400 mt-4">PIN padrão inicial: 0000</p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            Perfil do Paciente
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 ml-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 ml-1">Data de Nascimento</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 ml-1">Diagnóstico / CID (Opcional)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.diagnosis || ''}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
                placeholder="Ex: TEA, TDAH..."
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 ml-1">Medicamentos em uso</label>
            <div className="relative">
              <Pill className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea
                value={formData.medications || ''}
                onChange={(e) => handleChange('medications', e.target.value)}
                placeholder="Lista de medicamentos e horários..."
                rows={3}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t mt-4">
             <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 ml-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Alterar PIN de Acesso
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={formData.securityPin}
                onChange={(e) => handleChange('securityPin', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none tracking-widest font-mono"
                placeholder="0000"
              />
              <p className="text-[10px] text-slate-400 ml-1">Use 4 dígitos numéricos.</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} icon={<Save className="w-4 h-4" />}>Salvar Dados</Button>
        </div>

      </div>
    </div>
  );
};