const CONFIG = { refreshHours: 6 };
const FALCON_DEFAULTS = { stored: 5, storageCapacity: 35, active: 9, activeCapacity: 9, perRefresh: 11 };
const $ = id => document.getElementById(id);
const state = { lang: 'de', view: 'home', selectedDay: null, selectedTask: null, selectedPhase: null, history: [] };

const T = {
  de: {
    today:'Heute', home:'Heute', falcon:'🦅 Falkenquest-Planer', back:'← Zurück', detail:'Tagesplanung', taskDetail:'Aufgabe', tasks:'Heutige Aufgaben', bonus:'⭐ Überlebenskampf', collectTitle:'📦 Sammeln & Vorbereitung', prep:'Vorbereitung', optional:'Bonusmöglichkeit – keine Pflichtzeit.',
    sunday:'Vorbereitung auf Montag', day:'AD Tag', now:'Jetzt', next:'Als Nächstes', todayLabel:'HEUTE', when:'Wann?', note:'Hinweis', allDay:'den ganzen Tag möglich', overlapLabel:'', localTime:'Die Uhrzeit wird automatisch an deine lokale Zeitzone angepasst.',
    survivalNav:'⭐ Überlebenskampf', survivalPageTitle:'Überlebenskampf', survivalIntro:'Fünf Phasentypen wechseln sich im festen Rhythmus ab. Klicke eine Phase an, um zu sehen, was dort zählt.', survivalPhase:'Phase', survivalWhen:'Zeitfenster', survivalWhat:'Was zählt?', survivalHint:'Nur Aktionen, die zur laufenden Phase gehören, bringen dort Punkte. Ressourcen deshalb möglichst für die passende Phase aufheben.', survivalSourcesNote:'Die Phasen und die gewerteten Aktionsarten sind nach dem aktuellen Survival-Battle-Wiki hinterlegt.',
    survivalActions:{0:['🧑‍🤝‍🧑 Helden rekrutieren','🧪 Gegengift verbrauchen','💎 Käufe mit Diamanten können ebenfalls zählen'],1:['⏱️ Baubeschleuniger einsetzen','🏢 Gebäudemacht erhöhen','💎 Käufe mit Diamanten können ebenfalls zählen'],2:['🪖 Soldaten trainieren','⏱️ Trainingsbeschleuniger einsetzen','💎 Käufe mit Diamanten können ebenfalls zählen'],3:['⏱️ Forschungsbeschleuniger einsetzen','🔬 Technologiemacht erhöhen','💎 Käufe mit Diamanten können ebenfalls zählen'],4:['⚡ Ausdauer verbrauchen','🍎 Rabenfrüchte verbrauchen','💎 Käufe mit Diamanten können ebenfalls zählen']},
    days:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
    adNames:['Vorbereitung','🐦 Rabe','🏗️ Gebietsbau','🔬 Technologie','🦸 Helden','🏋️ Vorbereitung','⚔️ Raid'],
    survival:['🦸 Heldenverbesserung','🏗️ Gebietsbau','🪖 Soldatentraining','🔬 Technologieforschung','🐦 Rabenverbesserung'],
    overlap:'⭐',
    claimFalcon:'Falkenquests einlösen', noFalcon:'Heute keine Falkenquests einlösen.',
    researchScroll:'Studien-Schriftrollen verwenden',
    researchScrollNote:'Heute ist AD-Forschungstag. Die Schriftrollen können in den dafür vorgesehenen Forschungszweigen eingesetzt werden. Persönliche AD-Punktwerte bleiben bewusst außen vor.',
    resources:{survivor:'Überlebendentickets', antidote:'Gegengift', stamina:'Ausdauer', essence:'Rabenessenz', fruit:'Rabenfrüchte', chests:'Rabenausrüstungstruhen', research:'Forschungsressourcen', researchSpeed:'Forschungsbeschleuniger', study:'Studien-Schriftrollen', hero:'Heldenressourcen', building:'Gebäudehammer', buildingSpeed:'Baubeschleuniger', training:'Trainingsbeschleuniger', healing:'Heilungsbeschleuniger', falcon:'Falkenquests'},
    collectFor:'Für {day} aufheben', keepWeek:'über die Woche sammeln', nextCycle:'für die nächste AD-Woche aufheben',
    mondayTasks:[
      {id:'falcon', label:'🦅 Falkenquests einlösen', when:'{adStart}', note:'Alle für heute vorgesehenen Falkenquests können ab {adStartTime} Uhr eingelöst werden.'},
      {id:'ravenEssence', label:'🐦 Rabenessenz einlösen', when:'{adStart}', note:'Am Montag einlösen. Für den Überlebenskampf ist {ravenWindow} die passende Rabenphase.'},
      {id:'ravenFruit', label:'🍎 Rabenfrüchte einlösen', when:'{adStart}', note:'Am Montag einlösen. Für den Überlebenskampf ist {ravenWindow} die passende Rabenphase.'},
      {id:'antidote', label:'🧪 Gegengift einlösen', when:'{adStart}', note:'Gegengift zählt am Montag und Donnerstag. In den Heldenphasen {heroWindows} kannst du zusätzlich Punkte im Überlebenskampf mitnehmen.'},
      {id:'stamina', label:'⚡ Ausdauer verbrauchen', when:'{adStart}', note:'Montag verwenden. {ravenWindow} ist eine optionale Überschneidung mit der Rabenverbesserung.'},
      {id:'gather', label:'🌾 Rohstoffe sammeln', when:'{adStart}', note:'Rohstoffe gehören am Montag zur AD-Aufgabe. Alle verfügbaren Truppen sollten immer auf den Feldern sein, wenn sie nicht anderweitig gebraucht werden. Schicke sie am Sonntagabend auf die Felder, sodass sie nach Beginn des neuen AD-Tages wieder nach Hause kommen und direkt die ersten AD-Punkte sammeln.'}
    ],
    tuesdayTasks:[
      {id:'caravan', label:'🚚 UR-Karawanen durchführen', when:'{adStart}', note:'UR-Karawanen für AD verwenden; bei Bedarf die vorgesehenen Würfe nutzen.'},
      {id:'covert', label:'🕵️ Verdeckte UR-Operationen durchführen', when:'{adStart}', note:'UR-Operationen für den AD-Tag durchführen.'},
      {id:'survivors', label:'🧑‍🤝‍🧑 Überlebende rekrutieren', when:'{adStart}', note:'Überlebendentickets für Dienstag verwenden.'},
      {id:'building', label:'🏗️ Gebäudehammer / Bauressourcen einsetzen', when:'{adStart}', note:'Gebäudehämmer können die ganze Woche gesammelt und an Bau-Tagen eingesetzt werden.'},
      {id:'buildingMight', label:'🏢 Gebäudemacht erhöhen', when:'{adStart}', note:'Baufortschritt und Gebäudemacht zählen heute.'}
    ],
    wednesdayTasks:[
      {id:'falcon', label:'🦅 Falkenquests einlösen', when:'{adStart}', note:'Alle für heute gesammelten Falkenquests können ab {adStartTime} Uhr eingelöst werden.'},
      {id:'chests', label:'🐦 Rabenausrüstungstruhen öffnen', when:'{adStart}', note:'Die Rabenausrüstungstruhen gehören zum Mittwoch.'},
      {id:'study', label:'📜 Studien-Schriftrollen verwenden', when:'{adStart}', note:'Mehrere Forschungszweige verwenden Studien-Schriftrollen; welcher Zweig sinnvoll ist, bleibt deiner eigenen Planung überlassen.'},
      {id:'research', label:'🔬 Forschung durchführen', when:'{adStart}', note:'Mittwoch ist AD-Forschungstag; die {techWindow}-Tech-Phase bietet eine zusätzliche Überschneidung.'},
      {id:'techMight', label:'🔬 Technologiemacht erhöhen', when:'{adStart}', note:'Technologiemacht passt zur Tech-Phase im Überlebenskampf.'}
    ],
    thursdayTasks:[
      {id:'urHero', label:'🦸 UR-Heldenfragmente einlösen', when:'{adStart}', note:'Hero-Ressourcen gehören am Donnerstag zum AD.'},
      {id:'ssrHero', label:'🦸 SSR-Heldenfragmente einlösen', when:'{adStart}', note:'Hero-Ressourcen gehören am Donnerstag zum AD.'},
      {id:'srHero', label:'🦸 SR-Heldenfragmente einlösen', when:'{adStart}', note:'Hero-Ressourcen gehören am Donnerstag zum AD.'},
      {id:'heroRecruit', label:'🧑‍🤝‍🧑 Helden rekrutieren', when:'{adStart}', note:'Heldenrekrutierung gehört zum Donnerstag.'},
      {id:'badges', label:'🏅 Skill-Abzeichen einsetzen', when:'{adStart}', note:'Skill-Abzeichen gehören zum Hero-Tag.'},
      {id:'antidote', label:'🧪 Gegengift einlösen', when:'{adStart}', note:'Gegengift zählt am Montag und Donnerstag.'}
    ],
    fridayTasks:[
      {id:'falcon', label:'🦅 Falkenquests einlösen', when:'{adStart}', note:'Die nächsten Falkenquests werden erst am Sonntag für Montag gesammelt.'},
      {id:'research', label:'🔬 Forschung / Forschungsbeschleuniger einsetzen', when:'{adStart}', note:'Freitag ist Forschungstag; die Tech-Phase bietet eine zusätzliche Überschneidung.'},
      {id:'building', label:'🏗️ Bauen / Gebäudehammer einsetzen', when:'{adStart}', note:'Gebäudehämmer können die ganze Woche gesammelt werden.'},
      {id:'training', label:'🪖 Soldatentraining / Trainingsbeschleuniger einsetzen', when:'{adStart}', note:'Freitag ist Trainingstag; die Trainingsphase bietet eine zusätzliche Überschneidung.'}
    ],
    saturdayTasks:[
      {id:'survivors', label:'🧑‍🤝‍🧑 Überlebende rekrutieren', when:'{adStart}', note:'Überlebendentickets am Samstag verwenden.'},
      {id:'research', label:'🔬 Forschung / Forschungsbeschleuniger einsetzen', when:'{adStart}', note:'Samstag ist Forschungstag.'},
      {id:'building', label:'🏗️ Bauen / Gebäudehammer einsetzen', when:'{adStart}', note:'Samstag ist ein Bau-Tag.'},
      {id:'training', label:'🪖 Soldatentraining / Trainingsbeschleuniger einsetzen', when:'{adStart}', note:'Samstag ist ein Trainingstag.'},
      {id:'healing', label:'🩹 Heilung / Heilungsbeschleuniger einsetzen', when:'{adStart}', note:'Heilungsbeschleuniger für Samstag aufheben und verwenden.'},
      {id:'caravan', label:'🚚 Karawanen durchführen', when:'{adStart}', note:'UR-Karawanen gehören zum Samstag.'},
      {id:'covert', label:'🕵️ Verdeckte Operationen durchführen', when:'{adStart}', note:'UR-Verdeckte Operationen gehören zum Samstag.'},
    ],
    sundayTasks:[
      {id:'falcon', label:'🦅 Falkenquests für Montag sammeln', when:'Am Sonntag sammeln · Montag ab {adStartTime} Uhr einlösen', note:'Die Quests für Montag vorbereiten und bis Montag aufheben.'},
      {id:'raven', label:'🐦 Rabenessenz und Rabenfrüchte sammeln', when:'Den ganzen Sonntag', note:'Rabenressourcen über die Woche sammeln und für Montag aufheben.'},
      {id:'stamina', label:'⚡ Ausdauer sammeln', when:'Den Sonntag über', note:'Nur Ausdauerflaschen in der Tasche sammeln. Du kannst Ausdauer für Montag und auch für Samstag (Raid) zurückhalten.'},
      {id:'antidote', label:'🧪 Gegengift für Montag aufheben', when:'Den Sonntag über', note:'Gegengift für Montag zurückhalten.'},
      {id:'gather', label:'🌾 Rohstoffe für Montag vorbereiten', when:'Sonntagabend → Rückkehr nach Beginn des neuen AD-Tages', note:'Schicke am Sonntagabend alle verfügbaren Truppen auf die Felder, sodass sie nach Beginn des neuen AD-Tages wieder nach Hause kommen und direkt die ersten AD-Punkte sammeln.'}
    ],
    saveByDay:{
      1:['🧑‍🤝‍🧑 Überlebendentickets → Dienstag','🐦 Rabenausrüstungstruhen → Mittwoch','🔬 Forschungsressourcen → Mittwoch / Freitag / Samstag','🦸 Heldenressourcen → Donnerstag','🩹 Heilungsbeschleuniger → Samstag','🏗️ Gebäudehammer → Dienstag / Freitag / Samstag','🪖 Trainingsbeschleuniger → Freitag / Samstag'],
      2:['🦅 Falkenquests → Mittwoch','🔬 Forschungsressourcen → Mittwoch / Freitag / Samstag','🐦 Rabenausrüstungstruhen → Mittwoch','🦸 Heldenressourcen + 🧪 Gegengift → Donnerstag','🪖 Trainingsbeschleuniger → Freitag / Samstag','🩹 Heilungsbeschleuniger → Samstag','🏗️ Gebäudehammer → Freitag / Samstag','🐦 Rabenessenz + 🍎 Rabenfrüchte → Montag'],
      3:['🦸 Heldenressourcen + 🧪 Gegengift → Donnerstag','🦅 Falkenquests → Freitag','🏗️ Gebäudehammer → Freitag / Samstag','🔬 Forschungsbeschleuniger → Freitag / Samstag','🪖 Trainingsbeschleuniger → Freitag / Samstag','🩹 Heilungsbeschleuniger → Samstag','🧑‍🤝‍🧑 Überlebendentickets → Samstag','🐦 Rabenessenz + 🍎 Rabenfrüchte → Montag'],
      4:['🦅 Falkenquests → Freitag','🔬 Forschungsressourcen → Mittwoch / Freitag / Samstag', '🔬 Forschungsbeschleuniger → Freitag / Samstag','🏗️ Gebäudehammer → Freitag / Samstag','🪖 Trainingsbeschleuniger → Freitag / Samstag','🩹 Heilungsbeschleuniger → Samstag','🧑‍🤝‍🧑 Überlebendentickets → Samstag','🐦 Rabenessenz + 🍎 Rabenfrüchte → Montag'],
      5:['🧑‍🤝‍🧑 Überlebendentickets → Samstag','🔬 Forschungsressourcen / Forschungsbeschleuniger → Samstag','🏗️ Gebäudehammer → Samstag','🪖 Trainingsbeschleuniger → Samstag','🩹 Heilungsbeschleuniger → Samstag','🐦 Rabenessenz + 🍎 Rabenfrüchte → Montag'],
      6:['🐦 Rabenessenz + 🍎 Rabenfrüchte → Montag','⚡ Ausdauer → Montag','🧪 Gegengift → Montag','🦅 Falkenquests → Sonntag sammeln, für Montag aufheben'],
      0:['🦅 Falkenquests → Montag','🐦 Rabenessenz + 🍎 Rabenfrüchte → Montag','⚡ Ausdauer → Montag','🧪 Gegengift → Montag']
    },
    falconPlanner:{headline:'Falkenquest-Planer',intro:'Finde heraus, wie viele Quests du jetzt abholen musst – nicht mehr als nötig – damit du morgens maximal viele Quests für den AD-Vorrat hast.',stored:'Gespeicherte Quests',storedHint:'Das ist die Zahl der aktuell gespeicherten Quests.',storageCapacity:'Verfügbare Speicherplätze',storageCapacityHint:'Maximale Anzahl an Quests, die im Speicher liegen können. Nach einem Refresh darf die Zahl höchstens einen Platz darunter liegen.',active:'Aktive sichtbare Quests',activeHint:'Das ist die aktuelle Zahl deiner sichtbaren Quests. Ob erledigt oder unerledigt spielt für die Speicherberechnung keine Rolle.',activeCapacity:'Mögliche Anzahl aktiver Quests',activeCapacityHint:'Maximale Anzahl an sichtbaren Quests.',perRefresh:'Quests pro Aktualisierung',perRefreshHint:'So viele neue Quests kommen bei jeder Aktualisierung hinzu.',refresh:'Zeit bis zur nächsten Aktualisierung',login:'Wann spielst du wieder?',loginHint:'Die App berechnet, wie viele Quests du JETZT abholen musst, damit bis zu deiner nächsten Spielzeit kein Refresh verloren geht.',rules:'Regeln dieser Version',timezone:'Zeitzone: ',claimNow:'Jetzt abholen',startAfter:'Speicher danach',refreshes:'Refreshes bis dahin',morning:'Gespeicherte Quests morgens',ad:'AD-Vorrat morgens',claimExplain:'Du musst jetzt {n} Quests abholen. Mehr ist für das maximale Ergebnis nicht nötig.',morningExplain:'Damit hast du morgens {n} gespeicherte Quests.',timeline:'Verlauf',safe:'sicher',refreshAt:'Refresh',extra:'Die Berechnung geht davon aus, dass du jetzt offline gehst und bis zu deiner nächsten Spielsession nichts mehr abholst. Die notwendige Abholmenge muss deshalb jetzt erfolgen.',rulesList:['Die Werte für Speicherplätze, aktive Quests und neue Quests pro Aktualisierung kannst du selbst einstellen.','Nach einer Aktualisierung darf der Speicher höchstens einen Platz unter seiner eingestellten Kapazität liegen.','Beim Abholen einer sichtbaren Quest rutscht automatisch die nächste Quest aus dem Speicher nach.','Erledigt oder unerledigt spielt für die Anzahl der aktiven Plätze keine Rolle.','Die App berechnet die Abholmenge so, dass alle Refreshes bis zur nächsten Spielsession stattfinden können und morgens der maximale AD-Vorrat bereitsteht.','Die berechnete Abholmenge gilt für JETZT, weil bis zur nächsten Spielsession nichts mehr abgeholt wird.'],errorTime:'Bitte HH:MM:SS eingeben.',errorLogin:'Bitte eine gültige Spielzeit wählen.'}
  },
  en: {
    today:'Today', home:'Today', falcon:'🦅 Falcon Quest Planner', back:'← Back', detail:'Day plan', taskDetail:'Task', tasks:"Today's tasks", bonus:'⭐ Survival Battle', collectTitle:'📦 Save & Prepare', prep:'Preparation', optional:'Bonus opportunity – not required.',
    sunday:'Preparation for Monday', day:'AD Day', now:'Now', next:'Next', todayLabel:'TODAY', when:'When?', note:'Note', allDay:'all day', overlapLabel:'What to use / do:', localTime:'Times are automatically adjusted to your local time zone.',
    survivalNav:'⭐ Survival Battle', survivalPageTitle:'Survival Battle', survivalIntro:'Five phase types rotate in a fixed cycle. Tap a phase to see what counts there.', survivalPhase:'Phase', survivalWhen:'Time window', survivalWhat:'What counts?', survivalHint:'Only actions belonging to the active phase score there. Save resources for the matching phase where possible.', survivalSourcesNote:'Phase types and scored action categories are based on the current Survival Battle wiki.',
    survivalActions:{0:['🧑‍🤝‍🧑 Recruit heroes','🧪 Consume Antidote','💎 Purchases containing Diamonds can also score'],1:['🏗️ Build / use construction resources','⏱️ Use Construction Speedups','🏢 Increase Building Might','💎 Purchases containing Diamonds can also score'],2:['🪖 Train soldiers','⏱️ Use Training Boosts','💎 Purchases containing Diamonds can also score'],3:['🔬 Research technology','⏱️ Use Research Speedups','🔬 Increase Tech Might','💎 Purchases containing Diamonds can also score'],4:['⚡ Consume Stamina','🍎 Consume Raven Fruit','🐦 Enhance the Raven','💎 Purchases containing Diamonds can also score']},
    days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], adNames:['Preparation','🐦 Raven','🏗️ Construction','🔬 Technology','🦸 Heroes','🏋️ Preparation','⚔️ Raid'],
    survival:['🦸 Hero Improvement','🏗️ Territory Construction','🪖 Soldier Training','🔬 Technology Research','🐦 Raven Improvement'], overlap:'⭐',
    claimFalcon:'Claim Falcon Quests', noFalcon:'No Falcon Quests to claim today.', researchScroll:'Use Study Scrolls', researchScrollNote:'Today is an AD technology day. Scrolls can be used in the research branches that require them. Personal AD point values are intentionally left out for now.',
    resources:{survivor:'Survivor Tickets',antidote:'Antidote',stamina:'Stamina',essence:'Raven Essence',fruit:'Raven Fruit',chests:'Raven Equipment Chests',research:'Research resources',researchSpeed:'Research speedups',study:'Study Scrolls',hero:'Hero resources',building:'Building Hammers',buildingSpeed:'Building speedups',training:'Training speedups',healing:'Healing speedups',falcon:'Falcon Quests'},
    collectFor:'Save for {day}', keepWeek:'collect throughout the week', nextCycle:'save for the next AD week',
    mondayTasks:[{id:'falcon',label:'🦅 Claim Falcon Quests',when:'{adStart}',note:'Claim today’s Falcon Quests from {adStartTime} onward.'},{id:'ravenEssence',label:'🐦 Use Raven Essence',when:'{adStart}',note:'Use on Monday. {ravenWindow} is the Raven Survival overlap.'},{id:'ravenFruit',label:'🍎 Use Raven Fruit',when:'{adStart}',note:'Use on Monday. {ravenWindow} is the Raven Survival overlap.'},{id:'antidote',label:'🧪 Use Antidote',when:'{adStart}',note:'Antidote counts Monday and Thursday. During the Hero phases {heroWindows}, you can also earn Survival points.'},{id:'stamina',label:'⚡ Spend Stamina',when:'{adStart}',note:'Use on Monday. {ravenWindow} is an optional Survival overlap.'},{id:'gather',label:'🌾 Gather resources',when:'{adStart}',note:'Resource gathering belongs to Monday’s AD tasks. Keep all available troops on gathering fields whenever they are not needed elsewhere. Sunday evening can also prepare the first Monday points.'}],
    tuesdayTasks:[{id:'caravan',label:'🚚 Do UR Caravan trades',when:'{adStart}',note:'Use UR Caravan trades for Tuesday AD.'},{id:'covert',label:'🕵️ Do UR Covert Operations',when:'{adStart}',note:'Do UR Covert Operations for Tuesday AD.'},{id:'survivors',label:'🧑‍🤝‍🧑 Recruit Survivors',when:'{adStart}',note:'Use Survivor Tickets on Tuesday.'},{id:'building',label:'🏗️ Use Building Hammers / construction resources',when:'{adStart}',note:'Building Hammers can be saved all week and used on building days.'},{id:'buildingMight',label:'🏢 Increase Building Might',when:'{adStart}',note:'Building progress and Building Might count today.'}],
    wednesdayTasks:[{id:'falcon',label:'🦅 Claim Falcon Quests',when:'{adStart}',note:'Claim the Falcon Quests saved for Wednesday from {adStartTime} onward.'},{id:'chests',label:'🐦 Open Raven Equipment Chests',when:'{adStart}',note:'Raven Equipment Chests belong to Wednesday.'},{id:'study',label:'📜 Use Study Scrolls',when:'{adStart}',note:'Several research branches use Study Scrolls; choose the branch according to your own plan.'},{id:'research',label:'🔬 Do Research',when:'{adStart}',note:'Wednesday is an AD research day; the Tech phase adds an optional overlap.'},{id:'techMight',label:'🔬 Increase Technology Might',when:'{adStart}',note:'Technology Might overlaps the Tech phase.'}],
    thursdayTasks:[{id:'urHero',label:'🦸 Use UR Hero Shards',when:'{adStart}',note:'Hero resources belong to Thursday AD.'},{id:'ssrHero',label:'🦸 Use SSR Hero Shards',when:'{adStart}',note:'Hero resources belong to Thursday AD.'},{id:'srHero',label:'🦸 Use SR Hero Shards',when:'{adStart}',note:'Hero resources belong to Thursday AD.'},{id:'heroRecruit',label:'🧑‍🤝‍🧑 Recruit Heroes',when:'{adStart}',note:'Hero recruitment belongs to Thursday.'},{id:'badges',label:'🏅 Use Skill Badges',when:'{adStart}',note:'Skill Badges belong to the Hero day.'},{id:'antidote',label:'🧪 Use Antidote',when:'{adStart}',note:'Antidote counts Monday and Thursday.'}],
    fridayTasks:[{id:'falcon',label:'🦅 Claim Falcon Quests',when:'{adStart}',note:'The next Falcon Quests are collected on Sunday for Monday.'},{id:'research',label:'🔬 Do Research / use Research Speedups',when:'{adStart}',note:'Friday is a research day; the Tech phase is an optional overlap.'},{id:'building',label:'🏗️ Build / use Building Hammers',when:'{adStart}',note:'Building Hammers can be saved all week.'},{id:'training',label:'🪖 Train Soldiers / use Training Speedups',when:'{adStart}',note:'Friday is a training day; the Training phase is an optional overlap.'}],
    saturdayTasks:[{id:'survivors',label:'🧑‍🤝‍🧑 Recruit Survivors',when:'{adStart}',note:'Use Survivor Tickets on Saturday.'},{id:'research',label:'🔬 Do Research / use Research Speedups',when:'{adStart}',note:'Saturday is a research day.'},{id:'building',label:'🏗️ Build / use Building Hammers',when:'{adStart}',note:'Saturday is a building day.'},{id:'training',label:'🪖 Train Soldiers / use Training Speedups',when:'{adStart}',note:'Saturday is a training day.'},{id:'healing',label:'🩹 Heal / use Healing Speedups',when:'{adStart}',note:'Save Healing Speedups for Saturday.'},{id:'caravan',label:'🚚 Do Caravan trades',when:'{adStart}',note:'UR Caravan trades belong to Saturday.'},{id:'covert',label:'🕵️ Do Covert Operations',when:'{adStart}',note:'UR Covert Operations belong to Saturday.'},{id:'raid',label:'⚔️ Raid',when:'{adStart}',note:'Raid is a Saturday task.'}],
    sundayTasks:[{id:'falcon',label:'🦅 Collect Falcon Quests for Monday',when:'Collect on Sunday · claim Monday from {adStartTime}',note:'Prepare and save the quests for Monday.'},{id:'raven',label:'🐦 Collect Raven Essence and Fruit',when:'All Sunday',note:'Collect Raven resources throughout the week and save them for Monday.'},{id:'stamina',label:'⚡ Collect Stamina',when:'Throughout Sunday',note:'Only collect Stamina bottles in your bag. Stamina can be saved for Monday and also for Saturday (Raid).'}, {id:'antidote',label:'🧪 Save Antidote for Monday',when:'Throughout Sunday',note:'Hold Antidote for Monday.'},{id:'gather',label:'🌾 Prepare resources for Monday',when:'Sunday evening → return after the new AD day begins',note:'On Sunday evening, send all available troops to the fields so they return home after the new AD day begins and collect the first AD points.'}],
    saveByDay:{1:['🧑‍🤝‍🧑 Survivor Tickets → Tuesday','🐦 Raven Equipment Chests → Wednesday','🔬 Research resources → Wednesday','🦸 Hero resources → Thursday','🩹 Healing Speedups → Saturday','🏗️ Building Hammers → Tuesday / Friday / Saturday','🪖 Training Speedups → Friday / Saturday'],2:['🦅 Falcon Quests → Wednesday','🔬 Research resources → Wednesday','🐦 Raven Equipment Chests → Wednesday','🦸 Hero resources + 🧪 Antidote → Thursday','🪖 Training Speedups → Friday / Saturday','🩹 Healing Speedups → Saturday','🏗️ Building Hammers → Friday / Saturday','🐦 Raven Essence + 🍎 Fruit → Monday'],3:['🦸 Hero resources + 🧪 Antidote → Thursday','🦅 Falcon Quests → Friday','🏗️ Building Hammers → Friday / Saturday','🔬 Research Speedups → Friday / Saturday','🪖 Training Speedups → Friday / Saturday','🩹 Healing Speedups → Saturday','🧑‍🤝‍🧑 Survivor Tickets → Saturday','🐦 Raven Essence + 🍎 Fruit → Monday'],4:['🦅 Falcon Quests → Friday','🏗️ Building Hammers → Friday / Saturday','🔬 Research Speedups → Friday / Saturday','🪖 Training Speedups → Friday / Saturday','🩹 Healing Speedups → Saturday','🧑‍🤝‍🧑 Survivor Tickets → Saturday','🐦 Raven Essence + 🍎 Fruit → Monday'],5:['🧑‍🤝‍🧑 Survivor Tickets → Saturday','🔬 Research resources / Research Speedups → Saturday','🏗️ Building Hammers → Saturday','🪖 Training Speedups → Saturday','🩹 Healing Speedups → Saturday','🐦 Raven Essence + 🍎 Fruit → Monday'],6:['🔬 Research resources / Research Speedups → Saturday','🐦 Raven Essence + 🍎 Fruit → Monday','⚡ Stamina → Monday','🧪 Antidote → Monday','🦅 Falcon Quests → collect Sunday, save for Monday'],0:['🦅 Falcon Quests → Monday','🐦 Raven Essence + 🍎 Fruit → Monday','⚡ Stamina → Monday','🧪 Antidote → Monday']},
    falconPlanner:{headline:'Falcon Quest Planner',intro:'Find out how many quests you need to claim now – no more than necessary – so you have the maximum number of quests available for AD in the morning.',stored:'Stored quests',storedHint:'The number of quests currently stored.',storageCapacity:'Available storage slots',storageCapacityHint:'Maximum number of quests that can be stored. After a refresh, storage must stay one slot below this capacity.',active:'Active visible quests',activeHint:'The current number of visible quests. Whether they are completed or not does not affect the storage calculation.',activeCapacity:'Maximum active quests',activeCapacityHint:'Maximum number of visible quests.',perRefresh:'Quests per refresh',perRefreshHint:'How many new quests are added at each refresh.',refresh:'Time until next refresh',login:'When will you play again?',loginHint:'The planner calculates how many quests you must claim NOW so no refresh is lost before your next session.',rules:'Rules for this version',timezone:'Time zone: ',claimNow:'Claim now',startAfter:'Storage after claiming',refreshes:'Refreshes until then',morning:'Stored quests in morning',ad:'AD stock in morning',claimExplain:'You need to claim {n} quests now. More is not needed for the maximum result.',morningExplain:'This gives you {n} stored quests in the morning.',timeline:'Sequence',safe:'safe',refreshAt:'Refresh',extra:'The calculation assumes you go offline now and claim nothing else until your next session. The required number of claims therefore has to happen now.',rulesList:['You can set the values for storage slots, active quests and new quests per refresh yourself.','After a refresh, storage must stay one slot below the configured capacity.','When a visible quest is claimed, the next quest automatically moves out of storage.','Whether a visible quest is completed or not does not affect the number of active slots.','The planner calculates the claim amount so all refreshes until the next session can happen and the maximum AD stock is available in the morning.','The calculated claim amount is for NOW because nothing else is claimed before the next session.'],errorTime:'Enter HH:MM:SS.',errorLogin:'Choose a valid session time.'}
  }
};

