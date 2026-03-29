/* =============================================
   SCRIPT.JS — Better Eats
   Toutes les interactions JavaScript du site
============================================= */


/* ========================================
   1. VALIDATION BARRE HERO (adresse)
   Vérifie que le champ n'est pas vide
   avant de lancer la recherche
======================================== */
function rechercherRestaurants() {
  const input  = document.getElementById('input-adresse');
  const erreur = document.getElementById('erreur-adresse');
  const valeur = input.value.trim(); // .trim() enlève les espaces inutiles

  if (valeur === '') {
    // Champ vide : afficher le message d'erreur
    erreur.style.display = 'block';
    input.style.border = '2px solid #ff6b6b';
    return; // on arrête ici
  }

  // Valide : cacher l'erreur
  erreur.style.display = 'none';
  input.style.border = 'none';

  // Sauvegarder l'adresse dans localStorage
  localStorage.setItem('derniere-adresse', valeur);

  // Faire défiler la page vers la section restaurants
  document.getElementById('restaurants').scrollIntoView({ behavior: 'smooth' });

  // Afficher une notification de confirmation
  afficherToast('📍 Recherche pour : ' + valeur);
}

// Restaurer la dernière adresse tapée quand la page se charge
window.addEventListener('load', function () {
  const derniere = localStorage.getItem('derniere-adresse');
  if (derniere) {
    document.getElementById('input-adresse').value = derniere;
  }
});

// Permettre d'appuyer sur Entrée dans la barre d'adresse
document.getElementById('input-adresse').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') rechercherRestaurants();
});


/* ========================================
   2. FILTRE PAR CATÉGORIE
   Quand on clique sur une catégorie,
   on cache les restaurants qui ne
   correspondent pas
======================================== */
function filtrerCategorie(categorie) {
  const cards    = document.querySelectorAll('#grille-restaurants [data-categorie]');
  const titreEl  = document.getElementById('titre-restaurants');
  const btnReset = document.getElementById('btn-reset-filtre');
  let trouve = 0;

  // Parcourir chaque card et afficher/cacher selon la catégorie
  cards.forEach(function (card) {
    if (card.dataset.categorie === categorie) {
      card.style.display = 'block';
      trouve++;
    } else {
      card.style.display = 'none';
    }
  });

  // Mettre à jour le titre avec le nombre de résultats
  titreEl.textContent = 'Restaurants · ' + categorie + ' (' + trouve + ')';
  btnReset.style.display = 'inline-block';

  // Scroller vers les restaurants
  document.getElementById('restaurants').scrollIntoView({ behavior: 'smooth' });

  afficherToast('🍽️ Filtre : ' + categorie);
}

// Remettre toutes les cards visibles
function resetFiltre() {
  const cards = document.querySelectorAll('#grille-restaurants [data-categorie]');
  cards.forEach(function (card) { card.style.display = 'block'; });
  document.getElementById('titre-restaurants').textContent = 'Restaurants populaires près de chez vous';
  document.getElementById('btn-reset-filtre').style.display = 'none';
}


/* ========================================
   3. VALIDATION FORMULAIRE DE CONTACT
   Vérifie chaque champ avant d'envoyer
======================================== */
function envoyerFormulaire() {
  // Récupérer les valeurs de chaque champ
  const prenom  = document.getElementById('prenom').value.trim();
  const nom     = document.getElementById('nom').value.trim();
  const email   = document.getElementById('email').value.trim();
  const sujet   = document.getElementById('sujet').value;
  const message = document.getElementById('message').value.trim();

  let valide = true;

  // Vérifier chaque champ — si une erreur, valide devient false
  valide = validerChamp('prenom',  prenom !== '',           'err-prenom')  && valide;
  valide = validerChamp('nom',     nom !== '',              'err-nom')     && valide;
  valide = validerChamp('email',   estEmailValide(email),   'err-email')   && valide;
  valide = validerChamp('sujet',   sujet !== '',            'err-sujet')   && valide;
  valide = validerChamp('message', message.length >= 10,   'err-message') && valide;

  if (!valide) return; // Arrêter si des erreurs existent

  // Tout est valide : sauvegarder dans localStorage
  const donnees = { prenom, nom, email, sujet, message, date: new Date().toISOString() };
  sauvegarderMessage(donnees);

  // Afficher le message de succès vert
  document.getElementById('msg-succes').style.display = 'block';

  // Vider tous les champs du formulaire
  ['prenom', 'nom', 'email', 'message'].forEach(function (id) {
    document.getElementById(id).value = '';
  });
  document.getElementById('sujet').value = '';

  afficherToast('✅ Message envoyé avec succès !');

  // Masquer le message de succès après 5 secondes
  setTimeout(function () {
    document.getElementById('msg-succes').style.display = 'none';
  }, 5000);
}

