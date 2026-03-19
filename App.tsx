
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Play, RefreshCw, FileSpreadsheet, Activity, Globe, Cpu, ListChecks } from 'lucide-react';
import { parseExcel, validateRow, generateErrorExcel } from './services/excelService';
import { interpretRules } from './services/geminiService';
import { ProcessingState, AppResults, ValidationRule } from './types';

const App: React.FC = () => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [rulesFile, setRulesFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle', message: '' });
  const [results, setResults] = useState<AppResults | null>(null);
  const [progress, setProgress] = useState(0);
  const [useRemoteApi, setUseRemoteApi] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api/validate');

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleRulesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRulesFile(e.target.files[0]);
      setResults(null);
    }
  };

  const startValidation = async () => {
    if (!excelFile || !rulesFile) return;

    try {
      if (useRemoteApi) {
        setProcessing({ status: 'parsing-rules', message: 'Uploading to remote server...' });
        setProgress(20);
        const formData = new FormData();
        formData.append('excel', excelFile);
        formData.append('rules', rulesFile);
        const response = await fetch(apiUrl, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const apiData = await response.json();
        setProgress(100);
        setResults({ ...apiData, fileName: excelFile.name, interpretedRules: apiData.interpretedRules || [] });
      } else {
        setProgress(10);
        setProcessing({ status: 'parsing-rules', message: 'Reading files...' });
        const [rulesText, excelData] = await Promise.all([rulesFile.text(), parseExcel(excelFile)]);
        
        setProgress(30);
        setProcessing({ status: 'parsing-rules', message: 'AI is interpreting rules...' });
        const rules: ValidationRule[] = await interpretRules(rulesText, excelData.headers);
        
        setProgress(60);
        setProcessing({ status: 'validating', message: `Checking ${excelData.rows.length} rows...` });
        
        const invalidRows: any[] = [];
        let validCount = 0;

        excelData.rows.forEach((row) => {
          const result = validateRow(row, rules);
          if (result.isValid) validCount++;
          else invalidRows.push({ ...row, VALIDATION_ERRORS: result.errors.join(' | ') });
        });

        setResults({
          totalRows: excelData.rows.length,
          validRows: validCount,
          invalidRows: invalidRows.length,
          invalidData: invalidRows,
          fileName: excelFile.name,
          interpretedRules: rules
        });
      }
      setProcessing({ status: 'completed', message: 'Validation complete!' });
    } catch (error: any) {
      setProcessing({ status: 'error', message: error.message });
    }
  };

  const reset = () => {
    setExcelFile(null);
    setRulesFile(null);
    setProcessing({ status: 'idle', message: '' });
    setResults(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center py-12 px-4 selection:bg-blue-100">
      <header className="max-w-4xl w-full text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200/50">
            <FileSpreadsheet className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight sm:text-5xl">Excel Validator AI</h1>
        
        <div className="mt-8 flex justify-center">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
            <button 
              onClick={() => setUseRemoteApi(false)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${!useRemoteApi ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Cpu className="w-4 h-4" /> Browser Engine
            </button>
            <button 
              onClick={() => setUseRemoteApi(true)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${useRemoteApi ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Globe className="w-4 h-4" /> API Endpoint
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full">
        {processing.status === 'idle' && !results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`bg-white p-8 rounded-[2rem] shadow-sm border-2 transition-all ${excelFile ? 'border-emerald-100' : 'border-slate-100 hover:border-blue-200'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FileSpreadsheet className="w-6 h-6 text-emerald-500" /> Source Data</h3>
              <label className="block w-full cursor-pointer">
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelChange} />
                <div className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${excelFile ? 'bg-emerald-50 border-emerald-300' : 'border-slate-200'}`}>
                  {excelFile ? <span className="font-bold text-emerald-700">{excelFile.name}</span> : <Upload className="w-8 h-8 text-slate-300" />}
                </div>
              </label>
            </div>
            <div className={`bg-white p-8 rounded-[2rem] shadow-sm border-2 transition-all ${rulesFile ? 'border-blue-100' : 'border-slate-100 hover:border-blue-200'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="w-6 h-6 text-blue-500" /> Rules Text</h3>
              <label className="block w-full cursor-pointer">
                <input type="file" accept=".txt" className="hidden" onChange={handleRulesChange} />
                <div className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${rulesFile ? 'bg-blue-50 border-blue-300' : 'border-slate-200'}`}>
                  {rulesFile ? <span className="font-bold text-blue-700">{rulesFile.name}</span> : <Upload className="w-8 h-8 text-slate-300" />}
                </div>
              </label>
            </div>
          </div>
        )}

        {processing.status === 'idle' && excelFile && rulesFile && !results && (
          <div className="flex justify-center mt-12">
            <button onClick={startValidation} className="flex items-center gap-3 px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-bold text-xl shadow-xl transition-all hover:-translate-y-1">
              <Play className="w-6 h-6 fill-current" /> {useRemoteApi ? 'Send to API' : 'Process Locally'}
            </button>
          </div>
        )}

        {(processing.status === 'parsing-rules' || processing.status === 'validating') && (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center">
            <Activity className="w-12 h-12 text-blue-600 animate-pulse mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">{processing.message}</h3>
            <div className="w-full max-w-md bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {processing.status === 'error' && (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-red-50 flex flex-col items-center text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
            <h3 className="text-2xl font-black text-slate-800 mb-2">Processing Failed</h3>
            <p className="text-slate-500 mb-8 max-w-md">{processing.message}</p>
            <button onClick={reset} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800">Back to Upload</button>
          </div>
        )}

        {results && (
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-800">Report</h3>
                  <p className="text-slate-400 font-medium">{results.fileName}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={reset} className="flex items-center gap-2 px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">
                    <RefreshCw className="w-5 h-5" /> New Scan
                  </button>
                  {results.invalidRows > 0 && (
                    <button onClick={() => generateErrorExcel(results.invalidData, results.fileName)} className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg">
                      <Download className="w-5 h-5" /> Export Errors
                    </button>
                  )}
                </div>
              </div>

              {/* Rules Verification Summary */}
              <div className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">How AI Interpreted Your Rules</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.interpretedRules.map((rule, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                      <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase mt-0.5 whitespace-nowrap">{rule.type}</div>
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">{rule.column}</p>
                        <p className="text-xs text-slate-500 mt-1">{rule.ruleDescription}</p>
                      </div>
                    </div>
                  ))}
                  {results.interpretedRules.length === 0 && <p className="text-slate-400 text-sm italic">No rules found.</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-8 rounded-3xl flex flex-col items-center">
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Scanned</p>
                  <p className="text-5xl font-black text-slate-800">{results.totalRows}</p>
                </div>
                <div className="bg-emerald-50 p-8 rounded-3xl flex flex-col items-center">
                  <p className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-2">Valid</p>
                  <p className="text-5xl font-black text-emerald-600">{results.validRows}</p>
                </div>
                <div className="bg-red-50 p-8 rounded-3xl flex flex-col items-center">
                  <p className="text-red-500 text-xs font-black uppercase tracking-widest mb-2">Invalid</p>
                  <p className="text-5xl font-black text-red-600">{results.invalidRows}</p>
                </div>
              </div>

              {results.invalidRows > 0 && (
                <div className="mt-12 overflow-hidden border border-slate-100 rounded-3xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-400">
                      <tr>
                        <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Snippet</th>
                        <th className="py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Errors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {results.invalidData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="bg-white hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 text-slate-600 italic">
                            {Object.values(row).slice(0, 2).map(v => String(v)).join(' | ')}...
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
                              {row.VALIDATION_ERRORS}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {results.invalidRows === 0 && (
                <div className="mt-12 bg-emerald-600 p-12 rounded-[2rem] flex flex-col items-center text-center">
                  <CheckCircle2 className="w-12 h-12 text-white mb-4" />
                  <h4 className="text-2xl font-black text-white">Perfect Data!</h4>
                  <p className="text-emerald-50">No violations found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