const GAME_RESET_ZONE = 'Europe/Berlin';
const GAME_RESET_HOUR = 4;

function zoneParts(date, timeZone){
  const parts = new Intl.DateTimeFormat('en-US', {timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'}).formatToParts(date);
  const out = {};
  parts.forEach(p=>{ if(p.type!=='literal') out[p.type]=p.value; });
  return {year:Number(out.year), month:Number(out.month), day:Number(out.day), hour:Number(out.hour), minute:Number(out.minute), second:Number(out.second)};
}

function zoneOffsetMs(date, timeZone){
  const p = zoneParts(date, timeZone);
  const asUTC = Date.UTC(p.year, p.month-1, p.day, p.hour, p.minute, p.second);
  return asUTC - date.getTime();
}

function zonedDateToUtc(year, month, day, hour, minute=0, second=0, timeZone=GAME_RESET_ZONE){
  let candidate = Date.UTC(year, month-1, day, hour, minute, second);
  for(let i=0;i<3;i++) candidate = Date.UTC(year, month-1, day, hour, minute, second) - zoneOffsetMs(new Date(candidate), timeZone);
  return new Date(candidate);
}

function gameDate(now=new Date()){
  const p = zoneParts(now, GAME_RESET_ZONE);
  let base = Date.UTC(p.year, p.month-1, p.day);
  if(p.hour < GAME_RESET_HOUR) base -= 86400000;
  return new Date(base);
}

function gameResetInstantForDay(day){
  const base = gameDate();
  const current = base.getUTCDay();
  let diff = day - current;
  if(diff < 0) diff += 7;
  const target = new Date(base.getTime() + diff*86400000);
  return zonedDateToUtc(target.getUTCFullYear(), target.getUTCMonth()+1, target.getUTCDate(), GAME_RESET_HOUR);
}

function localClock(date){
  return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false});
}

