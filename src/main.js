import './style.css'
import historyEvents from './data.json'

// État de l'application
let selectedIds = new Set();
let currentFilter = 'all'; // 'all', 'fr', 'int'
let searchQuery = '';
let observer;

// --- QUIZ STATE ---
let quizQuestions = [];
let currentQuestionIndex = 0;
let quizTimerInterval;
let quizTimeLeft = 30;
const MAX_QUESTIONS = 15;
const QUESTIONS_PER_QUIZ = 15;

// --- 2. LOGIQUE D'AFFICHAGE ROUE ---
const wheelContainer = document.getElementById('wheel-container');
const selectionList = document.getElementById('selection-list');
const countBadge = document.getElementById('count-badge');
const startQuizContainer = document.getElementById('start-quiz-container');
const searchInput = document.getElementById('search-input');

function initApp() {
    // Récupérer les IDs depuis l'URL au chargement
    const urlParams = new URLSearchParams(window.location.search);
    const idsParam = urlParams.get('ids');
    if (idsParam) {
        const ids = idsParam.split(',').map(Number);
        // Vérifier que les IDs existent bien dans nos données
        ids.forEach(id => {
            if (historyEvents.some(e => e.id === id)) {
                selectedIds.add(id);
            }
        });
        // Nettoyer l'URL sans recharger
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    renderWheel();
    updateSelectionList(); // Mettre à jour la liste latérale avec la sélection importée
    setupObserver();

    // Écouteur pour la recherche
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderWheel();
        setupObserver();
    });
}

function setFilter(filterType) {
    currentFilter = filterType;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${filterType}`).classList.add('active');
    
    renderWheel();
    setupObserver();
}

function renderWheel() {
    wheelContainer.innerHTML = '';
    
    const filteredEvents = historyEvents.filter(event => {
        // Filtre par type
        const typeMatch = currentFilter === 'all' || event.type === currentFilter;
        
        // Filtre par recherche
        const searchMatch = event.title.toLowerCase().includes(searchQuery) || 
                            event.desc.toLowerCase().includes(searchQuery) || 
                            event.year.toString().includes(searchQuery);

        return typeMatch && searchMatch;
    }).sort((a, b) => a.year - b.year);

    if (filteredEvents.length === 0) {
        wheelContainer.innerHTML = '<div class="text-center text-gray-400 mt-20">Aucun événement trouvé.</div>';
        return;
    }

    filteredEvents.forEach(event => {
        const el = document.createElement('div');
        el.className = 'wheel-item bg-white rounded-xl shadow-lg p-6 mx-4 max-w-md md:mx-auto cursor-pointer border border-gray-100 relative';
        el.dataset.id = event.id;
        
        if (selectedIds.has(event.id)) {
            el.classList.add('selected');
        }
        
        const typeBadge = event.type === 'fr' 
            ? '<span class="absolute top-4 right-4 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">France</span>' 
            : '<span class="absolute top-4 right-4 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Monde</span>';

        el.innerHTML = `
            ${typeBadge}
            <div class="selected-indicator absolute top-0 right-0 mt-12 mr-4 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="text-4xl font-black text-blue-600 mb-1">${event.year}</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2 leading-tight">${event.title}</h3>
            <p class="text-gray-600 text-sm leading-relaxed">${event.desc}</p>
            <div class="mt-4 text-xs text-gray-400 font-semibold flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Touche pour sélectionner
            </div>
        `;

        el.addEventListener('click', () => toggleSelection(event.id, el));
        wheelContainer.appendChild(el);
    });
}

function setupObserver() {
    if (observer) observer.disconnect();

    const observerOptions = {
        root: wheelContainer,
        threshold: 0.5, 
        rootMargin: "-10% 0px -10% 0px"
    };

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.wheel-item').forEach(el => observer.observe(el));
}

// --- 4. GESTION DE LA SÉLECTION ---
function toggleSelection(id, element) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
        element.classList.remove('selected');
    } else {
        selectedIds.add(id);
        element.classList.add('selected');
        
        element.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.95)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
        ], { duration: 300 });
    }
    updateSelectionList();
}

function selectAll() {
    const visibleEvents = historyEvents.filter(event => {
        // Appliquer les mêmes filtres que l'affichage
        const typeMatch = currentFilter === 'all' || event.type === currentFilter;
        const searchMatch = event.title.toLowerCase().includes(searchQuery) || 
                            event.desc.toLowerCase().includes(searchQuery) || 
                            event.year.toString().includes(searchQuery);
        return typeMatch && searchMatch;
    });

    visibleEvents.forEach(event => selectedIds.add(event.id));
    renderWheel();
    updateSelectionList();
}

function deselectAll() {
    selectedIds.clear();
    renderWheel();
    updateSelectionList();
}

function updateSelectionList() {
    selectionList.innerHTML = '';
    
    if (selectedIds.size === 0) {
        selectionList.innerHTML = '<p class="text-gray-400 text-center italic mt-10 text-sm">Aucune date sélectionnée.<br>Touche les cartes du haut pour créer ta liste.</p>';
        countBadge.textContent = "0 dates";
        startQuizContainer.classList.add('hidden');
        return;
    }

    startQuizContainer.classList.remove('hidden');

    const sortedIds = Array.from(selectedIds).sort((a, b) => {
        const eventA = historyEvents.find(e => e.id === a);
        const eventB = historyEvents.find(e => e.id === b);
        return eventA.year - eventB.year;
    });

    sortedIds.forEach(id => {
        const event = historyEvents.find(e => e.id === id);
        const item = document.createElement('div');
        item.className = 'flex items-start gap-3 p-3 mb-2 bg-gray-50 rounded border border-gray-200 animate-[fadeIn_0.3s_ease-out]';
        // Note: onclick sur Wikipédia appelle openWiki
        item.innerHTML = `
            <div class="font-black text-blue-600 text-lg min-w-[3rem]">${event.year}</div>
            <div class="flex-grow">
                <div class="font-bold text-sm text-gray-800">${event.title}</div>
                <a href="#" onclick="openWiki('${event.wiki}'); return false;" class="text-xs text-blue-400 hover:text-blue-600 hover:underline flex items-center gap-1 mt-1 font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    En savoir plus
                </a>
            </div>
            <button onclick="removeSelection(${id})" class="text-red-400 hover:text-red-600 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        selectionList.appendChild(item);
    });

    countBadge.textContent = `${selectedIds.size} date${selectedIds.size > 1 ? 's' : ''}`;
}

