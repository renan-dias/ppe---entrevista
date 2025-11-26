
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";

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
  Trash: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Briefcase: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Upload: () => <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
};

const RECRUITER_AVATARS = [
    "https://cdn3.iconfinder.com/data/icons/avatars-9/145/Avatar_Dog-512.png",
    "https://cdn-icons-png.flaticon.com/512/4775/4775486.png",
    "https://w7.pngwing.com/pngs/867/134/png-transparent-giant-panda-dog-cat-avatar-fox-animal-tag-mammal-animals-carnivoran-thumbnail.png",
    "https://i.pinimg.com/474x/05/26/5f/05265f5c35a8f6d0f38e712f1ceefca7.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJ63nCVJWfJNQ-FYePohFXqSDQ0qk6sAIdtA&s"
];

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
  // Shared state to allow Interview to access generated resume
  const [globalResume, setGlobalResume] = useState<ResumeData | null>(null);

  const renderView = () => {
    switch (view) {
      case 'home': return <Home setView={setView} />;
      case 'resume': return <ResumeBuilder onBack={() => setView('home')} onComplete={setGlobalResume} />;
      case 'interview': return <InterviewSimulator onBack={() => setView('home')} globalResume={globalResume} />;
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

const ResumeBuilder = ({ onBack, onComplete }: { onBack: () => void, onComplete: (data: ResumeData) => void }) => {
  const [step, setStep] = useState<'template' | 'chat' | 'editor' | 'preview'>('template');
  const [template, setTemplate] = useState<TemplateType>('corporate');
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [importedText, setImportedText] = useState("");

  const handleFinish = () => {
      onComplete(resumeData);
      setStep('editor');
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><Icons.Home /></button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Construtor de Currículo</h2>
      </div>

      {step === 'template' && (
        <div className="flex-grow flex flex-col items-center justify-center space-y-8 animate-fade-in overflow-y-auto p-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl text-gray-600 dark:text-gray-300">Escolha o estilo do seu currículo</h3>
            <p className="text-sm text-gray-500">O consultor usará este modelo para guiar a entrevista.</p>
          </div>
          
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

          <div className="w-full max-w-lg mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="text-sm font-semibold text-gray-500 mb-2 block">Já tem um resumo? Cole aqui para acelerar (Opcional):</label>
              <textarea 
                className="w-full p-3 rounded-lg border dark:bg-dark-700 dark:border-gray-600 text-sm h-24"
                placeholder="Ex: Sou João, engenheiro de software com 5 anos de experiência..."
                value={importedText}
                onChange={e => setImportedText(e.target.value)}
              />
              {importedText && (
                  <button 
                    onClick={() => { setTemplate('corporate'); setStep('chat'); }}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                      Usar texto e iniciar Chat &rarr;
                  </button>
              )}
          </div>
        </div>
      )}

      {step === 'chat' && (
        <ResumeChat
          template={template}
          resumeData={resumeData}
          setResumeData={setResumeData}
          onFinish={handleFinish}
          initialContext={importedText}
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

const ResumeChat = ({ template, resumeData, setResumeData, onFinish, initialContext }: any) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string; widget?: any }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const client = new GoogleGenAI({ apiKey: API_KEY });
    setAi(client);
    
    if (!hasStarted) {
        setHasStarted(true);
        setLoading(true);
        setTimeout(() => {
            if (initialContext) {
                // If user provided context, parse it immediately
                handleSend(initialContext, true);
            } else {
                addMessage('model', "Olá! Sou seu consultor de carreira. Vamos montar um currículo incrível. Para começar, qual é o seu nome completo?");
                setLoading(false);
            }
        }, 1000);
    }
  }, []);

  const addMessage = (role: 'user' | 'model', content: string, widget?: any) => {
    setMessages(prev => [...prev, { role, content, widget }]);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async (text: string, isHiddenContext = false) => {
    if (!text.trim() || !ai) return;

    if (!isHiddenContext) {
        addMessage('user', text);
        setInput("");
        setQuickReplies([]);
    }
    
    setLoading(true); 

    try {
      const history = messages.map(m => `${m.role === 'user' ? 'Usuário' : 'Consultor'}: ${m.content}`).join('\n');
      const prompt = `
        Você é um Consultor Especialista em Carreira e Currículos, NÃO se identifique como IA.
        Você está entrevistando o usuário para coletar dados para o currículo. O Template escolhido é: ${template}.
        
        Dados atuais do currículo (JSON): ${JSON.stringify(resumeData)}

        Histórico da conversa:
        ${history}
        ${isHiddenContext ? `CONTEXTO INICIAL DO USUÁRIO: ${text}` : `Usuário: ${text}`}

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

      const responseText = result.text || "{}";
      const response = JSON.parse(responseText);

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
      }, 1500); 

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

// --- Interview Simulator (Enhanced with Job Board) ---

interface JobVacancy {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
}

const Step = ({ active, completed, number, label }: any) => (
    <div className={`flex flex-col items-center ${active ? 'text-primary-600' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 transition-colors ${completed ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {completed ? <Icons.Check /> : number}
        </div>
        <span className="text-xs font-medium">{label}</span>
    </div>
)

const InterviewSimulator = ({ onBack, globalResume }: { onBack: () => void, globalResume: ResumeData | null }) => {
  const [viewMode, setViewMode] = useState<'search' | 'resume_upload' | 'live' | 'report'>('search');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);

  const [resumeText, setResumeText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState(RECRUITER_AVATARS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sessionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const currentTranscriptRef = useRef<string[]>([]);

  // We keep a reference to stop audio context cleanly
  const audioContextRef = useRef<AudioContext | null>(null);

  const searchJobs = async () => {
      setLoadingJobs(true);
      setJobs([]);
      const client = new GoogleGenAI({ apiKey: API_KEY });
      
      const prompt = `Gere uma lista JSON de 4 a 5 vagas de emprego realistas para "${searchQuery}" em "${searchLocation || 'Brasil'}".
      Formato JSON esperado para cada item:
      {
          "id": "unique_id",
          "title": "Nome do Cargo",
          "company": "Nome da Empresa (fictícia ou real)",
          "location": "Cidade, Estado",
          "type": "Remoto/Híbrido/Presencial",
          "description": "Resumo atraente da vaga (estilo LinkedIn, max 200 caracteres)",
          "requirements": ["Requisito 1", "Requisito 2", "Requisito 3"]
      }`;

      try {
          const res = await client.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          });
          const text = res.text || "[]";
          const data = JSON.parse(text);
          setJobs(Array.isArray(data) ? data : []);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingJobs(false);
      }
  };

  const handleSelectJob = (job: JobVacancy) => {
      setSelectedJob(job);
      setViewMode('resume_upload');
  }

  const handleResumeUpload = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      
      // Simulate processing time
      await new Promise(r => setTimeout(r, 1500));

      if (file.type === 'text/plain') {
          const text = await file.text();
          setResumeText(text);
      } else {
          // Fallback for PDF (simulation)
           setResumeText(`[SISTEMA: Currículo "${file.name}" processado com sucesso]\n\nNOME: João Silva (Extraído)\nCARGO: Desenvolvedor (Extraído)\nEXPERIÊNCIA: ...\n\n(O recrutador terá acesso a este contexto simulado)`);
      }
      setUploading(false);
  }

  const handleImportResume = () => {
      if (globalResume) {
          const text = `Nome: ${globalResume.personalInfo.fullName}
          Resumo: ${globalResume.summary}
          Experiência: ${globalResume.experience.map(e => `${e.role} em ${e.company} (${e.duration})`).join('; ')}
          Skills: ${globalResume.skills.map(s => s.name).join(', ')}`;
          setResumeText(text);
      }
  }

  const endSession = async () => {
    if (sessionRef.current) {
        // Disconnect
        // Note: SDK doesn't have explicit disconnect in types sometimes, but usually does or we just let it drop.
        // We will generate report now.
    }
    setConnected(false);
    if(audioContextRef.current) audioContextRef.current.close();
    
    setViewMode('report');
    generateReport();
  }

  const generateReport = async () => {
      const client = new GoogleGenAI({ apiKey: API_KEY });
      const prompt = `
        Analise esta entrevista de emprego baseada nas transcrições abaixo.
        Vaga: ${selectedJob?.title} na ${selectedJob?.company}.
        
        Transcrições (incompletas/fragmentadas):
        ${currentTranscriptRef.current.join('\n')}

        Gere um relatório JSON:
        {
            "score": number (0-10),
            "summary": "Resumo geral do desempenho",
            "strengths": ["Ponto forte 1", "Ponto forte 2"],
            "weaknesses": ["Ponto a melhorar 1", "Ponto a melhorar 2"],
            "tips": ["Dica prática 1", "Dica prática 2"]
        }
      `;

      try {
           const res = await client.models.generateContent({
              model: 'gemini-3-pro-preview',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          });
          setFinalReport(JSON.parse(res.text || "{}"));
      } catch (e) {
          console.error("Erro no relatório", e);
          setFinalReport({ score: 0, summary: "Não foi possível gerar análise detalhada.", strengths: [], weaknesses: [], tips: [] });
      }
  }

  const startInterview = async () => {
    if (!selectedJob) return;
    setViewMode('live');
    setAvatarUrl(RECRUITER_AVATARS[Math.floor(Math.random() * RECRUITER_AVATARS.length)]);
    setTranscript([]);
    currentTranscriptRef.current = [];

    const client = new GoogleGenAI({ apiKey: API_KEY });
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
    const outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const endInterviewTool: FunctionDeclaration = {
        name: "endInterview",
        description: "Encerra a entrevista quando você (o recrutador) tiver informações suficientes ou o tempo acabar.",
        parameters: { type: Type.OBJECT, properties: {} }
    };

    const session = await client.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        tools: [{ functionDeclarations: [endInterviewTool] }],
        inputAudioTranscription: { model: "google-1-latest" },
        outputAudioTranscription: { model: "google-1-latest" },
        systemInstruction: `
          CONTEXTO:
          Você é um Recrutador Sênior da empresa ${selectedJob.company}.
          Você está entrevistando um candidato.
          
          VAGA: ${selectedJob.title}
          DESCRIÇÃO DA VAGA: ${selectedJob.description}
          REQUISITOS: ${selectedJob.requirements.join(', ')}

          DADOS DO CANDIDATO (Do PDF/Currículo):
          ${resumeText}

          SUA MISSÃO:
          1. INÍCIO IMEDIATO: Assim que a conexão abrir, FALE PRIMEIRO. Dê "Bom dia/Boa tarde", apresente-se como recrutador da ${selectedJob.company} e diga que analisou o currículo.
          2. Conduza uma entrevista realista de 5 a 10 minutos (simulado).
          3. Faça perguntas sobre a experiência dele baseada no currículo e como se conecta com a vaga.
          4. Seja profissional mas cordial.
          5. ENCERRAMENTO: Quando você tiver feito 3 ou 4 perguntas relevantes e ouvido as respostas, ou se sentir que já tem dados para um relatório, diga: "Ótimo, obrigado pelo seu tempo. Entraremos em contato em breve." e CHAME A FUNÇÃO 'endInterview'.
        `,
      },
      callbacks: {
        onopen: () => {
            setConnected(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    pcm16[i] = inputData[i] * 32768;
                }
                const uint8 = new Uint8Array(pcm16.buffer);
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
             // Handle Tool Calls (End Interview)
             if (msg.toolCall) {
                 for (const fc of msg.toolCall.functionCalls) {
                     if (fc.name === 'endInterview') {
                         session.sendToolResponse({
                             functionResponses: {
                                 name: fc.name,
                                 id: fc.id,
                                 response: { result: 'ok' }
                             }
                         });
                         endSession();
                         return;
                     }
                 }
             }

             // Handle Audio Output
             const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (audioData) {
                 setIsSpeaking(true);
                 // Decode Base64 manually to Float32Array
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
                 const start = Math.max(now, nextStartTime);
                 source.start(start);
                 nextStartTime = start + buffer.duration;
                 
                 source.onended = () => {
                     if (outputAudioContext.currentTime >= nextStartTime - 0.1) setIsSpeaking(false);
                 }
                 sources.add(source);
             }

             // Collect Transcription for report
             const userT = msg.serverContent?.inputTranscription?.text;
             const modelT = msg.serverContent?.outputTranscription?.text;
             if (userT) currentTranscriptRef.current.push(`Candidato: ${userT}`);
             if (modelT) currentTranscriptRef.current.push(`Recrutador: ${modelT}`);
        },
        onclose: () => {
            setConnected(false);
        },
        onerror: (e) => {
            console.error(e);
            setConnected(false);
        }
      }
    });
    sessionRef.current = session;
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
       <div className="flex items-center space-x-2 mb-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><Icons.Home /></button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {viewMode === 'search' && "Encontrar Vaga"}
                {viewMode === 'resume_upload' && "Preparação"}
                {viewMode === 'live' && "Entrevista em Andamento"}
                {viewMode === 'report' && "Resultado da Entrevista"}
            </h2>
        </div>

        {/* --- STEPPER --- */}
        <div className="flex items-center justify-center space-x-6 mb-6">
             <Step active={viewMode === 'search'} completed={viewMode !== 'search'} number={1} label="Vaga" />
             <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
             <Step active={viewMode === 'resume_upload'} completed={viewMode === 'live' || viewMode === 'report'} number={2} label="Upload CV" />
             <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
             <Step active={viewMode === 'live'} completed={viewMode === 'report'} number={3} label="Entrevista" />
        </div>

        {viewMode === 'search' && (
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Cargo ou Palavra-chave (ex: Desenvolvedor React)" className="p-3 border rounded-lg dark:bg-dark-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <input type="text" placeholder="Localização (ex: São Paulo, Remoto)" className="p-3 border rounded-lg dark:bg-dark-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" value={searchLocation} onChange={e => setSearchLocation(e.target.value)} />
                </div>
                <button onClick={searchJobs} disabled={loadingJobs} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center">
                    {loadingJobs ? <span className="animate-pulse">Buscando vagas com IA...</span> : <span className="flex items-center gap-2"><Icons.Search /> Buscar Vagas</span>}
                </button>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {jobs.map(job => (
                        <div key={job.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-xl hover:shadow-md transition-shadow bg-gray-50 dark:bg-dark-900 cursor-pointer group" onClick={() => handleSelectJob(job)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-primary-600 group-hover:underline">{job.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">{job.company}</p>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{job.type}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                <Icons.MapPin /> {job.location}
                            </div>
                            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{job.description}</p>
                        </div>
                    ))}
                    {jobs.length === 0 && !loadingJobs && <p className="text-center text-gray-400 py-10">Use a busca acima para encontrar oportunidades simuladas.</p>}
                </div>
            </div>
        )}

        {viewMode === 'resume_upload' && selectedJob && (
             <div className="bg-white dark:bg-dark-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center space-y-6 animate-fade-in">
                 <div className="w-full text-left bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                     <h3 className="font-bold text-blue-800 dark:text-blue-300">Vaga Selecionada: {selectedJob.title}</h3>
                     <p className="text-sm text-blue-600 dark:text-blue-400">{selectedJob.company}</p>
                 </div>
                 
                 <div className="space-y-2">
                     <h3 className="text-xl font-bold">Adicione seu Currículo</h3>
                     <p className="text-gray-500">O recrutador usará essas informações para fazer perguntas personalizadas.</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6 w-full">
                     <div className={`border-2 border-dashed ${uploading ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'} rounded-xl p-6 flex flex-col items-center justify-center space-y-4 hover:border-primary-500 transition-colors cursor-pointer relative`}>
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.doc,.docx,.txt" onChange={handleResumeUpload} disabled={uploading} />
                         {uploading ? (
                             <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                         ) : (
                             <Icons.Upload />
                         )}
                         <span className="text-sm font-medium">{uploading ? "Processando..." : "Upload Arquivo"}</span>
                         <span className="text-xs text-gray-400">PDF, DOCX, TXT</span>
                     </div>
                     <button onClick={handleImportResume} disabled={!globalResume} className="border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 hover:border-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50">
                         <Icons.Resume />
                         <span className="text-sm font-medium">Importar do Construtor</span>
                     </button>
                 </div>

                 {resumeText && (
                    <div className="w-full animate-fade-in">
                        <div className="flex items-center gap-2 text-green-600 mb-2 font-medium">
                            <Icons.Check /> <span>Currículo processado com sucesso</span>
                        </div>
                         <textarea 
                            className="w-full h-32 p-3 text-sm border rounded-lg bg-gray-50 dark:bg-dark-900 dark:border-gray-700 dark:text-white" 
                            placeholder="O texto do seu currículo aparecerá aqui..." 
                            value={resumeText} 
                            readOnly 
                        />
                    </div>
                 )}

                 <button onClick={startInterview} disabled={!resumeText} className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2">
                     <Icons.Microphone /> Iniciar Entrevista Agora
                 </button>
             </div>
        )}

        {viewMode === 'live' && (
            <div className="flex-grow flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-gray-900 to-black rounded-xl relative overflow-hidden p-8 text-white shadow-2xl animate-fade-in">
                {/* Background Pulse Animation */}
                {isSpeaking && <div className="absolute inset-0 bg-primary-500/10 animate-pulse"></div>}
                
                <div className="relative z-10 flex flex-col items-center space-y-6">
                    <div className={`relative w-40 h-40 rounded-full border-4 ${isSpeaking ? 'border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.5)]' : 'border-gray-600'} transition-all duration-300`}>
                        <img src={avatarUrl} alt="Recruiter" className="w-full h-full object-cover rounded-full" />
                        {isSpeaking && (
                            <div className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-green-500 text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
                                FALANDO
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold">Recrutador da {selectedJob?.company}</h3>
                        <p className="text-gray-400">Entrevista para {selectedJob?.title}</p>
                    </div>
                </div>

                <div className="w-full max-w-2xl bg-black/50 backdrop-blur-sm p-4 rounded-lg text-center h-24 flex items-center justify-center">
                    <p className="text-gray-300 italic">{isSpeaking ? "Ouvindo recrutador..." : "Sua vez de falar..."}</p>
                </div>

                <button onClick={endSession} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                    <Icons.Stop /> Encerrar Chamada
                </button>
            </div>
        )}

        {viewMode === 'report' && (
            <div className="bg-white dark:bg-dark-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-center mb-6">Feedback da Entrevista</h3>
                
                {!finalReport ? (
                    <div className="flex flex-col items-center py-10 space-y-4">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Gerando relatório de performance com IA...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="w-32 h-32 rounded-full border-8 border-primary-500 flex items-center justify-center flex-col">
                                <span className="text-4xl font-black text-primary-600">{finalReport.score}</span>
                                <span className="text-xs uppercase font-bold text-gray-400">Nota / 10</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-dark-900 p-6 rounded-xl border border-blue-100 dark:border-gray-700">
                            <h4 className="font-bold text-lg mb-2 text-blue-800 dark:text-blue-300">Resumo</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{finalReport.summary}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="font-bold text-green-600 flex items-center gap-2"><Icons.Check /> Pontos Fortes</h4>
                                <ul className="space-y-2">
                                    {finalReport.strengths.map((s:string, i:number) => (
                                        <li key={i} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm text-green-800 dark:text-green-200 border border-green-100 dark:border-green-900">{s}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-bold text-red-500 flex items-center gap-2"><Icons.Trash /> Pontos a Melhorar</h4>
                                <ul className="space-y-2">
                                    {finalReport.weaknesses.map((s:string, i:number) => (
                                        <li key={i} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm text-red-800 dark:text-red-200 border border-red-100 dark:border-red-900">{s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div>
                             <h4 className="font-bold text-purple-600 mb-3 flex items-center gap-2"><Icons.Brain /> Dicas do Especialista</h4>
                             <div className="grid gap-3">
                                {finalReport.tips.map((s:string, i:number) => (
                                    <div key={i} className="p-3 bg-gray-50 dark:bg-dark-900 border-l-4 border-purple-500 text-gray-700 dark:text-gray-300 text-sm">
                                        {s}
                                    </div>
                                ))}
                             </div>
                        </div>
                        
                        <button onClick={() => setViewMode('search')} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                            Nova Entrevista
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

// --- Vocational Test ---

const VocationalTest = ({ onBack }: { onBack: () => void }) => {
    const [messages, setMessages] = useState<{role: 'user'|'model', content: string}[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const client = new GoogleGenAI({ apiKey: API_KEY });
        setAi(client);
        setLoading(true);
        setTimeout(() => {
            setMessages([{ role: 'model', content: "Olá! Sou seu psicólogo de carreira virtual. Vamos descobrir juntos qual caminho profissional combina mais com sua personalidade e interesses. Para começar, o que você mais gosta de fazer no seu tempo livre?" }]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleSend = async () => {
        if(!input.trim() || !ai) return;
        const newMsgs = [...messages, { role: 'user' as const, content: input }];
        setMessages(newMsgs);
        setInput("");
        setLoading(true);

        const history = newMsgs.map(m => `${m.role === 'user' ? 'Usuário' : 'Psicólogo'}: ${m.content}`).join('\n');
        const prompt = `
            Você é um orientador vocacional e psicólogo experiente.
            Histórico:
            ${history}

            Objetivo: Fazer perguntas investigativas (uma por vez) para entender o perfil do usuário (RIASEC, MBTI simplificado, Interesses).
            Após cerca de 5 a 7 perguntas, ou se tiver certeza, forneça um "Resultado" detalhado sugerindo 3 áreas de atuação e explicando o porquê.
            Mantenha o tom empático, calmo e profissional.
            Seja sucinto nas perguntas.
        `;

        try {
            const res = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
            });
            const text = res.text || "Desculpe, pode repetir?";
            setMessages(prev => [...prev, { role: 'model', content: text }]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"><Icons.Home /></button>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Teste Vocacional</h2>
            </div>

            <div className="flex-grow bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-5 rounded-2xl leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-dark-700 text-slate-800 dark:text-gray-200 rounded-tl-none'}`}>
                                <p className="whitespace-pre-wrap">{m.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <TypingIndicator />
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
                     <input
                        type="text"
                        className="flex-grow bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white placeholder-gray-400"
                        placeholder="Responda aqui..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shadow-md">
                        <Icons.Send />
                    </button>
                </div>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