function adStartLabel(day=currentDay()){
  const start = gameResetInstantForDay(day);
  const label = localClock(start);
  return state.lang==='de' ? `Ab ${label} Uhr · den ganzen AD-Tag` : `From ${label} · the whole AD day`;
}

function currentDay(){
  return gameDate().getUTCDay();
}

function dayNumber(day){ return day === 0 ? 0 : day; }

// Agreed weekly Survival Battle rotation used by the planner.
const SURVIVAL_BY_DAY = {
  1:[0,1,2,3,4,0], // Monday
  2:[1,2,3,4,0,1], // Tuesday
  3:[2,3,4,0,1,2], // Wednesday
  4:[0,1,2,3,4,0], // Thursday
  5:[1,2,3,4,0,1], // Friday
  6:[2,3,4,0,1,2], // Saturday
  0:[3,4,0,1,2,3]  // Sunday
};
function survivalSlots(day){
  const t=T[state.lang];
  const phases=SURVIVAL_BY_DAY[day] || SURVIVAL_BY_DAY[0];
  const reset=gameResetInstantForDay(day);
  const slots=[];
  for(let i=0;i<6;i++){
    const startDate=new Date(reset.getTime()+i*4*3600000);
    const endDate=new Date(startDate.getTime()+4*3600000);
    slots.push({start:localClock(startDate),end:localClock(endDate),name:t.survival[phases[i]],phase:phases[i]});
  }
  return slots;
}
function bonusFor(day, phase){
  if(day===1) return phase===0 || phase===4; // Hero + Raven
  if(day===2) return phase===1;               // Building
  if(day===3) return phase===3;               // Tech
  if(day===4) return phase===0;               // Hero
  if(day===5) return phase===1 || phase===2 || phase===3; // Building + Training + Tech
  if(day===6) return phase===1 || phase===2 || phase===3; // Building + Training + Tech
  return false;
}
function overlapText(day, phase){
  const de = state.lang==='de';
  const map = {
    1:{0:de?'🧪 Gegengift einlösen':'🧪 Use Antidote',4:de?'🐦 Rabenessenz + 🍎 Rabenfrüchte einlösen':'🐦 Redeem Raven Essence + 🍎 Raven Fruit'},
    2:{1:de?'🏗️ Bauen / Gebäudehammer einsetzen':'🏗️ Build / use Building Hammers'},
    3:{3:de?'🔬 Forschung / Forschungsbeschleuniger einsetzen':'🔬 Research / use Research Speedups'},
    4:{0:de?'🧪 Gegengift einlösen':'🧪 Use Antidote'},
    5:{1:de?'🏗️ Bauen / Gebäudehammer einsetzen':'🏗️ Build / use Building Hammers',2:de?'🪖 Soldaten trainieren / Trainingsbeschleuniger einsetzen':'🪖 Train soldiers / use Training Speedups',3:de?'🔬 Forschung / Forschungsbeschleuniger einsetzen':'🔬 Research / use Research Speedups'},
    6:{1:de?'🏗️ Bauen / Gebäudehammer einsetzen':'🏗️ Build / use Building Hammers',2:de?'🪖 Soldaten trainieren / Trainingsbeschleuniger einsetzen':'🪖 Train soldiers / use Training Speedups',3:de?'🔬 Forschung / Forschungsbeschleuniger einsetzen':'🔬 Research / use Research Speedups'}
  };
  return map[day] && map[day][phase] ? map[day][phase] : '';
}

