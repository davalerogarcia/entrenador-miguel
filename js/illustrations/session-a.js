import { registerIllustration } from './illustration-registry.js';

const NS = 'http://www.w3.org/2000/svg';
const base = () => {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 240 180');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '4');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  return svg;
};
const el = (name, attrs = {}) => { const node = document.createElementNS(NS, name); Object.entries(attrs).forEach(([k,v]) => node.setAttribute(k, String(v))); return node; };
const add = (svg, ...nodes) => { svg.append(...nodes); return svg; };
const line = (x1,y1,x2,y2) => el('line',{x1,y1,x2,y2});
const circle = (cx,cy,r=10) => el('circle',{cx,cy,r});
const rect = (x,y,width,height,rx=3) => el('rect',{x,y,width,height,rx});
const path = d => el('path',{d});
const arrow = (x1,y1,x2,y2) => path(`M ${x1} ${y1} L ${x2} ${y2} M ${x2-7} ${y2-7} L ${x2} ${y2} L ${x2+7} ${y2-7}`);

function a01(){const s=base();return add(s,circle(116,35),line(112,46,94,88),line(94,88,130,103),line(130,103,162,137),line(94,88,66,112),line(66,112,43,142),line(103,64,145,76),line(145,76,181,76),line(38,147,73,147),line(151,142,177,142));}
function a02(){const s=base();return add(s,circle(72,42),line(80,48,129,76),line(129,76,153,107),line(129,76,105,119),line(105,119,102,153),line(153,107,178,150),line(114,68,114,127),line(114,127,112,155),line(93,157,119,157),line(168,154,190,154));}
function a03(){const s=base();return add(s,circle(120,34),line(120,45,120,100),line(120,58,86,28),line(120,58,154,28),line(120,100,96,145),line(120,100,144,145),arrow(190,138,190,38));}
function a04(){const s=base();return add(s,circle(115,34),line(115,45,116,94),line(116,60,87,80),line(116,60,148,78),line(116,94,98,137),line(98,137,85,157),line(116,94,148,118),line(148,118,161,104),line(70,160,112,160));}
function a05(){const s=base();return add(s,circle(118,31),line(116,42,102,84),line(102,84,133,102),line(133,102,158,139),line(102,84,72,111),line(72,111,54,143),rect(102,54,31,20,4),line(106,64,88,79),line(130,64,144,80),line(46,148,80,148),line(149,144,174,144));}
function a06(){const s=base();return add(s,rect(167,95,46,12,2),line(175,107,175,151),line(207,107,207,151),circle(105,33),line(105,44,107,92),line(107,60,81,82),line(107,60,134,82),line(107,92,78,125),line(78,125,62,154),line(107,92,157,116),line(157,116,180,101),rect(67,79,12,22,2),rect(135,79,12,22,2),line(48,158,78,158));}
function a07(){const s=base();return add(s,rect(135,112,70,14,2),line(145,126,145,158),line(195,126,195,158),circle(105,34),line(105,45,106,94),line(106,62,79,85),line(106,62,134,84),line(106,94,139,113),line(139,113,164,113),line(106,94,83,136),line(83,136,82,158),rect(66,82,12,22,2),rect(135,82,12,22,2),line(68,161,95,161));}
function a08(){const s=base();return add(s,line(36,20,36,160),circle(105,34),line(105,45,105,102),line(105,62,65,80),line(65,80,37,77),line(105,65,133,86),line(105,102,104,145),line(104,145,111,158),line(105,102,137,125),line(137,125,143,112),line(92,160,122,160));}
function a09(){const s=base();return add(s,circle(120,32),line(120,43,120,101),line(120,62,75,82),line(120,62,165,82),line(120,101,111,153),line(120,101,150,124),line(150,124,164,111),line(96,158,126,158));}

[['ill-a01',a01],['ill-a02',a02],['ill-a03',a03],['ill-a04',a04],['ill-a05',a05],['ill-a06',a06],['ill-a07',a07],['ill-a08',a08],['ill-a09',a09]].forEach(([id,factory])=>registerIllustration(id,factory));
