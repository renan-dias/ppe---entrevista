import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// --- Types ---

interface JobVacancy {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    location: string;
  };
  summary: string;
  experience: { role: string; company: string; duration: string; description: string }[];
  skills: { name: string; level: number }[];
}

interface RecruiterProfile {
    name: string;
    role: string;
    style: string;
}

// --- Mocks & Constants ---

const SoundFX = {
  playPop: () => {},
  playPing: () => {},
  playDisconnect: () => {},
  playConnect: () => {},
};

const RECRUITER_PROFILES: RecruiterProfile[] = [
    { name: "Sarah", role: "Gerente de RH", style: "Profissional e acolhedora" },
    { name: "Roberto", role: "Líder Técnico", style: "Direto e analítico" },
    { name: "Amanda", role: "Talent Acquisition", style: "Curiosa e dinâmica" }
];

const durationLimits: Record<string, number> = {
    short: 300,
    medium: 600,
    long: 900
};

// --- Helper Functions for Audio Processing ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function decodeRawPcm(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): AudioBuffer {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default function InterviewApp() {
  const API_KEY = process.env.API_KEY as string;

  // --- State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);
  const [viewMode, setViewMode] = useState("search");
  const [uploading, setUploading] = useState(false);
  const [globalResume, setGlobalResume] = useState<ResumeData | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [connected, setConnected] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [finalReport, setFinalReport] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [durationOption, setDurationOption] = useState("short");
  const [selectedProfile, setSelectedProfile] = useState<RecruiterProfile | null>(null);

  // --- Refs ---
  const sessionRef = useRef<any>(null);
  const currentTranscriptRef = useRef<string[]>([]);
  const durationRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const isAudioQueuePlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);

  // --- Actions ---

  const searchJobs = async () => {
      setLoadingJobs(true);
      setJobs([]);
      SoundFX.playPop();
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
              model: 'gemini-3.1-flash-lite-preview',
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
      SoundFX.playPop();
      setSelectedJob(job);
      setViewMode('resume_upload');
  }

  const handleResumeUpload = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      SoundFX.playPop();
      
      const client = new GoogleGenAI({ apiKey: API_KEY });

      try {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.readAsDataURL(file);
          });

          const prompt = `
            EXTRACT all relevant data from this resume image/document into this specific JSON structure.
            If the image is not a resume, return an empty structure.
            
            Structure:
            {
                "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedin": "", "location": "" },
                "summary": "Professional summary...",
                "experience": [{ "role": "", "company": "", "duration": "", "description": "" }],
                "skills": [{ "name": "", "level": 3 }]
            }
          `;

          const result = await client.models.generateContent({
              model: 'gemini-3.1-flash-lite-preview',
              contents: [
                  { inlineData: { mimeType: file.type, data: base64 } },
                  { text: prompt }
              ],
              config: { responseMimeType: 'application/json' }
          });

          const extractedData = JSON.parse(result.text || "{}");
          
          if (extractedData.personalInfo) {
              setGlobalResume(extractedData as ResumeData);
              const formattedText = `
                NOME: ${extractedData.personalInfo.fullName}
                RESUMO: ${extractedData.summary}
                EXPERIÊNCIA: ${extractedData.experience?.map((e: any) => `${e.role} at ${e.company}`).join('; ')}
                SKILLS: ${extractedData.skills?.map((s: any) => s.name).join(', ')}
              `;
              setResumeText(formattedText);
              SoundFX.playPing();
          } else {
              setResumeText("Não foi possível extrair dados legíveis do currículo. O recrutador fará perguntas gerais.");
          }

      } catch (err) {
          console.error("Extraction error:", err);
          setResumeText("Erro ao ler arquivo. O recrutador fará perguntas gerais.");
      }

      setUploading(false);
  }

  const handleImportResume = () => {
      if (globalResume) {
          SoundFX.playPop();
          const text = `Nome: ${globalResume.personalInfo.fullName}
          Resumo: ${globalResume.summary}
          Experiência: ${globalResume.experience.map((e: any) => `${e.role} em ${e.company} (${e.duration})`).join('; ')}
          Skills: ${globalResume.skills.map((s: any) => s.name).join(', ')}`;
          setResumeText(text);
      }
  }
  
  const handleStartWithoutResume = () => {
      setResumeText(""); 
      startInterview();
  }

  const endSession = async () => {
    if (isAudioQueuePlayingRef.current) {
        for(let i=0; i<50; i++) {
            if(!isAudioQueuePlayingRef.current) break;
            await new Promise(r => setTimeout(r, 100));
        }
    }
    
    SoundFX.playDisconnect();
    setConnected(false);
    
    if (sessionRef.current) {
        try {
            // Check if it has close (it might be the promise if something went wrong, but usually it's the session)
            // sessionRef.current is typed as 'any' to avoid TS issues with the dynamic loading of types
            if(typeof sessionRef.current.close === 'function') {
                sessionRef.current.close();
            }
        } catch(e) {}
    }

    const safelyClose = async (ctx: AudioContext | null) => {
        if (ctx && ctx.state !== 'closed') {
            try { await ctx.close(); } catch(e) { console.error("Error closing ctx", e); }
        }
    };
    
    await safelyClose(audioContextRef.current);
    audioContextRef.current = null;

    await safelyClose(inputAudioContextRef.current);
    inputAudioContextRef.current = null;
    
    setViewMode('report');
    generateReport();
  }

  const generateReport = async () => {
      const client = new GoogleGenAI({ apiKey: API_KEY });
      const transcriptText = currentTranscriptRef.current.length > 0 
          ? currentTranscriptRef.current.join('\n') 
          : "Transcrição indisponível. Baseie-se no fato de que o candidato completou a entrevista.";

      const prompt = `
        Analise esta entrevista de emprego baseada nas transcrições abaixo.
        Vaga: ${selectedJob?.title} na ${selectedJob?.company}.
        
        Transcrições:
        ${transcriptText}

        Avalie com critérios rigorosos:
        1. Comunicação (Clareza, articulação, confiança).
        2. Conteúdo Técnico (Alinhamento com a vaga).
        3. Fit Cultural (Postura, valores).

        Gere um relatório JSON:
        {
            "score": number (0-10, seja criterioso),
            "summary": "Feedback direto e construtivo, como se fosse um e-mail de retorno do RH.",
            "scores": { "communication": 0-10, "technical": 0-10, "cultural": 0-10 },
            "strengths": ["Ponto forte 1", "Ponto forte 2"],
            "weaknesses": ["Ponto a melhorar 1", "Ponto a melhorar 2"],
            "tips": ["Dica prática 1", "Dica prática 2"]
        }
      `;

      try {
           const res = await client.models.generateContent({
              model: 'gemini-3.1-pro-preview',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          });
          setFinalReport(JSON.parse(res.text || "{}"));
          SoundFX.playPing();
      } catch (e) {
          console.error("Erro no relatório", e);
          setFinalReport({ score: 0, summary: "Não foi possível gerar análise detalhada.", strengths: [], weaknesses: [], tips: [] });
      }
  }

  useEffect(() => {
    let interval: any;
    if (connected && viewMode === 'live') {
        const limit = durationLimits[durationOption];
        const warningTime = limit - 30;

        interval = setInterval(() => {
            setDuration(prev => {
                const next = prev + 1;
                durationRef.current = next;
                
                if (next === warningTime && sessionRef.current) {
                    sessionRef.current.sendRealtimeInput({
                        content: {
                            role: "user",
                            parts: [{ text: "SYSTEM: Estamos chegando ao fim do tempo. Comece a encaminhar para o encerramento, faça a última pergunta." }]
                        }
                    });
                }
                
                if (next >= limit) {
                     endSession();
                }
                
                return next;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [connected, viewMode, durationOption]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const startInterview = async () => {
    if (!selectedJob) return;
    SoundFX.playConnect();
    setViewMode('live');
    
    const profile = RECRUITER_PROFILES[Math.floor(Math.random() * RECRUITER_PROFILES.length)];
    setSelectedProfile(profile);

    setTranscript([]);
    currentTranscriptRef.current = [];
    setDuration(0);
    durationRef.current = 0;

    const client = new GoogleGenAI({ apiKey: API_KEY });
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    
    const inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
    inputAudioContextRef.current = inputAudioContext; 
    
    const outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;
    nextStartTimeRef.current = 0;
    isAudioQueuePlayingRef.current = false;
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    let sessionPromise: Promise<any>;

    const config = {
      model: 'gemini-3.1-flash-live-preview',
      callbacks: {
        onopen: async () => {
          setConnected(true);
          const source = inputAudioContext.createMediaStreamSource(stream);
          const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
             const inputData = e.inputBuffer.getChannelData(0);
             const pcmBlob = createBlob(inputData);
             if (sessionPromise) {
                 sessionPromise.then(session => {
                     session.sendRealtimeInput({ media: pcmBlob });
                 });
             }
          };
          
          source.connect(processor);
          processor.connect(inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
           // Output Audio
           const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
           if (base64Audio) {
               isAudioQueuePlayingRef.current = true;
               const currentTime = outputAudioContext.currentTime;
               if (nextStartTimeRef.current < currentTime) {
                   nextStartTimeRef.current = currentTime;
               }
               
               const audioBuffer = decodeRawPcm(decode(base64Audio), outputAudioContext, 24000, 1);
               const source = outputAudioContext.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputAudioContext.destination);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               
               source.onended = () => {
                   if (outputAudioContext.currentTime >= nextStartTimeRef.current - 0.1) {
                        isAudioQueuePlayingRef.current = false;
                   }
               };
           }
           
           // Transcription (Optional tracking)
           // If we wanted to update transcript, we would look at message.serverContent?.outputTranscription?.text
        },
        onclose: () => {
             setConnected(false);
        },
        onerror: (e: any) => {
             console.error(e);
        }
      },
      config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `
            You are ${profile.name}, a ${profile.role}.
            Your style is ${profile.style}.
            Interviewing a candidate for: ${selectedJob?.title} at ${selectedJob?.company}.
            Candidate Info: ${resumeText || "Not provided"}.
            
            Conduct a realistic job interview. 
            Start by briefly introducing yourself and asking the candidate to introduce themselves.
          `,
      }
    };
    
    // Connect
    sessionPromise = client.live.connect(config);
    sessionRef.current = await sessionPromise;
  }

  // Basic Render
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>AI Interview Simulator</h1>
        
        {viewMode === 'search' && (
            <div>
                <h2>Find a Job</h2>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <input 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        placeholder="Job Title (e.g. Frontend Dev)" 
                        style={{ padding: 8, flex: 1 }}
                    />
                    <input 
                        value={searchLocation} 
                        onChange={e => setSearchLocation(e.target.value)} 
                        placeholder="Location" 
                        style={{ padding: 8, flex: 1 }}
                    />
                    <button onClick={searchJobs} disabled={loadingJobs} style={{ padding: 8 }}>
                        {loadingJobs ? 'Searching...' : 'Search'}
                    </button>
                </div>
                <div>
                    {jobs.map(job => (
                        <div key={job.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, cursor: 'pointer' }} onClick={() => handleSelectJob(job)}>
                            <h3>{job.title}</h3>
                            <p><strong>{job.company}</strong> - {job.location} ({job.type})</p>
                            <p>{job.description}</p>
                        </div>
                    ))}
                    {jobs.length === 0 && !loadingJobs && <p>No jobs found or search not started.</p>}
                </div>
            </div>
        )}

        {viewMode === 'resume_upload' && selectedJob && (
            <div>
                <h2>Apply for: {selectedJob.title}</h2>
                <p>Upload your resume (Image/PDF) for personalized questions.</p>
                <input type="file" onChange={handleResumeUpload} disabled={uploading} accept="image/*,application/pdf" />
                {uploading && <p>Analyzing resume...</p>}
                
                {resumeText && (
                    <div style={{ margin: '20px 0', background: '#f0f0f0', padding: 10 }}>
                        <p><strong>Extracted Info:</strong></p>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{resumeText}</pre>
                        <button onClick={handleImportResume} style={{ marginRight: 10 }}>Use This Info</button>
                    </div>
                )}
                
                <div style={{ marginTop: 20 }}>
                    <button onClick={() => handleImportResume()} disabled={!globalResume} style={{ marginRight: 10 }}>Start with Resume</button>
                    <button onClick={handleStartWithoutResume}>Start without Resume</button>
                </div>
            </div>
        )}

        {viewMode === 'live' && (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <h2>Interview in Progress</h2>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{formatTime(duration)}</div>
                <p>Speaking with: <strong>{selectedProfile?.name}</strong> ({selectedProfile?.role})</p>
                <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Visualizer placeholder */}
                    {isAudioQueuePlayingRef.current ? "🗣️ AI Speaking..." : "👂 Listening..."}
                </div>
                <button onClick={endSession} style={{ padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: 5 }}>
                    Hang Up
                </button>
            </div>
        )}

        {viewMode === 'report' && finalReport && (
            <div>
                <h2>Interview Feedback Report</h2>
                <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 10 }}>
                    <h3>Overall Score: {finalReport.score}/10</h3>
                    <p>{finalReport.summary}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '20px 0' }}>
                        <div>Communication: {finalReport.scores?.communication}</div>
                        <div>Technical: {finalReport.scores?.technical}</div>
                        <div>Cultural Fit: {finalReport.scores?.cultural}</div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <h4>Strengths</h4>
                            <ul>{finalReport.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                        </div>
                        <div>
                            <h4>Areas for Improvement</h4>
                            <ul>{finalReport.weaknesses?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                        </div>
                    </div>
                    
                    <h4>Tips</h4>
                    <ul>{finalReport.tips?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                </div>
                <button onClick={() => setViewMode('search')} style={{ marginTop: 20, padding: 10 }}>Back to Jobs</button>
            </div>
        )}
    </div>
  );
}