function taskSurvivalWindows(day, taskId){
  const map = {
    1:{ravenEssence:[4], ravenFruit:[4], antidote:[0], stamina:[4]},
    2:{building:[1], buildingMight:[1]},
    3:{research:[3], techMight:[3]},
    4:{urHero:[0], ssrHero:[0], srHero:[0], heroRecruit:[0], badges:[0], antidote:[0]},
    5:{research:[3], building:[1], training:[2]},
    6:{research:[3], building:[1], training:[2]}
  };
  return (map[day] && map[day][taskId] ? map[day][taskId] : []).map(phase=>localWindow(day,phase));
}

function taskOverviewWhen(day, task){
  const base = replaceTimeTokens(String(task.when).replace('{adStart}', adStartLabel(day)), day);
  const windows = taskSurvivalWindows(day, task.id);
  if(!windows.length) return base;
  const prefix = state.lang==='de' ? '⭐ Survival: ' : '⭐ Survival: ';
  return `${base}<small class=\"task-survival-time\">${prefix}${windows.join(state.lang==='de'?' · ':' · ')}</small>`;
}

function dayTasks(day){
  const t=T[state.lang];
  if(day===1)return t.mondayTasks;
  if(day===2)return t.tuesdayTasks;
  if(day===3)return t.wednesdayTasks;
  if(day===4)return t.thursdayTasks;
  if(day===5)return t.fridayTasks;
  if(day===6)return t.saturdayTasks;
  return t.sundayTasks;
}

