"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type GameId = "snake" | "blocks" | "word" | "merge" | "memory" | "mines" | "breakout" | "stars";
type Scores = Record<string, number>;

const GAMES: { id: GameId; name: string; kicker: string; icon: string; color: string; category: string }[] = [
  { id: "snake", name: "Snake Trail", kicker: "Chase. Grow. Repeat.", icon: "◉", color: "mint", category: "Arcade" },
  { id: "blocks", name: "Block Drop", kicker: "Clear the skyline", icon: "▦", color: "blue", category: "Puzzle" },
  { id: "word", name: "Word Pop", kicker: "Five letters. Six tries.", icon: "Aa", color: "yellow", category: "Word" },
  { id: "merge", name: "Merge 2048", kicker: "Slide into big numbers", icon: "2⁸", color: "purple", category: "Puzzle" },
  { id: "memory", name: "Flip Friends", kicker: "Find every pair", icon: "✦", color: "pink", category: "Cards" },
  { id: "mines", name: "Mine Garden", kicker: "Tread carefully", icon: "✿", color: "green", category: "Puzzle" },
  { id: "breakout", name: "Brick Bounce", kicker: "Keep the ball alive", icon: "●", color: "orange", category: "Arcade" },
  { id: "stars", name: "Star Catch", kicker: "Fast fingers win", icon: "★", color: "cyan", category: "Action" },
];

function useScores() {
  const [scores, setScores] = useState<Scores>({});
  useEffect(() => { queueMicrotask(() => { try { setScores(JSON.parse(localStorage.getItem("pocket-arcade-scores") || "{}")); } catch {} }); }, []);
  const save = useCallback((id: string, score: number) => {
    setScores(old => { const next = { ...old, [id]: Math.max(old[id] || 0, score) }; localStorage.setItem("pocket-arcade-scores", JSON.stringify(next)); return next; });
  }, []);
  return { scores, save };
}

function ControlButton({ children, onPress, label }: { children: React.ReactNode; onPress: () => void; label: string }) {
  return <button className="control-btn" aria-label={label} onPointerDown={e => { e.preventDefault(); onPress(); }}>{children}</button>;
}