function removeSelection(id) {
    selectedIds.delete(id);
    const domItem = document.querySelector(`.wheel-item[data-id="${id}"]`);
    if(domItem) domItem.classList.remove('selected');
    updateSelectionList();
}

// --- WIKIPEDIA API LOGIC ---

function openWiki(wikiUrl) {
    const modal = document.getElementById('wiki-modal');
    const modalContent = document.getElementById('wiki-modal-content');
    const titleEl = document.getElementById('wiki-title');
    const bodyEl = document.getElementById('wiki-body');
    const linkEl = document.getElementById('wiki-full-link');

    // Réinitialiser la modale
    titleEl.textContent = "Chargement...";
    bodyEl.innerHTML = '<div class="flex justify-center py-10"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>';
    linkEl.href = wikiUrl;

    // Afficher la modale
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Extraire le titre de l'URL pour l'API
    // Ex: https://fr.wikipedia.org/wiki/Prise_de_la_Bastille -> Prise_de_la_Bastille
    const pageTitle = wikiUrl.split('/').pop();
    const apiUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            titleEl.textContent = data.title;
            
            let contentHtml = '';
            
            // Ajouter l'image si elle existe
            if (data.thumbnail && data.thumbnail.source) {
                contentHtml += `<div class="flex justify-center mb-4"><img src="${data.thumbnail.source}" alt="${data.title}" class="max-h-64 object-cover rounded shadow-md"></div>`;
            }

            // Ajouter le résumé
            if (data.extract_html) {
                contentHtml += `<div class="text-gray-700 text-lg leading-relaxed">${data.extract_html}</div>`;
            } else if (data.extract) {
                contentHtml += `<p class="text-gray-700 text-lg leading-relaxed">${data.extract}</p>`;
            } else {
                contentHtml += `<p class="text-gray-500 italic">Résumé non disponible.</p>`;
            }

            bodyEl.innerHTML = contentHtml;
        })
        .catch(err => {
            console.error(err);
            bodyEl.innerHTML = '<p class="text-red-500 text-center">Impossible de charger les informations Wikipédia. Vérifiez votre connexion.</p>';
        });
}