function orderedDayTasks(day){
  const tasks = [...dayTasks(day)];
  const slots = survivalSlots(day);
  const windows = taskSurvivalWindows;

  // First show all-day tasks. For tasks with Survival overlaps,
  // sort by the first occurrence of that phase during this day.
  // If a phase occurs twice, its earliest time determines the order.
  function firstSurvivalSlot(day, taskId){
    const phases = windowsForTaskPhase(day, taskId);
    if(!phases.length) return 99;
    const indices = phases.map(phase => slots.findIndex(slot => slot.phase === phase)).filter(i => i >= 0);
    return indices.length ? Math.min(...indices) : 99;
  }

  return tasks.sort((a,b)=>{
    const hasA = windows(day,a.id).length > 0;
    const hasB = windows(day,b.id).length > 0;
    if(hasA !== hasB) return hasA ? 1 : -1;
    if(hasA && hasB){
      const pa = firstSurvivalSlot(day,a.id);
      const pb = firstSurvivalSlot(day,b.id);
      if(pa !== pb) return pa-pb;
    }
    return 0;
  });
}
function windowsForTaskPhase(day, taskId){
  const map = {
    1:{ravenEssence:[4], ravenFruit:[4], antidote:[0], stamina:[4]},
    2:{building:[1], buildingMight:[1]},
    3:{research:[3], techMight:[3]},
    4:{urHero:[0], ssrHero:[0], srHero:[0], heroRecruit:[0], badges:[0], antidote:[0]},
    5:{research:[3], building:[1], training:[2]},
    6:{research:[3], building:[1], training:[2]}
  };
  return (map[day] && map[day][taskId]) ? map[day][taskId].map(Number) : [];
}

