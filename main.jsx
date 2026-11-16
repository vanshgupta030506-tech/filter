import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Download, RefreshCw, Sparkles, ChevronRight, Circle, Shirt, Sun, Clapperboard } from 'lucide-react';
import { FilesetResolver, PoseLandmarker, ImageSegmenter } from '@mediapipe/tasks-vision';
import './style.css';

const looks = [["Rekha","Himmatwala · 1983","sari","#ce286f","Gold jhumkas","drops"],["Vijay","Deewaar · 1975","denim","#28415c","Knotted neck scarf","scarf"],["Iqbal","Coolie · 1983","cotton","#bc3024","Brass porter badge","badge"],["Jimmy","Disco Dancer · 1982","disco","#302f38","Silver headband","band"],["Mona","Saagar · 1985","silk","#a93236","Gold hoops","hoops"],["Chandni","Chandni · 1989","sari","#f2d246","Pearl earrings","pearls"],["Mohini","Tezaab · 1988","fringe","#d72e80","Stage earrings","drops"],["Mogambo","Mr. India · 1987","braid","#28352e","Gold epaulettes","epaulettes"],["Umrao","Umrao Jaan · 1981","brocade","#8c2745","Pearl choker","choker"],["Prem","Maine Pyar Kiya · 1989","leather","#302d2e","Jacket badge","badge"]].map(([title,film,kind,base,tagline,accessory])=>({
  title, film, kind, tagline, accessory, id:title, icon:'✦', colors:[base,'#dfb875'],
  rgb:[1,3,5].map(i=>parseInt(base.slice(i,i+2),16))
}));

function accessories(ctx, look, mask, w, h, shoulderWidth, garmentTop){
  const values=mask.getAsFloat32Array();
  let left=mask.width,right=0,top=mask.height,bottom=0;
  for(let i=0;i<values.length;i++)if(values[i]>.7){
    const x=i%mask.width,y=Math.floor(i/mask.width);
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<=left)return;
  const x=w*(1-(left+right)/(2*mask.width)), y=h*top/mask.height;
  const width=(right-left)*w/mask.width,height=(bottom-top)*h/mask.height;
  ctx.save();ctx.translate(x,y);ctx.scale(width,height);
  const metal=ctx.createLinearGradient(-.55,0,.55,0);
  const silver=look.accessory==='band';
  ['#795325','#fff2b8','#b78439','#fff6d0','#89602e'].forEach((c,i)=>metal.addColorStop(i/4,silver?['#56555a','#ffffff','#aaa9ac','#ececf0','#747477'][i]:c));
  ctx.fillStyle=ctx.strokeStyle=metal;ctx.lineWidth=.022;
  const oval=(cx,cy,rx,ry,fill=true)=>{ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,2*Math.PI);fill?ctx.fill():ctx.stroke()};
  const neck=(garmentTop-y)/height;
  switch(look.accessory){
    case 'band':ctx.fillRect(-.52,.09,1.04,.085);break;
    case 'scarf':ctx.fillStyle='#a82826';ctx.beginPath();ctx.moveTo(-.42,neck);ctx.lineTo(.45,neck);ctx.lineTo(.18,neck+.38);ctx.closePath();ctx.fill();break;
    case 'badge':oval(-.31*shoulderWidth/width,neck+.32,.12,.072);ctx.fillStyle='#33291b';ctx.font='bold 0.065px sans-serif';ctx.textAlign='center';ctx.fillText(look.title==='Iqbal'?'786':'PREM',-.31*shoulderWidth/width,neck+.34);break;
    case 'epaulettes':for(const sign of [-1,1])for(let n=0;n<3;n++)ctx.fillRect(sign*.32*shoulderWidth/width-.14,neck+n*.03,.28,.017);break;
    case 'choker':for(let n=-5;n<=5;n++){ctx.fillStyle='#f5e1b8';oval(n*.061,1.08+.055*Math.cos(n*.28),.035,.026)}break;
    default:for(const sign of [-1,1]){const cx=sign*.48;oval(cx,.72,.023,.018);if(look.accessory==='hoops')oval(cx,.82,.057,.09,false);else{ctx.fillStyle=look.accessory==='pearls'?'#efe5ce':metal;oval(cx,.80,.041,.05);if(look.accessory==='drops')oval(cx,.86,.066,.036)}}
  }
  ctx.restore();
}