export default function Home() {
  const [active, setActive] = useState<GameId | null>(null);
  const [filter, setFilter] = useState("All");
  const [sound, setSound] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { scores, save } = useScores();
  const filtered = filter === "All" ? GAMES : GAMES.filter(g => g.category === filter);
  const game = GAMES.find(g => g.id === active);
  const playTone = useCallback(() => {
    if (!sound || typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.frequency.value = 520; gain.gain.setValueAtTime(.04, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .08);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .08);
  }, [sound]);
  const launch = (id: GameId) => { playTone(); setActive(id); };
  return (
    <main className="arcade-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActive(null)} aria-label="Pocket Arcade home">
          <span className="brand-mark"><i /><i /><i /><i /></span><span>POCKET<span>ARCADE</span></span>
        </button>
        <div className="top-actions">
          <div className="coin-pill"><span>●</span> {Object.values(scores).reduce((a,b) => a + b, 0).toLocaleString()}</div>
          <button className="round-btn" onClick={() => setShowSettings(true)} aria-label="Settings">⚙</button>
        </div>
      </header>

      {!active ? <>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">PLAYER ONE · READY</span>
            <h1>Your whole arcade.<br/><em>Right in your pocket.</em></h1>
            <p>Eight instant games. No downloads, no sign-ins, no ads. Just press play.</p>
            <button className="primary-btn" onClick={() => launch("snake")}><span>▶</span> Quick play</button>
          </div>
          <div className="console-art" aria-label="Colourful handheld game console illustration">
            <div className="console-speaker"><i/><i/><i/></div>
            <div className="console-screen">
              <div className="screen-cloud one"/><div className="screen-cloud two"/>
              <div className="screen-title">POCKET<br/><strong>ARCADE</strong></div>
              <div className="screen-land"><span>◆</span><span>●</span><span>▲</span></div>
            </div>
            <div className="dpad"><i/><i/></div>
            <div className="ab"><button>A</button><button>B</button></div>
            <div className="console-slot" />
          </div>
        </section>

        <section className="library">
          <div className="section-head"><div><span className="eyebrow">GAME LIBRARY</span><h2>Pick your next obsession</h2></div><span className="game-count">{GAMES.length} games</span></div>
          <div className="filters">{["All","Arcade","Puzzle","Word","Cards","Action"].map(x => <button key={x} className={filter===x?"active":""} onClick={()=>setFilter(x)}>{x}</button>)}</div>
          <div className="game-grid">{filtered.map((g, i) => <button className={`game-card ${g.color}`} key={g.id} onClick={()=>launch(g.id)} style={{"--delay":`${i*45}ms`} as React.CSSProperties}>
            <div className="game-icon"><span>{g.icon}</span><b>▶</b></div>
            <div className="game-meta"><small>{g.category}</small><h3>{g.name}</h3><p>{g.kicker}</p></div>
            <div className="high-score">BEST <strong>{(scores[g.id] || 0).toLocaleString()}</strong></div>
          </button>)}</div>
        </section>
        <footer><span>POCKET ARCADE © 2026</span><span>Made for tiny screens & big scores</span><span>v1.0</span></footer>
      </> : <section className="game-view">
        <div className="game-bar"><button onClick={()=>setActive(null)} className="back-btn">‹ <span>Arcade</span></button><div><small>{game?.category}</small><strong>{game?.name}</strong></div><div className="best-mini">BEST <b>{scores[active] || 0}</b></div></div>
        <div className={`game-stage ${game?.color}`}>
          {active === "snake" && <Snake onScore={n=>save("snake",n)} />}
          {active === "blocks" && <BlockDrop onScore={n=>save("blocks",n)} />}
          {active === "word" && <WordPop onScore={n=>save("word",n)} />}
          {active === "merge" && <MergeGame onScore={n=>save("merge",n)} />}
          {active === "memory" && <MemoryGame onScore={n=>save("memory",n)} />}
          {active === "mines" && <MinesGame onScore={n=>save("mines",n)} />}
          {active === "breakout" && <Breakout onScore={n=>save("breakout",n)} />}
          {active === "stars" && <StarCatch onScore={n=>save("stars",n)} />}
        </div>
      </section>}

      {showSettings && <div className="modal-wrap" onPointerDown={()=>setShowSettings(false)}><div className="settings-card" onPointerDown={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowSettings(false)}>×</button><span className="eyebrow">SYSTEM</span><h2>Settings</h2>
        <label><span><b>Game sounds</b><small>Clicks, pops and victories</small></span><input type="checkbox" checked={sound} onChange={e=>setSound(e.target.checked)}/></label>
        <label><span><b>Local progress</b><small>Scores stay on this device</small></span><span className="status-dot">ON</span></label>
        <button className="danger-btn" onClick={()=>{localStorage.removeItem("pocket-arcade-scores"); location.reload();}}>Reset all scores</button>
      </div></div>}
    </main>
  );
}

function GameHeader({ score, title, sub }: { score: number; title: string; sub: string }) { return <div className="inside-head"><div><span className="eyebrow">{title}</span><p>{sub}</p></div><div className="score-box"><small>SCORE</small><strong>{score}</strong></div></div> }
function Overlay({ title, text, action, onClick }: { title: string; text: string; action: string; onClick:()=>void }) { return <div className="game-overlay"><span>★</span><h2>{title}</h2><p>{text}</p><button className="primary-btn" onClick={onClick}>▶ {action}</button></div> }

