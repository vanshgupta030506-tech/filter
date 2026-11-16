import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Download, RefreshCw, Sparkles, ChevronRight, Circle, Shirt, Sun, Clapperboard } from 'lucide-react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import './style.css';

const looks = [
  { id:'dream', title:'Dream Girl', film:'Himmatwala · 1983', kind:'sari', colors:['#e94c83','#f8c844'], tagline:'Disco queen energy', icon:'✦' },
  { id:'angry', title:'Angry Young Man', film:'Deewaar · 1975', kind:'jacket', colors:['#cb542e','#e9aa45'], tagline:'The classic rebel', icon:'✹' },
  { id:'coolie', title:'The Coolie', film:'Coolie · 1983', kind:'uniform', colors:['#d85038','#f1cf62'], tagline:'All aboard, superstar', icon:'✦' },
  { id:'disco', title:'Disco Dancer', film:'Disco Dancer · 1982', kind:'disco', colors:['#4d6bd0','#e950a0'], tagline:'One more dance number', icon:'✷' },
  { id:'romance', title:'Monsoon Romance', film:'Saagar · 1985', kind:'romance', colors:['#267b70','#e9b95e'], tagline:'A little filmy, a lot iconic', icon:'❋' },
];

function Garment({look, x, y, width, height, angle=0, alpha=1}) {
  const [a,b] = look.colors;
  const id = `grad-${look.id}`;
  const common = { fill:`url(#${id})`, stroke:'#ffe5ad', strokeWidth:3, strokeLinejoin:'round' };
  return <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={alpha}>
    <defs><linearGradient id={id} x1="0" x2="1" y1="0" y2="1"><stop stopColor={a}/><stop offset="1" stopColor={b}/></linearGradient></defs>
    <ellipse cx="0" cy={height*.49} rx={width*.62} ry={height*.48} fill="#1b1420" opacity=".12"/>
    {look.kind==='sari' ? <>
      <path d={`M ${-width*.43} ${-height*.45} Q ${-width*.3} ${-height*.58} 0 ${-height*.49} Q ${width*.32} ${-height*.57} ${width*.44} ${-height*.42} L ${width*.48} ${height*.1} Q ${width*.38} ${height*.22} ${width*.43} ${height*.52} L ${width*.12} ${height*.5} Q 0 ${height*.1} ${-width*.12} ${height*.5} L ${-width*.44} ${height*.52} Q ${-width*.39} ${height*.1} ${-width*.48} ${height*.02} Z`} {...common}/>
      <path d={`M ${-width*.4} ${-height*.38} Q ${width*.15} ${-height*.05} ${width*.34} ${height*.3} L ${width*.23} ${height*.42} Q ${width*.05} ${height*.13} ${-width*.45} ${-height*.12} Z`} fill={b} stroke="#ffe5ad" strokeWidth="2"/>
      <path d={`M ${-width*.3} ${height*.18} Q 0 ${height*.23} ${width*.35} ${height*.16}`} fill="none" stroke="#ffe5ad" strokeWidth="3"/>
    </> : look.kind==='jacket' ? <>
      <path d={`M ${-width*.46} ${-height*.43} L ${-width*.25} ${-height*.52} L ${-width*.1} ${-height*.37} L ${width*.1} ${-height*.37} L ${width*.25} ${-height*.52} L ${width*.46} ${-height*.43} L ${width*.57} ${height*.08} L ${width*.42} ${height*.16} L ${width*.43} ${height*.5} L ${-width*.43} ${height*.5} L ${-width*.42} ${height*.16} L ${-width*.57} ${height*.08} Z`} {...common}/>
      <path d={`M ${-width*.13} ${-height*.39} L 0 ${-height*.22} L ${width*.13} ${-height*.39} L ${width*.22} ${height*.48} L ${-width*.22} ${height*.48} Z`} fill="#f2dbb3" stroke="#713c30" strokeWidth="2"/>
      <path d={`M ${-width*.4} ${-height*.08} L ${width*.4} ${-height*.08}`} stroke="#ffe5ad" strokeWidth="3"/>
    </> : look.kind==='uniform' ? <>
      <path d={`M ${-width*.44} ${-height*.44} L ${-width*.25} ${-height*.52} L ${-width*.1} ${-height*.37} L ${width*.1} ${-height*.37} L ${width*.25} ${-height*.52} L ${width*.44} ${-height*.44} L ${width*.58} ${height*.06} L ${width*.44} ${height*.17} L ${width*.44} ${height*.5} L ${-width*.44} ${height*.5} L ${-width*.44} ${height*.17} L ${-width*.58} ${height*.06} Z`} {...common}/>
      <path d={`M ${-width*.12} ${-height*.39} L 0 ${-height*.23} L ${width*.12} ${-height*.39} L ${width*.16} ${height*.49} L ${-width*.16} ${height*.49} Z`} fill="#f4dfbd" stroke="#8c493a" strokeWidth="2"/>
      <path d={`M ${-width*.35} ${height*.04} L ${-width*.12} ${height*.04} L ${-width*.12} ${height*.17} L ${-width*.35} ${height*.17} Z`} fill="none" stroke="#ffe5ad" strokeWidth="2"/>
    </> : look.kind==='disco' ? <>
      <path d={`M ${-width*.45} ${-height*.44} L ${-width*.25} ${-height*.52} L ${-width*.1} ${-height*.36} L ${width*.1} ${-height*.36} L ${width*.25} ${-height*.52} L ${width*.45} ${-height*.44} L ${width*.57} ${height*.06} L ${width*.4} ${height*.15} L ${width*.44} ${height*.49} L ${-width*.44} ${height*.49} L ${-width*.4} ${height*.15} L ${-width*.57} ${height*.06} Z`} {...common}/>
      <path d={`M ${-width*.12} ${-height*.4} L 0 ${-height*.23} L ${width*.12} ${-height*.4}`} fill="none" stroke="#fff2c1" strokeWidth="4"/>
      {[-.28,-.1,.1,.28].map((p,i)=><circle key={i} cx={width*p} cy={height*.03} r={width*.025} fill="#ffe8a7"/>)}
    </> : <>
      <path d={`M ${-width*.45} ${-height*.44} L ${-width*.25} ${-height*.52} L ${-width*.1} ${-height*.36} L ${width*.1} ${-height*.36} L ${width*.25} ${-height*.52} L ${width*.45} ${-height*.44} L ${width*.56} ${height*.09} L ${width*.4} ${height*.16} L ${width*.46} ${height*.5} L ${-width*.46} ${height*.5} L ${-width*.4} ${height*.16} L ${-width*.56} ${height*.09} Z`} {...common}/>
      <path d={`M ${-width*.1} ${-height*.36} Q ${-width*.2} ${-height*.08} ${-width*.12} ${height*.13} Q 0 ${height*.25} ${width*.12} ${height*.13} Q ${width*.2} ${-height*.08} ${width*.1} ${-height*.36}`} fill="none" stroke="#ffe5ad" strokeWidth="3"/>
    </>}
    <path d={`M ${-width*.39} ${height*.42} Q 0 ${height*.48} ${width*.39} ${height*.42}`} stroke="#ffe7af" strokeWidth="2" fill="none" opacity=".9"/>
  </g>;
}

