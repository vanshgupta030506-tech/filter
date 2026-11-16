import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Download, RefreshCw, Sparkles, ChevronRight, Circle, Shirt, Sun, Clapperboard } from 'lucide-react';
import { FilesetResolver, PoseLandmarker, ImageSegmenter } from '@mediapipe/tasks-vision';
import './style.css';

const looks = [["Rekha","Himmatwala · 1983","sari","#ce286f","Gold jhumkas","drops"],["Vijay","Deewaar · 1975","denim","#28415c","Knotted neck scarf","scarf"],["Iqbal","Coolie · 1983","cotton","#bc3024","Brass porter badge","badge"],["Jimmy","Disco Dancer · 1982","disco","#302f38","Silver headband","band"],["Mona","Saagar · 1985","silk","#a93236","Gold hoops","hoops"],["Chandni","Chandni · 1989","sari","#f2d246","Pearl earrings","pearls"],["Mohini","Tezaab · 1988","fringe","#d72e80","Stage earrings","drops"],["Mogambo","Mr. India · 1987","braid","#28352e","Gold epaulettes","epaulettes"],["Umrao","Umrao Jaan · 1981","brocade","#8c2745","Pearl choker","choker"],["Prem","Maine Pyar Kiya · 1989","leather","#302d2e","Patched black leather · burgundy shirt","badge"]].map(([title,film,kind,base,tagline,accessory])=>({
  title, film, kind, tagline, accessory, id:title, icon:'✦', colors:[base,'#dfb875'],
  rgb:[1,3,5].map(i=>parseInt(base.slice(i,i+2),16))
}));

const jacketPhoto = new Image();
let jacketPixels;
jacketPhoto.onload = () => {
  const canvas = document.createElement('canvas');
  canvas.width = jacketPhoto.width;
  canvas.height = jacketPhoto.height;
  const context = canvas.getContext('2d');
  context.drawImage(jacketPhoto, 0, 0);
  jacketPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
};
jacketPhoto.src = '/prem-fit.png';

const wardrobe=new Image(), hair=new Image();
let textiles;
wardrobe.onload=()=>{
  const sheet=document.createElement('canvas');
  sheet.width=wardrobe.width;sheet.height=wardrobe.height;
  const brush=sheet.getContext('2d');
  brush.drawImage(wardrobe,0,0);
  textiles=brush.getImageData(0,0,sheet.width,sheet.height).data;
};
let hairPixels;
hair.onload=()=>{
  const crop=document.createElement('canvas');crop.width=120;crop.height=34;
  const brush=crop.getContext('2d');
  for(let x=0;x<120;x++){
    const crown=8+30*((x-60)/60)**2;
    brush.drawImage(hair,18+x,crown+6,1,34,x,0,1,34);
  }
  hairPixels=brush.getImageData(0,0,120,34).data;
};
wardrobe.src='/costumes.webp';hair.src='/prem-hair.png';
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
    case 'band':
      ctx.beginPath();ctx.moveTo(-.44,.11);ctx.quadraticCurveTo(0,.015,.44,.11);
      ctx.lineTo(.43,.16);ctx.quadraticCurveTo(0,.07,-.43,.16);ctx.closePath();ctx.fill();break;
    case 'scarf':ctx.fillStyle='#a82826';ctx.beginPath();ctx.moveTo(-.42,neck);ctx.lineTo(.45,neck);ctx.lineTo(.18,neck+.38);ctx.closePath();ctx.fill();break;
    case 'badge':oval(-.31*shoulderWidth/width,neck+.32,.12,.072);ctx.fillStyle='#33291b';ctx.font='bold 0.065px sans-serif';ctx.textAlign='center';ctx.fillText(look.title==='Iqbal'?'786':'PREM',-.31*shoulderWidth/width,neck+.34);break;
    case 'epaulettes':for(const sign of [-1,1])for(let n=0;n<3;n++)ctx.fillRect(sign*.32*shoulderWidth/width-.14,neck+n*.03,.28,.017);break;
    case 'choker':for(let n=-5;n<=5;n++){ctx.fillStyle='#f5e1b8';oval(n*.061,1.08+.055*Math.cos(n*.28),.035,.026)}break;
    case 'drops':
      for(const sign of [-1,1]){
        const cx=sign*.48;
        const gold=ctx.createLinearGradient(cx-.045,0,cx+.045,0);
        ['#78511e','#ffdf85','#ba812b','#ffdd84','#815321'].forEach((c,i)=>gold.addColorStop(i/4,c));
        ctx.fillStyle=gold;
        oval(cx,.72,.018,.018);
        ctx.fillRect(cx-.005,.731,.01,.032);
        ctx.beginPath();
        ctx.ellipse(cx,.804,.048,.047,0,Math.PI,2*Math.PI);
        ctx.closePath();ctx.fill();
        for(let bead=-2;bead<=2;bead++)oval(cx+bead*.018,.809,.008,.009);
      }
      break;
    default:for(const sign of [-1,1]){const cx=sign*.48;oval(cx,.72,.023,.018);if(look.accessory==='hoops')oval(cx,.82,.057,.09,false);else{ctx.fillStyle=look.accessory==='pearls'?'#efe5ce':metal;oval(cx,.80,.041,.05);if(look.accessory==='drops')oval(cx,.86,.066,.036)}}
  }
  ctx.restore();
}

