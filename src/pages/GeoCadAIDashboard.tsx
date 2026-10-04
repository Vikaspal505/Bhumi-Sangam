import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers, Search, Download, ChevronDown, ChevronRight, Eye, EyeOff,
  Sliders, Activity, Cpu, Building2, Map, Maximize2, ArrowLeftRight,
  Ruler, Box, GitMerge, Network, Satellite, Layers3, BrainCircuit,
  TriangleAlert, Crosshair, ChevronUp, Terminal, Gauge, HardDrive,
  Move3D, PlusCircle, MinusCircle, Send, Globe, Percent,
  User, Lock, ChevronLeft, Bell, FileUp, UploadCloud, Check,
  Clock, Database, AlignLeft, BarChart, SplitSquareHorizontal, Layers2, ShieldCheck, Banknote, Sparkles, MessageSquareCode
} from 'lucide-react';

interface LayerConfig { id:string;label:string;sublabel:string;icon:React.ReactNode;color:string;active:boolean;opacity:number; }
interface ChatMsg { id:string;role:'user'|'ai';text:string;ts:string;type:'sql'|'python'|'text'; }

function hexToRgb(hex:string){const r=parseInt(hex.slice(1,3),16);const g=parseInt(hex.slice(3,5),16);const b=parseInt(hex.slice(5,7),16);return r+','+g+','+b;}

const INIT_LAYERS: LayerConfig[] = [
  { id:'cadastral',label:'2D Parcel Boundaries (Adjusted via ICP)',sublabel:'LA_SpatialUnit',icon:<Map size={13}/>,color:'#00E5FF',active:true,opacity:90 },
  { id:'lidar',label:'Classified UAV Point Cloud (GMM Filtered)',sublabel:'GMM Noise Filtered',icon:<Layers3 size={13}/>,color:'#8B5CF6',active:true,opacity:75 },
  { id:'citygml',label:'3D Polyhedral Building Units',sublabel:'LA_LegalSpaceBuildingUnit - LOD2.2+',icon:<Building2 size={13}/>,color:'#F59E0B',active:true,opacity:100 },
  { id:'stratified',label:'Stratified Vertical Extents',sublabel:'LA_VerticalExtent',icon:<Layers2 size={13}/>,color:'#10B981',active:true,opacity:85 },
  { id:'utility',label:'Subterranean Utility & Metro Networks',sublabel:'LA_LegalSpaceUtilityNetwork',icon:<Network size={13}/>,color:'#EF4444',active:true,opacity:70 },
  { id:'sar',label:'Bitemporal SAR Flood Inundation',sublabel:'MRF Change Layer',icon:<Satellite size={13}/>,color:'#3B82F6',active:false,opacity:0 },
];

const INIT_CHAT: ChatMsg[] = [
  {id:'c1',role:'ai',text:'Dual-Agent GeoAI Assistant initialized. I can route spatial queries to CodeS-7B (Text-to-SQL) or complex analytics to the Python Coding Agent. How can I assist you with Block 14-Urban?',ts:'18:40',type:'text'},
];

const CONSOLE_LOGS = [
  '[18:41:02] [Apache Sedona] INFO: Distributed spatial join started on 12 workers.',
  '[18:41:05] [PostGIS] ST_3DIntersects: Evaluated 14,200 building units against utility buffers. 0 collisions.',
  '[18:41:09] [ICP Alignment] Boundary registration converged. RMSE: 0.61m (Target < 1.0m) OK.',
  '[18:41:12] [PolyFit] Surface reconstruction completed for Sector 4. CSG-to-B-Rep exported to cache.',
];

const SBadge:React.FC<{s:'ok'|'warn'|'error'|'info';label:string;pulse?:boolean}>=({s,label,pulse})=>{
  const c={ok:'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',warn:'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',error:'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',info:'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30'};
  const d={ok:'bg-[#10B981]',warn:'bg-[#F59E0B]',error:'bg-[#EF4444]',info:'bg-[#00E5FF]'};
  return React.createElement('span',{className:'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide '+c[s]},
    pulse!==false?React.createElement('span',{className:'relative flex h-1.5 w-1.5'},
      React.createElement('span',{className:'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 '+d[s]}),
      React.createElement('span',{className:'relative inline-flex rounded-full h-1.5 w-1.5 '+d[s]})
    ):null,label);
};

const CBar:React.FC<{v:number;label:string}>=({v,label})=>{
  const c=v>=90?'#10B981':v>=70?'#F59E0B':'#EF4444';
  return React.createElement('div',{className:'mb-2.5'},
    React.createElement('div',{className:'flex justify-between text-[10px] mb-1.5'},
      React.createElement('span',{className:'text-slate-300 font-mono'},label),
      React.createElement('span',{className:'font-mono font-bold',style:{color:c}},v+'%')),
    React.createElement('div',{className:'bg-[#0B0F19] rounded-full h-1.5 overflow-hidden border border-slate-800'},
      React.createElement('div',{className:'h-full rounded-full transition-all duration-700 relative overflow-hidden',style:{width:v+'%',backgroundColor:c}},
        React.createElement('div',{className:'absolute inset-0 bg-white/20',style:{transform:'translateX(-100%)',animation:'shimmer 2s infinite'}})
      )));
};

const Acc:React.FC<{title:string;icon:React.ReactNode;children:React.ReactNode;open?:boolean}>=({title,icon,children,open:io=false})=>{
  const [open,setOpen]=useState(io);
  return React.createElement('div',{className:'border-b border-slate-800/80'},
    React.createElement('button',{onClick:()=>setOpen(o=>!o),className:'w-full flex items-center justify-between px-3.5 py-3 text-xs hover:bg-[#131C2E]/60 transition-colors'},
      React.createElement('span',{className:'flex items-center gap-2.5 text-slate-400'},icon,React.createElement('span',{className:'text-slate-200 font-semibold tracking-wide'},title)),
      React.createElement(ChevronDown,{size:13,className:'text-slate-500 transition-transform '+(open?'rotate-180':'')})),
    open?React.createElement('div',{className:'px-3.5 pb-3.5'},children):null);
};

