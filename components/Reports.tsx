import React, { useEffect, useState } from 'react';
import { Note, NoteType, UserProfile } from '../types';
import { generateReport } from '../services/geminiService';
import { Button } from './Button';
import { Download, ArrowLeft, Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface ReportsProps {
  notes: Note[];
  userProfile: UserProfile;
  onBack: () => void;
}

export const Reports: React.FC<ReportsProps> = ({ notes, userProfile, onBack }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calculate age helper
  const calculateAge = (birthDateString: string): string => {
    if (!birthDateString) return '';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const age = calculateAge(userProfile.birthDate);

  useEffect(() => {
    const fetchReport = async () => {
      if (notes.length === 0) {
        setLoading(false);
        return;
      }
      const data = await generateReport(notes);
      setReportData(data);
      setLoading(false);
    };
    fetchReport();
  }, [notes]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-4" />
        <p>Gerando relatório inteligente...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500 mb-4">Dados insuficientes para gerar relatório.</p>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      {/* No-print header */}
      <div className="bg-white border-b sticky top-0 z-10 p-4 flex justify-between items-center print:hidden shadow-sm">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <h1 className="font-semibold text-slate-800">Relatório Clínico</h1>
        <Button variant="primary" size="sm" onClick={handlePrint}>
          <Download className="w-4 h-4 mr-1" /> PDF
        </Button>
      </div>

      <div className="max-w-3xl mx-auto p-6 sm:p-10 bg-white shadow-sm my-4 sm:my-8 print:shadow-none print:m-0 print:p-0">
        
        {/* Report Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Relatório de Evolução</h1>
              <div className="mt-2 text-slate-800 space-y-1">
                 <p><span className="font-semibold text-slate-500 text-xs uppercase tracking-wide">Paciente:</span> {userProfile.name || 'Não informado'}</p>
                 {age && <p><span className="font-semibold text-slate-500 text-xs uppercase tracking-wide">Idade:</span> {age} anos</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Data de Emissão</p>
              <p className="font-medium text-slate-700">{new Date().toLocaleDateString()}</p>
              <p className="text-xs text-slate-400 mt-2">Período</p>
              <p className="font-medium text-slate-700">Últimos 30 dias</p>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="mb-8 bg-brand-50 p-6 rounded-xl border border-brand-100 print:bg-white print:border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-800 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Resumo Executivo
          </h2>
          <p className="text-slate-700 leading-relaxed text-justify">
            {reportData.executiveSummary}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Triggers */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Gatilhos Identificados</h3>
            <ul className="space-y-2">
              {reportData.topTriggers?.map((trigger: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                  <span className="bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">{i+1}</span>
                  {trigger}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 border-b pb-2">Sugestões de Intervenção</h3>
            <ul className="space-y-2">
              {reportData.recommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Selected Notes Table for Context */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Registros de Destaque</h3>
          <div className="space-y-3">
             {notes.slice(0, 5).map(note => (
               <div key={note.id} className="text-sm border-l-2 pl-4 py-1" style={{ borderColor: note.type === NoteType.EPISODE ? '#f43f5e' : '#cbd5e1' }}>
                 <div className="flex gap-2 mb-1 text-xs text-slate-500">
                   <span className="font-semibold text-slate-700">{new Date(note.timestamp).toLocaleDateString()}</span>
                   <span>•</span>
                   <span className="uppercase">{note.type}</span>
                   {note.intensity && <span>• Int: {note.intensity}</span>}
                 </div>
                 <p className="text-slate-700">{note.text}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-12 pt-6 border-t text-xs text-slate-400 text-center">
          <p>Este relatório é um auxílio observacional e <strong>não substitui avaliação ou diagnóstico profissional</strong>.</p>
        </div>

      </div>
    </div>
  );
};