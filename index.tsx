import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

// --- Icons ---
const Icons = {
  Resume: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Microphone: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  Brain: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  Sun: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Send: () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>,
  Stop: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>,
  Home: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Edit: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

// --- API & Types ---
const API_KEY = process.env.API_KEY;

// Resume Data Structure
interface Skill {
  name: string;
  level: number; // 1-5
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
  };
  summary: string;
  experience: { role: string; company: string; duration: string; description: string }[];
  education: { degree: string; school: string; year: string }[];
  skills: Skill[];
  languages: { name: string; level: string }[];
}

const initialResumeData: ResumeData = {
  personalInfo: { fullName: "", email: "", phone: "", linkedin: "", github: "", location: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
};

// --- Resume Templates ---
// 1. Corporate (Clean, Bars)
// 2. Creative (Modern, Dots)
// 3. Academic (Text heavy, detailed)

// --- Helper Components ---

function ProgressBar({ level }: { level: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 print:bg-gray-200">
      <div className="bg-primary-600 h-2.5 rounded-full print:bg-black" style={{ width: `${(level / 5) * 100}%` }}></div>
    </div>
  );
}

function Dots({ level }: { level: number }) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={`w-3 h-3 rounded-full print:border print:border-black ${i <= level ? 'bg-primary-600 print:bg-black' : 'bg-gray-300 dark:bg-gray-600 print:bg-white'}`} />
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex space-x-1 p-2 bg-gray-100 dark:bg-dark-700 rounded-2xl rounded-tl-none w-16 items-center justify-center">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
}

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<'home' | 'resume' | 'interview' | 'vocational'>('home');

  const renderView = () => {
    switch (view) {
      case 'home': return <Home setView={setView} />;
      case 'resume': return <ResumeBuilder onBack={() => setView('home')} />;
      case 'interview': return <InterviewSimulator onBack={() => setView('home')} />;
      case 'vocational': return <VocationalTest onBack={() => setView('home')} />;
      default: return <Home setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
      <Header setView={setView} />
      <main className="flex-grow container mx-auto px-4 py-6">
        {renderView()}
      </main>
      <Footer />
    </div>
  );
};

// --- Header / Footer ---

const Header = ({ setView }: { setView: (v: any) => void }) => (
  <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setView('home')}>
        <div className="bg-primary-600 p-2 rounded-lg text-white group-hover:bg-primary-700 transition-colors">
          <Icons.Brain />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">PPE <span className="text-primary-600 font-normal hidden sm:inline">- Prática Profissional Entrevistadora</span></h1>
      </div>
      <ThemeToggle />
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto transition-colors duration-300">
    <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>Desenvolvido por <span className="font-semibold text-primary-600">Renan Dias</span></p>
      <a href="https://github.com/renan-dias" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">github.com/renan-dias</a>
    </div>
  </footer>
);

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
      {isDark ? <Icons.Sun /> : <Icons.Moon />}
    </button>
  );
};

// --- Home Dashboard ---

const Home = ({ setView }: { setView: (v: any) => void }) => (
  <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
    <div className="text-center space-y-4 py-10">
      <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Prepare-se para o seu futuro</h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        A ferramenta definitiva para alavancar sua carreira. Crie currículos perfeitos, simule entrevistas e descubra sua vocação.
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      <DashboardCard
        title="Construtor de Currículo"
        desc="Crie um CV profissional com auxílio de um consultor especialista."
        icon={<Icons.Resume />}
        color="bg-blue-500"
        onClick={() => setView('resume')}
      />
      <DashboardCard
        title="Simulador de Entrevista"
        desc="Pratique com um entrevistador de voz realista em tempo real."
        icon={<Icons.Microphone />}
        color="bg-emerald-500"
        onClick={() => setView('interview')}
      />
      <DashboardCard
        title="Teste Vocacional"
        desc="Descubra sua área ideal conversando com nosso psicólogo."
        icon={<Icons.Brain />}
        color="bg-violet-500"
        onClick={() => setView('vocational')}
      />
    </div>
  </div>
);