function snapshot(){ return {view:state.view, selectedDay:state.selectedDay, selectedTask:state.selectedTask, selectedPhase:state.selectedPhase}; }
function navigate(view, props={}){
  state.history.push(snapshot());
  state.view=view;
  if(Object.prototype.hasOwnProperty.call(props,'selectedDay')) state.selectedDay=props.selectedDay;
  if(Object.prototype.hasOwnProperty.call(props,'selectedTask')) state.selectedTask=props.selectedTask;
  if(Object.prototype.hasOwnProperty.call(props,'selectedPhase')) state.selectedPhase=props.selectedPhase;
  render();
  window.scrollTo({top:0,left:0,behavior:'auto'});
}
function goBack(){
  const prev=state.history.pop();
  if(prev){ Object.assign(state, prev); render(); }
  else { state.view='home'; state.selectedTask=null; state.selectedPhase=null; render(); }
}

function nav(){
  const t=T[state.lang];
  $('nav').innerHTML=`<button class="nav-button ${state.view==='home'?'active':''}" data-view="home">🏠 ${t.home}</button><button class="nav-button ${state.view==='detail'?'active':''}" data-view="detail">📅 ${t.detail}</button><button class="nav-button ${state.view==='survival'?'active':''}" data-view="survival">${t.survivalNav}</button><button class="nav-button ${state.view==='falcon'?'active':''}" data-view="falcon">${t.falcon}</button>`;
  document.querySelectorAll('.nav-button').forEach(b=>b.onclick=()=>navigate(b.dataset.view, {selectedDay:(b.dataset.view==='detail'||b.dataset.view==='survival')?currentDay():null, selectedTask:null, selectedPhase:null}));
}

function dayHeading(day){
  const t=T[state.lang];
  const name=t.days[day] || t.days[0];
  const ad=day===0?t.sunday:`AD ${day} · ${t.adNames[day]}`;
  return {name,ad};
}

function home(){
  const t=T[state.lang], d=currentDay(), h=dayHeading(d), tasks=dayTasks(d);
  let html=`<section class="card today-card"><div class="day-kicker">${t.todayLabel}</div><h2>${h.name}</h2><p class="ad-title">${h.ad}</p></section>`;
  html+=`<section class="card task-card"><h2>${t.tasks}</h2><div class="task-list">${tasks.map(x=>`<button class="task-row" data-task="${x.id}" data-day="${d}"><span>${x.label}</span><span>›</span></button>`).join('')}</div><button class="primary full" data-day-detail="${d}">${t.detail} →</button></section>`;
  return html;
}

function localWindow(day, phase){
  const slots=survivalSlots(day).filter(s=>s.phase===phase);
  return slots.map(s=>`${s.start}–${s.end}`).join(state.lang==='de'?' bzw. ':' or ');
}

function replaceTimeTokens(text, day){
  if(!text) return '';
  const reset=gameResetInstantForDay(day);
  return String(text)
    .replaceAll('{adStartTime}', localClock(reset))
    .replaceAll('{ravenWindow}', localWindow(day,4))
    .replaceAll('{heroWindows}', localWindow(day,0))
    .replaceAll('{techWindow}', localWindow(day,3))
    .replaceAll('{trainingWindow}', localWindow(day,2))
    .replaceAll('{buildingWindow}', localWindow(day,1));
}

function taskDetail(day, taskId){
  const t=T[state.lang], task=(dayTasks(day)||[]).find(x=>x.id===taskId) || dayTasks(day)[0];
  const h=dayHeading(day);
  return `<button class="back-button" id="backHome">${t.back}</button>
    <section class="card task-focus"><div class="day-kicker">${t.taskDetail}</div><h2>${task.label}</h2><p class="ad-title">${h.name} · ${h.ad}</p></section>
    <section class="card"><h2>⏰ ${t.when}</h2><p class="task-when">${replaceTimeTokens(String(task.when).replace('{adStart}', adStartLabel(day)), day)}</p><hr><h3>${t.note}</h3><p class="note">${replaceTimeTokens(task.note, day)}</p><p class="note">🕓 ${t.localTime}</p></section>`;
}

function dayPicker(day){
  const t=T[state.lang];
  return `<div class="day-picker" aria-label="${state.lang==='de'?'Wochentag auswählen':'Choose day'}">${t.days.map((name,i)=>`<button class="day-pill ${i===day?'active':''}" data-pick-day="${i}">${name}</button>`).join('')}</div>`;
}

function nextScheduledDay(day, schedule){
  for(let offset=1; offset<=7; offset++){ const candidate=(day+offset)%7; if(schedule.includes(candidate)) return candidate; }
  return schedule[0];
}
function allScheduledDaysFromNext(day, schedule){
  // On a day where the resource is actually used/redeemed, it is NOT a
  // collection item at all. It reappears from the following day.
  if(schedule.includes(day)) return [];
  const ordered=[];
  for(let offset=1; offset<=6; offset++){
    const candidate=(day+offset)%7;
    if(schedule.includes(candidate) && !ordered.includes(candidate)) ordered.push(candidate);
  }
  return ordered;
}
function rotatingSaveItems(day){
  const t=T[state.lang], dName=n=>t.days[n];
  const nextAll=(schedule)=>allScheduledDaysFromNext(day,schedule).map(dName).join(' / ');
  const items=[];

  // Falcon Quests are collected only on the three specific preparation days:
  // Sunday -> Monday, Tuesday -> Wednesday, Thursday -> Friday.
  const falconTargets={0:1,2:3,4:5};
  if(Object.prototype.hasOwnProperty.call(falconTargets,day)){
    items.push({text:`🦅 ${state.lang==='de'?'Falkenquests für '+dName(falconTargets[day])+' sammeln':'Collect Falcon Quests for '+dName(falconTargets[day])}`, click:'falcon'});
  }

  const add=(text,schedule)=>{
    const days=allScheduledDaysFromNext(day,schedule);
    if(days.length) items.push({text:`${text} → ${days.map(dName).join(' / ')}`});
  };
  add(`🐦 ${state.lang==='de'?'Rabenausrüstungstruhen':'Raven Equipment Chests'}`,[3]);
  add(`🔬 ${state.lang==='de'?'Forschungsressourcen / Forschungsbeschleuniger':'Research resources / Research Speedups'}`,[3,5,6]);
  add(`📜 ${state.lang==='de'?'Studien-Schriftrollen':'Study Scrolls'}`,[3]);
  add(`🦸 ${state.lang==='de'?'Heldenressourcen':'Hero resources'}`,[4]);
  add(`🧪 ${state.lang==='de'?'Gegengift':'Antidote'}`,[1,4]);
  add(`🩹 ${state.lang==='de'?'Heilungsbeschleuniger':'Healing Speedups'}`,[6]);
  add(`🏗️ ${state.lang==='de'?'Gebäudehammer / Baubeschleuniger':'Building Hammers / Construction Speedups'}`,[2,5,6]);
  add(`🪖 ${state.lang==='de'?'Trainingsbeschleuniger':'Training Speedups'}`,[5,6]);
  add(`🧑‍🤝‍🧑 ${state.lang==='de'?'Überlebendentickets':'Survivor Tickets'}`,[2,6]);
  add(`🐦 ${state.lang==='de'?'Rabenessenz + 🍎 Rabenfrüchte':'Raven Essence + 🍎 Raven Fruit'}`,[1]);
  add(`⚡ ${state.lang==='de'?'Ausdauerflaschen':'Stamina bottles'}`,[1,6]);
  return items;
}

