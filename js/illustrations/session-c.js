import { registerIllustration } from './illustration-registry.js';
const NS='http://www.w3.org/2000/svg';
const base=()=>{const s=document.createElementNS(NS,'svg');[['viewBox','0 0 240 180'],['fill','none'],['stroke','currentColor'],['stroke-width','4'],['stroke-linecap','round'],['stroke-linejoin','round'],['preserveAspectRatio','xMidYMid meet']].forEach(([k,v])=>s.setAttribute(k,v));return s;};
const e=(n,a={})=>{const x=document.createElementNS(NS,n);Object.entries(a).forEach(([k,v])=>x.setAttribute(k,v));return x;};
const add=(s,...n)=>(s.append(...n),s),l=(x1,y1,x2,y2)=>e('line',{x1,y1,x2,y2}),c=(x,y,r=10)=>e('circle',{cx:x,cy:y,r}),r=(x,y,w,h,rx=3)=>e('rect',{x,y,width:w,height:h,rx}),p=d=>e('path',{d});
const dumb=(x,y)=>add(e('g'),r(x-9,y-4,18,8,2),l(x-14,y,x+14,y));
function c01(){const s=base();return add(s,l(38,24,202,24),c(120,57),l(120,68,120,116),l(120,78,87,54),l(87,54,73,24),l(120,78,153,54),l(153,54,167,24),l(120,116,95,158),l(120,116,145,158));}
function c02(){const s=c01();s.append(p('M 64 31 Q 73 37 82 31'),p('M 158 31 Q 167 37 176 31'));return s;}
function c03(){const s=base();return add(s,r(34,94,73,12,2),l(44,106,44,155),l(97,106,97,155),c(133,42),l(127,52,101,91),l(101,91,65,92),l(113,72,151,90),l(151,90,172,67),dumb(180,62),l(127,94,113,139),l(127,94,165,126),l(165,126,194,126));}
function c04(){const s=base();const start=e('g',{'opacity':'0.55','stroke-dasharray':'7 5'}),finish=e('g');add(start,c(70,47),l(70,58,70,118),l(70,76,70,39),l(70,39,70,20),l(70,76,82,42),l(82,42,74,20),dumb(72,16),l(70,118,52,157),l(70,118,88,157));add(finish,c(166,47),l(166,58,166,118),l(166,76,166,40),l(166,40,184,56),l(166,76,178,42),l(178,42,190,58),dumb(190,61),l(166,118,148,157),l(166,118,184,157));return add(s,start,finish);}
function c05(){const s=base();return add(s,c(83,61),l(91,67,124,91),l(124,91,159,91),l(106,78,75,113),l(75,113,48,113),l(124,91,176,62),l(176,62,208,62),l(124,91,96,128),l(96,128,67,128),l(159,91,199,126),l(199,126,219,126),l(32,145,224,145));}
function c06(){const s=base();return add(s,c(58,91),l(68,94,128,103),l(128,103,190,113),l(91,97,109,70),l(109,70,131,79),l(83,97,67,133),l(67,133,45,133),l(128,103,149,140),l(149,140,196,140),l(35,146,207,146));}
[['ill-c01',c01],['ill-c02',c02],['ill-c03',c03],['ill-c04',c04],['ill-c05',c05],['ill-c06',c06]].forEach(([i,f])=>registerIllustration(i,f));
