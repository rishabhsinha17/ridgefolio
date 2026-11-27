// Run with node scripts/chart-plates.mjs to rebuild the published chart assets.
import {readFile, writeFile} from "node:fs/promises";
import sharp from "sharp";

const assets = new URL("../public/assets/", import.meta.url);
const parks = JSON.parse(await readFile(new URL("parks.json", assets), "utf8"));
const paper = "https://arxiv.org/abs/2610.37679v1";
const research = "https://github.com/rishabhsinha17/latent-state-auditing/tree/eb44e3105f3f5cd56f20df05de19247addf55fe5/analysis";
const master = "https://github.com/rishabhsinha17/cgs-industrial-parks-dashboard/blob/673480b96b7dbfce3990cc9f72208c87c65b54a9/data/master/CGS_Industrial_Parks_Sept_2024.csv";

// Published Figure 1. Each cell records AUROC and its lower/upper bootstrap bounds.
// Columns are mixed-training exposure, mixed-training commitment, and retrained commitment.
const matrix = [
  ["Qwen2.5-7B", [1,1,1], [.672,.605,.743], [.853,.799,.897]],
  ["Mistral-7B", [.282,.223,.343], [.835,.793,.874], [.896,.866,.923]],
  ["OLMo-2-7B", [.957,.912,.989], [.785,.742,.826], [.912,.887,.935]],
];
// Published Figure 2, rounded as in the paper. The final field is the grouped-fold mean when reported.
const groups = [
  ["Mixed training", [
    ["Activation probe", .672,.605,.743], ["NLA text (NB)", .556,.483,.629]]],
  ["Commitment training", [
    ["Logistic activation probe", .853,.799,.897,.795], ["Centroid activation probe", .763,.691,.819,.747],
    ["Visible text (TF-IDF)", .855,.803,.901,.780], ["Visible text (NB)", .793,.737,.850,.673],
    ["Zero-shot self-judge", .615,.563,.668], ["NLA text (NB)", .570,.500,.644,.565],
    ["NLA text (TF-IDF)", .518,.444,.594]]],
  ["Steps before action", [
    ["Logistic probe, two steps", .878,.833,.921], ["Logistic probe, one step", .871,.821,.917]]],
  ["Other model families", [
    ["Mistral-7B", .896,.866,.923,.856], ["OLMo-2-7B", .912,.887,.935,.905]]],
];

const P = { paper:"#faf9f3", ink:"#183c33", muted:"#486157", faint:"#dae1d7", green:"#326e58", strong:"#1e5746", red:"#873e2d", redwash:"#f4ded1", wash:"#e3ede2" };
const escape = text => String(text).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const decimal = n => n.toFixed(3);
const line = (x,y,x2,y2,color=P.faint,attrs="") => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" ${attrs}/>`;
const rect = (x,y,width,height,color) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}"/>`;
const text = (x,y,value,size=16,attrs="") => `<text x="${x}" y="${y}" font-size="${size}" ${attrs}>${escape(value)}</text>`;
const circle = (x,y,r,attrs) => `<circle cx="${x}" cy="${y}" r="${r}" ${attrs}/>`;
const diamond = (x,y,r) => `<path d="M${x} ${y-r}l${r} ${r} -${r} ${r} -${r} -${r}Z" fill="${P.paper}" stroke="${P.ink}" stroke-width="1.5"/>`;
const label = (x,y,s,size=14) => text(x,y,s,size,'class="label"');
const note = (x,y,s,size=14) => text(x,y,s,size,`fill="${P.muted}"`);
const end = 'text-anchor="end"';
const center = 'text-anchor="middle"';
const fmt = n => +n.toFixed(2);

