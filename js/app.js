import './illustrations/session-a.js';
import './illustrations/session-b.js';
import './illustrations/session-c.js';
import './illustrations/ankle.js';
import { createStore, createInitialState, APP_STATUSES, SCREEN_IDS } from './state/store.js';
import { loadPersistence, savePersistence } from './state/persistence.js';
import { selectActivePhase, selectCompletedDaysThisWeek, selectCurrentPlanWeek, selectNextStrengthSession, selectRecommendedSession, selectActiveSessionProgress } from './state/selectors.js';
import { getExerciseById, getExercisePhaseValue, getSessionById, getSessionIdAtSequencePosition } from './core/plan-service.js';
import { getNextSequencePositionFromHistory } from './core/history-service.js';
import { createActiveSession, completeCurrentSet, continueAfterRest, recoverPersistedActiveSession, discardActiveSession } from './core/session-engine.js';
import { recoverRestTimer, updateRestTimer, skipRestTimer, isRestTimerFinished } from './core/timer-service.js';
import { notifyRestFinished } from './core/feedback-service.js';
import { clearElement, focusElement } from './utils/dom-utils.js';
import { formatLocalDate, getPlanWeek } from './utils/date-utils.js';
import { formatTarget, formatLoad } from './utils/format-utils.js';
import { createFirstRunScreen } from './screens/first-run-screen.js';
import { createHomeScreen } from './screens/home-screen.js';
import { createExerciseScreen } from './screens/exercise-screen.js';
import { createRestScreen } from './screens/rest-screen.js';
import { createCompletedScreen } from './screens/completed-screen.js';
import { createSettingsScreen } from './screens/settings-screen.js';
import { createHistoryScreen } from './screens/history-screen.js';
import { createMedicalNoticeScreen } from './screens/medical-notice-screen.js';


async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !globalThis.isSecureContext) {
    return;
  }

  try {
    await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
  } catch {
    // La PWA sigue funcionando como aplicación web cuando el registro no está disponible.
  }
}

const mount=document.querySelector('#app');
const persisted=loadPersistence();
const recovered=recoverPersistedActiveSession();
if(recovered) persisted.activeSession=recovered;
const store=createStore(createInitialState(persisted));
let currentView=null; let activeInterval=null; let workTimerKey=null; let workEndsAt=null; let restFeedbackKey=null; let seriesCompletionLockedUntil=0;

function syncPersistent(){ const p=loadPersistence(); store.replacePersistentData(p); }
function cleanupView(){ if(activeInterval){clearInterval(activeInterval);activeInterval=null;} currentView?.destroy?.(); currentView=null; clearElement(mount); }
function setScreen(screen){ store.setCurrentScreen(screen); render(); }
function showView(view){ cleanupView(); currentView=view; mount.append(view.element); requestAnimationFrame(()=>focusElement(view.focusTarget||view.element)); }
function dayName(){ return new Intl.DateTimeFormat('es-ES',{weekday:'long'}).format(new Date()).replace(/^./,c=>c.toUpperCase()); }

function completeOrRoute(session){
 if(!session) return;
 syncPersistent();
 if(session.isCompleted){ setScreen(SCREEN_IDS.COMPLETED); return; }
 store.updateState(d=>{d.activeSession=session;});
 setScreen(session.currentStage==='descanso'?SCREEN_IDS.REST:SCREEN_IDS.EXERCISE);
}

function startPosition(position,fatigue){
 const state=store.getState(); const sessionId=getSessionIdAtSequencePosition(position); const session=getSessionById(sessionId); const week=Math.max(1,selectCurrentPlanWeek(state)??1);
 const active=createActiveSession({sessionId,sequencePosition:position,phaseId:state.settings.activePhaseId,planWeek:week,fatigueMode:fatigue});
 completeOrRoute(active?.plannedExerciseIds?.length===0?completeCurrentSet(active):active);
}