const DashboardCard = ({ title, desc, icon, color, onClick }: any) => (
  <div onClick={onClick} className="group bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:-translate-y-1">
    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

// --- Resume Builder (Refined) ---

type TemplateType = 'corporate' | 'creative' | 'academic';

const ResumeBuilder = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<'template' | 'chat' | 'editor' | 'preview'>('template');
  const [template, setTemplate] = useState<TemplateType>('corporate');
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><Icons.Home /></button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Construtor de Currículo</h2>
      </div>

      {step === 'template' && (
        <div className="flex-grow flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <h3 className="text-xl text-gray-600 dark:text-gray-300">Escolha o estilo do seu currículo</h3>
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
            {[
              { id: 'corporate', name: 'Corporativo', desc: 'Limpo, profissional, ideal para grandes empresas. Barras de progresso.', color: 'border-blue-500' },
              { id: 'creative', name: 'Criativo', desc: 'Moderno, com design arrojado. Ideal para design/tech. Bolinhas de skill.', color: 'border-pink-500' },
              { id: 'academic', name: 'Acadêmico', desc: 'Focado em texto e detalhes. Ideal para pesquisa e educação.', color: 'border-green-500' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTemplate(t.id as TemplateType); setStep('chat'); }}
                className={`p-6 bg-white dark:bg-dark-800 border-2 ${template === t.id ? t.color : 'border-transparent'} hover:border-primary-500 rounded-xl shadow-lg transition-all text-left space-y-2`}
              >
                <div className={`w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center text-gray-400 font-semibold`}>
                    Preview {t.name}
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">{t.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'chat' && (
        <ResumeChat
          template={template}
          resumeData={resumeData}
          setResumeData={setResumeData}
          onFinish={() => setStep('editor')}
        />
      )}

      {step === 'editor' && (
        <ResumeEditor
          data={resumeData}
          setData={setResumeData}
          onPreview={() => setStep('preview')}
        />
      )}

      {step === 'preview' && (
        <ResumePreview
          data={resumeData}
          template={template}
          onEdit={() => setStep('editor')}
        />
      )}
    </div>
  );
};

// --- Resume Chat ---