function detail(day){
  day = Number.isInteger(day) && day>=0 && day<=6 ? day : currentDay();
  const t=T[state.lang], h=dayHeading(day);
  let html=`<button class="back-button" id="backHome">${t.back}</button>${dayPicker(day)}<section class="card day-head"><div class="day-kicker">${t.detail}</div><h2>${h.name}</h2><p class="ad-title">${h.ad}</p></section>`;
  html+=`<section class="card"><h2>🔴 ${t.tasks}</h2><div class="plan-task-list">${orderedDayTasks(day).map(x=>`<button class="plan-task-row" data-task="${x.id}" data-day="${day}"><div class="plan-task-main"><strong>${x.label}</strong><span>${taskOverviewWhen(day, x)}</span></div><span class="survival-arrow">›</span></button>`).join('')}</div></section>`;
  html+=`<section class="card"><h2>${t.bonus}</h2><p class="note">${t.optional}</p><div class="survival-list">`;
  survivalSlots(day).forEach(s=>{const hit=bonusFor(day,s.phase);const action=overlapText(day,s.phase);html+=`<button class="survival-row survival-link ${hit?'highlight':''}" data-survival-phase="${s.phase}" data-survival-day="${day}"><div class="survival-time">${s.start}–${s.end}</div><div><strong>${s.name}</strong>${hit&&action?`<div class="overlap">${action}</div>`:''}</div><span class="survival-arrow">›</span></button>`});
  html+=`</div></section>`;
  html+=`<section class="card"><h2>${t.collectTitle}</h2><div class="detail-list">${rotatingSaveItems(day).map(x=>x.click==='falcon'?`<button class="detail-item detail-link" data-collect-action="falcon">${x.text}<span class="survival-arrow">›</span></button>`:`<div class="detail-item">${x.text}</div>`).join('')}</div>`;
  html+=`</section>`;
  return html;
}

function survivalPhaseDetail(day, phase){
  const t=T[state.lang], p=Number(phase), h=dayHeading(day);
  const slots=survivalSlots(day).filter(s=>s.phase===p);
  const actions=t.survivalActions[p] || [];
  const timeText=slots.map(s=>`${s.start}–${s.end}`).join(' · ');
  return `<button class="back-button" id="backSurvival">${t.back}</button>
    <section class="card phase-focus"><div class="day-kicker">${t.survivalPhase}</div><h2>${t.survival[p]}</h2><p class="ad-title">${h.name} · ${timeText}</p></section>
    <section class="card"><h2>⏰ ${t.survivalWhen}</h2><p class="task-when">${timeText}</p><hr><h2>🎯 ${t.survivalWhat}</h2><div class="detail-list">${actions.map(a=>`<div class="detail-item">${a}</div>`).join('')}</div><p class="note">${t.survivalHint}</p></section>`;
}

function survivalView(){
  const t=T[state.lang], d=state.selectedDay ?? currentDay(), slots=survivalSlots(d), reset=gameResetInstantForDay(d), now=new Date();
  const currentIndex=Math.floor((now.getTime()-reset.getTime())/(4*3600000));
  let html=`${dayPicker(d)}<section class="card today-card"><div class="day-kicker">${t.survivalPageTitle}</div><h2>${t.days[d]}</h2><p class="ad-title">${t.survivalIntro}</p></section>`;
  html+=`<section class="card"><h2>⭐ ${t.survivalPageTitle}</h2><p class="note">${t.optional}</p><div class="survival-list">`;
  slots.forEach((s,i)=>{
    const current=i===currentIndex;
    html+=`<button class="survival-row survival-link ${current?'current':''}" data-survival-phase="${s.phase}" data-survival-day="${d}"><div class="survival-time">${s.start}–${s.end}</div><div><strong>${s.name}</strong>${current?`<div class="overlap">${t.now}</div>`:''}</div><span class="survival-arrow">›</span></button>`;
  });
  html+=`</div></section><section class="card"><h2>📌 ${t.survivalWhat}</h2><p class="note">${t.survivalSourcesNote}</p></section>`;
  return html;
}

function falconView(){
  const t=T[state.lang].falconPlanner;
  return `<button class="back-button" id="backHome">${T[state.lang].back}</button>
  <section class="card intro"><h2>${t.headline}</h2><p>${t.intro}</p></section>
  <section class="card falcon-setting"><label for="storedQuests">${t.stored}</label><div class="time-control"><input id="storedQuests" class="time-input" type="text" value="5" inputmode="numeric"><input id="storedQuestsRange" class="time-range" type="range" min="0" max="35" step="1" value="5"></div><p class="hint">${t.storedHint}</p></section>
  <section class="card falcon-setting"><label for="storageCapacity">${t.storageCapacity}</label><div class="time-control"><input id="storageCapacity" class="time-input" type="text" value="35" inputmode="numeric"><input id="storageCapacityRange" class="time-range" type="range" min="1" max="100" step="1" value="35"></div><p class="hint">${t.storageCapacityHint}</p></section>
  <section class="card falcon-setting"><label for="activeQuests">${t.active}</label><div class="time-control"><input id="activeQuests" class="time-input" type="text" value="9" inputmode="numeric"><input id="activeQuestsRange" class="time-range" type="range" min="0" max="50" step="1" value="9"></div><p class="hint">${t.activeHint}</p></section>
  <section class="card falcon-setting"><label for="activeCapacity">${t.activeCapacity}</label><div class="time-control"><input id="activeCapacity" class="time-input" type="text" value="9" inputmode="numeric"><input id="activeCapacityRange" class="time-range" type="range" min="1" max="50" step="1" value="9"></div><p class="hint">${t.activeCapacityHint}</p></section>
  <section class="card falcon-setting"><label for="perRefresh">${t.perRefresh}</label><div class="time-control"><input id="perRefresh" class="time-input" type="text" value="11" inputmode="numeric"><input id="perRefreshRange" class="time-range" type="range" min="0" max="50" step="1" value="11"></div><p class="hint">${t.perRefreshHint}</p></section>
  <section class="card"><label for="nextRefreshRange">${t.refresh}</label><div class="time-control"><input id="nextRefreshValue" class="time-input" type="text" value="01:00:00" inputmode="numeric"><input id="nextRefreshRange" class="time-range" type="range" min="60" max="21600" step="60" value="3600"></div></section>
  <section class="card"><label for="nextLoginRange">${t.login}</label><div class="time-control"><input id="nextLoginValue" class="time-input" type="text" value="06:00" inputmode="numeric"><input id="nextLoginRange" class="time-range" type="range" min="0" max="1410" step="30" value="360"></div><p class="hint">${t.loginHint}</p></section>
  <section id="result" class="result card" aria-live="polite"></section>
  <details class="card details"><summary>${t.rules}</summary><ul>${t.rulesList.map(x=>`<li>${x}</li>`).join('')}</ul></details>`;
}