function App(){
  const videoRef=useRef(null), garmentCanvasRef=useRef(null), landmarkerRef=useRef(null), segmenterRef=useRef(null), rafRef=useRef(null), streamRef=useRef(null), lastPoseRef=useRef(null), maskRef=useRef(null), selectedRef=useRef(looks[0]);
  const [selected,setSelected]=useState(looks[0]); const [camera,setCamera]=useState('idle'); const [error,setError]=useState(''); const [poseReady,setPoseReady]=useState(false); const [captured,setCaptured]=useState(null); const [timer,setTimer]=useState(false); const [mode,setMode]=useState('live');
  useEffect(()=>{selectedRef.current=selected},[selected]);
  useEffect(()=>()=>{cancelAnimationFrame(rafRef.current); streamRef.current?.getTracks().forEach(t=>t.stop()); landmarkerRef.current?.close?.()},[]);
  const startCamera=async()=>{
    setError(''); setCamera('starting');
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:800}},audio:false}); streamRef.current=stream;
      const video=videoRef.current; video.srcObject=stream; await video.play(); setCamera('live');
      const vision=await FilesetResolver.forVisionTasks('/wasm');
      const options={baseOptions:{modelAssetPath:'/clothing.tflite'},runningMode:'VIDEO',outputConfidenceMasks:true};
      segmenterRef.current=await ImageSegmenter.createFromOptions(vision,options);
      setPoseReady(true);
      drawLoop();
    } catch(e){ setCamera('idle'); setError(e.name==='NotAllowedError'?'Camera access was blocked. Allow camera access in your browser settings, then try again.':'Could not start the camera. Check that it is connected and not being used by another app.'); }
  };
  const drawLoop=()=>{
    const video=videoRef.current, canvas=garmentCanvasRef.current;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    let previous=-1;
    function render(now){
      rafRef.current=requestAnimationFrame(render);
      if(video.readyState<2 || video.currentTime===previous)return;
      previous=video.currentTime;
      const w=640,h=Math.round(w*video.videoHeight/video.videoWidth);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
      segmenterRef.current.segmentForVideo(video,now,result=>{
        const mask=result.confidenceMasks[4];
        if(!mask)return;
        const confidence=mask.getAsFloat32Array(), mw=mask.width,mh=mask.height;
        ctx.save();ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,w,h);ctx.restore();
        const frame=ctx.getImageData(0,0,w,h), pixels=frame.data;
        let left=mw,right=0,top=mh;
        for(let i=0;i<confidence.length;i++)if(confidence[i]>.6){left=Math.min(left,i%mw);right=Math.max(right,i%mw);top=Math.min(top,Math.floor(i/mw))}
        const look=selectedRef.current.kind;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){
          const mx=Math.floor((w-1-x)*mw/w),my=Math.floor(y*mh/h);
          const blend=Math.min(1,Math.max(0,(confidence[my*mw+mx]-.28)*2));
          if(!blend)continue;
          const i=(y*w+x)*4, light=(pixels[i]*.30+pixels[i+1]*.59+pixels[i+2]*.11)/255;
          const u=(mx-left)/Math.max(1,right-left),v=(my-top)/Math.max(1,right-left);
          let color=selectedRef.current.rgb;
          if(look==='sari'&&Math.abs(u-v*.7-.16)<.06)color=[230,172,67];
          if(look==='disco'&&(Math.cos(u*250)*Math.cos(v*250)>.67 || Math.abs(Math.abs(u-.5)-v*.38)<.025))color=[211,215,228];
          if(look==='braid' && (Math.abs(u-.5)<.012 || (v%.12<.012 && Math.abs(u-.5)<.22)))color=[193,148,72];
          if(look==='brocade' && Math.cos(u*120)*Math.sin(v*108)>.72)color=[199,152,82];
          if(look==='fringe' && v<.28 && Math.cos(u*155)>.86)color=[228,179,123];
          if(look==='denim' && Math.abs(u-.5)<.008)color=[165,143,97];
          const shade=.17+light*1.22+.025*Math.sin(mx*12+my*7);
          for(let k=0;k<3;k++)pixels[i+k]+=blend*(color[k]*shade+35*light**4-pixels[i+k]);
        }
        ctx.putImageData(frame,0,0);
        if(right>left)accessories(ctx,selectedRef.current,result.confidenceMasks[3],w,h,(right-left)*w/mw,top*h/mh);
      });
    }
    rafRef.current=requestAnimationFrame(render);
  };
  const capture=()=>{ if(!videoRef.current||camera!=='live')return; setTimer(true); setTimeout(()=>{const v=videoRef.current, c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const x=c.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(v,0,0);x.setTransform(1,0,0,1,0,0);const overlay=garmentCanvasRef.current;if(overlay)x.drawImage(overlay,0,0,c.width,c.height);setCaptured(c.toDataURL('image/png'));setMode('photo');setTimer(false)},900); };
  const download=()=>{if(!captured)return;const a=document.createElement('a');a.href=captured;a.download=`filmi-fit-${selected.id}.png`;a.click()};
  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">F</span><span>FILMI<span className="brand-accent">FIT</span><small>THE BOLLYWOOD PHOTO BOOTH</small></span></a><div className="top-center"><span className="live-dot"/> MADE FOR YOUR MAIN CHARACTER MOMENT</div><button className="about-button" onClick={()=>document.getElementById('about').showModal()}>THE IDEA <ChevronRight size={15}/></button></header>
    <section className="intro"><div className="intro-kicker"><Sparkles size={14}/> YOUR SCENE. YOUR STYLE. YOUR STAR TURN.</div><h1>Lights, camera,<br/><em>you.</em></h1><p>Step into the frame. Pick an iconic Bollywood look.<br className="desktop-only"/> The spotlight is yours.</p></section>
    <section className="booth-layout">
      <div className="screen-wrap"><div className="screen-top"><div><span className="screen-label">THE BIG SCREEN</span><span className="screen-sub">LIVE FROM YOUR CAMERA</span></div><div className="screen-status"><span className={camera==='live'?'live-dot':'status-dot'}/>{camera==='live'?'LIVE':camera==='starting'?'WAKING UP…':'READY WHEN YOU ARE'}</div></div>
        <div className="camera-stage">
          <video ref={videoRef} className="camera-video" playsInline muted style={{display:camera==='live'?'block':'none'}}/>
          <div className="preview-placeholder" style={{display:camera==='live'?'none':'flex'}}><div className="placeholder-sun"/><div className="placeholder-arch"><div className="placeholder-person"><i/><b/><span/></div></div><span className="placeholder-caption">YOUR CLOSE-UP STARTS HERE</span></div>
          <canvas ref={garmentCanvasRef} className="camera-overlay" style={{objectFit:"cover",display:poseReady&&camera==='live'?'block':'none'}}/>
          {camera!=='live'&&<div className="frame-guides"><span/><i/><b/></div>}
          {camera!=='live'&&<div className="camera-cta"><span className="cta-icon"><Camera size={22}/></span><strong>{camera==='starting'?'Getting the stage ready…':'Ready for your close-up?'}</strong><span>Your camera stays right here on your device.</span><button className="primary-button" onClick={startCamera} disabled={camera==='starting'}><Camera size={17}/>{camera==='starting'?'STARTING CAMERA':'START THE CAMERA'}</button>{error&&<p className="error-message">{error}</p>}</div>}
          {camera==='live'&&<div className="viewfinder-label"><span>● REC</span><span>FILMI FIT · CAM 01</span></div>}
          {timer&&<div className="flash-count">3</div>}
          {mode==='photo'&&captured&&<div className="photo-result"><img src={captured}/><div className="photo-actions"><span>THAT'S A WRAP!</span><button onClick={download}><Download size={16}/> SAVE PHOTO</button><button className="retake" onClick={()=>setMode('live')}><RefreshCw size={15}/> RETAKE</button></div></div>}
        </div>
        <div className="screen-footer"><span><Sparkles size={14}/> {poseReady?'LIVE FABRIC FIT':camera==='live'?'LOADING FABRIC FIT':'CAMERA OFF'}</span><span>ONE STAR AT A TIME</span></div>
      </div>
      <aside className="wardrobe"><div className="wardrobe-heading"><span className="screen-label">THE COSTUME DEPARTMENT</span><span className="wardrobe-count">{String(looks.length).padStart(2,'0')} LOOKS</span></div><h2>Pick your <em>picture.</em></h2><p className="wardrobe-copy">A little 80s. A lot of leading role.</p><div className="look-list" style={{maxHeight:350,overflowY:"auto"}}>{looks.map((look,i)=><button className={`look-card ${selected.id===look.id?'selected':''}`} key={look.id} onClick={()=>{setSelected(look);setCaptured(null);setMode('live')}}><span className="look-thumb" style={{'--color-a':look.colors[0],'--color-b':look.colors[1]}}><span>{look.icon}</span></span><span className="look-info"><strong>{look.title}</strong><small>{look.film}</small></span><span className="look-number">{String(i+1).padStart(2,'0')}</span></button>)}</div>
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