const ResumeChat = ({ template, resumeData, setResumeData, onFinish }: any) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string; widget?: any }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);

  useEffect(() => {
    const client = new GoogleGenAI({ apiKey: API_KEY });
    setAi(client);
    // Simulate delay for first message
    setLoading(true);
    setTimeout(() => {
        addMessage('model', "Olá! Sou seu consultor de carreira. Vamos montar um currículo incrível. Para começar, qual é o seu nome completo?");
        setLoading(false);
    }, 1000);
  }, []);

  const addMessage = (role: 'user' | 'model', content: string, widget?: any) => {
    setMessages(prev => [...prev, { role, content, widget }]);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !ai) return;

    addMessage('user', text);
    setInput("");
    setQuickReplies([]);
    setLoading(true); // Show typing indicator

    try {
      // Prompt construction
      const history = messages.map(m => `${m.role === 'user' ? 'Usuário' : 'Consultor'}: ${m.content}`).join('\n');
      const prompt = `
        Você é um Consultor Especialista em Carreira e Currículos, NÃO se identifique como IA.
        Você está entrevistando o usuário para coletar dados para o currículo. O Template escolhido é: ${template}.
        
        Dados atuais do currículo (JSON): ${JSON.stringify(resumeData)}

        Histórico da conversa:
        ${history}
        Usuário: ${text}

        INSTRUÇÕES:
        1. Analise a resposta do usuário.
        2. Atualize o JSON do currículo se houver novas informações.
        3. Formule a próxima pergunta (seja breve, direto e amigável).
        4. Use perguntas curtas. Ex: "E qual seu email?"
        5. Se o usuário falar sobre uma área (ex: "sou dev"), sugira skills dessa área no widget.
        6. Se pedir contatos, peça LinkedIn/GitHub/Email e use o widget de contato.
        7. SE TIVER DADOS SUFICIENTES ou o usuário pedir para gerar, defina "completed": true.

        FORMATO DE RESPOSTA (JSON APENAS):
        {
          "message": "Sua resposta curta aqui.",
          "quickReplies": ["Sugestão 1", "Sugestão 2"],
          "updateResume": { ...partial resume data structure ... },
          "widget": { "type": "skills" | "contact" | "none", "data": [] },
          "completed": boolean
        }
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      // FIX: Access .text directly from the response object
      const responseText = result.text || "{}";
      const response = JSON.parse(responseText);

      // Simulate human typing delay based on message length
      setTimeout(() => {
        if (response.updateResume) {
            setResumeData((prev: any) => {
                const newData = { ...prev };
                if (response.updateResume.personalInfo) newData.personalInfo = { ...newData.personalInfo, ...response.updateResume.personalInfo };
                if (response.updateResume.summary) newData.summary = response.updateResume.summary;
                if (response.updateResume.experience) newData.experience = [...newData.experience, ...response.updateResume.experience];
                if (response.updateResume.education) newData.education = [...newData.education, ...response.updateResume.education];
                return newData;
            });
        }

        addMessage('model', response.message, response.widget);
        setQuickReplies(response.quickReplies || []);

        if (response.completed) {
            setTimeout(onFinish, 2500);
        }
        setLoading(false);
      }, 1500); // 1.5s delay for realism

    } catch (e) {
      console.error(e);
      setLoading(false);
      addMessage('model', "Desculpe, não entendi. Pode repetir?");
    }
  };

  // --- Widgets ---

  const handleSkillsUpdate = (newSkills: Skill[]) => {
      setResumeData((prev: any) => ({
          ...prev,
          skills: [...prev.skills.filter((s: Skill) => !newSkills.find(ns => ns.name === s.name)), ...newSkills]
      }));
  };

  const handleContactUpdate = (info: any) => {
      setResumeData((prev: any) => ({ ...prev, personalInfo: { ...prev.personalInfo, ...info } }));
      handleSend("Contatos atualizados.");
  };

  return (
    <div className="flex flex-col flex-grow bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-dark-700 text-slate-800 dark:text-gray-200 rounded-tl-none'}`}>
              {m.content}
            </div>
            {m.widget?.type === 'skills' && (
                <SkillsWidget suggestions={m.widget.data} currentSkills={resumeData.skills} onSave={(s) => { handleSkillsUpdate(s); handleSend("Skills definidas."); }} />
            )}
             {m.widget?.type === 'contact' && (
                <ContactWidget currentInfo={resumeData.personalInfo} onSave={handleContactUpdate} />
            )}
          </div>
        ))}
        {loading && (
            <div className="flex flex-col items-start">
                 <TypingIndicator />
            </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-gray-700">
        {quickReplies.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
            {quickReplies.map((r, i) => (
              <button key={i} onClick={() => handleSend(r)} className="px-3 py-1 bg-white dark:bg-dark-700 border border-primary-200 dark:border-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-sm hover:bg-primary-50 dark:hover:bg-dark-600 transition-colors shadow-sm">
                {r}
              </button>
            ))}
          </div>
        )}
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-grow bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-gray-400"
            placeholder="Digite sua resposta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          />
          <button onClick={() => handleSend(input)} disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shadow-md">
            <Icons.Send />
          </button>
        </div>
      </div>
    </div>
  );
};