function parseDuration(v){const m=String(v).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);if(!m)return null;const h=Number(m[1]),mi=Number(m[2]),s=m[3]===undefined?0:Number(m[3]);if(!Number.isInteger(h)||!Number.isInteger(mi)||!Number.isInteger(s)||mi>59||s>59)return null;const total=h*3600+mi*60+s;return total>=60&&total<=21600?total:null;}
function formatDuration(sec){const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function formatLogin(minutes){const h=Math.floor(minutes/60),m=minutes%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;}
function parseLogin(v){const m=String(v).trim().match(/^(\d{1,2}):(\d{2})$/);if(!m)return null;const h=Number(m[1]),mi=Number(m[2]);if(h>23||mi>59)return null;return h*60+mi;}
function nextLoginDate(v){const n=Number(v);if(!Number.isFinite(n)||n<0||n>1439)return null;const h=Math.floor(n/60),mi=n%60,now=new Date(),d=new Date(now);d.setHours(h,mi,0,0);if(d<=now)d.setDate(d.getDate()+1);return d;}
function time(d){return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}
function fmt(n){return new Intl.NumberFormat(state.lang==='de'?'de-DE':'en-US').format(n)}
function readFalconNumber(id, min, max, fallback){
  const n=Number($(id)?.value);
  return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n))):fallback;
}
function calculateFalcon(){
  const t=T[state.lang].falconPlanner, result=$('result'); if(!result)return;
  const storageCapacity=readFalconNumber('storageCapacity',1,100,FALCON_DEFAULTS.storageCapacity);
  const safeStorage=Math.max(0,storageCapacity-1);
  const activeCapacity=readFalconNumber('activeCapacity',1,50,FALCON_DEFAULTS.activeCapacity);
  const stored=Math.max(0,Math.min(safeStorage,readFalconNumber('storedQuests',0,storageCapacity,FALCON_DEFAULTS.stored)));
  const active=Math.max(0,Math.min(activeCapacity,readFalconNumber('activeQuests',0,activeCapacity,FALCON_DEFAULTS.active)));
  const perRefresh=readFalconNumber('perRefresh',0,50,FALCON_DEFAULTS.perRefresh);
  const sec=parseDuration($('nextRefreshValue').value), loginMinutes=parseLogin($('nextLoginValue').value), login=nextLoginDate(loginMinutes);
  if(sec===null){result.innerHTML=`<p class="warn">${t.errorTime}</p>`;return;}
  if(loginMinutes===null||!login){result.innerHTML=`<p class="warn">${t.errorLogin}</p>`;return;}
  const now=new Date(), first=new Date(now.getTime()+sec*1000), refreshes=[];
  for(let d=new Date(first);d<login;d=new Date(d.getTime()+CONFIG.refreshHours*3600*1000)) refreshes.push(new Date(d));
  const N=refreshes.length, requiredNow=Math.max(0,stored+N*perRefresh-safeStorage), after=stored-requiredNow, morningStored=after+N*perRefresh, morningTotal=morningStored+active;
  let html=`<h3 class="good">🟢 ${t.claimExplain.replace('{n}',fmt(requiredNow))}</h3><div class="summary-grid"><div class="metric"><div class="label">${t.claimNow}</div><div class="value">${fmt(requiredNow)}</div></div><div class="metric"><div class="label">${t.startAfter}</div><div class="value">${fmt(after)}/${fmt(storageCapacity)}</div></div><div class="metric"><div class="label">${t.refreshes}</div><div class="value">${fmt(N)}</div></div><div class="metric"><div class="label">${t.morning}</div><div class="value">${fmt(morningStored)}/${fmt(storageCapacity)}</div></div></div><p>${t.morningExplain.replace('{n}',fmt(morningStored))}</p><p><strong>${t.ad}</strong>: ${fmt(morningTotal)} (${fmt(morningStored)} ${state.lang==='de'?'gespeichert':'stored'} + ${fmt(active)} ${state.lang==='de'?'aktive':'active'} ${state.lang==='de'?'Quests':'quests'})</p><div class="timeline"><strong>${t.timeline}</strong><ol>`;
  let s=after; for(let i=0;i<N;i++){s+=perRefresh;html+=`<li>${t.refreshAt} ${time(refreshes[i])}: ${fmt(s)}/${fmt(storageCapacity)} (${s<=safeStorage?t.safe:(state.lang==='de'?'zu hoch':'too high')})</li>`;} if(N===0)html+=`<li>${fmt(s)}/${fmt(storageCapacity)}</li>`;
  html+=`</ol></div><p class="small">${t.extra}</p><p class="small">${t.timezone}${Intl.DateTimeFormat().resolvedOptions().timeZone}</p>`;
  result.innerHTML=html;
}

function wireFalcon(){
  const pairs=[
    ['storedQuests','storedQuestsRange'],['storageCapacity','storageCapacityRange'],
    ['activeQuests','activeQuestsRange'],['activeCapacity','activeCapacityRange'],['perRefresh','perRefreshRange']
  ];
  pairs.forEach(([textId,rangeId])=>{
    const text=$(textId), range=$(rangeId);
    range.addEventListener('input',()=>{text.value=range.value;calculateFalcon();});
    text.addEventListener('input',()=>{
      const n=Number(text.value);
      if(Number.isFinite(n)){range.value=Math.max(Number(range.min),Math.min(Number(range.max),Math.round(n)));}
      if(textId==='storageCapacity'){
        const cap=Math.max(1,Math.min(100,Math.round(Number(text.value)||FALCON_DEFAULTS.storageCapacity)));
        const stored=Math.min(Number($('storedQuests').value)||0, cap);
        $('storedQuests').value=stored; $('storedQuestsRange').value=stored;
      }
      if(textId==='activeCapacity'){
        const cap=Math.max(1,Math.min(50,Math.round(Number(text.value)||FALCON_DEFAULTS.activeCapacity)));
        const active=Math.min(Number($('activeQuests').value)||0, cap);
        $('activeQuests').value=active; $('activeQuestsRange').value=active;
      }
      calculateFalcon();
    });
    text.addEventListener('change',calculateFalcon);
  });
  $('nextRefreshRange').addEventListener('input',()=>{$('nextRefreshValue').value=formatDuration(Number($('nextRefreshRange').value));calculateFalcon();});
  $('nextLoginRange').addEventListener('input',()=>{$('nextLoginValue').value=formatLogin(Number($('nextLoginRange').value));calculateFalcon();});
  $('nextRefreshValue').addEventListener('change',calculateFalcon); $('nextLoginValue').addEventListener('change',calculateFalcon); calculateFalcon();
}

function render(){
  const t=T[state.lang];
  $('pageTitle').textContent=state.view==='home'?t.today:(state.view==='falcon'?t.falcon:(state.view==='survival'?t.survivalPageTitle:(state.view==='survivalTask'?t.survivalPhase:(state.view==='task'?t.taskDetail:t.detail))));
  nav();
  const view=$('view');
  if(state.view==='home') view.innerHTML=home();
  else if(state.view==='falcon') view.innerHTML=falconView();
  else if(state.view==='survival') view.innerHTML=survivalView();
  else if(state.view==='survivalTask') view.innerHTML=survivalPhaseDetail(state.selectedDay ?? currentDay(), state.selectedPhase);
  else if(state.view==='task') view.innerHTML=taskDetail(state.selectedDay ?? currentDay(), state.selectedTask);
  else if(state.view==='detail') view.innerHTML=detail(state.selectedDay ?? currentDay());
  else view.innerHTML=home();

  const back=$('backHome');
  if(back) back.onclick=goBack;
  const backSurvival=$('backSurvival');
  if(backSurvival) backSurvival.onclick=goBack;
  document.querySelectorAll('[data-day-detail]').forEach(b=>b.onclick=()=>navigate('detail',{selectedDay:Number(b.dataset.day),selectedTask:null,selectedPhase:null}));
  document.querySelectorAll('[data-pick-day]').forEach(b=>b.onclick=()=>navigate(state.view,{selectedDay:Number(b.dataset.pickDay),selectedTask:null,selectedPhase:null}));
  document.querySelectorAll('.task-row,.plan-task-row').forEach(b=>b.onclick=()=>navigate('task',{selectedDay:Number(b.dataset.day),selectedTask:b.dataset.task,selectedPhase:null}));
  document.querySelectorAll('.survival-link').forEach(b=>b.onclick=()=>navigate('survivalTask',{selectedDay:Number(b.dataset.survivalDay),selectedPhase:Number(b.dataset.survivalPhase),selectedTask:null}));
document.querySelectorAll('[data-collect-action="falcon"]').forEach(b=>b.onclick=()=>navigate('falcon',{selectedDay:null,selectedTask:null,selectedPhase:null}));
  $('languageButton').textContent=state.lang==='de'?'EN':'DE';
  if(state.view==='falcon')wireFalcon();
}

$('languageButton').addEventListener('click',()=>{state.lang=state.lang==='de'?'en':'de';render();});
render();