function closeWikiModal() {
    const modal = document.getElementById('wiki-modal');
    const modalContent = document.getElementById('wiki-modal-content');
    
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200); // Attendre la fin de l'animation
}

// --- 5. IMPRESSION ---
function printSelection() {
    if (selectedIds.size === 0) {
        alert("Sélectionne d'abord des dates dans la roue !");
        return;
    }

    const printContainer = document.getElementById('print-list-content');
    printContainer.innerHTML = '';

    const sortedIds = Array.from(selectedIds).sort((a, b) => {
        const eventA = historyEvents.find(e => e.id === a);
        const eventB = historyEvents.find(e => e.id === b);
        return eventA.year - eventB.year;
    });

    sortedIds.forEach(id => {
        const event = historyEvents.find(e => e.id === id);
        const row = document.createElement('div');
        row.className = 'print-item';
        row.innerHTML = `
            <div style="display: flex; align-items: baseline;">
                <span style="font-weight: 900; font-size: 1.2em; width: 60px;">${event.year}</span>
                <div style="flex-grow: 1;">
                    <strong style="font-size: 1.1em;">${event.title}</strong>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #444;">${event.desc}</p>
                </div>
            </div>
        `;
        printContainer.appendChild(row);
    });

    window.print();
}

// --- 6. PARTAGE ---
function shareSelection() {
    if (selectedIds.size === 0) {
        alert("Sélectionne d'abord des dates pour générer un lien !");
        return;
    }

    const idsArray = Array.from(selectedIds).join(',');
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?ids=${idsArray}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Lien de partage copié dans le presse-papier !\n\n" + shareUrl);
    }).catch(err => {
        console.error('Erreur copie:', err);
        prompt("Copiez ce lien :", shareUrl);
    });
}

// --- QUIZ LOGIC ---

function startQuiz() {
    const selectedEvents = Array.from(selectedIds).map(id => historyEvents.find(e => e.id === id));
    if (selectedEvents.length === 0) return;

    // Générer les questions
    quizQuestions = generateQuestions(selectedEvents);
    currentQuestionIndex = 0;

    // Afficher l'overlay
    document.getElementById('quiz-overlay').classList.remove('hidden');
    
    // Lancer la première question
    showQuestion();
}

function generateQuestions(events) {
    let questions = [];
    const eventsPool = [...events];

    // Mélanger les événements
    eventsPool.sort(() => Math.random() - 0.5);

    // Limiter à 15 questions maximum
    const max = Math.min(eventsPool.length, MAX_QUESTIONS);

    for (let i = 0; i < max; i++) {
        const correctEvent = eventsPool[i];
        const isDateQuestion = Math.random() > 0.5; // 50% chance
        
        // Trouver des mauvaises réponses (leurres)
        let decoys = events.filter(e => e.id !== correctEvent.id);
        decoys.sort(() => Math.random() - 0.5);
        decoys = decoys.slice(0, 3); // Prendre 3 leurres

        // Si pas assez de leurres, compléter avec d'autres dates de historyEvents global
        if (decoys.length < 3) {
            const otherDecoys = historyEvents.filter(e => e.id !== correctEvent.id && !decoys.includes(e));
            otherDecoys.sort(() => Math.random() - 0.5);
            decoys = [...decoys, ...otherDecoys.slice(0, 3 - decoys.length)];
        }

        const choices = [correctEvent, ...decoys];
        choices.sort(() => Math.random() - 0.5);

        if (isDateQuestion) {
            // Type 1: Date donnée -> Trouver la description/titre
            questions.push({
                type: 'date_to_desc',
                correct: correctEvent,
                choices: choices,
                questionText: `Que s'est-il passé en <span class="text-blue-600 font-black text-3xl mx-2">${correctEvent.year}</span> ?`
            });
        } else {
            // Type 2: Description donnée -> Trouver la date
            questions.push({
                type: 'desc_to_date',
                correct: correctEvent,
                choices: choices,
                questionText: `En quelle année a eu lieu : <br><span class="text-blue-800 font-bold text-xl block mt-2">"${correctEvent.title}"</span>`
            });
        }
    }

    return questions;
}

function showQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    const contentEl = document.getElementById('quiz-content');
    const progressEl = document.getElementById('quiz-progress');
    const timerBar = document.getElementById('quiz-timer-bar');

    // Mise à jour progression
    progressEl.textContent = `${currentQuestionIndex + 1}/${quizQuestions.length}`;

    // Reset Timer
    clearInterval(quizTimerInterval);
    quizTimeLeft = 30;
    timerBar.style.width = '100%';
    timerBar.classList.remove('bg-red-500');
    timerBar.classList.add('bg-yellow-400');

    // Timer Animation
    quizTimerInterval = setInterval(() => {
        quizTimeLeft -= 0.1;
        const percent = (quizTimeLeft / 30) * 100;
        timerBar.style.width = `${percent}%`;

        if (quizTimeLeft <= 5) {
             timerBar.classList.remove('bg-yellow-400');
             timerBar.classList.add('bg-red-500');
        }

        if (quizTimeLeft <= 0) {
            clearInterval(quizTimerInterval);
            handleAnswer(null, question); // Time out
        }
    }, 100);

    // Construction HTML de la question
    let choicesHtml = '';
    question.choices.forEach(choice => {
        const label = question.type === 'date_to_desc' ? choice.title : choice.year;
        choicesHtml += `
            <button onclick="handleAnswer(${choice.id}, this)" class="quiz-option w-full bg-white border-2 border-blue-100 p-4 rounded-xl text-lg font-bold text-gray-700 hover:border-blue-400 hover:bg-blue-50 shadow-sm text-left transition mb-3">
                ${label}
            </button>
        `;
    });

    contentEl.innerHTML = `
        <div class="quiz-card-enter w-full max-w-md">
            <div class="text-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
                <p class="text-gray-600 uppercase tracking-widest text-xs font-bold mb-2">Question ${currentQuestionIndex + 1}</p>
                <h3 class="text-gray-800 text-xl leading-snug">${question.questionText}</h3>
            </div>
            <div class="space-y-2">
                ${choicesHtml}
            </div>
        </div>
    `;
    
    // Attacher l'objet question au DOM pour référence dans handleAnswer (via closure/scope global temporaire ou paramètre)
    // Ici handleAnswer est global donc on passe l'ID et on retrouvera la question via currentQuestionIndex
}

window.handleAnswer = function(choiceId, btnElement) {
    clearInterval(quizTimerInterval);
    const question = quizQuestions[currentQuestionIndex];
    const isCorrect = choiceId === question.correct.id;
    const contentEl = document.getElementById('quiz-content');

    // Feedback Visuel sur les boutons
    const buttons = document.querySelectorAll('.quiz-option');
    buttons.forEach(btn => {
        btn.disabled = true; // Désactiver tous les boutons
        // Trouver le bon bouton pour le mettre en vert
        // On doit parser le contenu ou utiliser un attribut data, simplifions :
        // On va re-parcourir les choix de la question pour trouver lequel correspond au bon ID
        // Mais plus simple : on sait lequel est le correct.
    });

    // Si l'utilisateur a cliqué
    if (btnElement) {
        if (isCorrect) {
            btnElement.classList.remove('border-blue-100', 'bg-white');
            btnElement.classList.add('bg-green-500', 'border-green-500', 'text-white');
        } else {
            btnElement.classList.remove('border-blue-100', 'bg-white');
            btnElement.classList.add('bg-red-500', 'border-red-500', 'text-white');
        }
    }

    // Afficher la solution complète après un court délai
    setTimeout(() => {
        showSolution(question, isCorrect);
    }, 800);
};