const WebGLMapCanvas: React.FC<{is3D:boolean;activeLayerIds:string[];epochSlider:number;splitScreen:number}> = ({is3D,activeLayerIds,epochSlider,splitScreen}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d'); if(!ctx) return;
    const resize=()=>{canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;};
    resize(); const ro=new ResizeObserver(resize); ro.observe(canvas);
    
    // Realistic land architecture layout with irregular cadastral polygons
    const parcels = [
      { id: 100, label: 'Parcel 100', status: 'valid', h3d: 45, hasErr: false, pts: [[50,50],[180,45],[190,140],[60,150]] },
      { id: 101, label: 'Parcel 101', status: 'valid', h3d: 30, hasErr: false, pts: [[190,45],[320,35],[340,120],[200,135]] },
      { id: 102, label: 'Parcel 102', status: 'dispute', h3d: 60, hasErr: true, pts: [[330,35],[450,40],[460,130],[350,115]] },
      { id: 103, label: 'Parcel 103', status: 'valid', h3d: 25, hasErr: false, pts: [[460,40],[580,50],[570,140],[470,130]] },
      { id: 104, label: 'Parcel 104', status: 'overlap', h3d: 80, hasErr: true, pts: [[590,50],[720,60],[700,160],[580,140]] },

      { id: 105, label: 'Parcel 105', status: 'valid', h3d: 35, hasErr: false, pts: [[70,200],[210,180],[220,290],[80,300]] },
      { id: 106, label: 'Parcel 106', status: 'valid', h3d: 55, hasErr: false, pts: [[220,180],[360,160],[380,260],[230,280]] },
      { id: 107, label: 'Parcel 107', status: 'valid', h3d: 40, hasErr: false, pts: [[370,160],[490,150],[510,250],[390,260]] },
      { id: 108, label: 'Parcel 108', status: 'valid', h3d: 20, hasErr: false, pts: [[500,150],[630,145],[640,240],[520,250]] },

      { id: 109, label: 'Parcel 109', status: 'valid', h3d: 70, hasErr: false, pts: [[100,350],[250,330],[280,450],[130,470]] },
      { id: 110, label: 'Parcel 110', status: 'valid', h3d: 30, hasErr: false, pts: [[260,330],[400,320],[440,430],[300,450]] },
      { id: 111, label: 'Parcel 111', status: 'valid', h3d: 45, hasErr: false, pts: [[410,315],[550,305],[600,410],[460,425]] }
    ];

    const draw=(t:number)=>{
      const W=canvas.width,H=canvas.height;
      ctx.clearRect(0,0,W,H);
      const bg=ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,'#0B0F19');bg.addColorStop(1,'#070a12');
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
      
      // Grid
      ctx.strokeStyle='rgba(0,229,255,0.06)';ctx.lineWidth=1;
      for(let gx=0;gx<W;gx+=50){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
      for(let gy=0;gy<H;gy+=50){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
      
      // Utility Networks
      if(activeLayerIds.includes('utility')){
        ctx.strokeStyle='rgba(239,68,68,0.4)';ctx.lineWidth=2;
        for(let u=0;u<4;u++){ctx.beginPath();ctx.moveTo(0,100+u*70);ctx.bezierCurveTo(W*.4,100+u*70+25,W*.6,100+u*70-25,W,100+u*70);ctx.stroke();}
      }
      
      const splitX = W * (splitScreen/100);

      // Keep parcels perfectly centered on all screen sizes
      const scale = Math.min(W / 950, H / 550);
      const gridW = 855 * scale;
      const gridH = 450 * scale;
      const offsetX = Math.max(0, (W - gridW) / 2);
      const offsetY = Math.max(0, (H - gridH) / 2);

      const drawParcels = (isRightSide: boolean) => {
        // Draw the legacy road path behind parcels
        ctx.fillStyle = isRightSide ? 'rgba(0,229,255,0.02)' : 'rgba(255,255,255,0.03)';
        ctx.beginPath();
        ctx.moveTo(30,175); ctx.lineTo(750,130); ctx.lineTo(760,190); ctx.lineTo(40,235);
        ctx.fill();

        // Sort parcels from back to front (Top-Right to Bottom-Left) for correct 3D occlusion
        const sorted = [...parcels].sort((a,b) => {
           const getDepth = (p) => {
              const cx = p.pts.reduce((s, pt) => s + pt[0], 0) / p.pts.length;
              const cy = p.pts.reduce((s, pt) => s + pt[1], 0) / p.pts.length;
              return cx - cy; // Top-Right has large cx-cy, Bottom-Left has small cx-cy
           };
           return getDepth(b) - getDepth(a);
        });

        sorted.forEach((p)=>{
          const cx = p.pts.reduce((s, pt) => s + pt[0], 0) / p.pts.length;
          const cy = p.pts.reduce((s, pt) => s + pt[1], 0) / p.pts.length;
          
          let currentStatus = p.status;
          let isChanged = false;
          let pts = p.pts;
          let h3d = p.h3d;

          // Simulate change detection when time-traveling to Epoch 2
          if (epochSlider === 2 && p.label === 'Parcel 104') {
             currentStatus = 'overlap';
             h3d = p.h3d * 1.5; // Simulate vertical structural expansion
             // Expand the footprint for change detection
             pts = pts.map(pt => [pt[0] + (pt[0]-cx)*0.1, pt[1] + (pt[1]-cy)*0.1]);
             isChanged = true;
          }

          if (!isRightSide) {
            // Legacy 2D
            ctx.fillStyle='rgba(255,255,255,0.03)';
            ctx.strokeStyle='rgba(255,255,255,0.2)';
            ctx.lineWidth=1;
            ctx.beginPath();
            pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt[0], pt[1]) : ctx.lineTo(pt[0], pt[1]));
            ctx.closePath();
            ctx.fill(); ctx.stroke();
            ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px monospace';ctx.textAlign='center';
            ctx.fillText(p.label+' (Old)', cx, cy + 4);
          } else {
            // 3D Footprints
            const c = currentStatus==='overlap'?'#EF4444':currentStatus==='dispute'?'#F59E0B':'#00E5FF';
            const rgb = hexToRgb(c);
            const ox = (is3D && activeLayerIds.includes('citygml')) ? h3d * 0.5 : 0;
            const oy = (is3D && activeLayerIds.includes('citygml')) ? -h3d * 0.6 : 0;
            
            if(ox !== 0 || oy !== 0){
              // Side walls (with backface culling)
              ctx.fillStyle = `rgba(${rgb}, 0.15)`;
              ctx.strokeStyle = `rgba(${rgb}, 0.4)`;
              ctx.lineWidth = 1;
              pts.forEach((pt, i) => {
                const nextPt = pts[(i + 1) % pts.length];
                // Only draw walls facing the isometric camera (Bottom-Left)
                if ((nextPt[0] - pt[0]) + (nextPt[1] - pt[1]) < 0) {
                  ctx.beginPath();
                  ctx.moveTo(pt[0], pt[1]); ctx.lineTo(nextPt[0], nextPt[1]);
                  ctx.lineTo(nextPt[0] + ox, nextPt[1] + oy); ctx.lineTo(pt[0] + ox, pt[1] + oy);
                  ctx.closePath();
                  ctx.fill(); ctx.stroke();
                }
              });
            }

            // Top footprint
            ctx.fillStyle = `rgba(${rgb}, ${ox !== 0 ? 0.3 : 0.05})`;
            ctx.strokeStyle = `rgba(${rgb}, 0.8)`;
            ctx.lineWidth = isChanged ? 2 : p.hasErr ? 2 : 1;
            ctx.beginPath();
            pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt[0] + ox, pt[1] + oy) : ctx.lineTo(pt[0] + ox, pt[1] + oy));
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='10px monospace';ctx.textAlign='center';
            ctx.fillText(p.label, cx + ox, cy + oy + 4);
            
            if(p.hasErr || isChanged){
                const r=8+4*Math.sin(t/20);
                ctx.strokeStyle='rgba(239,68,68,0.8)';ctx.lineWidth=1.5;
                ctx.beginPath();ctx.arc(cx + ox, cy + oy, r, 0, Math.PI*2);ctx.stroke();
            }
          }
        });
      };

      // Draw Legacy 2D on the left
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, H);
      ctx.clip();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      drawParcels(false);
      ctx.restore();

      // Draw 3D on the right
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, W-splitX, H);
      ctx.clip();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      drawParcels(true);
      ctx.restore();

      // Split Screen Divider
      ctx.strokeStyle='rgba(0,229,255,0.8)';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(splitX,0);ctx.lineTo(splitX,H);ctx.stroke();
      ctx.fillStyle='#0B0F19';ctx.beginPath();ctx.arc(splitX,H/2,12,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(0,229,255,0.8)';ctx.font='12px sans-serif';ctx.fillText('◂▸',splitX-8,H/2+4);

      rafRef.current=requestAnimationFrame(draw);
    };
    rafRef.current=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(rafRef.current);ro.disconnect();};
  },[is3D,activeLayerIds,splitScreen,epochSlider]);
  return React.createElement('canvas',{ref:canvasRef,className:'w-full h-full cursor-col-resize',style:{display:'block'}});
};
export const GeoCadAIDashboard: React.FC = () => {
  const { language } = useApp();
  const t = (en:string, hi:string) => language === 'hi' ? hi : en;
  const [layers,setLayers]=useState<LayerConfig[]>(INIT_LAYERS);
  const [is3D,setIs3D]=useState(true);
  const [crs,setCrs]=useState<'SWEREF99'|'WGS84'|'EPSG:3857'>('EPSG:3857');
  const [tab,setTab]=useState(0);
  const [dockOpen,setDockOpen]=useState(true);
  const [leftOff,setLeftOff]=useState(false);
  const [rightOff,setRightOff]=useState(false);
  const [chatIn,setChatIn]=useState('');
  const [msgs,setMsgs]=useState<ChatMsg[]>(INIT_CHAT);
  const [typing,setTyping]=useState(false);
  const [splitScreen, setSplitScreen]=useState(60);
  const [epochSlider, setEpochSlider]=useState(2);
  const [agentMode, setAgentMode]=useState<'sql'|'python'>('sql');

  const chatEnd=useRef<HTMLDivElement>(null);

  const activeLayers=layers.filter(l=>l.active).map(l=>l.id);
  const toggleLayer=(id:string)=>setLayers(prev=>prev.map(l=>l.id===id?{...l,active:!l.active}:l));
  const setOpacity=(id:string,v:number)=>setLayers(prev=>prev.map(l=>l.id===id?{...l,opacity:v}:l));

  const send=useCallback(()=>{
    if(!chatIn.trim()) return;
    const um:ChatMsg={id:Date.now().toString(),role:'user',text:chatIn,ts:new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),type:'text'};
    setMsgs(p=>[...p,um]);setChatIn('');setTyping(true);
    
    let reply='Analyzed 3D overlaps in Block 14.';
    let type:'sql'|'python'|'text' = 'text';
    if(agentMode==='sql'){
      reply="SELECT a.su_id, ST_Volume(a.geom) FROM la_legalspacebuildingunit a WHERE ST_3DIntersects(a.geom, (SELECT geom FROM la_verticalextent WHERE type='airspace'));\n-- Returned 4 units breaching airspace limits.";
      type='sql';
    } else {
      reply='import geopandas as gpd\nimport geocubed\n# MRF Change Detection\nepoch1 = gpd.read_file("epoch1.laz")\nepoch2 = gpd.read_file("epoch2.laz")\nchanges = geocubed.compute_volumetric_diff(epoch1, epoch2)\nprint(f"Total volume changed: {changes.volume} m3")';
      type='python';
    }

    setTimeout(()=>{
      setMsgs(p=>[...p,{id:(Date.now()+1).toString(),role:'ai',text:reply,ts:new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),type}]);
      setTyping(false);
    },1500);
  },[chatIn, agentMode]);

  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:'smooth'});},[msgs,typing]);
  const TABS=[{label:t('Schema Matcher','स्कीमा मैचर')},{label:t('Topology Engine','टोपोलॉजी इंजन')},{label:t('Change Detection','बदलाव की पहचान')},{label:t('LADM Valuation','LADM मूल्यांकन')},{label:t('GeoAI Assistant','GeoAI सहायक')}];

  return (
    <div className="flex flex-col h-screen bg-[#0B0F19] text-slate-200 overflow-hidden" style={{fontFamily:"'Inter','Outfit',sans-serif"}}>

      {/* 1. HEADER BAR (64px) */}
      <header className="flex items-center gap-4 px-5 h-16 shrink-0 border-b border-[#131C2E] bg-[#0c1221] z-50">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-cyan-600 flex items-center justify-center shadow-lg shadow-[#00E5FF]/20">
            <Layers3 size={18} className="text-[#0B0F19]"/>
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-tight">{t('GeoCadAI Platform', 'जियोकैड एआई प्लेटफॉर्म')}</div>
            <div className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">{t('NAKSHA Enterprise Engine v3.0', 'नक्शा एंटरप्राइज़ इंजन v3.0')}</div>
          </div>
          <div className="relative flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 rounded-full px-3 py-1.5 ml-4">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span></span>
            <span className="text-[10px] text-[#10B981] font-bold tracking-wide uppercase">{t('Bi-Temporal Kafka Stream Active', 'द्वि-कालिक काफ्का स्ट्रीम सक्रिय')}</span>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center">
           <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 bg-[#131C2E]/50 px-4 py-1.5 rounded-lg border border-[#131C2E]">
             <div className="flex items-center gap-1.5"><Clock size={12} className="text-[#00E5FF]"/>{t('Valid Time (Tv):', 'वैध समय (Tv):')} <span className="text-white">2026-10-03</span></div>
             <div className="w-px h-3 bg-slate-700"/>
             <div className="flex items-center gap-1.5"><Database size={12} className="text-[#F59E0B]"/>{t('Transaction (Tt):', 'लेन-देन (Tt):')} <span className="text-white">2026-10-03 18:41:22</span></div>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#131C2E] border border-slate-800 rounded-lg px-3 py-2">
            <Map size={12} className="text-slate-400"/>
            <span className="text-[11px] font-semibold text-slate-200">{t('Zone 4 - High-Density Urban Sector', 'ज़ोन 4 - उच्च-घनत्व शहरी क्षेत्र')}</span>
          </div>
          <div className="flex bg-[#131C2E] border border-slate-800 rounded-lg overflow-hidden text-[10px] font-mono font-semibold">
            {(['SWEREF99','WGS84','EPSG:3857'] as const).map(c=>(
              <button key={c} onClick={()=>setCrs(c)} className={'px-3 py-2 transition-colors '+(crs===c?'bg-[#00E5FF] text-[#0B0F19]':'text-slate-400 hover:bg-slate-800')}>{c}</button>
            ))}
          </div>
          
          <div className="relative group">
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg px-4 py-2.5 transition-colors border border-slate-700">
              <Download size={14}/>{t('Export', 'निर्यात')}<ChevronDown size={12}/>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-[#131C2E] border border-slate-800 rounded-xl shadow-2xl hidden group-hover:flex flex-col min-w-[140px] z-50 overflow-hidden py-1">
              {['3D CityGML 3.0','IFC 4.3','LADM XML','PostGIS SQL'].map(f=>(
                <button key={f} className="text-[11px] text-slate-300 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] px-4 py-2.5 text-left transition-colors font-semibold">{f}</button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* 2. LEFT PANEL (320px) */}
        <aside className={'flex flex-col border-r border-[#131C2E] bg-[#0c101a] shrink-0 overflow-hidden transition-all duration-300 '+(leftOff?'w-10':'w-[320px]')}>
          <div className="flex items-center justify-between px-3 py-3 border-b border-[#131C2E]">
            {!leftOff&&<span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{t('Multi-Source Layer & Ingestion', 'बहु-स्रोत परत और अंतर्ग्रहण')}</span>}
            <button onClick={()=>setLeftOff(v=>!v)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-[#131C2E] rounded transition-colors ml-auto">
              {leftOff?<ChevronRight size={14}/>:<ChevronLeft size={14}/>}
            </button>
          </div>
          {!leftOff&&(
            <div className="flex-1 overflow-y-auto">
              <Acc title={t('Ingestion Dropzone','अंतर्ग्रहण ड्रॉपज़ोन')} icon={<UploadCloud size={14} className="text-[#00E5FF]"/>} open={true}>
                <div className="space-y-2 mt-1">
                  {[{label:'UAV-LiDAR (.LAS/.LAZ)',icon:<Layers3 size={11}/>},{label:'Drone ORI (.GeoTIFF)',icon:<Satellite size={11}/>},
                    {label:'BIM (.IFC 4.3)',icon:<Building2 size={11}/>},{label:'CityGML (.gml)',icon:<Building2 size={11}/>},
                    {label:'Revenue CSVs',icon:<AlignLeft size={11}/>},{label:'SAR Imagery',icon:<Satellite size={11}/>},
                  ].map(item=>(
                    <label key={item.label} className="flex items-center gap-3 bg-[#131C2E]/40 hover:bg-[#131C2E] border border-slate-800/40 hover:border-[#00E5FF]/30 rounded-lg px-3 py-2.5 cursor-pointer transition-all group">
                      <span className="text-[#00E5FF] shrink-0">{item.icon}</span>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-200 flex-1">{item.label}</span>
                      <UploadCloud size={11} className="text-slate-600 group-hover:text-[#00E5FF]"/>
                      <input type="file" className="hidden"/>
                    </label>
                  ))}
                </div>
              </Acc>
              <Acc title={t('Interactive Layer Hierarchy','संवादात्मक परत पदानुक्रम')} icon={<Layers size={14} className="text-[#10B981]"/>} open={true}>
                <div className="space-y-2.5 mt-1">
                  {layers.map(layer=>(
                    <div key={layer.id} className={'rounded-xl border p-3 transition-all '+(layer.active?'border-slate-800 bg-[#131C2E]/60':'border-[#131C2E]/40 bg-transparent opacity-60')}>
                      <div className="flex items-start gap-2.5">
                        <button onClick={()=>toggleLayer(layer.id)} className={'mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-all '+(layer.active?'border-transparent bg-[#00E5FF]':'border-slate-600')}>
                          {layer.active&&<Check size={11} className="text-[#0B0F19]"/>}
                        </button>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-[11px] text-slate-200 font-bold truncate leading-tight">{layer.label}</div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{layer.sublabel}</div>
                          {layer.active&&(
                            <div className="flex items-center gap-3 mt-3">
                              <Eye size={11} className="text-slate-500"/>
                              <input type="range" min={0} max={100} value={layer.opacity} onChange={e=>setOpacity(layer.id,+e.target.value)} className="w-full h-1 cursor-pointer" style={{accentColor:layer.color}}/>
                              <span className="text-[9px] text-slate-400 font-mono w-8 text-right">{layer.opacity}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Acc>
              <Acc title={t('Point Cloud & Geometry Status','पॉइंट क्लाउड और ज्यामिति स्थिति')} icon={<Activity size={14} className="text-[#F59E0B]"/>} open={true}>
                <div className="space-y-2 mt-1">
                  <div className="bg-[#131C2E] border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('LiDAR Density', 'LiDAR घनत्व')}</div>
                    <div className="text-xl font-mono font-bold text-[#00E5FF]">87 pts/m²</div>
                  </div>
                  <div className="bg-[#131C2E] border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('RMSE H-Accuracy', 'RMSE H-सटीकता')}</div>
                    <div className="text-sm font-mono font-bold text-[#10B981]">ICP Adjusted: ±0.61m</div>
                  </div>
                  <div className="bg-[#131C2E] border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('CSG-to-B-Rep Status', 'CSG-to-B-Rep स्थिति')}</div>
                    <SBadge s="ok" label={t('Conversion Complete','रूपांतरण पूर्ण')} />
                  </div>
                </div>
              </Acc>
            </div>
          )}
        </aside>
        {/* 3. CENTRAL MAIN VIEWPORT */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#070a12]">
          <div className="flex-1 relative overflow-hidden">
            <WebGLMapCanvas is3D={is3D} activeLayerIds={activeLayers} epochSlider={epochSlider} splitScreen={splitScreen} />
            
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              
              {/* TOP HUD */}
              <div className="flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                  <div className="flex bg-[#131C2E]/90 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl p-1">
                    <button onClick={()=>setIs3D(false)} className={'px-4 py-2 text-xs font-bold rounded-lg transition-colors '+(!is3D?'bg-[#00E5FF] text-[#0B0F19]':'text-slate-400 hover:text-white')}>
                      2D View
                    </button>
                    <button onClick={()=>setIs3D(true)} className={'px-4 py-2 text-xs font-bold rounded-lg transition-colors '+(is3D?'bg-[#00E5FF] text-[#0B0F19]':'text-slate-400 hover:text-white')}>
                      3D View
                    </button>
                  </div>
                  <div className="flex flex-col bg-[#131C2E]/90 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl w-12">
                    {[{icon:<Move3D size={16}/>,t:'Pitch/Tilt/Rotate Controls'},
                      {icon:<PlusCircle size={16}/>,t:'Zoom In'},{icon:<MinusCircle size={16}/>,t:'Zoom Out'},
                      {icon:<Ruler size={16}/>,t:'3D Distance & Volumetric Measure Tool (m³)'},
                      {icon:<Maximize2 size={16}/>,t:'Fullscreen'}].map((x,i)=>(
                      <button key={i} title={x.t} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-slate-700/80 hover:text-[#00E5FF] transition-colors border-b border-slate-800/60 last:border-0">{x.icon}</button>
                    ))}
                  </div>
                </div>

                {/* LEGEND / STATUS OVERLAY */}
                <div className="bg-[#131C2E]/90 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-3 shadow-2xl pointer-events-auto">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{t('Volumetric Overlay Legend', 'वॉल्यूमेट्रिक ओवरले लेजेंड')}</div>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm bg-[#00E5FF]/20 border border-[#00E5FF]/60"/><span className="text-[11px] font-semibold text-slate-200">{t('Valid Titles', 'वैध स्वामित्व')}</span></div>
                    <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm bg-[#F59E0B]/20 border border-[#F59E0B]/60"/><span className="text-[11px] font-semibold text-slate-200">{t('Pending Disputes', 'लंबित विवाद')}</span></div>
                    <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm bg-[#EF4444]/20 border border-[#EF4444]/60"/><span className="text-[11px] font-semibold text-slate-200">{t('Overlap / Conflict', 'ओवरलैप / विवाद')}</span></div>
                  </div>
                </div>
              </div>

              {/* BOTTOM HUD SLIDERS */}
              <div className="flex flex-col gap-3 pointer-events-auto w-[600px] mx-auto mb-2">
                <div className="bg-[#131C2E]/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-2xl flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{t('Bi-Temporal Historic Time-Travel', 'द्वि-कालिक ऐतिहासिक समय-यात्रा')}</span>
                    <span className="text-[#00E5FF]">Epoch {epochSlider}: {epochSlider===1?'Historical Registry':'New LiDAR Sweep'}</span>
                  </div>
                  <input type="range" min={1} max={2} step={1} value={epochSlider} onChange={e=>setEpochSlider(+e.target.value)} className="w-full h-2 rounded-full cursor-pointer" style={{accentColor:'#00E5FF'}}/>
                </div>
                
                <div className="bg-[#131C2E]/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-2xl flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{t('Bitemporal Split-Screen Comparison', 'द्वि-कालिक स्प्लिट-स्क्रीन तुलना')}</span>
                    <span className="text-white">{t('Legacy 2D Map ◂▸ 3D Extracted Footprints', 'विरासत 2D मानचित्र ◂▸ 3D निकाले गए पदचिह्न')}</span>
                  </div>
                  <input type="range" min={10} max={90} value={splitScreen} onChange={e=>setSplitScreen(+e.target.value)} className="w-full h-2 rounded-full cursor-pointer" style={{accentColor:'#10B981'}}/>
                </div>
              </div>

            </div>
          </div>
          
          {/* BOTTOM DOCK (180px) */}
          <div className={'border-t border-[#131C2E] bg-[#0c1221] shrink-0 transition-all duration-300 overflow-hidden '+(dockOpen?'h-[180px]':'h-10')}>
            <div className="flex items-center px-4 h-10 border-b border-[#131C2E] gap-4 bg-[#131C2E]/30 cursor-pointer" onClick={()=>setDockOpen(v=>!v)}>
              <div className="flex items-center gap-2 text-slate-300 font-bold text-[11px] tracking-wide">
                <Terminal size={14} className="text-[#00E5FF]"/>{t(' REAL-TIME PROCESSING CONSOLE ', ' रीयल-टाइम प्रोसेसिंग कंसोल ')} {dockOpen?<ChevronDown size={13}/>:<ChevronUp size={13}/>}
              </div>
              <div className="flex-1"/>
              {[{icon:<Gauge size={12}/>,l:'Latency',v:'12ms',c:'text-[#10B981]'},
                {icon:<HardDrive size={12}/>,l:'VRAM',v:'4.2 / 8.0 GB',c:'text-[#00E5FF]'},
                {icon:<Activity size={12}/>,l:'FPS',v:'58',c:'text-[#10B981]'}
              ].map(m=>(
                <div key={m.l} className={'flex items-center gap-1.5 text-[11px] font-mono '+m.c}>
                  {m.icon}<span className="text-slate-500">{m.l}:</span><span className="font-bold">{m.v}</span>
                </div>
              ))}
            </div>
            {dockOpen&&<div className="h-[140px] overflow-y-auto px-4 py-3 space-y-1 font-mono text-[11px] tracking-tight">
              {CONSOLE_LOGS.map((line,i)=>(
                <div key={i} className={line.includes('INFO')?'text-[#00E5FF]':line.includes('ST_3DIntersects')?'text-slate-300':line.includes('OK')?'text-[#10B981]':'text-slate-400'}>{line}</div>
              ))}
              <div className="text-slate-600 animate-pulse mt-1">_</div>
            </div>}
          </div>
        </main>

        {/* 4. RIGHT PANEL (420px) */}
        <aside className={'flex flex-col border-l border-[#131C2E] bg-[#0c101a] shrink-0 overflow-hidden transition-all duration-300 '+(rightOff?'w-10':'w-[420px]')}>
          <div className="flex items-center justify-between px-3 py-3 border-b border-[#131C2E] shrink-0">
            <button onClick={()=>setRightOff(v=>!v)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-[#131C2E] rounded transition-colors">
              {rightOff?<ChevronLeft size={14}/>:<ChevronRight size={14}/>}
            </button>
            {!rightOff&&<span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{t('Advanced AI Inspector & LADM Hub', 'उन्नत AI इंस्पेक्टर और LADM हब')}</span>}
          </div>
          {!rightOff&&(
            <>
              <div className="flex flex-wrap border-b border-[#131C2E] shrink-0">
                {TABS.map((t,i)=>(
                  <button key={i} onClick={()=>setTab(i)} className={'px-3 py-3 text-[10px] font-bold transition-all border-b-2 whitespace-nowrap '+(tab===i?'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/5':'border-transparent text-slate-500 hover:text-slate-300 hover:bg-[#131C2E]/50')}>
                    {t.label}
                  </button>
                ))}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {/* Tab 0: Magneto Schema Matcher */}
                {tab===0&&<div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2"><Sparkles size={14} className="text-[#00E5FF]"/>{t(' Magneto Schema Matcher', ' मैग्नेटो स्कीमा मैचर')}</h3>
                    <SBadge s="info" label={t('SLM + LLM Reranking Active','SLM + LLM रीरैंकिंग सक्रिय')} pulse={false}/>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{t('Live column alignment between source revenue CSVs and target LADM Ed II classes.', 'स्रोत राजस्व CSV और लक्ष्य LADM Ed II वर्गों के बीच लाइव कॉलम संरेखण।')}</p>
                  
                  <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4 space-y-3">
                    <CBar v={98} label="owner_name -> LA_Party.name" />
                    <CBar v={94} label="volume_m3 -> LA_SpatialUnit.volume" />
                    <CBar v={82} label="land_use_code -> LA_LandUse.type" />
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#00E5FF] hover:bg-cyan-400 text-[#0B0F19] text-xs font-bold rounded-lg px-3 py-2.5 transition-colors shadow-lg shadow-[#00E5FF]/20">{t('Run Reranker', 'रीरैंकर चलाएं')}</button>
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2.5 transition-colors border border-slate-700">{t('Manual Override', 'मैनुअल ओवरराइड')}</button>
                  </div>
                </div>}

                {/* Tab 1: Point Cloud & Topology Engine */}
                {tab===1&&<div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2"><Layers3 size={14} className="text-[#8B5CF6]"/>{t(' Point Cloud & Topology Engine', ' पॉइंट क्लाउड और टोपोलॉजी इंजन')}</h3>
                    <SBadge s="warn" label={t('Review Pending','समीक्षा लंबित')} pulse={false}/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-3">
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t('GMM Noise Filter Metrics', 'GMM नॉइज़ फ़िल्टर मेट्रिक्स')}</div>
                      <div className="text-lg font-mono font-bold text-[#10B981]">86%</div>
                      <div className="text-[9px] text-slate-500">{t('Vegetation Noise Filtered', 'वनस्पति शोर फ़िल्टर किया गया')}</div>
                    </div>
                    <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-3">
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{t('ICP Boundary Alignment', 'ICP सीमा संरेखण')}</div>
                      <div className="text-sm font-mono font-bold text-[#00E5FF]">1.19m ➔ 0.61m</div>
                      <div className="text-[9px] text-slate-500">{t('RMSE Error Reduction', 'RMSE त्रुटि में कमी')}</div>
                    </div>
                  </div>

                  <div className="bg-[#131C2E]/60 border border-[#F59E0B]/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wide">{t('Topology Conflict Detected', 'टोपोलॉजी विवाद का पता चला')}</div>
                    </div>
                    <div className="text-[13px] font-semibold text-slate-200">{t('Parcel Overlap: ', 'पार्सल ओवरलैप: ')}<span className="text-[#EF4444] font-mono">0.38m²</span>{t(' at Boundary #104', ' सीमा #104 पर')}</div>
                    <div className="text-[11px] text-slate-400">{t('PolyFit Surface Reconstruction & Orthogonality controls available for first-floor area refinement.', 'प्रथम तल क्षेत्र शोधन के लिए PolyFit सतह पुनर्निर्माण और ऑर्थोगोनलिटी नियंत्रण उपलब्ध हैं।')}</div>
                    
                    <div className="flex gap-2.5 mt-2">
                      <button className="flex-1 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-[11px] font-bold rounded-lg px-2 py-2.5 transition-colors">{t('Auto-Fix (PolyFit)', 'ऑटो-फिक्स (PolyFit)')}</button>
                      <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg px-2 py-2.5 transition-colors border border-slate-600">{t('Flag for Engineer Review', 'इंजीनियर समीक्षा के लिए फ़्लैग करें')}</button>
                    </div>
                  </div>
                </div>}
                {/* Tab 2: Indoor 3D Cadastre Change Detection */}
                {tab===2&&<div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2"><ArrowLeftRight size={14} className="text-[#3B82F6]"/>{t(' 3D Change Detection', ' 3D बदलाव की पहचान')}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400">{t('Comparing multi-temporal scans (Epoch 1 vs Epoch 2).', 'मल्टी-टेम्पोरल स्कैन की तुलना (युग 1 बनाम युग 2)।')}</p>
                  
                  <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">{t('Semantic Classification Tags', 'सिमेंटिक वर्गीकरण टैग')}</div>
                    <div className="flex gap-2">
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded">{t('Permanent Walls', 'स्थायी दीवारें')}</span>
                      <span className="bg-slate-800 text-slate-500 text-[10px] px-2 py-1 rounded line-through">{t('Dynamic Furniture/Clutter', 'अस्थायी फर्नीचर / क्लटर')}</span>
                    </div>
                  </div>

                  <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <TriangleAlert size={16} className="text-[#EF4444] shrink-0 mt-0.5"/>
                      <div>
                        <div className="text-[12px] font-bold text-[#EF4444] mb-1">{t('Structural Modification Detected', 'संरचनात्मक संशोधन का पता चला')}</div>
                        <div className="text-[11px] text-slate-300">{t('Wall Removed - Rooms 201 & 202 Merged.', 'दीवार हटा दी गई - कमरे 201 और 202 मिला दिए गए।')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-3 text-center">
                      <div className="text-[11px] text-slate-400 font-bold uppercase mb-1">{t('Re-calculated Area', 'पुनः परिकलित क्षेत्र')}</div>
                      <div className="text-xl font-mono font-bold text-[#00E5FF]">142 m²</div>
                    </div>
                    <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-3 text-center">
                      <div className="text-[11px] text-slate-400 font-bold uppercase mb-1">{t('3D Unit Volume', '3D इकाई आयतन')}</div>
                      <div className="text-xl font-mono font-bold text-[#10B981]">426 m³</div>
                    </div>
                  </div>
                </div>}

                {/* Tab 3: LADM Title & 3D Property Valuation */}
                {tab===3&&<div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2"><Banknote size={14} className="text-[#10B981]"/>{t(' LADM Title & Valuation', ' LADM स्वामित्व और मूल्यांकन')}</h3>
                    <SBadge s="ok" label={t('Verified','सत्यापित')}/>
                  </div>
                  
                  <div className="text-[11px] font-mono bg-[#131C2E] border border-slate-800 rounded-xl px-3 py-2.5">
                    <span className="text-slate-400">LA_LegalSpaceBuildingUnit ID:</span> <span className="text-[#00E5FF] font-bold">297011501</span>
                  </div>
                  
                  <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3"><Lock size={12} className="text-[#F59E0B]"/><span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{t('Legal Rights (LA_RRR)', 'कानूनी अधिकार (LA_RRR)')}</span></div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between"><span className="text-slate-400">{t('Ownership Type', 'स्वामित्व प्रकार')}</span><span className="text-[#10B981] font-semibold">{t('Freehold', 'फ़्रीहोल्ड')}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">{t('Height Limit', 'ऊंचाई सीमा')}</span><span className="text-[#F59E0B] font-mono">24.0 m (FAR 2.5)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">{t('Encumbrances', 'भार')}</span><span className="text-[#10B981] font-semibold">{t('Clear', 'स्पष्ट')}</span></div>
                    </div>
                  </div>

                  <div className="bg-[#131C2E] border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3"><Layers2 size={12} className="text-[#00E5FF]"/><span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{t('Multi-Tier Stratification', 'मल्टी-टियर स्तरीकरण')}</span></div>
                    <div className="space-y-2 text-[10px] font-mono">
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-slate-500 rounded-full"/> <span className="text-slate-300">{t('-10m to 0m (Subsurface)', '-10m से 0m (उपसतह)')}</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#10B981] rounded-full"/> <span className="text-[#10B981]">{t('0m to +0.6m (Surface)', '0m से +0.6m (सतह)')}</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#00E5FF] rounded-full"/> <span className="text-[#00E5FF]">{t('+9m to +50m (Airspace)', '+9m से +50m (हवाई क्षेत्र)')}</span></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#131C2E] to-[#1a263d] border border-slate-700 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                       3D Property Valuation Card
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div><div className="text-slate-400 mb-1">{t('Sunlight Exposure', 'सूरज की रोशनी का संपर्क')}</div><div className="font-bold text-[#F59E0B]">{t('High (South-Facing)', 'उच्च (दक्षिण की ओर)')}</div></div>
                      <div><div className="text-slate-400 mb-1">{t('Floor Height', 'फर्श की ऊंचाई')}</div><div className="font-bold text-white">{t('12.5m (4th Floor)', '12.5m (चौथी मंजिल)')}</div></div>
                      <div className="col-span-2"><div className="text-slate-400 mb-1">{t('Volumetric Co-ownership Ratio', 'वॉल्यूमेट्रिक सह-स्वामित्व अनुपात')}</div><div className="font-mono text-[#00E5FF] font-bold">{t('14.2% of Block A', 'ब्लॉक ए का 14.2%')}</div></div>
                    </div>
                  </div>
                </div>}

                {/* Tab 4: Dual-Agent GeoAI Assistant */}
                {tab===4&&<div className="flex flex-col" style={{height:'calc(100vh - 130px)'}}>
                  
                  <div className="p-3 border-b border-[#131C2E] flex justify-center">
                     <div className="flex bg-[#131C2E] border border-slate-700 rounded-xl overflow-hidden p-1 shadow-inner">
                        <button onClick={()=>setAgentMode('sql')} className={'flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors '+(agentMode==='sql'?'bg-[#00E5FF] text-[#0B0F19]':'text-slate-400 hover:text-white')}>
                           <Database size={12}/> Text-to-SQL (CodeS-7B)
                        </button>
                        <button onClick={()=>setAgentMode('python')} className={'flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors '+(agentMode==='python'?'bg-[#8B5CF6] text-white':'text-slate-400 hover:text-white')}>
                           <MessageSquareCode size={12}/> Python Coding Agent
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {msgs.map(m=>(
                      <div key={m.id} className={'flex gap-3 '+(m.role==='user'?'flex-row-reverse':'')}>
                        <div className={'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold shadow-lg '+(m.role==='ai'?'bg-gradient-to-br from-[#00E5FF] to-cyan-600 text-[#0B0F19]':'bg-slate-700 text-slate-200')}>
                           {m.role==='ai'?<Sparkles size={12}/>:'U'}
                        </div>
                        <div className={'rounded-2xl px-4 py-3 text-[12px] leading-relaxed max-w-[85%] shadow-md '+(m.role==='ai'?'bg-[#131C2E] text-slate-200 border border-slate-700/50':'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30')}>
                          {m.type==='text' ? m.text : (
                             <div className="font-mono text-[10px] whitespace-pre-wrap bg-[#0B0F19] p-3 rounded-lg border border-slate-800">
                                <div className="text-slate-500 mb-2 border-b border-slate-800 pb-1">{m.type==='sql'?'Spatial SQL Trace':'Python Analytics Trace'}</div>
                                <span className={m.type==='sql'?'text-cyan-400':'text-emerald-400'}>{m.text}</span>
                             </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {typing&&<div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00E5FF] to-cyan-600 flex items-center justify-center text-[10px] shadow-lg"><Sparkles size={12} className="text-[#0B0F19]"/></div>
                      <div className="bg-[#131C2E] border border-slate-700/50 rounded-2xl px-4 py-3 flex gap-1.5 items-center shadow-md">
                        {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" style={{animationDelay:i*.15+'s'}}/>)}
                      </div>
                    </div>}
                    <div ref={chatEnd}/>
                  </div>
                  
                  <div className="p-4 border-t border-[#131C2E] bg-[#0c101a]">
                    <div className="flex items-center gap-2 bg-[#131C2E] border border-slate-700 rounded-xl px-4 py-3 focus-within:border-[#00E5FF]/50 transition-colors shadow-inner">
                      <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={t('Type a spatial query or analytics request...','स्थानिक क्वेरी या एनालिटिक्स अनुरोध टाइप करें...')} className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"/>
                      <button onClick={send} disabled={!chatIn.trim()} className="w-8 h-8 bg-[#00E5FF] hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-[#00E5FF]/20">
                        <Send size={14} className="text-[#0B0F19]"/>
                      </button>
                    </div>
                  </div>
                </div>}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};
