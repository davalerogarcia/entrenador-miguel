import { createElement } from '../utils/dom-utils.js';
import { createAppHeader } from '../components/app-header.js';
import { createProgressBar } from '../components/progress-bar.js';
import { createExerciseIllustration } from '../components/exercise-illustration.js';
import { createExerciseStats } from '../components/exercise-stats.js';
import { createTechniquePanel } from '../components/technique-panel.js';
import { createPrimaryButton } from '../components/primary-button.js';

export function createExerciseScreen({ exercise, exerciseIndex, totalExercises, currentSet, totalSets, phaseValue, progress, workTimer, onExit, onCompleteSet } = {}) {
 const root=createElement('section',{className:'screen screen--exercise'}); const parts=[];
 const header=createAppHeader({title:'Entrenamiento',action:{text:'×',label:'Salir al inicio',onActivate:onExit}}); parts.push(header);
 const bar=createProgressBar({value:progress,label:'Progreso de la sesión'}); parts.push(bar);
 const counter=createElement('p',{className:'exercise-counter',text:`Ejercicio ${exerciseIndex+1} de ${totalExercises} · Serie ${currentSet} de ${totalSets}`});
 const illustration=createExerciseIllustration({illustrationId:exercise.illustrationId,exerciseName:exercise.name}); parts.push(illustration);
 const name=createElement('h1',{className:'exercise-name',text:exercise.name,attributes:{tabindex:'-1'}});
 const objective=createElement('p',{className:'objective-badge',text:exercise.objective});
 const target = phaseValue.targetType==='tiempo' ? `${workTimer?.remainingSeconds ?? phaseValue.targetValue} s` : phaseValue.targetType==='máximo' ? 'Máximo técnico' : String(phaseValue.targetValue ?? '1 recorrido');
 const load=phaseValue.load?.description || [phaseValue.load?.value,phaseValue.load?.unit].filter(Boolean).join(' ');
 const stats=createExerciseStats({set:`${currentSet} / ${totalSets}`,target,target, targetLabel:phaseValue.targetType==='tiempo'?'Tiempo':'Reps',load}); parts.push(stats);
 const note=createElement('p',{className:'technical-note',text:exercise.technicalNote});
 const technique=createTechniquePanel({content:exercise.fullTechnique}); parts.push(technique);
 root.append(header.element,bar.element,counter,illustration.element,name,objective,stats.element,note,technique.element);
 const button=createPrimaryButton({label:'✓ Serie completada',disabled:false,onActivate:onCompleteSet}); parts.push(button); root.append(button.element);
 return {element:root,focusTarget:name,updateWorkTimer(next){ if(workTimer){ stats.update({target:`${Math.max(0,Number(next?.remainingSeconds)||0)} s`}); } },destroy(){parts.forEach(p=>p.destroy?.());root.remove();}};
}
