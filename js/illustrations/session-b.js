import { registerIllustration } from './illustration-registry.js';
const NS='http://www.w3.org/2000/svg';
const base=()=>{const s=document.createElementNS(NS,'svg');[['viewBox','0 0 240 180'],['fill','none'],['stroke','currentColor'],['stroke-width','4'],['stroke-linecap','round'],['stroke-linejoin','round'],['preserveAspectRatio','xMidYMid meet']].forEach(([k,v])=>s.setAttribute(k,v));return s;};
const el=(n,a={})=>{const e=document.createElementNS(NS,n);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e;};
const add=(s,...n)=>(s.append(...n),s),l=(x1,y1,x2,y2)=>el('line',{x1,y1,x2,y2}),c=(cx,cy,r=10)=>el('circle',{cx,cy,r}),r=(x,y,w,h,rx=3)=>el('rect',{x,y,width:w,height:h,rx}),p=d=>el('path',{d});
const dumb=(x,y)=>add(el('g'),r(x-9,y-4,18,8,2),l(x-14,y,x+14,y));
function b01(){const s=base();return add(s,c(55,83),l(65,87,126,98),l(126,98,187,111),l(79,90,70,126),l(70,126,45,126),l(126,98,149,135),l(149,135,193,135),l(36,139,205,139));}
function b02(){const s=base();return add(s,c(74,72),l(83,79,130,104),l(130,104,184,132),l(96,85,78,126),l(78,126,48,126),l(111,94,132,45),l(132,45,132,18),l(130,104,148,145),l(148,145,190,145),l(43,149,199,149));}
function b03(){const s=base();return add(s,c(56,120),l(67,116,121,112),l(121,112,159,85),l(159,85,192,59),l(104,113,78,70),l(78,70,55,45),l(121,112,152,128),l(152,128,184,128),l(106,112,129,76),l(129,76,129,43),l(30,142,205,142));}
function b04(){const s=base();return add(s,c(58,110),p('M 68 108 Q 110 70 145 87'),l(145,87,193,109),l(91,95,62,61),l(62,61,39,50),l(30,142,208,142));}
function b05(){const s=base();return add(s,c(95,54),l(99,65,124,101),l(124,101,152,125),l(124,101,94,128),l(94,128,74,114),l(152,125,179,111),dumb(170,87),l(112,82,157,89),l(157,89,170,87),l(50,145,191,145));}
function b06(){const s=base();const start=el('g',{'opacity':'0.55','stroke-dasharray':'7 5'}),finish=el('g');add(start,c(72,50),l(72,61,72,117),l(72,79,45,79),l(45,79,45,48),l(72,79,99,79),l(99,79,99,48),l(72,117,52,156),l(72,117,92,156),dumb(45,43),dumb(99,43));add(finish,c(168,50),l(168,61,168,117),l(168,79,146,48),l(146,48,146,22),l(168,79,190,48),l(190,48,190,22),l(168,117,148,156),l(168,117,188,156),dumb(146,18),dumb(190,18));return add(s,start,finish);}
function b07(){const s=base();return add(s,c(120,38),l(120,49,120,111),l(120,68,66,68),l(120,68,174,68),l(120,111,96,156),l(120,111,144,156),dumb(53,68),dumb(187,68));}
function b08(){const s=base();return add(s,c(120,35),l(120,46,120,112),l(120,74,87,57),l(87,57,104,88),l(120,74,153,57),l(153,57,136,88),dumb(104,91),dumb(136,91),p('M 82 113 L 82 83 M 75 90 L 82 83 L 89 90'),p('M 158 113 L 158 83 M 151 90 L 158 83 L 165 90'),l(120,112,96,157),l(120,112,144,157));}
function b09(){const s=base();return add(s,c(55,96),l(65,99,126,108),l(126,108,188,118),l(82,101,67,134),l(67,134,45,134),l(126,108,145,143),l(145,143,194,143),l(35,148,205,148));}
function b10(){const s=base();return add(s,r(52,74,65,12,2),l(60,86,60,151),l(109,86,109,151),c(137,53),l(132,63,121,104),l(121,104,151,113),l(151,113,196,113),l(127,76,108,93),l(108,93,113,116),l(151,113,181,145),l(181,145,210,145));}
function b11(){const s=base();return add(s,c(120,34),l(120,45,120,111),l(120,68,91,89),l(91,89,82,62),dumb(79,55),l(120,68,149,89),l(149,89,158,62),dumb(161,55),l(120,111,96,157),l(120,111,144,157));}
[['ill-b01',b01],['ill-b02',b02],['ill-b03',b03],['ill-b04',b04],['ill-b05',b05],['ill-b06',b06],['ill-b07',b07],['ill-b08',b08],['ill-b09',b09],['ill-b10',b10],['ill-b11',b11]].forEach(([i,f])=>registerIllustration(i,f));
