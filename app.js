const CONFIG = { level: 9, visible: 9, storage: 35, safeStorage: 34, perRefresh: 11, refreshHours: 6 };
const $ = id => document.getElementById(id);
const state = { lang: 'de' };
const T = {
 de:{headline:'Falkenquest-Planer',intro:'Finde heraus, wie viele Quests du jetzt abholen musst – nicht mehr als nötig – damit du morgens maximal viele Quests für den AD-Vorrat hast.',stored:'Gespeicherte Quests',storedHint:'Das ist die Zahl oben rechts im Spiel. Nach einem Refresh darf sie höchstens 34 erreichen.',active:'Aktive sichtbare Quests',activeHint:'Maximal 9 sichtbare Quests. Ob erledigt oder unerledigt spielt für die Speicherberechnung keine Rolle.',refresh:'Zeit bis zur nächsten Aktualisierung',login:'Wann spielst du wieder?',loginHint:'Die App berechnet, wie viele Quests du JETZT abholen musst, damit bis zu deiner nächsten Spielzeit kein Refresh verloren geht.',rules:'Regeln dieser Version',timezone:'Zeitzone: ',claimNow:'Jetzt abholen',startAfter:'Speicher danach',refreshes:'Refreshes bis dahin',morning:'Gespeicherte Quests morgens',ad:'AD-Vorrat morgens',claimExplain:'Du musst jetzt {n} Quests abholen. Mehr ist für das maximale Ergebnis nicht nötig.',morningExplain:'Damit hast du morgens {n}/35 gespeicherte Quests.',adExplain:'AD-Vorrat morgens: {n} ({stored} gespeichert + {active} aktive Quests).',timeline:'Verlauf',safe:'sicher',refreshAt:'Refresh',extra:'Die Berechnung geht davon aus, dass du jetzt offline gehst und bis zu deiner nächsten Spielsession nichts mehr abholst. Die notwendige Abholmenge muss deshalb jetzt erfolgen.',rulesList:['Level 9: maximal 9 sichtbare Quests, 35 Speicherplätze, 11 neue Quests pro Refresh.','34/35 ist sicher; 35/35 darf nicht erreicht werden.','Beim Abholen einer sichtbaren Quest rutscht automatisch die nächste Quest aus dem Speicher nach.','Erledigt oder unerledigt spielt für die Anzahl der aktiven Plätze keine Rolle.','Die App berechnet die Abholmenge so, dass alle Refreshes bis zur nächsten Spielsession stattfinden können und morgens der maximale AD-Vorrat bereitsteht.','Die berechnete Abholmenge gilt für JETZT, weil bis zur nächsten Spielsession nichts mehr abgeholt wird.'],errorTime:'Bitte HH:MM:SS eingeben.',errorLogin:'Bitte eine gültige Spielzeit wählen.'},
 en:{headline:'Falcon Quest Planner',intro:'Find out how many quests you need to claim now – no more than necessary – so you have the maximum number of quests available for AD in the morning.',stored:'Stored quests',storedHint:'This is the number shown in the top right. After a refresh it must never exceed 34.',active:'Active visible quests',activeHint:'Maximum 9 visible quests. Whether they are completed or not does not affect the storage calculation.',refresh:'Time until next refresh',login:'When will you play again?',loginHint:'The planner calculates how many quests you must claim NOW so no refresh is lost before your next session.',rules:'Rules for this version',timezone:'Time zone: ',claimNow:'Claim now',startAfter:'Storage after claiming',refreshes:'Refreshes until then',morning:'Stored quests in morning',ad:'AD stock in morning',claimExplain:'You need to claim {n} quests now. More is not needed for the maximum result.',morningExplain:'This gives you {n}/35 stored quests in the morning.',adExplain:'Morning AD stock: {n} ({stored} stored + {active} active quests).',timeline:'Sequence',safe:'safe',refreshAt:'Refresh',extra:'The calculation assumes you go offline now and claim nothing else until your next session. The required number of claims therefore has to happen now.',rulesList:['Level 9: maximum 9 visible quests, 35 storage slots, 11 new quests per refresh.','34/35 is safe; 35/35 must not be reached.','When a visible quest is claimed, the next quest automatically moves out of storage.','Whether a visible quest is completed or not does not affect the number of active slots.','The planner calculates the claim amount so all refreshes until the next session can happen and the maximum AD stock is available in the morning.','The calculated claim amount is for NOW because nothing else is claimed before the next session.'],errorTime:'Enter HH:MM:SS.',errorLogin:'Choose a valid session time.'}
};
function parseDuration(v){
 const m=String(v).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
 if(!m)return null;
 const h=Number(m[1]),mi=Number(m[2]),s=m[3]===undefined?0:Number(m[3]);
 if(!Number.isInteger(h)||!Number.isInteger(mi)||!Number.isInteger(s)||mi>59||s>59)return null;
 const total=h*3600+mi*60+s;
 return total>=60&&total<=21600?total:null;
}
function formatDuration(sec){const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function formatLogin(minutes){const h=Math.floor(minutes/60),m=minutes%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;}
function parseLogin(v){const m=String(v).trim().match(/^(\d{1,2}):(\d{2})$/);if(!m)return null;const h=Number(m[1]),mi=Number(m[2]);if(h>23||mi>59)return null;return h*60+mi;}
function updateTimeDisplays(){
 const r=Number($('nextRefreshRange').value), l=Number($('nextLoginRange').value);
 $('nextRefreshValue').value=formatDuration(r);
 $('nextLoginValue').value=formatLogin(l);
}
function nextLoginDate(v){const n=Number(v);if(!Number.isFinite(n)||n<0||n>1439)return null;const h=Math.floor(n/60),mi=n%60;const now=new Date(),d=new Date(now);d.setHours(h,mi,0,0);if(d<=now)d.setDate(d.getDate()+1);return d;}
function syncRefreshFromText(){
 const el=$('nextRefreshValue'), sec=parseDuration(el.value);
 if(sec===null){el.classList.add('invalid');return false;}
 el.classList.remove('invalid');$('nextRefreshRange').value=sec;return true;
}
function syncLoginFromText(){
 const el=$('nextLoginValue'), min=parseLogin(el.value);
 if(min===null){el.classList.add('invalid');return false;}
 el.classList.remove('invalid');$('nextLoginRange').value=min;return true;
}
function fmt(n){return new Intl.NumberFormat(state.lang==='de'?'de-DE':'en-US').format(n)}
function time(d){return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
function calculate(){
 const t=T[state.lang], result=$('result');
 const stored=Math.max(0,Math.min(CONFIG.safeStorage,Number($('storedQuests').value)||0));
 const active=Math.max(0,Math.min(CONFIG.visible,Number($('activeQuests').value)||0));
 const sec=parseDuration($('nextRefreshValue').value), loginMinutes=parseLogin($('nextLoginValue').value), login=nextLoginDate(loginMinutes);
 if(sec===null){$('nextRefreshValue').classList.add('invalid');result.innerHTML=`<p class="warn">${t.errorTime}</p>`;return}
 if(loginMinutes===null||!login){$('nextLoginValue').classList.add('invalid');result.innerHTML=`<p class="warn">${t.errorLogin}</p>`;return}
 $('nextRefreshValue').classList.remove('invalid');$('nextLoginValue').classList.remove('invalid');
 const now=new Date();
 const first=new Date(now.getTime()+sec*1000);
 const refreshes=[];
 for(let d=new Date(first);d<login;d=new Date(d.getTime()+CONFIG.refreshHours*3600*1000)) refreshes.push(new Date(d));
 const N=refreshes.length;
 const requiredNow=Math.max(0, stored + N*CONFIG.perRefresh - CONFIG.safeStorage);
 const after=stored-requiredNow;
 const morningStored=after + N*CONFIG.perRefresh;
 const morningActive=CONFIG.visible;
 const morningTotal=morningStored + morningActive;
 let html=`<h3 class="good">🟢 ${t.claimExplain.replace('{n}',fmt(requiredNow))}</h3>`;
 html+=`<div class="summary-grid">
 <div class="metric"><div class="label">${t.claimNow}</div><div class="value">${fmt(requiredNow)}</div></div>
 <div class="metric"><div class="label">${t.startAfter}</div><div class="value">${fmt(after)}/35</div></div>
 <div class="metric"><div class="label">${t.refreshes}</div><div class="value">${fmt(N)}</div></div>
 <div class="metric"><div class="label">${t.morning}</div><div class="value">${fmt(morningStored)}/35</div></div></div>`;
 html+=`<p>${t.morningExplain.replace('{n}',fmt(morningStored))}</p>`;
 html+=`<p><strong>${t.ad}</strong>: ${fmt(morningTotal)} (${fmt(morningStored)} ${state.lang==='de'?'gespeichert':'stored'} + ${fmt(morningActive)} ${state.lang==='de'?'aktive':'active'} ${state.lang==='de'?'Quests':'quests'})</p>`;
 html+=`<div class="timeline"><strong>${t.timeline}</strong><ol>`;
 let s=after;
 for(let i=0;i<N;i++){s+=CONFIG.perRefresh;html+=`<li>${t.refreshAt} ${time(refreshes[i])}: ${fmt(s)}/35 (${t.safe})</li>`;}
 if(N===0) html+=`<li>${fmt(s)}/35</li>`;
 html+=`</ol></div>`;
 html+=`<p class="small">${t.extra}</p><p class="small">${t.timezone}${Intl.DateTimeFormat().resolvedOptions().timeZone}</p>`;
 result.innerHTML=html;
}
function render(){const t=T[state.lang];$('headline').textContent=t.headline;$('introText').textContent=t.intro;$('storedLabel').textContent=t.stored;$('storedHint').textContent=t.storedHint;$('activeLabel').textContent=t.active;$('activeHint').textContent=t.activeHint;$('refreshLabel').textContent=t.refresh;$('loginLabel').textContent=t.login;$('loginHint').textContent=t.loginHint;$('rulesTitle').textContent=t.rules;$('rulesList').innerHTML=t.rulesList.map(x=>`<li>${x}</li>`).join('');$('timezoneHint').textContent=t.timezone+Intl.DateTimeFormat().resolvedOptions().timeZone;$('languageButton').textContent=state.lang==='de'?'EN':'DE';updateTimeDisplays();calculate()}
['storedQuests','activeQuests'].forEach(id=>$(id).addEventListener('input',calculate));
$('nextRefreshRange').addEventListener('input',()=>{ $('nextRefreshValue').value=formatDuration(Number($('nextRefreshRange').value)); $('nextRefreshValue').classList.remove('invalid'); calculate(); });
$('nextLoginRange').addEventListener('input',()=>{ $('nextLoginValue').value=formatLogin(Number($('nextLoginRange').value)); $('nextLoginValue').classList.remove('invalid'); calculate(); });
$('nextRefreshValue').addEventListener('change',()=>{ if(syncRefreshFromText()) calculate(); else calculate(); });
$('nextLoginValue').addEventListener('change',()=>{ if(syncLoginFromText()) calculate(); else calculate(); });
$('languageButton').addEventListener('click',()=>{state.lang=state.lang==='de'?'en':'de';render()});
render();