const SNAKE_SIZE = 15;
function Snake({ onScore }: { onScore:(n:number)=>void }) {
  const [snake,setSnake]=useState([[7,7],[6,7],[5,7]]); const [food,setFood]=useState([11,7]); const [dir,setDir]=useState([1,0]); const dirRef=useRef(dir); const [playing,setPlaying]=useState(false); const [over,setOver]=useState(false);
  const move=(d:number[])=>{ if(d[0]!==-dirRef.current[0] || d[1]!==-dirRef.current[1]) {dirRef.current=d;setDir(d)} };
  const reset=()=>{setSnake([[7,7],[6,7],[5,7]]);setFood([11,7]);dirRef.current=[1,0];setDir([1,0]);setOver(false);setPlaying(true)};
  useEffect(()=>{ if(!playing)return; const t=setInterval(()=>setSnake(s=>{const h=[s[0][0]+dirRef.current[0],s[0][1]+dirRef.current[1]]; if(h[0]<0||h[1]<0||h[0]>=SNAKE_SIZE||h[1]>=SNAKE_SIZE||s.some(p=>p[0]===h[0]&&p[1]===h[1])){const final=(s.length-3)*100;queueMicrotask(()=>{setPlaying(false);setOver(true);onScore(final)});return s} const ate=h[0]===food[0]&&h[1]===food[1]; const n=[h,...s];if(!ate)n.pop();else setFood([Math.floor(Math.random()*SNAKE_SIZE),Math.floor(Math.random()*SNAKE_SIZE)]);return n;}),125);return()=>clearInterval(t)},[playing,food,onScore]);
  useEffect(()=>{const k=(e:KeyboardEvent)=>{const m:Record<string,number[]>={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};if(m[e.key]){e.preventDefault();move(m[e.key])}};addEventListener("keydown",k);return()=>removeEventListener("keydown",k)},[]);
  const occupied=new Map(snake.map((p,i)=>[p.join(","),i])); return <div className="game-inner"><GameHeader score={(snake.length-3)*100} title="SNAKE TRAIL" sub="Eat the fruit. Don't bite your tail."/><div className="snake-board">{Array.from({length:SNAKE_SIZE*SNAKE_SIZE},(_,i)=>{const x=i%SNAKE_SIZE,y=Math.floor(i/SNAKE_SIZE),body=occupied.get(`${x},${y}`);return <i key={i} className={body!==undefined?body===0?"snake head":"snake":food[0]===x&&food[1]===y?"food":""}/>})}{!playing&&<Overlay title={over?"Trail ended!":"Ready to slither?"} text={over?`You scored ${(snake.length-3)*100}. One more run?`:"Swipe the pad or use your arrow keys."} action={over?"Play again":"Start game"} onClick={reset}/>}</div><div className="dpad-controls"><span/><ControlButton label="Up" onPress={()=>move([0,-1])}>▲</ControlButton><span/><ControlButton label="Left" onPress={()=>move([-1,0])}>◀</ControlButton><ControlButton label="Down" onPress={()=>move([0,1])}>▼</ControlButton><ControlButton label="Right" onPress={()=>move([1,0])}>▶</ControlButton></div></div>
}

type Pt={x:number,y:number}; const SHAPES:Pt[][]=[[{x:0,y:0},{x:1,y:0},{x:0,y:1},{x:1,y:1}],[{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:0,y:1}],[{x:-1,y:0},{x:0,y:0},{x:1,y:0},{x:2,y:0}],[{x:-1,y:0},{x:0,y:0},{x:0,y:1},{x:1,y:1}]];
function BlockDrop({onScore}:{onScore:(n:number)=>void}) {
  const [board,setBoard]=useState<number[]>(Array(160).fill(0)); const [piece,setPiece]=useState({shape:SHAPES[0],x:4,y:0,c:1});const [score,setScore]=useState(0);const[play,setPlay]=useState(false);const[over,setOver]=useState(false); const state=useRef({board,piece,score}); useEffect(()=>{state.current={board,piece,score}},[board,piece,score]);
  const valid=(p=piece,b=board)=>p.shape.every(q=>{const x=p.x+q.x,y=p.y+q.y;return x>=0&&x<10&&y>=0&&y<16&&!b[y*10+x]});
  const spawn=(b:number[],s:number)=>{const p={shape:SHAPES[Math.floor(Math.random()*SHAPES.length)],x:4,y:0,c:1+Math.floor(Math.random()*5)};if(!valid(p,b)){setPlay(false);setOver(true);onScore(s)}setPiece(p)};
  // The live board is held in a ref so the game clock never closes over a stale frame.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const down=useCallback(()=>{const {board:b,piece:p,score:s}=state.current;const n={...p,y:p.y+1};if(valid(n,b))setPiece(n);else{const nb=[...b];p.shape.forEach(q=>{const y=p.y+q.y,x=p.x+q.x;if(y>=0)nb[y*10+x]=p.c});let cleared=0;for(let y=15;y>=0;y--)if(nb.slice(y*10,y*10+10).every(Boolean)){nb.splice(y*10,10);nb.unshift(...Array(10).fill(0));cleared++;y++}const ns=s+10+cleared*150;setBoard(nb);setScore(ns);spawn(nb,ns)}},[]);
  const move=(dx:number)=>setPiece(p=>{const n={...p,x:p.x+dx};return valid(n)?n:p}); const rotate=()=>setPiece(p=>{const n={...p,shape:p.shape.map(q=>({x:-q.y,y:q.x}))};return valid(n)?n:p}); const reset=()=>{setBoard(Array(160).fill(0));setScore(0);setOver(false);setPiece({shape:SHAPES[1],x:4,y:0,c:2});setPlay(true)};
  useEffect(()=>{if(!play)return;const t=setInterval(down,500);return()=>clearInterval(t)},[play,down]);
  const ghost=[...board];piece.shape.forEach(q=>{const x=piece.x+q.x,y=piece.y+q.y;if(y>=0&&x>=0&&x<10&&y<16)ghost[y*10+x]=piece.c});return <div className="game-inner narrow"><GameHeader score={score} title="BLOCK DROP" sub="Build full rows to clear them."/><div className="block-board">{ghost.map((c,i)=><i key={i} className={c?`block c${c}`:""}/>)}{!play&&<Overlay title={over?"Stacked out!":"Blocks incoming"} text={over?`Final score: ${score}`:"Rotate, slide and clear the board."} action={over?"Try again":"Start game"} onClick={reset}/>}</div><div className="row-controls"><ControlButton label="Left" onPress={()=>move(-1)}>◀</ControlButton><ControlButton label="Rotate" onPress={rotate}>↻</ControlButton><ControlButton label="Drop" onPress={down}>▼</ControlButton><ControlButton label="Right" onPress={()=>move(1)}>▶</ControlButton></div></div>
}