function renderFirstRun(){ showView(createFirstRunScreen({onComplete:({planStartDate,activePhaseId})=>{const p=loadPersistence();savePersistence({...p,settings:{...p.settings,planStartDate,activePhaseId,medicalNoticeAccepted:true,firstRunCompleted:true}});syncPersistent();setScreen(SCREEN_IDS.HOME);}})); }
function renderHome(){ const s=store.getState(); const recommended=selectRecommendedSession(s); const pos=getNextSequencePositionFromHistory(s.history); showView(createHomeScreen({dayLabel:dayName(),weekLabel:`Semana ${Math.max(1,selectCurrentPlanWeek(s)??1)}`,phaseLabel:selectActivePhase(s)?.displayName||'Fase 1',recommendedSession:recommended,sequencePosition:pos,activePhaseId:s.settings.activePhaseId,planWeek:Math.max(1,selectCurrentPlanWeek(s)??1),nextStrengthSession:selectNextStrengthSession(s),completedDays:selectCompletedDaysThisWeek(s),activeSession:s.activeSession,onSettings:()=>setScreen(SCREEN_IDS.SETTINGS),onStart:startPosition,onResume:()=>setScreen(s.activeSession.currentStage==='descanso'?SCREEN_IDS.REST:SCREEN_IDS.EXERCISE),onDiscard:()=>{discardActiveSession();syncPersistent();render();}})); }
function renderExercise(){ const s=store.getState(), a=s.activeSession; if(!a){setScreen(SCREEN_IDS.HOME);return;} const ex=getExerciseById(a.currentExerciseId); if(!ex){setScreen(SCREEN_IDS.HOME);return;} const pv=getExercisePhaseValue(ex.id,a.phaseId); const totalSets=a.plannedSetsByExercise[ex.id]; let workTimer=null; let setCompletionHandled=false;
 if(ex.usesWorkTimer && pv?.targetType==='tiempo'){ const totalSeconds=Number(pv.targetValue); const stageStartedAt=new Date(a.updatedAt).getTime(); const key=`${a.id}:${ex.id}:${a.currentSet}:${a.updatedAt}`; workTimerKey=key; workEndsAt=stageStartedAt+totalSeconds*1000; workTimer={totalSeconds,remainingSeconds:Math.max(0,Math.ceil((workEndsAt-Date.now())/1000))};workTimer.finished=workTimer.remainingSeconds===0; }
 const view=createExerciseScreen({exercise:ex,exerciseIndex:a.currentExerciseIndex,totalExercises:a.plannedExerciseIds.length,currentSet:a.currentSet,totalSets,phaseValue:pv,progress:selectActiveSessionProgress(s),workTimer,onExit:()=>setScreen(SCREEN_IDS.HOME),onCompleteSet:()=>{const now=Date.now();if(setCompletionHandled||now<seriesCompletionLockedUntil)return;setCompletionHandled=true;seriesCompletionLockedUntil=now+750;workTimerKey=null;workEndsAt=null;completeOrRoute(completeCurrentSet(a));}});showView(view);
 if(workTimer){activeInterval=setInterval(()=>{const remaining=Math.max(0,Math.ceil((workEndsAt-Date.now())/1000));view.updateWorkTimer({remainingSeconds:remaining,finished:remaining===0});if(remaining===0){clearInterval(activeInterval);activeInterval=null;}},250);}
}
function nextInfo(a){const ex=getExerciseById(a.currentExerciseId);const pv=getExercisePhaseValue(ex.id,a.phaseId);return{label:`${ex.name} · Serie ${a.currentSet+1}`,details:`${formatTarget(pv)} · ${formatLoad(pv.load)}`};}
function renderRest(){const s=store.getState(),a=s.activeSession;if(!a?.rest){setScreen(SCREEN_IDS.HOME);return;}let timer=recoverRestTimer(a);if(!timer){setScreen(SCREEN_IDS.EXERCISE);return;}const info=nextInfo(a);const view=createRestScreen({progress:selectActiveSessionProgress(s),timer:{...timer,finished:isRestTimerFinished(timer)},nextLabel:info.label,nextDetails:info.details,onExit:()=>setScreen(SCREEN_IDS.HOME),onSkip:()=>{skipRestTimer(a.rest);completeOrRoute(continueAfterRest(store.getState().activeSession));},onContinue:()=>completeOrRoute(continueAfterRest(store.getState().activeSession))});showView(view);
 const tick=async()=>{timer=updateRestTimer(timer);const finished=isRestTimerFinished(timer);view.updateTimer({...timer,finished});if(finished){clearInterval(activeInterval);activeInterval=null;const key=a.rest.endsAt;if(restFeedbackKey!==key&&timer.status==='finalizado'){restFeedbackKey=key;await notifyRestFinished();}}};tick();if(!isRestTimerFinished(timer))activeInterval=setInterval(tick,250);
}
function renderCompleted(){showView(createCompletedScreen({onHome:()=>{syncPersistent();setScreen(SCREEN_IDS.HOME);}}));}
function renderSettings(){const s=store.getState();showView(createSettingsScreen({settings:s.settings,onBack:()=>setScreen(SCREEN_IDS.HOME),onSave:(next)=>{const p=loadPersistence();savePersistence({...p,settings:{...p.settings,...next}});syncPersistent();setScreen(SCREEN_IDS.HOME);},onHistory:()=>setScreen(SCREEN_IDS.HISTORY),onMedical:()=>setScreen(SCREEN_IDS.MEDICAL_NOTICE)}));}
function renderHistory(){showView(createHistoryScreen({history:store.getState().history,onBack:()=>setScreen(SCREEN_IDS.SETTINGS)}));}
function renderMedical(){showView(createMedicalNoticeScreen({onBack:()=>setScreen(SCREEN_IDS.SETTINGS)}));}
function render(){const s=store.getState();if(!s.settings.firstRunCompleted){renderFirstRun();return;}switch(s.currentScreen){case SCREEN_IDS.HOME:renderHome();break;case SCREEN_IDS.EXERCISE:renderExercise();break;case SCREEN_IDS.REST:renderRest();break;case SCREEN_IDS.COMPLETED:renderCompleted();break;case SCREEN_IDS.SETTINGS:renderSettings();break;case SCREEN_IDS.HISTORY:renderHistory();break;case SCREEN_IDS.MEDICAL_NOTICE:renderMedical();break;default:store.setCurrentScreen(SCREEN_IDS.HOME);renderHome();}}
store.setAppStatus(APP_STATUSES.READY);store.setCurrentScreen(persisted.settings.firstRunCompleted?SCREEN_IDS.HOME:SCREEN_IDS.FIRST_RUN);render();
void registerServiceWorker();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&store.getState().currentScreen===SCREEN_IDS.REST)renderRest();});
