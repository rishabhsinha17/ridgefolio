const $=s=>document.querySelector(s);document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));const toggle=$('.menu-toggle');toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',open);$('nav').classList.toggle('open',open);toggle.firstChild.textContent=open?'Close ':'Menu '});function closeMenu(){toggle?.setAttribute('aria-expanded','false');$('nav')?.classList.remove('open');if(toggle)toggle.firstChild.textContent='Menu '}document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus()}});const demo=$('#demo-dialog');let record={name:'Juniper Workshop',type:'Creative studio',reference:'DEMO-0042',status:'Ready for review'};function stage(n){document.querySelectorAll('[data-step-label]').forEach(e=>e.classList.toggle('active',Number(e.dataset.stepLabel)===n));const box=$('#demo-content');if(n===1){box.innerHTML='<form id="sample-form"><label for="sample-name">Business name (fictional)</label><input id="sample-name" value="Juniper Workshop" maxlength="80" required><label for="sample-type">Business activity</label><select id="sample-type"><option>Creative studio</option><option>Retail shop</option><option>Professional services</option></select><div class="demo-explain">An applicant sees the information needed and a clear next step. A full implementation would apply the agency’s actual rules.</div><button class="dialog-action">Create sample application →</button></form>';$('#sample-form').addEventListener('submit',e=>{e.preventDefault();record.name=$('#sample-name').value;record.type=$('#sample-type').value;record.status='Ready for review';stage(2)})}if(n===2){box.innerHTML='<h3>Ready for staff review</h3><dl class="review-list"><div><dt>Business</dt><dd id="review-name"></dd><dt>Activity</dt><dd id="review-type"></dd></div><div><dt>Reference</dt><dd>DEMO-0042</dd><dt>Status</dt><dd>Ready for review</dd></div></dl><div class="demo-explain">Staff can review the same record and log a decision. This example has no actual approval authority.</div><button class="dialog-action" id="complete-sample">Mark sample review complete →</button>';$('#review-name').textContent=record.name;$('#review-type').textContent=record.type;$('#complete-sample').addEventListener('click',()=>{record.status='Sample review complete';stage(3)})}if(n===3){box.innerHTML='<div class="success-mark" aria-hidden="true">✓</div><h3>One complete record.</h3><p class="dialog-copy" style="margin-top:14px">The application and review status are ready to export. In a real project, fields, permissions and retention would be defined with the agency.</p><button class="dialog-action" id="download-record">Download sample CSV ↓</button><button class="dialog-action" id="reset-demo" style="background:#eef3f2;color:#244d42;margin-left:10px">Restart</button><div id="download-status" role="status"></div>';$('#download-record').addEventListener('click',()=>{const csv=v=>'"'+String(v).replaceAll('"','""')+'"';download('ridgefolio-demonstration.csv','reference,business,activity,status,record_type\r\n'+[record.reference,record.name,record.type,record.status,'Synthetic demonstration'].map(csv).join(','),'text/csv');$('#download-status').className='feedback';$('#download-status').textContent='Sample export prepared. No data was sent to a server.'});$('#reset-demo').addEventListener('click',()=>stage(1))}}function download(name,text,type){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>{stage(1);demo.showModal()}));document.querySelectorAll('[data-inquiry]').forEach(b=>b.addEventListener('click',()=>$('#inquiry-dialog').showModal()));$('#inquiry-form')?.addEventListener('submit',e=>{e.preventDefault();const body='Hello Rishabh,\n\nProject: '+$('#project-kind').value+'\n\nWhat we need: '+$('#project-note').value+'\n\nTiming: '+($('#project-timing').value||'To be discussed');const url='mailto:rsinha17@terpmail.umd.edu?subject='+encodeURIComponent('Ridgefolio project inquiry — '+$('#project-kind').value)+'&body='+encodeURIComponent(body);const link=document.createElement('a');link.href=url;link.click();$('#inquiry-status').className='feedback';$('#inquiry-status').textContent='Email draft requested. Review and send it in your mail app, or use the direct email address above.'});
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const projectTabs = [...document.querySelectorAll('[data-project]')];
  function selectProject(tab, focus = false) {
    if (tab.getAttribute('aria-selected') === 'true') return;
    projectTabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (!reduced.matches && panel.animate) panel.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.2,.75,.25,1)'});
    if (focus) tab.focus();
  }
  projectTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectProject(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % projectTabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + projectTabs.length - 1) % projectTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = projectTabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectProject(projectTabs[next], true); }
    });
  });
  document.querySelectorAll('[data-engagement]').forEach(button => button.addEventListener('click', () => document.getElementById('engagement-dialog').showModal()));
  document.querySelectorAll('.practice details').forEach(detail => detail.addEventListener('toggle', () => {
    if (!detail.open || reduced.matches) return;
    detail.querySelector('.service-detail').animate?.([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:250,easing:'ease-out'});
  }));

  // An original, shaded ridge surface. Render only while the view is changing.
  const canvas = document.getElementById('ridge-surface');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const hero = document.querySelector('.hero');
  const pointer = matchMedia('(pointer: fine)');
  const columns = 64, rows = 78;
  const mesh = [];
  for (let j = 0; j <= rows; j++) {
    const v = (j / rows - .5) * 2.5;
    const line = [];
    for (let i = 0; i <= columns; i++) {
      const u = (i / columns - .5) * 2.35;
      const bend = .29 * Math.sin(v * 1.65);
      const ridge = Math.exp(-Math.pow((u - bend) / .4, 2));
      const taper = .53 + .47 * Math.cos(v * .65);
      const z = ridge * 1.22 * taper + .055 * Math.cos(v * 2 + u);
      line.push({x:u,y:v,z});
    }
    mesh.push(line);
  }
  let width=0, height=0, dpr=1, targetX=0, targetY=0, currentX=0, currentY=0, frame=0, inView=true;
  function draw() {
    if (!width || !height) return;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width,height);
    const mobile = hero.clientWidth < 730;
    const yaw = -.68 + currentX * .115;
    const tilt = .92 + currentY * .06;
    const sy=Math.sin(yaw), cy=Math.cos(yaw), st=Math.sin(tilt), ct=Math.cos(tilt);
    const scale = mobile ? Math.min(width*.395,height*.49) : Math.min(width*.273,height*.49);
    const centerX = width*(mobile ? .53 : .757), centerY = height*(mobile ? .59 : .52);
    const projected = mesh.map(line => line.map(p => {
      const rx=p.x*cy-p.y*sy, ry=p.x*sy+p.y*cy;
      const depth=ry*ct+p.z*st;
      const perspective=1 + depth*.075;
      return {x:centerX+rx*scale*perspective,y:centerY+(ry*st-p.z*ct*1.65)*scale*perspective,depth,z:p.z};
    }));
    // Filled facets establish material and occlusion; etched lines describe its construction.
    for (let j=0;j<rows;j++) {
      for (let i=0;i<columns;i++) {
        const a=projected[j][i],b=projected[j][i+1],c=projected[j+1][i+1],d=projected[j+1][i];
        const slope=mesh[j][i+1].z-mesh[j][i].z;
        const shade=Math.max(29,Math.min(93,48+slope*285+a.z*17));
        ctx.fillStyle=`rgb(${shade*.92},${shade},${shade*.88})`;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fill();
      }
    }
    ctx.lineWidth=.65;
    for(let j=0;j<=rows;j++) {
      const alpha=j%5===0?.6:.32;
      ctx.strokeStyle=`rgba(195,207,181,${alpha})`;
      ctx.beginPath();projected[j].forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
    }
    ctx.lineWidth=.5;
    ctx.strokeStyle='rgba(143,161,130,.22)';
    for(let i=0;i<=columns;i+=4){ctx.beginPath();for(let j=0;j<=rows;j++){const p=projected[j][i];if(j)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y)}ctx.stroke()}
  }
  function animate() {
    frame=0;
    if(!inView || document.hidden) return;
    currentX+=(targetX-currentX)*.075;
    currentY+=(targetY-currentY)*.075;
    draw();
    if(Math.abs(targetX-currentX)+Math.abs(targetY-currentY)>.002) frame=requestAnimationFrame(animate);
  }
  function requestFrame(){if(!frame && inView && !document.hidden)frame=requestAnimationFrame(animate)}
  function reset(){targetX=targetY=0;if(reduced.matches){currentX=currentY=0;if(frame)cancelAnimationFrame(frame);frame=0;draw()}else requestFrame()}
  function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw()}
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, {passive:true});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView){draw();requestFrame()}else if(frame){cancelAnimationFrame(frame);frame=0}},{threshold:0}).observe(hero);
  hero.addEventListener('pointermove',event=>{if(reduced.matches||!pointer.matches)return;const r=hero.getBoundingClientRect();targetX=(event.clientX-r.left)/r.width*2-1;targetY=(event.clientY-r.top)/r.height*2-1;requestFrame()},{passive:true});
  hero.addEventListener('pointerleave',reset,{passive:true});
  window.addEventListener('blur',reset);
  if (reduced.addEventListener) reduced.addEventListener('change',reset);
  else reduced.addListener(reset);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;targetX=targetY=currentX=currentY=0}else draw()});
  resize();
})();

// A desktop resize must not leave the mobile navigation expanded.
matchMedia('(min-width:761px)').addEventListener?.('change', closeMenu);