const WORDS=["APPLE","BRAVE","CLOUD","DREAM","FLAME","GRAPE","HAPPY","JUICE","LIGHT","MAGIC","NINJA","OCEAN","PIXEL","QUEST","ROBOT","SOLAR","TIGER","ULTRA","WORLD"];
function WordPop({onScore}:{onScore:(n:number)=>void}) { const target=useMemo(()=>WORDS[new Date().getDate()%WORDS.length],[]);const[guesses,setGuesses]=useState<string[]>([]);const[cur,setCur]=useState("");const[done,setDone]=useState(false);const add=(k:string)=>{if(done)return;if(k==="⌫")setCur(x=>x.slice(0,-1));else if(k==="ENTER"&&cur.length===5){const n=[...guesses,cur];setGuesses(n);setCur("");if(cur===target||n.length===6){setDone(true);onScore(cur===target?(7-n.length)*250:0)}}else if(/^[A-Z]$/.test(k)&&cur.length<5)setCur(x=>x+k)};useEffect(()=>{const f=(e:KeyboardEvent)=>add(e.key==="Backspace"?"⌫":e.key==="Enter"?"ENTER":e.key.toUpperCase());addEventListener("keydown",f);return()=>removeEventListener("keydown",f)});const rows=[...guesses,cur,...Array(6-guesses.length-(cur?1:0)).fill("")];return <div className="game-inner word-wrap"><GameHeader score={done&&guesses.at(-1)===target?(7-guesses.length)*250:0} title="WORD POP" sub="Guess today's five-letter word."/><div className="word-grid">{rows.slice(0,6).map((w,r)=>Array.from({length:5},(_,i)=>{const ch=w[i]||"";const submitted=r<guesses.length;const cls=submitted?(target[i]===ch?"right":target.includes(ch)?"near":"miss"):"";return <i className={cls} key={i}>{ch}</i>}))}</div>{done&&<div className="word-result"><strong>{guesses.at(-1)===target?"Brilliant!":"The word was "+target}</strong><button onClick={()=>{setGuesses([]);setCur("");setDone(false)}}>Play again</button></div>}<div className="keyboard">{["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"].map((row,i)=><div key={row}>{i===2&&<button onClick={()=>add("ENTER")}>ENTER</button>}{[...row].map(k=><button key={k} onClick={()=>add(k)}>{k}</button>)}{i===2&&<button onClick={()=>add("⌫")}>⌫</button>}</div>)}</div></div> }

