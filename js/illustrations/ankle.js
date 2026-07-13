import { registerIllustration } from './illustration-registry.js';
const NS='http://www.w3.org/2000/svg';
const base=()=>{const s=document.createElementNS(NS,'svg');[['viewBox','0 0 240 180'],['fill','none'],['stroke','currentColor'],['stroke-width','4'],['stroke-linecap','round'],['stroke-linejoin','round'],['preserveAspectRatio','xMidYMid meet']].forEach(([k,v])=>s.setAttribute(k,v));return s;};
const e=(n,a={})=>{const x=document.createElementNS(NS,n);Object.entries(a).forEach(([k,v])=>x.setAttribute(k,v));return x;};
const add=(s,...n)=>(s.append(...n),s),l=(x1,y1,x2,y2)=>e('line',{x1,y1,x2,y2}),c=(x,y,r=10)=>e('circle',{cx:x,cy:y,r}),r=(x,y,w,h,rx=3)=>e('rect',{x,y,width:w,height:h,rx}),p=d=>e('path',{d});
function t01(){const s=base();return add(s,c(120,32),c(116,30,1.5),c(124,30,1.5),l(120,43,120,101),l(120,62,75,82),l(120,62,165,82),l(120,101,111,153),l(120,101,150,124),l(150,124,164,111),l(96,158,126,158));}
function t02(){const s=base();return add(s,c(120,32),l(113,30,118,30),l(122,30,127,30),l(120,43,120,101),l(120,62,75,82),l(120,62,165,82),l(120,101,111,153),l(120,101,150,124),l(150,124,164,111),l(96,158,126,158));}
function t04(){const s=base();return add(s,r(46,57,65,12,2),l(57,69,57,148),l(100,69,100,148),c(133,44),l(127,54,110,93),l(110,93,80,94),l(126,76,151,102),l(151,102,184,102),l(126,94,146,128),l(146,128,181,128),p('M 191 83 A 31 31 0 1 1 160 52 M 160 52 L 172 49 M 160 52 L 165 63'));
}
function t05(){const s=base();return add(s,c(120,30),l(120,41,120,96),l(120,60,82,78),l(120,60,158,78),l(120,96,110,136),l(120,96,150,117),l(150,117,162,104),r(75,143,72,15,8));}
[['ill-t01',t01],['ill-t02',t02],['ill-t04',t04],['ill-t05',t05]].forEach(([i,f])=>registerIllustration(i,f));