function App(){
  const videoRef=useRef(null), garmentCanvasRef=useRef(null), landmarkerRef=useRef(null), segmenterRef=useRef(null), rafRef=useRef(null), streamRef=useRef(null), lastPoseRef=useRef(null), maskRef=useRef(null), selectedRef=useRef(looks[0]);
  const [selected,setSelected]=useState(looks.find(item=>item.title==="Prem")); const [camera,setCamera]=useState('idle'); const [error,setError]=useState(''); const [poseReady,setPoseReady]=useState(false); const [captured,setCaptured]=useState(null); const [timer,setTimer]=useState(false); const [mode,setMode]=useState('live');
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
    const source=document.createElement('canvas'), sourceCtx=source.getContext('2d');
    let previous=-1;
    function render(now){
      rafRef.current=requestAnimationFrame(render);
      if(video.readyState<2 || video.currentTime===previous)return;
      previous=video.currentTime;
      const w=640,h=Math.round(w*video.videoHeight/video.videoWidth);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
      if(source.width!==w||source.height!==h){source.width=w;source.height=h}
      sourceCtx.drawImage(video,0,0,w,h);
      segmenterRef.current.segmentForVideo(source,now,result=>{
        const mask=result.confidenceMasks[4];
        if(!mask)return;
        const confidence=mask.getAsFloat32Array(), mw=mask.width,mh=mask.height;
        ctx.save();ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(source,0,0,w,h);ctx.restore();
        const frame=ctx.getImageData(0,0,w,h), pixels=frame.data;
        let left=mw,right=0,top=mh;
        for(let i=0;i<confidence.length;i++)if(confidence[i]>.6){left=Math.min(left,i%mw);right=Math.max(right,i%mw);top=Math.min(top,Math.floor(i/mw))}
        const look=selectedRef.current.kind;
        const scalp=result.confidenceMasks[1].getAsFloat32Array();
        let hl=mw,hr=0,ht=mh,hb=0;
        if(look==='leather')for(let i=0;i<scalp.length;i++)if(scalp[i]>.6){
          const x=i%mw,y=Math.floor(i/mw);hl=Math.min(hl,x);hr=Math.max(hr,x);ht=Math.min(ht,y);hb=Math.max(hb,y);
        }
        const jacket=look==='leather' && jacketPixels;
        const tile=looks.indexOf(selectedRef.current);
        // Estimate the neckline from the upper clothing band. Sleeves lower in
        // the frame must not move the shirt's button line sideways.
        let neckSum=0, neckCount=0;
        const span=Math.max(1,right-left);
        const rowLeft=new Int32Array(mh).fill(mw),rowRight=new Int32Array(mh).fill(-1);
        for(let row=top;row<mh;row++)for(let col=left;col<=right;col++){
          if(confidence[row*mw+col]<.45)continue;
          rowLeft[row]=Math.min(rowLeft[row],col);
          rowRight[row]=Math.max(rowRight[row],col);
          if(row<top+span*.10){neckSum+=col;neckCount++}
        }
        const neck=neckCount?neckSum/neckCount:(left+right)/2;
        // Measure the upper torso independently of sleeves near the camera.
        const shoulderRow = Math.min(mh-1, top+Math.round(span*.24*w*mh/(mw*h)));
        const shoulderSpan = Math.max(span*.55, rowRight[shoulderRow]-rowLeft[shoulderRow]);
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){
          const mx=Math.floor((w-1-x)*mw/w),my=Math.floor(y*mh/h);
          const blend=Math.min(1,Math.max(0,(confidence[my*mw+mx]-.12)*2.8));
          if(hairPixels && look==='leather' && hr>hl && hb>ht && scalp[my*mw+mx]>.2){
            const hx=Math.min(119,Math.max(0,Math.round(119*(hr-mx)/(hr-hl))));
            const hy=Math.min(33,Math.max(0,Math.round(33*(my-ht)/(hb-ht))));
            const target=(y*w+x)*4, sample=(hy*120+hx)*4;
            for(let k=0;k<3;k++)pixels[target+k]+=.8*scalp[my*mw+mx]*(hairPixels[sample+k]-pixels[target+k]);
          }
          if(!blend)continue;
          const i=(y*w+x)*4, light=(pixels[i]*.30+pixels[i+1]*.59+pixels[i+2]*.11)/255;
          const half=Math.max(span*.32,mx>neck?rowRight[my]-neck:neck-rowLeft[my]);
          const u=.5+(mx-neck)/(2*half),v=(my-top)/Math.max(1,right-left);
          let color=selectedRef.current.rgb;
          if(look==='sari'&&Math.abs(u-v*.7-.16)<.06)color=[230,172,67];
          if(look==='disco'&&(Math.cos(u*250)*Math.cos(v*250)>.67 || Math.abs(Math.abs(u-.5)-v*.38)<.025))color=[211,215,228];
          if(look==='braid' && (Math.abs(u-.5)<.012 || (v%.12<.012 && Math.abs(u-.5)<.22)))color=[193,148,72];
          if(look==='brocade' && Math.cos(u*120)*Math.sin(v*108)>.72)color=[199,152,82];
          if(look==='fringe' && v<.28 && Math.cos(u*155)>.86)color=[228,179,123];
          if(look==='denim' && Math.abs(u-.5)<.008)color=[165,143,97];
          if(jacket){
            const width=jacketPhoto.naturalWidth,height=jacketPhoto.naturalHeight;
            const depth=Math.max(0,Math.min(1,(my-top)*h/mh/(span*w/mw)));
            const ty=Math.round(depth*(height-1));
            const center=.49*width;
            const side=mx-neck;
            const halfSpan=Math.max(span*.34,side>0?rowRight[my]-neck:neck-rowLeft[my]);
            const distance=Math.min(1,Math.abs(side)/halfSpan);
            const edge=side>0?(60-54*depth):(388+28*depth);
            const tx=Math.round(center+(edge-center)*distance);
            const sample=(ty*width+tx)*4;
            const luminance=.3*jacketPixels[sample]+.59*jacketPixels[sample+1]+.11*jacketPixels[sample+2];
            const exposure=.68+.58*light;
            for(let k=0;k<3;k++){
              let value=jacketPixels[sample+k];
              if(look==='denim')value=.32*value+luminance*[.54,.78,1.18][k]+[6,13,24][k];
              if(look==='disco')value=.17*value+Math.sqrt(luminance/255)*[160,165,180][k];
              pixels[i+k]+=blend*(value*exposure-pixels[i+k]);
            }
            continue;
          }
          if(textiles && tile>=0 && tile<9){
            const tileX=tile%3,tileY=Math.floor(tile/3);
            const sideWidth = mx < neck ? neck-rowLeft[my] : rowRight[my]-neck;
            const horizontal = .5-(mx-neck)/(2*Math.max(1,sideWidth));
            const sx=Math.floor((tileX+.001+.998*Math.min(1,Math.max(0,horizontal)))*wardrobe.width/3);
            const sy=Math.floor((tileY+.01+.98*Math.min(1,Math.max(0,(my-top)*h*mw/(w*mh*shoulderSpan*1.22))))*wardrobe.height/3);
            const sample=(sy*wardrobe.width+sx)*4;
            for(let k=0;k<3;k++)pixels[i+k]+=blend*(textiles[sample+3]/255)*(textiles[sample+k]*(.7+.55*light)-pixels[i+k]);
            continue;
          }
          const shade=.17+light*1.22+.025*Math.sin(mx*12+my*7);
          for(let k=0;k<3;k++)pixels[i+k]+=blend*(color[k]*shade+35*light**4-pixels[i+k]);
        }
        ctx.putImageData(frame,0,0);
        if(right>left && ['disco','fringe','silk','sari'].includes(look))accessories(ctx,selectedRef.current,result.confidenceMasks[3],w,h,(right-left)*w/mw,top*h/mh);
      });
    }
    rafRef.current=requestAnimationFrame(render);
  };
  const timeout = useRef(null);
  useEffect(() => () => clearTimeout(timeout.current), []);
  const capture = () => {
    if (timeout.current !== null || !poseReady || mode === 'photo') return;
    let seconds = 5;
    setTimer(seconds);
    const tick = () => {
      seconds -= 1;
      setTimer(seconds);
      if (seconds > 0) {
        timeout.current = setTimeout(tick, 1000);
        return;
      }
      timeout.current = null;
      setCaptured(garmentCanvasRef.current.toDataURL('image/png'));
      setMode('photo');
    };
    timeout.current = setTimeout(tick, 1000);
  };
  const download=()=>{if(!captured)return;const a=document.createElement('a');a.href=captured;a.download=`shaam-e-cinema-${selected.id}.png`;a.click()};
  return <main>
    <header><img src="/wordmark.jpg" alt="Shaam-e-Cinema"/><h1>Bollywood Photo Booth</h1></header>
    <section className="booth">
      <div>
        <div className="stage">
          <video ref={videoRef} playsInline muted hidden={camera!=='live'}/>
          <canvas ref={garmentCanvasRef} hidden={!poseReady}/>
          {camera!=='live' && <div className="entrance"><button onClick={startCamera} disabled={camera==='starting'}><Camera size={18}/> {camera==='starting'?'Opening camera…':'Open camera'}</button>{error && <p role="alert">{error}</p>}</div>}
          {timer>0 && <output aria-live="assertive">{timer}</output>}
          {mode==='photo' && <img src={captured} alt="Your costume portrait"/>}
        </div>
        <div className="caption"><div><strong>{selected.title}</strong><small>{selected.film}</small></div>
        {mode==='photo' ? <div className="actions"><button onClick={()=>{setCaptured(null);setMode('live')}}>Retake</button><button onClick={download}>Save photo</button></div> :
        <button disabled={!poseReady || !!timer} onClick={capture}><Camera size={17}/> Take photo <small>5 sec</small></button>}</div>
      </div>
      <aside><h2>Choose your costume</h2><div className="list">{looks.map(look=><button key={look.id} aria-pressed={selected===look} disabled={!!timer || mode==='photo'} onClick={()=>setSelected(look)}>
        <i style={{backgroundColor:look.colors[0]}}/><span>{look.title}<small>{look.film}</small></span>{selected===look && <b aria-hidden="true">✓</b>}</button>)}</div></aside>
    </section>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