const SkillsWidget = ({ suggestions, currentSkills, onSave }: any) => {
    const [selected, setSelected] = useState<Skill[]>([]);

    useEffect(() => {
        if (suggestions) {
            const newOpts = suggestions.map((name: string) => ({ name, level: 3 }));
            setSelected(newOpts);
        }
    }, [suggestions]);

    const updateLevel = (idx: number, level: number) => {
        const newSel = [...selected];
        newSel[idx].level = level;
        setSelected(newSel);
    }

    return (
        <div className="mt-2 p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-600 w-full max-w-md shadow-md animate-fade-in">
            <h4 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Defina seu nível de habilidade</h4>
            <div className="space-y-3">
                {selected.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{s.name}</span>
                        <div className="flex space-x-1">
                            {[1,2,3,4,5].map(l => (
                                <button key={l} onClick={() => updateLevel(i, l)} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center transition-all ${l <= s.level ? 'bg-primary-600 text-white scale-110' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => onSave(selected)} className="mt-4 w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                Confirmar Habilidades
            </button>
        </div>
    )
}

const ContactWidget = ({ currentInfo, onSave }: any) => {
    const [info, setInfo] = useState(currentInfo);
    return (
        <div className="mt-2 p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-600 w-full max-w-md space-y-3 shadow-md animate-fade-in">
             <h4 className="font-semibold mb-1 text-sm text-gray-500 uppercase tracking-wide">Informações de Contato</h4>
            <input type="text" placeholder="LinkedIn URL" value={info.linkedin} onChange={e => setInfo({...info, linkedin: e.target.value})} className="w-full p-2 text-sm border rounded-lg dark:bg-dark-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="text" placeholder="GitHub URL" value={info.github} onChange={e => setInfo({...info, github: e.target.value})} className="w-full p-2 text-sm border rounded-lg dark:bg-dark-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            <input type="text" placeholder="Telefone" value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} className="w-full p-2 text-sm border rounded-lg dark:bg-dark-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            <button onClick={() => onSave(info)} className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">Salvar Contatos</button>
        </div>
    )
}

// --- Resume Editor ---

const ResumeEditor = ({ data, setData, onPreview }: any) => {
    const handleChange = (section: string, field: string, value: any, index?: number) => {
        setData((prev: any) => {
            const newData = { ...prev };
            if (section === 'personalInfo') {
                newData.personalInfo[field] = value;
            } else if (index !== undefined) {
                newData[section][index][field] = value;
            } else {
                newData[section] = value;
            }
            return newData;
        });
    };

    return (
        <div className="flex flex-col h-full space-y-4 animate-fade-in pb-10">
             <div className="flex justify-between items-center bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Revisar Dados</h3>
                <button onClick={onPreview} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
                    <Icons.Check /> <span>Gerar Visualização</span>
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-6 p-1">
                {/* Personal Info */}
                <section className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="text-lg font-semibold border-b pb-2 dark:border-gray-700 text-slate-800 dark:text-white">Dados Pessoais</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Nome Completo" value={data.personalInfo.fullName} onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)} />
                        <Input label="Email" value={data.personalInfo.email} onChange={(e) => handleChange('personalInfo', 'email', e.target.value)} />
                        <Input label="Telefone" value={data.personalInfo.phone} onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)} />
                        <Input label="Localização" value={data.personalInfo.location} onChange={(e) => handleChange('personalInfo', 'location', e.target.value)} />
                        <Input label="LinkedIn" value={data.personalInfo.linkedin} onChange={(e) => handleChange('personalInfo', 'linkedin', e.target.value)} />
                        <Input label="GitHub/Portfolio" value={data.personalInfo.github} onChange={(e) => handleChange('personalInfo', 'github', e.target.value)} />
                    </div>
                </section>

                <section className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="text-lg font-semibold border-b pb-2 dark:border-gray-700 text-slate-800 dark:text-white">Resumo Profissional</h4>
                    <textarea 
                        className="w-full h-32 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white" 
                        value={data.summary} 
                        onChange={(e) => handleChange('summary', '', e.target.value)} 
                    />
                </section>

                {/* Experience - simplified list for brevity */}
                 <section className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Experiência</h4>
                    </div>
                    {data.experience.map((exp: any, i: number) => (
                        <div key={i} className="p-4 border rounded-lg dark:border-gray-700 space-y-2 bg-gray-50 dark:bg-dark-900">
                            <div className="grid grid-cols-2 gap-2">
                                <Input label="Cargo" value={exp.role} onChange={(e) => handleChange('experience', 'role', e.target.value, i)} />
                                <Input label="Empresa" value={exp.company} onChange={(e) => handleChange('experience', 'company', e.target.value, i)} />
                            </div>
                            <textarea className="w-full p-2 border rounded dark:bg-dark-700 dark:border-gray-600 text-slate-800 dark:text-white" value={exp.description} onChange={(e) => handleChange('experience', 'description', e.target.value, i)} />
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

const Input = ({ label, value, onChange }: any) => (
    <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <input type="text" className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-white outline-none transition-all" value={value} onChange={onChange} />
    </div>
);


// --- Resume Preview & Renderer ---

const ResumePreview = ({ data, template, onEdit }: any) => {
    return (
        <div className="flex flex-col h-full animate-fade-in pb-10">
            <div className="flex justify-between items-center mb-4 px-2">
                <button onClick={onEdit} className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 dark:text-gray-300 transition-colors">
                    <Icons.Edit /> <span>Voltar e Editar</span>
                </button>
                <div className="flex space-x-3">
                    <button onClick={() => window.print()} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 shadow-lg transition-transform hover:scale-105">
                        <Icons.Download /> <span>Salvar PDF</span>
                    </button>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto bg-gray-200 dark:bg-gray-800 p-8 rounded-xl flex justify-center shadow-inner border border-gray-300 dark:border-gray-700">
                <div className="transform origin-top scale-95 md:scale-100 transition-transform">
                    <div className="bg-white text-black w-[210mm] min-h-[297mm] shadow-2xl p-0 overflow-hidden print:w-full print:h-full print:shadow-none print:m-0">
                        {/* Template Renderer */}
                        {template === 'corporate' && <CorporateTemplate data={data} />}
                        {template === 'creative' && <CreativeTemplate data={data} />}
                        {template === 'academic' && <AcademicTemplate data={data} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Templates ---

const CorporateTemplate = ({ data }: { data: ResumeData }) => (
    <div className="p-10 space-y-6 font-sans">
        <header className="border-b-2 border-gray-800 pb-4">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-gray-900">{data.personalInfo.fullName}</h1>
            <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4 font-medium">
                {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
                {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
                {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
                {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
            </div>
        </header>

        <section>
            <h2 className="text-xl font-bold uppercase text-gray-800 border-b border-gray-300 mb-3">Resumo</h2>
            <p className="text-gray-700 leading-relaxed text-justify">{data.summary}</p>
        </section>

        <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
                <section>
                    <h2 className="text-xl font-bold uppercase text-gray-800 border-b border-gray-300 mb-3">Experiência</h2>
                    {data.experience.map((exp, i) => (
                        <div key={i} className="mb-4">
                            <h3 className="font-bold text-lg text-gray-900">{exp.role}</h3>
                            <div className="text-sm text-gray-600 mb-1 font-medium">{exp.company} | {exp.duration}</div>
                            <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{exp.description}</p>
                        </div>
                    ))}
                </section>
                <section>
                    <h2 className="text-xl font-bold uppercase text-gray-800 border-b border-gray-300 mb-3">Formação</h2>
                     {data.education.map((edu, i) => (
                        <div key={i} className="mb-2">
                             <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                             <div className="text-sm text-gray-600">{edu.school}, {edu.year}</div>
                        </div>
                    ))}
                </section>
            </div>
            <div className="col-span-1 space-y-6">
                 <section>
                    <h2 className="text-xl font-bold uppercase text-gray-800 border-b border-gray-300 mb-3">Habilidades</h2>
                    <div className="space-y-3">
                        {data.skills.map((skill, i) => (
                            <div key={i}>
                                <div className="text-sm font-semibold mb-1 text-gray-700">{skill.name}</div>
                                <ProgressBar level={skill.level} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    </div>
);

const CreativeTemplate = ({ data }: { data: ResumeData }) => (
    <div className="flex h-full min-h-[297mm]">
        <aside className="w-1/3 bg-slate-900 text-white p-8 space-y-8 print:bg-slate-900 print:text-white">
            <div className="space-y-2">
                <h1 className="text-3xl font-black leading-tight text-white">{data.personalInfo.fullName.split(' ').map((n,i) => <div key={i}>{n}</div>)}</h1>
                <p className="text-slate-400 text-sm">{data.personalInfo.location}</p>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
                <div className="break-all">{data.personalInfo.email}</div>
                <div>{data.personalInfo.phone}</div>
                <div className="break-all text-xs">{data.personalInfo.linkedin}</div>
                <div className="break-all text-xs">{data.personalInfo.github}</div>
            </div>

            <div>
                <h3 className="text-primary-500 font-bold tracking-widest uppercase mb-4 text-sm">Skills</h3>
                <div className="space-y-2">
                    {data.skills.map((skill, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-200">{skill.name}</span>
                            <Dots level={skill.level} />
                        </div>
                    ))}
                </div>
            </div>
        </aside>
        <main className="w-2/3 p-10 space-y-8 text-slate-800 bg-white">
             <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-2">Perfil</h2>
                 <p className="text-sm leading-relaxed text-gray-600 text-justify">{data.summary}</p>
             </section>
             <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4">Experiência</h2>
                 <div className="space-y-6">
                    {data.experience.map((exp, i) => (
                        <div key={i} className="relative pl-6 border-l-2 border-slate-200">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-primary-500 rounded-full border-4 border-white print:border-white"></div>
                            <h3 className="font-bold text-lg text-slate-900">{exp.role}</h3>
                            <div className="text-primary-600 font-medium text-sm mb-2">{exp.company} <span className="text-gray-400 mx-1">•</span> {exp.duration}</div>
                            <p className="text-sm text-gray-600">{exp.description}</p>
                        </div>
                    ))}
                 </div>
             </section>
             <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4">Educação</h2>
                 {data.education.map((edu, i) => (
                        <div key={i} className="mb-4">
                             <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                             <div className="text-sm text-gray-500">{edu.school}, {edu.year}</div>
                        </div>
                ))}
             </section>
        </main>
    </div>
);

const AcademicTemplate = ({ data }: { data: ResumeData }) => (
    <div className="p-12 font-serif text-gray-900">
        <header className="text-center border-b-2 border-black pb-6 mb-8">
            <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName}</h1>
            <p className="text-sm italic text-gray-700">{data.personalInfo.location} • {data.personalInfo.email} • {data.personalInfo.phone}</p>
             {data.personalInfo.linkedin && <p className="text-sm text-gray-700">{data.personalInfo.linkedin}</p>}
        </header>

        <section className="mb-6">
             <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 text-black">Resumo Profissional</h2>
             <p className="text-justify leading-relaxed text-gray-800">{data.summary}</p>
        </section>

        <section className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 text-black">Experiência Profissional</h2>
             {data.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                    <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-black">{exp.role}</h3>
                        <span className="italic text-sm">{exp.duration}</span>
                    </div>
                    <div className="italic text-sm mb-1">{exp.company}</div>
                    <p className="text-sm mt-1 text-gray-800">{exp.description}</p>
                </div>
            ))}
        </section>

        <section className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 text-black">Formação Acadêmica</h2>
             {data.education.map((edu, i) => (
                <div key={i} className="mb-2 flex justify-between">
                     <div>
                         <span className="font-bold text-black">{edu.degree}</span>, {edu.school}
                     </div>
                     <span className="italic text-sm">{edu.year}</span>
                </div>
            ))}
        </section>

        <section>
            <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2 text-black">Habilidades Técnicas</h2>
            <p className="text-sm text-gray-800">
                {data.skills.map(s => s.name).join(' • ')}
            </p>
        </section>
    </div>
);

// --- Interview Simulator (with Audio Fix) ---

const InterviewSimulator = ({ onBack }: { onBack: () => void }) => {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [started, setStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [finalReport, setFinalReport] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<any>(null);

  const startInterview = async () => {
    if(!role || !company) return;
    setStarted(true);

    const client = new GoogleGenAI({ apiKey: API_KEY });
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
    const outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const session = await client.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: `Você é um entrevistador profissional da empresa ${company}. Você está entrevistando um candidato para a vaga de ${role}.
          Seja sério mas educado. Comece se apresentando e pedindo para o candidato se apresentar.
          Faça perguntas técnicas e comportamentais relevantes. Mantenha o tom profissional de uma entrevista real.`,
        inputAudioTranscription: { model: 'gemini-2.5-flash-native-audio-preview-09-2025' }
      },
      callbacks: {
        onopen: () => {
            setConnected(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                // Manual PCM16 conversion
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    pcm16[i] = inputData[i] * 32768;
                }
                const uint8 = new Uint8Array(pcm16.buffer);
                // Base64 encode
                let binary = '';
                const len = uint8.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(uint8[i]);
                }
                const b64 = btoa(binary);

                session.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: b64
                    }
                });
            };
            source.connect(processor);
            processor.connect(inputAudioContext.destination);
        },
        onmessage: (msg: LiveServerMessage) => {
             // Audio Output Handling
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData) {
                 const binaryString = atob(audioData);
                 const len = binaryString.length;
                 const bytes = new Uint8Array(len);
                 for (let i = 0; i < len; i++) {
                     bytes[i] = binaryString.charCodeAt(i);
                 }
                 const int16 = new Int16Array(bytes.buffer);
                 const float32 = new Float32Array(int16.length);
                 for(let i=0; i<int16.length; i++) {
                     float32[i] = int16[i] / 32768.0;
                 }
                 
                 const buffer = outputAudioContext.createBuffer(1, float32.length, 24000);
                 buffer.getChannelData(0).set(float32);

                 const source = outputAudioContext.createBufferSource();
                 source.buffer = buffer;
                 source.connect(outputAudioContext.destination);
                 
                 const now = outputAudioContext.currentTime;
                 const start = Math.max(nextStartTime, now);
                 source.start(start);
                 nextStartTime = start + buffer.duration;
                 sources.add(source);
                 source.onended = () => sources.delete(source);
             }

             // Transcription accumulation for report
             if (msg.serverContent?.inputTranscription) {
                 setTranscript(p => [...p, `You: ${msg.serverContent?.inputTranscription?.text}`]);
             }
             if (msg.serverContent?.outputTranscription) {
                 setTranscript(p => [...p, `Interviewer: ${msg.serverContent?.outputTranscription?.text}`]);
             }
        },
        onclose: () => setConnected(false)
      }
    });
    sessionRef.current = session;
  };

  const endSession = async () => {
      // Clean up
      sessionRef.current?.disconnect(); 
      setConnected(false);
      setStarted(false);

      // Generate Report
      const client = new GoogleGenAI({ apiKey: API_KEY });
      const prompt = `Analise a seguinte transcrição de entrevista de emprego para ${role} na ${company}.
      
      Transcrição:
      ${transcript.join('\n')}

      Gere um relatório JSON com:
      - score (0-10)
      - insights (pontos fortes)
      - tips (pontos de melhoria)
      - summary (resumo da performance)
      `;

      try {
        const res = await client.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        // FIX: Access .text directly
        const reportText = res.text || "{}";
        setFinalReport(JSON.parse(reportText));
      } catch (e) {
          console.error("Report gen error", e);
      }
  };

  if (finalReport) {
      return (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
              <button onClick={onBack} className="mb-4 text-gray-500 hover:text-primary-600">Voltar</button>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Relatório de Performance</h2>
              <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                      <span className="text-xl font-bold text-slate-800 dark:text-white">Nota Geral</span>
                      <span className={`text-4xl font-black ${finalReport.score >= 7 ? 'text-green-500' : 'text-yellow-500'}`}>{finalReport.score}/10</span>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <h3 className="font-bold text-green-600 mb-2">Pontos Fortes</h3>
                          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">{Array.isArray(finalReport.insights) ? finalReport.insights.map((i:any, k:any) => <li key={k}>{i}</li>) : finalReport.insights}</ul>
                      </div>
                      <div>
                          <h3 className="font-bold text-red-500 mb-2">Dicas de Melhoria</h3>
                          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300">{Array.isArray(finalReport.tips) ? finalReport.tips.map((i:any, k:any) => <li key={k}>{i}</li>) : finalReport.tips}</ul>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center justify-center h-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Simulador de Entrevista</h2>
        <p className="text-gray-500">Pratique com voz em tempo real.</p>
      </div>

      {!started ? (
        <div className="w-full space-y-4 bg-white dark:bg-dark-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <Input label="Cargo Pretendido" value={role} onChange={(e) => setRole(e.target.value)} />
          <Input label="Empresa Alvo" value={company} onChange={(e) => setCompany(e.target.value)} />
          <button onClick={startInterview} disabled={!role || !company} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-md">
             Iniciar Entrevista
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
           <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${connected ? 'bg-green-100 dark:bg-green-900/30 animate-pulse' : 'bg-gray-200 dark:bg-dark-700'}`}>
                {connected ? <div className="w-20 h-20 bg-green-500 rounded-full animate-ping" /> : <div className="w-20 h-20 bg-gray-400 rounded-full" />}
           </div>
           <div className="text-center">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">{connected ? "Entrevista em andamento..." : "Conectando..."}</h3>
               <p className="text-sm text-gray-500">Fale naturalmente com o entrevistador.</p>
           </div>
           <button onClick={endSession} className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-colors">
               <Icons.Stop /> <span>Encerrar Entrevista</span>
           </button>
        </div>
      )}
    </div>
  );
};

// --- Vocational Test ---

const VocationalTest = ({ onBack }: { onBack: () => void }) => {
    const [messages, setMessages] = useState<{role:string, text:string}[]>([]);
    const [input, setInput] = useState("");
    const [ai, setAi] = useState<GoogleGenAI|null>(null);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const client = new GoogleGenAI({ apiKey: API_KEY });
        setAi(client);
        setLoading(true);
        setTimeout(() => {
            setMessages([{role:'model', text: "Olá! Sou seu Orientador Vocacional. Vou te fazer algumas perguntas para entender seu perfil. Podemos começar?"}]);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const send = async () => {
        if(!input) return;
        const newMsgs = [...messages, {role: 'user', text: input}];
        setMessages(newMsgs);
        setInput("");
        setLoading(true); // Show typing
        
        try {
             const history = newMsgs.map(m => `${m.role==='user'?'User':'Model'}: ${m.text}`).join('\n');
             const res = await ai?.models.generateContent({
                 model: 'gemini-3-pro-preview',
                 contents: `Você é um psicólogo especialista em orientação vocacional. Não diga que é uma IA.
                 Histórico: ${history}. 
                 Responda o usuário, faça perguntas sobre interesses, hobbies, matérias favoritas. 
                 Se já tiver dados suficientes, sugira 3 áreas de atuação com justificativa.`,
             });
             
             setTimeout(() => {
                 // FIX: Access .text directly
                 setMessages([...newMsgs, {role: 'model', text: res?.text || ''}]);
                 setLoading(false);
             }, 1500); // Simulated delay
        } catch(e) { console.error(e); setLoading(false); }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col max-w-2xl mx-auto">
             <div className="flex items-center space-x-2 mb-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><Icons.Home /></button>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Teste Vocacional</h2>
            </div>
            <div className="flex-grow bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {messages.map((m, i) => (
                        <div key={i} className={`p-3 rounded-2xl max-w-[80%] shadow-sm ${m.role === 'user' ? 'bg-primary-600 text-white self-end ml-auto rounded-tr-none' : 'bg-gray-100 dark:bg-dark-700 text-slate-800 dark:text-gray-200 rounded-tl-none'}`}>
                            {m.text}
                        </div>
                    ))}
                    {loading && <TypingIndicator />}
                    <div ref={scrollRef} />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 bg-gray-50 dark:bg-dark-900">
                    <input 
                        className="flex-grow p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" 
                        value={input} 
                        onChange={e=>setInput(e.target.value)} 
                        onKeyDown={e=>e.key==='Enter'&&send()} 
                        placeholder="Digite aqui..." 
                    />
                    <button onClick={send} disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors shadow-md disabled:opacity-50">
                        <Icons.Send />
                    </button>
                </div>
            </div>
        </div>
    )
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);