function art(width,height,title,description,source,marks) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">${escape(title)}</title><desc id="description">${escape(description)}</desc><metadata>${escape(source)}</metadata>
<style>text{font-family:Arial,Helvetica,sans-serif;font-variant-numeric:tabular-nums}.display{font-family:Georgia,"Times New Roman",serif;letter-spacing:-.025em}.label{font-weight:bold;letter-spacing:.06em}</style>
${rect(0,0,width,height,P.paper)}<g fill="${P.ink}">${marks.join("\n")}</g></svg>\n`;
}

function strata(compact) {
  const w=compact?390:900, h=compact?508:530, pad=compact?18:40;
  const m=[label(pad,compact?30:39,"AGENTDOJO  /  MONITOR EVALUATION",compact?11:14),
    text(pad,compact?69:98,"What the probe detects",compact?31:55,'class="display"'),
    note(pad,compact?93:130,"AUROC by training contrast and model",compact?15:21)];
  const start=compact?pad:220, step=(w-pad-start)/3, cy=compact?131:182;
  m.push(label(start,cy,"MIXED TRAINING",compact?10.8:14), label(start+step*2,cy,"RETRAINED",compact?10.8:14));
  m.push(line(start,cy+8,start+step*2-9,cy+8,P.ink),line(start+2*step,cy+8,w-pad,cy+8,P.ink));
  for(const [i,s] of ["Exposure","Commitment","Commitment"].entries())m.push(text(start+i*step+2,cy+29,s,compact?15:20));
  for(const [r,[model,...cells]] of matrix.entries()){
    const y=compact?180+r*84:237+r*79;
    m.push(text(pad,y+(compact?0:36),model,compact?16:23,'font-weight="bold"'));
    for(const [c,[v,lo,hi]] of cells.entries()){
      const x=start+c*step, top=y+(compact?9:0);
      const dark=v>=.85;
      const fill=v<.5?P.redwash:dark?P.strong:P.wash;
      const ink=dark?"#fffefa":v<.5?P.red:P.ink;
      m.push(rect(x,top,step-5,compact?49:65,fill),
        text(x+8,top+(compact?23:30),decimal(v),compact?21:27,`fill="${ink}" font-weight="bold"`),
        text(x+8,top+(compact?39:52),decimal(lo)+"–"+decimal(hi),compact?11.3:15,`fill="${ink}"`));
    }
  }
  const y=compact?435:477;
  m.push(line(pad,y,w-pad,y),note(pad,y+20,"Ranges are 95% bootstrap intervals. Chance = 0.500.",compact?12.2:15),
    note(pad,y+(compact?39:40),compact?"Retrained probes use exposed cases only.":"Retrained probes use exposed cases only. Exposure was not a training target.",compact?12.2:15));
  if(compact)m.push(note(pad,y+57,"Exposure was not a training target in this condition.",12.2));
  const description=matrix.map(([name,...cells])=>name+" "+cells.map(([v,l,u])=>decimal(v)+" ("+decimal(l)+"–"+decimal(u)+")").join(", ")).join(". ");
  return art(w,h,"What the probe detects", "Activation-probe AUROC. Columns show mixed-training exposure, mixed-training commitment, then retrained commitment. "+description, paper+" · Figure 1 · "+research,m);
}

function forest(compact) {
  const w=compact?365:900,pad=compact?12:40,x0=compact?168:335,x1=compact?310:729;
  const x=n=>fmt(x0+(x1-x0)*(n-.42)/.58);
  const m=[label(pad,compact?29:39,"AGENTDOJO  /  PRE-ACTION MONITORS",compact?11:14),
    text(pad,compact?67:94,"Predicting commitment",compact?32:51,'class="display"'),
    note(pad,compact?92:126,"Out-of-fold AUROC with 95% bootstrap intervals",compact?14:20)];
  const key=compact?120:163;
  m.push(circle(pad+5,key-4,4,`fill="${P.strong}"`),text(pad+17,key,"Stratified folds",compact?13:17),
    diamond(compact?147:232,key-4,4.6),text(compact?161:248,key,"Grouped-fold mean",compact?13:17));
  let y=compact?177:224;
  const chartTop=y-21;
  const rows=[];
  groups.forEach(([heading,entries])=>{
    rows.push(text(pad,y,heading,compact?16:20,'font-weight="bold"'));
    y+=compact?26:31;
    for(const [name,v,lo,hi,g] of entries){
      const a=x(lo),b=x(hi),val=x(v);
      rows.push(`<g><title>${escape(name)}: ${decimal(v)}, 95% interval ${decimal(lo)}–${decimal(hi)}${g==null?"":", grouped mean "+decimal(g)}</title>`,
        text(pad,y+4,name,compact?13.7:17),
        line(a,y,b,y,P.green,'stroke-width="3"'),line(a,y-4,a,y+4,P.green),line(b,y-4,b,y+4,P.green),
        circle(val,y,compact?4:5,`fill="${P.strong}"`));
      if(g!=null)rows.push(diamond(x(g),y+4,compact?4:5));
      rows.push(text(w-pad,y+4,compact?decimal(v):decimal(v)+"   ["+decimal(lo)+"–"+decimal(hi)+"]",compact?13.7:16,end),"</g>");
      y+=compact?27:30;
    }
    rows.push(line(pad,y-9,w-pad,y-9));
    y+=compact?18:22;
  });
  const axis=chartTop-5;
  for(const tick of [.5,.6,.7,.8,.9,1]){
    const tx=x(tick);
    m.push(line(tx,chartTop,tx,y-37,tick===.5?"#879b8b":P.faint,tick===.5?'stroke-dasharray="4 5"':''),
      text(tx,axis,tick.toFixed(1),compact?10:14,center));
  }
  m.push(text(w-pad,axis,compact?"Score":"AUROC  [95% interval]",compact?10:13,end),...rows,
    note(pad,y-5,"Qwen2.5-7B unless another model is named.",compact?12:15),
    note(pad,y+15,"NB = naive Bayes. Chance = 0.500.",compact?12:15));
  return art(w,y+34,"Predicting commitment",groups.map(([name,rows])=>name+": "+rows.map(([label,v,l,h,g])=>label+" "+decimal(v)+" ["+decimal(l)+", "+decimal(h)+"]"+(g==null?"":"; grouped "+decimal(g))).join(". ")).join(". "),paper+" · Figure 2 · "+research,m);
}

const categories=[
  ["Operational","Operational","#2b6561"],
  ["Operational with Continued Construction","Operating and expanding","#81b5a7"],
  ["Under Construction","Under construction","#bd653c"],
  ["Before Construction","Before construction","#dfae66"],
  ["Stalled","Stalled","#766079"],["Unclear","Unclear","#a6a89b"]
];
function regional(compact) {
  const w=compact?400:900,h=compact?530:600,pad=compact?18:40;
  const regions=Map.groupBy(parks,p=>p.region);
  const ranked=[...regions].sort((a,b)=>b[1].length-a[1].length);
  const m=[label(pad,compact?30:40,"INDONESIA  /  MAY 2025 HANDOVER",compact?11:14),
    text(pad,compact?70:99,"Industrial parks by region",compact?30:52,'class="display"'),
    note(pad,compact?97:138,parks.length+" parks  ·  "+regions.size+" regions  ·  Reported site status",compact?14:19)];
  const x0=compact?122:236, x1=w-(compact?52:95), x=n=>x0+(x1-x0)*n/70, top=compact?146:196, gap=compact?34:40;
  for(const tick of [0,20,40,60]){
    m.push(text(x(tick),top-13,String(tick),compact?11:15,center),line(x(tick),top-4,x(tick),top+gap*6+24));
  }
  ranked.forEach(([region,rows],i)=>{
    const y=top+i*gap;
    m.push(text(pad,y+14,region,compact?13:18),text(w-pad,y+14,String(rows.length),compact?15:19,end+' font-weight="bold"'));
    let n=0;
    for(const [status,,color] of categories){
      const count=rows.filter(p=>p.status===status).length;
      if(count)m.push(`<g><title>${escape(region+" · "+status+": "+count)}</title>`,rect(fmt(x(n)),y,fmt(x(n+count)-x(n)),compact?16:21,color),"</g>");
      n+=count;
    }
    if(n!==rows.length)throw Error("Unrepresented park status in "+region);
  });
  const ky=top+gap*7+21;
  m.push(line(pad,ky-10,w-pad,ky-10));
  const cols=compact?2:3;
  for(const [i,[,label,color]] of categories.entries()){
    const x=pad+(i%cols)*(w-2*pad)/cols,y=ky+15+Math.floor(i/cols)*(compact?21:25);
    m.push(rect(x,y-10,10,10,color),text(x+16,y,label,compact?12.2:16));
  }
  m.push(note(pad,h-17,"University of Maryland Center for Global Sustainability",compact?11.1:14));
  return art(w,h,"Industrial parks by region",ranked.map(([n,r])=>n+": "+r.length).join(", ")+". Each park is counted once by its reported status.",master,m);
}

function dashboard() {
  // "Main Industry" from the archived master CSV, grouped with dashboard.html lines 395–408.
  const industry=[["Mixed/general",77],["Manufacturing",19],["Nickel",14],["Palm oil",7],["Unknown",7],["Petrochemical",5],["Aluminum",4],["Coal",3],["Chemicals",2],["Other metals",2],["IT",1]];
  const counts=categories.map(([name,label,color])=>[label,parks.filter(p=>p.status===name).length,color]).sort((a,b)=>b[1]-a[1]);
  if(industry.reduce((sum,[,n])=>sum+n,0)!==parks.length) throw Error("Industry total does not reconcile");
  const m=[label(32,37,"INDONESIA  /  MAY 2025 HANDOVER"),text(32,92,"Inside the industrial parks dataset",43,'class="display"')];
  for(const [x,heading,rows] of [[32,"Reported site status",counts],[478,"Main industry",industry]]){
    m.push(text(x,143,heading,23,'font-weight="bold"'),line(x,156,x+391,156));
    rows.forEach(([name,n,color],i)=>{const y=186+i*24;m.push(text(x,y,name,14),rect(x+170,y-11,n*2.35,10,color||P.green),text(x+386,y,n,15,end));});
  }
  m.push(note(32,480,"Number of parks  ·  University of Maryland Center for Global Sustainability",15));
  return art(900,505,"Industrial park status and industry","Two distributions from 141 named parks.",master,m);
}

function forestPreview() {
  const rows=groups[1][1].filter((_,i)=>[0,1,2,5].includes(i));
  const x=n=>Math.round(330+(n-.45)*930);
  const marks=[label(38,40,"QWEN2.5-7B  /  COMMITMENT TRAINING"),
    text(38,106,"Four pre-action monitors",50,'class="display"'),
    note(38,146,"Out-of-fold AUROC with 95% bootstrap intervals",22)];
  for(const tick of [.5,.6,.7,.8,.9,1]) {
    marks.push(text(x(tick),200,tick.toFixed(1),18,center),line(x(tick),214,x(tick),433,P.faint));
  }
  rows.forEach(([name,v,lo,hi],i)=>{
    const y=245+i*55;
    marks.push(text(38,y+6,name,21),line(x(lo),y,x(hi),y,P.green,'stroke-width="5"'),
      line(x(lo),y-7,x(lo),y+7,P.green),line(x(hi),y-7,x(hi),y+7,P.green),
      circle(x(v),y,8,'fill="'+P.strong+'"'),text(869,y+7,decimal(v),20,end+' font-weight="bold"'));
  });
  marks.push(line(38,451,862,451),note(38,485,"Selected comparisons from Figure 2 · Exposure Is Not Commitment",19));
  return art(900,530,"Four pre-action monitors","Qwen2.5-7B results under commitment training. "+rows.map(([n,v,l,h])=>n+" "+decimal(v)+", interval "+decimal(l)+"–"+decimal(h)).join(". "),paper,marks);
}

await writeFile(new URL("project-evidence/monitor-confidence-preview.svg",assets),forestPreview());
const files=[["monitor-strata",strata],["monitor-confidence",forest],["regional-status",regional]];
for(const [stem,figure] of files)for(const compact of [false,true]){
  await writeFile(new URL("project-evidence/"+stem+(compact?"-compact":"")+".svg",assets),figure(compact));
}
const raster = async (svg,path,width) => {
  const data=await sharp(Buffer.from(svg),{density:2*72}).resize({width}).webp({quality:92}).toBuffer();
  await writeFile(new URL(path,assets),data);
};
await raster(strata(false),"editorial/monitor-results.webp",1800);
await raster(dashboard(),"showcase/dashboard-charts.webp",1800);