function make2048(){const a=Array(16).fill(0);a[Math.floor(Math.random()*16)]=2;a[Math.floor(Math.random()*16)]=2;return a} function MergeGame({onScore}:{onScore:(n:number)=>void}) {const[b,setB]=useState(make2048);const[score,setScore]=useState(0);const swipe=useRef<[number,number]|null>(null);const move=(dir:string)=>{const a=[...b];let gain=0,changed=false;const lines=Array.from({length:4},(_,r)=>Array.from({length:4},(_,c)=>dir==="left"||dir==="right"?r*4+c:c*4+r));for(let ids of lines){if(dir==="right"||dir==="down")ids=[...ids].reverse();const vals=ids.map(i=>a[i]).filter(Boolean);for(let i=0;i<vals.length-1;i++)if(vals[i]===vals[i+1]){vals[i]*=2;gain+=vals[i];vals.splice(i+1,1)}while(vals.length<4)vals.push(0);ids.forEach((id,i)=>{if(a[id]!==vals[i])changed=true;a[id]=vals[i]})}if(changed){const empt=a.map((v,i)=>v?null:i).filter(x=>x!==null) as number[];if(empt.length)a[empt[Math.floor(Math.random()*empt.length)]]=Math.random()<.9?2:4;setB(a);const nextScore=score+gain;setScore(nextScore);onScore(nextScore)}};return <div className="game-inner narrow"><GameHeader score={score} title="MERGE 2048" sub="Join matching tiles. Reach 2048."/><div className="merge-board" onPointerDown={e=>swipe.current=[e.clientX,e.clientY]} onPointerUp={e=>{if(!swipe.current)return;const x=e.clientX-swipe.current[0],y=e.clientY-swipe.current[1];move(Math.abs(x)>Math.abs(y)?x>0?"right":"left":y>0?"down":"up")}}>{b.map((n,i)=><i className={n?`n${Math.min(n,2048)}`:""} key={i}>{n||""}</i>)}</div><p className="hint">Swipe the board or use the controls</p><div className="dpad-controls"><span/><ControlButton label="Up" onPress={()=>move("up")}>▲</ControlButton><span/><ControlButton label="Left" onPress={()=>move("left")}>◀</ControlButton><ControlButton label="Down" onPress={()=>move("down")}>▼</ControlButton><ControlButton label="Right" onPress={()=>move("right")}>▶</ControlButton></div><button className="text-btn" onClick={()=>{setB(make2048());setScore(0)}}>New game</button></div>}

const EMOJIS=["🍓","🚀","🐸","⚡","🍄","🌈","👻","💎"];
function MemoryGame({onScore}:{onScore:(n:number)=>void}) {const make=()=>[...EMOJIS,...EMOJIS].sort(()=>Math.random()-.5);const[cards,setCards]=useState(make);const[open,setOpen]=useState<number[]>([]);const[matched,setMatched]=useState<number[]>([]);const[moves,setMoves]=useState(0);const flip=(i:number)=>{if(open.length===2||open.includes(i)||matched.includes(i))return;const n=[...open,i];setOpen(n);if(n.length===2){setMoves(m=>m+1);if(cards[n[0]]===cards[n[1]]){const mm=[...matched,...n];setMatched(mm);setOpen([]);if(mm.length===16)onScore(Math.max(100,2000-(moves+1)*60))}else setTimeout(()=>setOpen([]),650)}};const reset=()=>{setCards(make());setOpen([]);setMatched([]);setMoves(0)};return <div className="game-inner narrow"><GameHeader score={matched.length*100} title="FLIP FRIENDS" sub={`${moves} moves · ${matched.length/2} of 8 pairs`}/><div className="memory-board">{cards.map((c,i)=><button key={i} className={open.includes(i)||matched.includes(i)?"flipped":""} onClick={()=>flip(i)}><span className="card-back">?</span><span className="card-face">{c}</span></button>)}</div>{matched.length===16&&<Overlay title="All matched!" text={`You found every friend in ${moves} moves.`} action="Shuffle again" onClick={reset}/>}</div>}

function MinesGame({onScore}:{onScore:(n:number)=>void}) {const create=()=>{const a=Array(64).fill(0);let n=9;while(n){const i=Math.floor(Math.random()*64);if(a[i]!==-1){a[i]=-1;n--}}return a.map((v,i)=>v===-1?-1:Array.from({length:64},(_,j)=>j).filter(j=>a[j]===-1&&Math.abs(j%8-i%8)<=1&&Math.abs(Math.floor(j/8)-Math.floor(i/8))<=1).length)};const[mines,setMines]=useState(create);const[seen,setSeen]=useState<number[]>([]);const[status,setStatus]=useState<"play"|"lost"|"won">("play");const reveal=(i:number)=>{if(status!=="play")return;if(mines[i]===-1){setSeen(Array.from({length:64},(_,x)=>x));setStatus("lost");return}const s=new Set(seen);const flood=(x:number)=>{if(s.has(x)||x<0||x>=64)return;s.add(x);if(mines[x]===0){[-9,-8,-7,-1,1,7,8,9].forEach(d=>{const j=x+d;if(j>=0&&j<64&&Math.abs(j%8-x%8)<=1)flood(j)})}};flood(i);setSeen([...s]);if(s.size===55){setStatus("won");onScore(1500)}};const reset=()=>{setMines(create());setSeen([]);setStatus("play")};return <div className="game-inner narrow"><GameHeader score={seen.filter(i=>mines[i]!==-1).length*20} title="MINE GARDEN" sub="Reveal every safe patch."/><div className="mines-board">{mines.map((n,i)=><button key={i} onClick={()=>reveal(i)} className={seen.includes(i)?n===-1?"mine":"seen":""}>{seen.includes(i)?n===-1?"✹":n||"":"✿"}</button>)}</div>{status!=="play"&&<Overlay title={status==="won"?"Garden cleared!":"Boom!"} text={status==="won"?"Every safe patch is blooming.":"That flower was hiding a mine."} action="New garden" onClick={reset}/>}</div>}

