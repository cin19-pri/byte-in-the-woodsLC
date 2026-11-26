import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, ChevronRight, Diamond, Heart, Pause, Play, RotateCcw,  X, Trophy,  LockKeyhole, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { art } from "./art";
import { ForestEngine } from "./engine";
import { GameAudio } from "./audio";
import { INITIAL_LIVES, isCorrect, nextProgress, getQuestion, questionCount } from "./rules";
type Screen = "start" | "intro" | "play" | "challenge" | "success" | "defeat" | "victory";
const dialogue = [
  { who: "Ada", text: "¿Dónde estoy? Este lugar es muy extraño.", image: art.idle },
  { who: "Luciérnaga Mágica", text: "¡Hola, Ada! El bosque está hechizado. Los fragmentos de la gema con el código perdido están encerrados en cofres mágicos. ¡Solo tu ingenio puede abrirlos!", image: art.firefly },
  { who: "Ada", text: "Tal vez tú puedas ayudarme. Necesito encontrar una salida. ¡Vamos a recuperar esos fragmentos!", image: art.idle },
] as const;
export function Game() {
  const [screen, setScreen] = useState<Screen>("start"); const [level, setLevel] = useState(1); const [lives, setLives] = useState(INITIAL_LIVES); const [fragments, setFragments] = useState(0);
  const [muted, setMuted] = useState(false); const [paused, setPaused] = useState(false); const [introStep, setIntroStep] = useState(0); const [attempt, setAttempt] = useState(0); const [hint, setHint] = useState(false); const [questionIndex, setQuestionIndex] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null); const engine = useRef<ForestEngine | null>(null); const audio = useRef<GameAudio | null>(null);
  const playing = screen !== "start" && screen !== "intro";
  function sound() { audio.current ??= new GameAudio(); audio.current.unlock(); audio.current.muted = muted; return audio.current; }
  function start() { sound(); setIntroStep(0); setScreen("intro"); }
  function beginLevel(newLevel: number) { setLevel(newLevel); setLives(INITIAL_LIVES);  setHint(false); setPaused(false); setAttempt(n => n + 1); setScreen("play"); }
  function advanceDialogue() { if (introStep < 2) setIntroStep(n => n + 1); else { setFragments(0); beginLevel(1); } }
  useEffect(() => { if (screen !== "intro") return; const handler = (e: KeyboardEvent) => { if (e.key === " ") { e.preventDefault(); advanceDialogue(); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [screen, introStep]);
  useEffect(() => {
    if (!playing || !canvas.current) return;
    const game = new ForestEngine(canvas.current, level, {
      onLives: setLives, onProgress: () => {}, onDefeat: () => setScreen("defeat"),
      onChest: () => { setQuestionIndex(Math.floor(Math.random() * questionCount(level))); setHint(false); setScreen("challenge"); },
      sound: kind => audio.current?.play(kind),
    }); engine.current = game;
    return () => { game.dispose(); engine.current = null; };
  }, [playing, level, attempt]);
  useEffect(() => { engine.current?.setPaused(paused || screen !== "play"); }, [paused, screen, attempt]);
  useEffect(() => { if (audio.current) audio.current.muted = muted; }, [muted]);
  const question = getQuestion(level, questionIndex);
  const currentDialogue = dialogue[introStep] ?? dialogue[0];
  function answer(index: number) { if (!isCorrect(question, index)) { audio.current?.play("damage"); setScreen("defeat"); return; } const result = nextProgress(level); setFragments(result.fragments); audio.current?.play("chest"); setScreen("success"); }
  function nextLevel() { if (level === 1) beginLevel(2); else { setScreen("victory"); audio.current?.play("victory"); } }
  function returnHome() { setScreen("start"); setPaused(false); }
  const touch = (key: string) => ({ onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.setPointerCapture(e.pointerId); engine.current?.input(key, true); }, onPointerUp: () => engine.current?.input(key, false), onPointerCancel: () => engine.current?.input(key, false), onLostPointerCapture: () => engine.current?.input(key, false) });
  return <div className="game-shell">
    {screen === "start" ? <>
      <main className="cover"><img className="cover-background" src={art.night} alt="Bosque encantado nocturno con hongos luminosos"/><div className="sparkles">{Array.from({ length: 18 }, (_, i) => <i key={i} className="spark" style={{ left: `${40 + i * 3 % 58}%`, top: `${10 + i * 17 % 74}%`, animationDelay: `${i * .3}s` }}/>)}</div>
        <div className="cover-content"><h1 className="cover-title">BYTE IN<br/>THE <span>WOODS</span></h1><p className="cover-subtitle">En Busca del Código Perdido</p><p className="cover-description">Un bosque hechizado. Un código perdido.<br/>Y una pequeña exploradora con un gran destino.</p><Button variant="magic" className="start-button" onClick={start}><Play size={16} fill="currentColor"/> INICIAR AVENTURA <ArrowRight size={16}/></Button></div>
        <img className="cover-ada" src={art.idle} alt="Ada, exploradora con sudadera morada"/><img className="cover-firefly" src={art.firefly} alt="Luciérnaga mágica"/>

      </main>
    </> : screen === "intro" ? <main className="play-area"><Button className="skip-button" variant="secondary" size="sm" onClick={() => { setFragments(0); beginLevel(1); }}>Omitir <ChevronRight/></Button><div className="game-stage"><img className="cover-background" src={art.night} alt="El bosque donde comienza la aventura"/><div className="scene-overlay"><div className="dialog-panel" role="dialog" aria-label="Historia de Ada"><div className="dialog-top"><img className="dialog-character" src={currentDialogue.image} alt={currentDialogue.who}/><span>{currentDialogue.who}</span></div><p>{currentDialogue.text}</p><div className="dialog-actions"><Button variant="magic" onClick={advanceDialogue}>{introStep === 2 ? "¡Vamos al bosque!" : "Continuar"}<ArrowRight/></Button></div></div></div></div></main> :
    <main className="play-area"><div className="game-stage"><canvas className="game-canvas" ref={canvas} aria-label="Juego de plataformas: Ada explora el bosque"/><div className="hud"><div className="hud-group"><span>NIVEL {level}</span><span className="hud-lives" aria-label={`${lives} vidas`}>{Array.from({ length: lives }, (_, i) => <Heart key={i} size={17} fill="currentColor"/>)}</span></div><div className="hud-group"><Button variant="ghost" size="icon" aria-label="Volver al inicio" title="Volver al inicio" onClick={returnHome}><Home/></Button><span className="hud-fragments"><Diamond size={16}/>{fragments} / 2 <span className="hidden sm:inline">fragmentos</span></span><Button variant="ghost" size="icon" aria-label={paused ? "Reanudar juego" : "Pausar juego"} title={paused ? "Reanudar" : "Pausar"} disabled={screen !== "play"} onClick={() => setPaused(p => !p)}>{paused ? <Play/> : <Pause/>}</Button></div></div>
      {(paused || screen !== "play") && <div className="scene-overlay"><div className="dialog-panel" role="dialog" aria-label={screen === "challenge" ? "Cofre mágico" : "Estado de la aventura"}>
        {paused && screen === "play" ? <><div className="dialog-top"><Pause/> Un momento de calma</div><h2>Aventura en pausa</h2><Button variant="secondary" onClick={() => { sound(); setMuted(v => !v); }}>{muted ? "Activar sonido" : "Silenciar sonido"}</Button><div className="dialog-actions"><Button variant="ghost" onClick={() => beginLevel(level)}><RotateCcw/>Reiniciar</Button><Button variant="magic" onClick={() => setPaused(false)}><Play/>Continuar</Button></div></> : screen === "challenge" ? <><div className="dialog-top"><LockKeyhole/> COFRE MÁGICO · NIVEL {level}</div><h2>El código abre el camino</h2><p>{question.prompt}</p>{question.code && <div className="code-block">{question.code}</div>}<div className="answer-list">{question.answers.map((a, i) => <Button key={a} variant="outline" className="answer-button" onClick={() => answer(i)}><span className="answer-letter">{String.fromCharCode(65 + i)}</span>{a}</Button>)}</div>{hint && <div className="feedback" role="status">✦ ¡Inténtalo otra vez! {question.hint}</div>}</> : screen === "success" ? <><img className="reward-chest" src={art.open} alt="Cofre abierto con el fragmento de gema"/><div className="dialog-top"><Diamond/> FRAGMENTO RECUPERADO</div><h2>¡Tu ingenio es mágico!</h2><p>{level === 1 ? "El cofre se abre y una gema ilumina el camino. El bosque nocturno te espera." : "Los dos fragmentos se unen. ¡El hechizo se ha roto y el portal de regreso a casa está abierto!"}</p><div className="dialog-actions"><Button variant="magic" onClick={nextLevel}>{level === 1 ? "Al bosque nocturno" : "Regresar a casa"}<ArrowRight/></Button></div></> : screen === "defeat" ? <><div className="dialog-top"><Heart/> CADA INTENTO ES UN NUEVO COMIENZO</div><h2 className="game-over-title">GAME OVER</h2><p>Ada puede volver a intentarlo desde el inicio del nivel.</p><div className="dialog-actions"><Button variant="ghost" onClick={returnHome}><X/>Salir</Button><Button variant="magic" onClick={() => beginLevel(level)}><RotateCcw/>Reintentar nivel</Button></div></> : <><div className="dialog-top"><Trophy/> AVENTURA COMPLETADA</div><h2>¡Encontraste el código perdido!</h2><p>Ada ha vuelto a casa. Con curiosidad, valentía y un poco de lógica, liberaste al bosque de su hechizo.</p><div className="hud-fragments"><Diamond/> 2 / 2 fragmentos recuperados</div><div className="dialog-actions"><Button variant="magic" onClick={returnHome}>Volver al inicio</Button></div></>}
      </div></div>}
    </div><div className="touch-controls"><div><Button variant="secondary" className="touch-button" aria-label="Mover a la izquierda" {...touch("left")}><ArrowLeft/></Button><Button variant="secondary" className="touch-button" aria-label="Mover a la derecha" {...touch("right")}><ArrowRight/></Button></div><Button variant="magic" className="touch-button" aria-label="Saltar" {...touch("jump")}><ArrowUp/></Button></div></main>}

  </div>;
}