// Fonction helper : vérifie un champ et affiche/cache son erreur
function validerChamp(idChamp, condition, idErreur) {
  const champ = document.getElementById(idChamp);
  const errEl = document.getElementById(idErreur);

  if (!condition) {
    // Condition non remplie : afficher l'erreur en rouge
    champ.classList.add('erreur');
    errEl.style.display = 'block';
    return false;
  } else {
    // Condition remplie : cacher l'erreur
    champ.classList.remove('erreur');
    errEl.style.display = 'none';
    return true;
  }
}

// Vérifie le format d'un email avec une expression régulière
function estEmailValide(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Effacer l'erreur en temps réel quand l'utilisateur commence à taper
['prenom', 'nom', 'email', 'message'].forEach(function (id) {
  document.getElementById(id).addEventListener('input', function () {
    this.classList.remove('erreur');
    const errEl = document.getElementById('err-' + id);
    if (errEl) errEl.style.display = 'none';
  });
});


/* ========================================
   4. LOCALSTORAGE
   Sauvegarde les messages du formulaire
   dans le navigateur de l'utilisateur
======================================== */
function sauvegarderMessage(donnees) {
  // Récupérer les messages déjà sauvegardés (ou tableau vide si aucun)
  let messages = JSON.parse(localStorage.getItem('messages-contact') || '[]');
  messages.push(donnees); // Ajouter le nouveau message
  localStorage.setItem('messages-contact', JSON.stringify(messages));
}


/* ========================================
   5. COMPTEURS ANIMÉS — section À propos
   Les chiffres s'animent quand la section
   devient visible à l'écran
======================================== */
function animerCompteur(id, cible, suffixe) {
  const el = document.getElementById(id);
  let compteur = 0;
  const increment = Math.ceil(cible / 60); // divise la cible en 60 étapes

  const interval = setInterval(function () {
    compteur += increment;
    if (compteur >= cible) {
      compteur = cible;
      clearInterval(interval); // arrêter quand on atteint la cible
    }
    // Afficher le nombre avec séparateur de milliers français
    el.textContent = compteur.toLocaleString('fr-FR') + (suffixe || '');
  }, 30); // toutes les 30ms
}

// IntersectionObserver : déclenche les compteurs quand la section est visible
const observerApropos = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      animerCompteur('stat-villes',      50,      '+');
      animerCompteur('stat-restaurants', 700000,  '+');
      animerCompteur('stat-clients',     5000000, '+');
      observerApropos.disconnect(); // lancer une seule fois
    }
  });
}, { threshold: 0.3 }); // se déclenche quand 30% de la section est visible

observerApropos.observe(document.getElementById('apropos'));


/* ========================================
   6. TOAST NOTIFICATION
   Petite notification qui apparaît
   en bas à droite pendant 3 secondes
======================================== */
function afficherToast(message) {
  const toast = document.getElementById('toast');
  const msg   = document.getElementById('toast-msg');

  msg.textContent = message;
  toast.classList.add('visible');    // fait apparaître le toast

  setTimeout(function () {
    toast.classList.remove('visible'); // fait disparaître après 3s
  }, 3000);
}