function Breakout({onScore}:{onScore:(n:number)=>void}) {const canvas=useRef<HTMLCanvasElement>(null);const paddle=useRef(150);const[score,setScore]=useState(0);const[play,setPlay]=useState(false);const[over,setOver]=useState(false);const run=()=>{setScore(0);setOver(false);setPlay(true)};useEffect(()=>{if(!play||!canvas.current)return;const c=canvas.current,ctx=c.getContext("2d")!;let x=180,y=300,dx=2.8,dy=-3.2,raf=0;const bricks=Array.from({length:30},(_,i)=>({x:12+(i%6)*58,y:24+Math.floor(i/6)*27,on:true}));const frame=()=>{ctx.clearRect(0,0,360,420);ctx.fillStyle="#fff4dc";ctx.fillRect(0,0,360,420);bricks.forEach((b,i)=>{if(!b.on)return;ctx.fillStyle=["#ff5d73","#ffb928","#35c8a0","#5a8df5","#9b70e8"][Math.floor(i/6)];ctx.beginPath();ctx.roundRect(b.x,b.y,48,18,5);ctx.fill();if(x>b.x&&x<b.x+48&&y>b.y&&y<b.y+20){b.on=false;dy=Math.abs(dy);setScore(s=>s+50)}});x+=dx;y+=dy;if(x<7||x>353)dx*=-1;if(y<7)dy=Math.abs(dy);if(y>375&&y<395&&x>paddle.current&&x<paddle.current+70)dy=-Math.abs(dy);ctx.fillStyle="#20223b";ctx.beginPath();ctx.roundRect(paddle.current,390,70,10,5);ctx.fill();ctx.fillStyle="#20223b";ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();if(bricks.every(b=>!b.on)){setPlay(false);setOver(true);onScore(1500);return}if(y>430){setPlay(false);setOver(true);return}raf=requestAnimationFrame(frame)};raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf)},[play,onScore]);const shift=(n:number)=>paddle.current=Math.max(0,Math.min(290,paddle.current+n));return <div className="game-inner narrow"><GameHeader score={score} title="BRICK BOUNCE" sub="Break the wall. Save the ball."/><div className="canvas-wrap"><canvas ref={canvas} width="360" height="420"/>{!play&&<Overlay title={over?"Round over":"Ready to bounce?"} text={over?`You banked ${score} points.`:"Move the paddle and clear every brick."} action={over?"Play again":"Start game"} onClick={run}/>}</div><div className="wide-controls"><ControlButton label="Move left" onPress={()=>shift(-28)}>◀ HOLD</ControlButton><ControlButton label="Move right" onPress={()=>shift(28)}>HOLD ▶</ControlButton></div></div>}

function StarCatch({onScore}:{onScore:(n:number)=>void}) {const[playing,setPlaying]=useState(false);const[time,setTime]=useState(20);const[score,setScore]=useState(0);const[pos,setPos]=useState({x:50,y:50});const start=()=>{setScore(0);setTime(20);setPlaying(true);setPos({x:50,y:50})};useEffect(()=>{if(!playing)return;const t=setInterval(()=>setTime(v=>Math.max(0,v-1)),1000);return()=>clearInterval(t)},[playing]);useEffect(()=>{if(playing&&time===0)queueMicrotask(()=>{setPlaying(false);onScore(score)})},[playing,time,score,onScore]);const hit=()=>{setScore(s=>s+100);setPos({x:8+Math.random()*82,y:8+Math.random()*78})};return <div className="game-inner"><GameHeader score={score} title="STAR CATCH" sub={`${time}s left · Tap every star you see`}/><div className="star-field">{playing&&<button className="target-star" style={{left:`${pos.x}%`,top:`${pos.y}%`}} onPointerDown={hit}>★</button>}{!playing&&<Overlay title={time===0?"Time!":"Quick fingers?"} text={time===0?`You caught ${score/100} stars.`:"Catch as many stars as you can in 20 seconds."} action={time===0?"Go again":"Start game"} onClick={start}/>}<i className="planet p1"/><i className="planet p2"/></div></div>}
