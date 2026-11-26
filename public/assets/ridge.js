(() => {
  'use strict';
  const stage = document.querySelector('[data-tech]');
  if (!stage) return;
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const state = { w:0, h:0, dpr:1, x:0, y:0, tx:0, ty:0, visible:true, frame:0, last:0, mode:'surface' };
  const poly = (points, fill, stroke, width=.7) => {
    ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p)); ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();} if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();}
  };
  function line(points, color, width=.6, dash=[]){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
  function text(label,x,y,color='#81967b',size=8,align='left'){ctx.fillStyle=color;ctx.font=`${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;ctx.textAlign=align;ctx.fillText(label,x,y);ctx.textAlign='left';}
  function dot(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function begin(){
    ctx.setTransform(state.dpr,0,0,state.dpr,0,0);ctx.clearRect(0,0,state.w,state.h);
    ctx.save();const scale=Math.min((state.w-26)/600,(state.h-125)/450);
    ctx.translate(state.w/2,state.h*.48);ctx.scale(scale,scale);
    ctx.lineJoin='round';ctx.lineCap='round';
  }
  function corners(color){for(const [x,y,sx,sy] of [[-265,-185,1,1],[265,-185,-1,1],[-265,185,1,-1],[265,185,-1,-1]])line([[x,y+sy*7],[x,y],[x+sx*7,y]],color,.7);}
  function grid(color,spacing=32){for(let x=-256;x<=256;x+=spacing)for(let y=-176;y<=176;y+=spacing)dot(x,y,.65,color);}

  const cols=52,rows=65,mesh=[];
  for(let j=0;j<=rows;j++){
    const v=(j/rows-.5)*2.5,row=[];
    for(let i=0;i<=cols;i++){
      const u=(i/cols-.5)*2.35,bend=.29*Math.sin(v*1.65);
      const z=Math.exp(-Math.pow((u-bend)/.4,2))*1.22*(.53+.47*Math.cos(v*.65))+.055*Math.cos(v*2+u);
      row.push({x:u,y:v,z});
    }mesh.push(row);
  }
  function ridge(){
    begin();grid('#afc2a413',32);corners('#a4b69955');
    const yaw=-.63+state.x*.22,tilt=.88+state.y*.1,sy=Math.sin(yaw),cy=Math.cos(yaw),st=Math.sin(tilt),ct=Math.cos(tilt);
    const scale=157;
    const project=p=>{
      const rx=p.x*cy-p.y*sy,ry=p.x*sy+p.y*cy,depth=ry*ct+p.z*st,per=1+depth*.055;
      return {x:rx*scale*per,y:37+(ry*st-p.z*ct*1.48)*scale*per,depth,z:p.z};
    };
    const points=mesh.map(row=>row.map(project));
    const cells=[];
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const ps=[points[j][i],points[j][i+1],points[j+1][i+1],points[j+1][i]],slope=mesh[j][i+1].z-mesh[j][i].z;
      const shade=Math.max(32,Math.min(99,48+slope*210+ps[0].z*21));
      cells.push({ps,depth:ps.reduce((sum,p)=>sum+p.depth,0)/4,shade});
    }
    if(state.mode==='surface'){
      cells.sort((a,b)=>a.depth-b.depth);
      for(const cell of cells){const sh=cell.shade;poly(cell.ps.map(p=>[p.x,p.y]),`rgb(${sh*.88},${sh},${sh*.84})`,null);}
    }
    for(let j=0;j<=rows;j++){
      const strong=j%5===0;
      line(points[j].map(p=>[p.x,p.y]),state.mode==='wire'?(strong?'#d2ddc894':'#9bb18a40'):(strong?'#c3d1b58c':'#b1c39f38'),strong?.75:.5);
    }
    for(let i=0;i<=cols;i+=3)line(points.map(row=>[row[i].x,row[i].y]),state.mode==='wire'?'#a6bd954b':'#b1c39f2b',.5);
    const spine=mesh.map((row,j)=>{let highest=row.reduce((best,p,i)=>p.z>row[best].z?i:best,0);return points[j][highest];});
    line(spine.map(p=>[p.x,p.y]),'#d2986a99',1.15);
    const p=spine[Math.floor(rows*.65)];dot(p.x,p.y,2.5,'#efc5a1');
    line([[p.x,p.y],[p.x+25,p.y-28],[p.x+90,p.y-28]],'#bdc9af8a',.6);
    text('f(x, y)',p.x+31,p.y-35,'#bdc9af',8);
    text('PARAMETRIC SURFACE',-247,210,'#a4b69988',7);
    text('STRUCTURE / BEHAVIOR',247,210,'#a4b69988',7,'right');
    ctx.restore();
  }

  function draw(){if(state.w&&state.h){ridge();stage.classList.add("is-drawn");}}
  function frame(now){
    state.frame=0;if(!state.visible||document.hidden)return;
    if(now-state.last<30){state.frame=requestAnimationFrame(frame);return;}
    state.last=now;
    state.x+=(state.tx-state.x)*.09;state.y+=(state.ty-state.y)*.09;
    draw();
    if(!reduced.matches&&Math.abs(state.tx-state.x)+Math.abs(state.ty-state.y)>.002)state.frame=requestAnimationFrame(frame);
  }
  function request(){if(!state.frame&&state.visible&&!document.hidden)state.frame=requestAnimationFrame(frame);}
  function resize(){const r=canvas.getBoundingClientRect();state.w=r.width;state.h=r.height;state.dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*state.dpr);canvas.height=Math.round(r.height*state.dpr);draw();request();}
  function reset(){state.tx=state.ty=0;if(reduced.matches)state.x=state.y=0;request();}
  stage.addEventListener('pointermove',e=>{if(!fine.matches||reduced.matches)return;const r=stage.getBoundingClientRect();state.tx=(e.clientX-r.left)/r.width-.5;state.ty=(e.clientY-r.top)/r.height-.5;request();},{passive:true});
  stage.addEventListener('pointerleave',reset,{passive:true});
  stage.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{state.mode=button.dataset.mode;stage.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw();}));
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);else addEventListener('resize',resize,{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;if(state.visible)request();else if(state.frame){cancelAnimationFrame(state.frame);state.frame=0;}},{threshold:0}).observe(stage);
  reduced.addEventListener('change',()=>{state.tx=state.ty=state.x=state.y=0;if(state.frame)cancelAnimationFrame(state.frame);state.frame=0;draw();request();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.frame){cancelAnimationFrame(state.frame);state.frame=0;}else request();});
  addEventListener('blur',reset);
  document.fonts.ready.then(draw);
  resize();
})();