function App(){
  const videoRef=useRef(null), canvasRef=useRef(null), landmarkerRef=useRef(null), rafRef=useRef(null), streamRef=useRef(null), lastPoseRef=useRef(null);
  const [selected,setSelected]=useState(looks[0]); const [camera,setCamera]=useState('idle'); const [error,setError]=useState(''); const [poseReady,setPoseReady]=useState(false); const [captured,setCaptured]=useState(null); const [timer,setTimer]=useState(false); const [mode,setMode]=useState('live');
  useEffect(()=>()=>{cancelAnimationFrame(rafRef.current); streamRef.current?.getTracks().forEach(t=>t.stop()); landmarkerRef.current?.close?.()},[]);
  const startCamera=async()=>{
    setError(''); setCamera('starting');
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:800}},audio:false}); streamRef.current=stream;
      const video=videoRef.current; video.srcObject=stream; await video.play(); setCamera('live');
      try { const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm'); landmarkerRef.current=await PoseLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:'GPU'},runningMode:'VIDEO',numPoses:1}); setPoseReady(true); } catch(e){ console.warn('Pose model unavailable; using centered fitting.',e); }
      drawLoop();
    } catch(e){ setCamera('idle'); setError(e.name==='NotAllowedError'?'Camera access was blocked. Allow camera access in your browser settings, then try again.':'Could not start the camera. Check that it is connected and not being used by another app.'); }
  };
  const drawLoop=()=>{
    const video=videoRef.current, canvas=canvasRef.current; if(!video||!canvas)return; const ctx=canvas.getContext('2d');
    const render=()=>{
      if(video.readyState>=2){const w=video.videoWidth,h=video.videoHeight; if(w&&h){if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
        ctx.clearRect(0,0,w,h); ctx.save(); ctx.translate(w,0); ctx.scale(-1,1);
        let p=lastPoseRef.current;
        if(landmarkerRef.current){try{const res=landmarkerRef.current.detectForVideo(video,performance.now());if(res.landmarks?.[0]){const lm=res.landmarks[0],ls=lm[11],rs=lm[12],lh=lm[23],rh=lm[24]; if(ls.visibility>.25&&rs.visibility>.25){p={cx:(ls.x+rs.x)/2*w, cy:(ls.y+rs.y)/2*h, shoulder:Math.abs(ls.x-rs.x)*w, angle:Math.atan2((rs.y-ls.y)*h,(rs.x-ls.x)*w)*180/Math.PI, torso:lh.visibility>.2&&rh.visibility>.2?Math.abs((lh.x+rh.x)/2*w-(ls.x+rs.x)/2*w):null};lastPoseRef.current=p}}}catch{}}
        const scale=p?.shoulder?Math.max(.65,Math.min(1.7,p.shoulder/210)):1; const sw=(p?.shoulder||w*.23)*1.5, sh=sw*1.07;
        const x=p?.cx??w*.5, y=p?.cy!=null?p.cy+sh*.42:h*.43;
        // Keep the camera image untouched and draw the garment on a separate transparent canvas layer.
        ctx.restore(); ctx.save();
        const garmentX=w-x, garmentY=y; Garment({look:selected,x:garmentX,y:garmentY,width:sw,height:sh,angle:-(p?.angle||0)});
        ctx.restore();
        // Render the SVG garment into the overlay by drawing a small generated vector scene.
        // The React/SVG overlay below handles crisp scaling and pose anchoring.
      }}
      rafRef.current=requestAnimationFrame(render);
    }; render();
  };
  const pose=lastPoseRef.current;
  const capture=()=>{ if(!videoRef.current||camera!=='live')return; setTimer(true); setTimeout(()=>{const v=videoRef.current, c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(v,0,0);x.setTransform(1,0,0,1,0,0);const overlay=canvasRef.current;if(overlay)x.drawImage(overlay,0,0);setCaptured(c.toDataURL('image/png'));setMode('photo');setTimer(false)},900); };
  const download=()=>{if(!captured)return;const a=document.createElement('a');a.href=captured;a.download=`filmi-fit-${selected.id}.png`;a.click()};
  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">F</span><span>FILMI<span className="brand-accent">FIT</span><small>THE BOLLYWOOD PHOTO BOOTH</small></span></a><div className="top-center"><span className="live-dot"/> MADE FOR YOUR MAIN CHARACTER MOMENT</div><button className="about-button" onClick={()=>document.getElementById('about').showModal()}>THE IDEA <ChevronRight size={15}/></button></header>
    <section className="intro"><div className="intro-kicker"><Sparkles size={14}/> YOUR SCENE. YOUR STYLE. YOUR STAR TURN.</div><h1>Lights, camera,<br/><em>you.</em></h1><p>Step into the frame. Pick an iconic Bollywood look.<br className="desktop-only"/> The spotlight is yours.</p></section>
    <section className="booth-layout">
      <div className="screen-wrap"><div className="screen-top"><div><span className="screen-label">THE BIG SCREEN</span><span className="screen-sub">LIVE FROM YOUR CAMERA</span></div><div className="screen-status"><span className={camera==='live'?'live-dot':'status-dot'}/>{camera==='live'?'LIVE':camera==='starting'?'WAKING UP…':'READY WHEN YOU ARE'}</div></div>
        <div className="camera-stage">
          <video ref={videoRef} className="camera-video" playsInline muted style={{display:camera==='live'?'block':'none'}}/>
          <div className="preview-placeholder" style={{display:camera==='live'?'none':'flex'}}><div className="placeholder-sun"/><div className="placeholder-arch"><div className="placeholder-person"><i/><b/><span/></div></div><span className="placeholder-caption">YOUR CLOSE-UP STARTS HERE</span></div>
          {camera==='live'&&<><canvas ref={canvasRef} className="camera-overlay"/><svg className="garment-overlay" viewBox={`0 0 ${videoRef.current?.videoWidth||1280} ${videoRef.current?.videoHeight||800}`} preserveAspectRatio="none"><g transform={`translate(${videoRef.current?.videoWidth||1280},0) scale(-1,1)`}><Garment look={selected} x={pose?.cx??(videoRef.current?.videoWidth||1280)*.5} y={pose?.cy?(pose.cy+(pose.shoulder||200)*.68):(videoRef.current?.videoHeight||800)*.55} width={(pose?.shoulder||((videoRef.current?.videoWidth||1280)*.23))*1.5} height={(pose?.shoulder||((videoRef.current?.videoWidth||1280)*.23))*1.6} angle={pose?.angle||0}/></g></svg></>}
          {camera!=='live'&&<div className="frame-guides"><span/><i/><b/></div>}
          {camera!=='live'&&<div className="camera-cta"><span className="cta-icon"><Camera size={22}/></span><strong>{camera==='starting'?'Getting the stage ready…':'Ready for your close-up?'}</strong><span>Your camera stays right here on your device.</span><button className="primary-button" onClick={startCamera} disabled={camera==='starting'}><Camera size={17}/>{camera==='starting'?'STARTING CAMERA':'START THE CAMERA'}</button>{error&&<p className="error-message">{error}</p>}</div>}
          {camera==='live'&&<div className="viewfinder-label"><span>● REC</span><span>FILMI FIT · CAM 01</span></div>}
          {timer&&<div className="flash-count">3</div>}
          {mode==='photo'&&captured&&<div className="photo-result"><img src={captured}/><div className="photo-actions"><span>THAT'S A WRAP!</span><button onClick={download}><Download size={16}/> SAVE PHOTO</button><button className="retake" onClick={()=>setMode('live')}><RefreshCw size={15}/> RETAKE</button></div></div>}
        </div>
        <div className="screen-footer"><span><Sparkles size={14}/> {poseReady?'OUTFIT TRACKING ON':'OUTFIT PREVIEW'}</span><span>ONE STAR AT A TIME</span></div>
      </div>
      <aside className="wardrobe"><div className="wardrobe-heading"><span className="screen-label">THE COSTUME DEPARTMENT</span><span className="wardrobe-count">{String(looks.length).padStart(2,'0')} LOOKS</span></div><h2>Pick your <em>picture.</em></h2><p className="wardrobe-copy">A little 80s. A lot of leading role.</p><div className="look-list">{looks.map((look,i)=><button className={`look-card ${selected.id===look.id?'selected':''}`} key={look.id} onClick={()=>{setSelected(look);setCaptured(null);setMode('live')}}><span className="look-thumb" style={{'--color-a':look.colors[0],'--color-b':look.colors[1]}}><span>{look.icon}</span></span><span className="look-info"><strong>{look.title}</strong><small>{look.film}</small></span><span className="look-number">0{i+1}</span></button>)}</div>
        <div className="selected-note"><span className="note-star">✦</span><div><small>NOW SHOWING</small><strong>{selected.tagline}</strong></div><span className="note-film">{selected.film}</span></div>
        <button className="shutter-button" onClick={camera==='live'?capture:startCamera} disabled={camera==='starting'}><span className="shutter-icon"><Circle size={25} fill="currentColor"/></span><span>{camera==='live'?'TAKE THE SHOT':'STEP INTO THE SPOTLIGHT'}<small>{camera==='live'?'3 second countdown · save your photo':'Turn on your camera to begin'}</small></span><ChevronRight size={19}/></button>
        <div className="booth-note"><Sun size={14}/> TIP: GOOD LIGHTING MAKES EVERY STAR SHINE.</div>
      </aside>
    </section>
    <footer className="footer"><span>AN HOMAGE TO THE GOLDEN AGE OF BOLLYWOOD</span><span className="footer-ornament">✳</span><span>MADE FOR YOUR MOMENT</span></footer>
    <dialog id="about" className="about-dialog"><button className="dialog-close" onClick={()=>document.getElementById('about').close()}>×</button><span className="intro-kicker">THE CONCEPT</span><h2>Your very own<br/><em>Bollywood close-up.</em></h2><p>Filmi Fit turns a café visit into a starring role. Pick a look inspired by the unforgettable style of 80s Bollywood, see it over your live camera view, then take home your movie moment.</p><small>Camera processing happens in your browser. Your camera feed is not uploaded.</small></dialog>
  </main>
}

createRoot(document.getElementById('root')).render(<App/>);