function showSolution(question, isCorrect) {
    const contentEl = document.getElementById('quiz-content');
    const event = question.correct;

    const feedbackTitle = isCorrect ? "🎉 Bravo !" : "Pas de panique !";
    const feedbackColor = isCorrect ? "text-green-600" : "text-blue-600";

    // Récupérer infos wiki (asynchrone, mais on affiche d'abord le statique)
    // On fait un fetch rapide pour avoir le résumé
    const pageTitle = event.wiki.split('/').pop();
    const apiUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`;

    contentEl.innerHTML = `
        <div class="quiz-card-enter w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div class="p-6 text-center border-b border-gray-100 bg-gray-50">
                <h2 class="${feedbackColor} font-black text-2xl mb-2">${feedbackTitle}</h2>
                <p class="text-gray-500 text-sm">La réponse était :</p>
                <div class="mt-2">
                    <span class="text-3xl font-black text-blue-600 block">${event.year}</span>
                    <span class="text-xl font-bold text-gray-800 block">${event.title}</span>
                </div>
            </div>
            
            <div class="p-6 overflow-y-auto flex-grow">
                 <p class="text-gray-700 mb-4 italic border-l-4 border-blue-200 pl-4 bg-blue-50/50 py-2 rounded-r">
                    ${event.desc}
                </p>
                <div id="wiki-preview-quiz" class="text-sm text-gray-600">
                    <div class="flex justify-center py-4"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                </div>
            </div>

            <div class="p-4 border-t border-gray-100 bg-gray-50 text-center">
                <button onclick="nextQuestion()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105">
                    Question Suivante →
                </button>
            </div>
        </div>
    `;

    // Fetch Wiki Content
    fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
        const wikiContainer = document.getElementById('wiki-preview-quiz');
        if(!wikiContainer) return;

        let html = '';
        if (data.thumbnail && data.thumbnail.source) {
            html += `<img src="${data.thumbnail.source}" class="w-full h-32 object-cover rounded-lg mb-3 shadow-sm">`;
        }
        html += `<p class="line-clamp-4">${data.extract || "Pas de description Wikipédia disponible."}</p>`;
        
        wikiContainer.innerHTML = html;
    })
    .catch(() => {
        const wikiContainer = document.getElementById('wiki-preview-quiz');
        if(wikiContainer) wikiContainer.innerHTML = "";
    });
}

window.nextQuestion = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        showQuestion();
    } else {
        showEndScreen();
    }
};

function showEndScreen() {
    const contentEl = document.getElementById('quiz-content');
    contentEl.innerHTML = `
        <div class="quiz-card-enter text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-auto">
            <div class="text-6xl mb-4">🏆</div>
            <h2 class="text-3xl font-black text-blue-800 mb-4">Session Terminée !</h2>
            <p class="text-gray-600 mb-8 text-lg">Tu as révisé ${quizQuestions.length} dates importantes. Continue comme ça pour devenir un expert en histoire !</p>
            
            <button onclick="closeQuiz()" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105 w-full">
                Retour à la roue
            </button>
        </div>
    `;
    document.getElementById('quiz-timer-bar').parentElement.classList.add('hidden');
}

window.closeQuiz = function() {
    document.getElementById('quiz-overlay').classList.add('hidden');
    clearInterval(quizTimerInterval);
    document.getElementById('quiz-timer-bar').parentElement.classList.remove('hidden'); // Restore for next time
};

window.startQuiz = startQuiz;

// Exposer les fonctions au global
window.setFilter = setFilter;
window.selectAll = selectAll;
window.deselectAll = deselectAll;
window.openWiki = openWiki;
window.closeWikiModal = closeWikiModal;
window.printSelection = printSelection;
window.shareSelection = shareSelection; // Nouvelle fonction
window.removeSelection = removeSelection;

// Démarrage
initApp();
