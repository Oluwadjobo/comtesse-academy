# COMTESSE Academy V2 — architecture fonctionnelle et technique

Version: 1.0 — 24 novembre 2026
Branche de travail: `rebuild-v2`

## 1. Périmètre et principes

La V2 est une reconstruction fonctionnelle. Le prototype React actuel valide uniquement la direction visuelle et la sélection des profils. Il ne constitue pas une authentification ni une application métier opérationnelle.

Principes:
- Ne pas modifier ni supprimer la branche `main` et les données de l'application historique.
- Ne pas réutiliser les anciennes tables métier sans audit et migration explicitement approuvée.
- Concevoir la V2 autour de formations créées par les formateurs, et non autour d'un catalogue global fixe de six modules.
- Toutes les permissions sont vérifiées côté API; masquer un bouton dans React ne constitue jamais une protection.
- Les contenus, tentatives, résultats et certificats sont persistés en base.
- Les changements de structure de base sont versionnés par migrations et testés sur une base de test avant toute base réelle.

## 2. Rôles et responsabilités

### Administrateur
- Vue et pilotage globaux.
- Gestion des comptes formateurs et apprenants.
- Activation/désactivation des comptes.
- Consultation des formations, affectations, résultats et certificats.
- Paramètres généraux et supervision.

### Formateur
- Connexion avec identifiant professionnel et mot de passe.
- Création et gestion de ses formations dédiées.
- Ajout, modification, réorganisation et désactivation des modules.
- Création de séquences dans chaque module.
- Ajout de blocs de contenu: texte, image, galerie/carrousel d'images facultatif et audio.
- Création du mini-quiz de chaque module, définition des bonnes réponses et explications éventuelles.
- Création d'une évaluation finale couvrant les modules de sa formation.
- Ajout et gestion des apprenants; activation/désactivation.
- Affectation multiple d'un apprenant à plusieurs formations.
- Paramétrage du nombre de tentatives et du seuil de réussite selon les règles retenues.
- Consultation des progressions, tentatives et résultats de ses apprenants.

### Apprenant
- Accès uniquement aux formations qui lui sont affectées et actives.
- Consultation des modules et séquences autorisés.
- Passage des mini-quiz et de l'évaluation finale.
- Affichage du score, du résultat et des corrections au moment prévu par les règles pédagogiques.
- Accès au certificat PDF lorsqu'il remplit les conditions de délivrance.

## 3. Règles métier déjà validées

- Affectation: un apprenant peut être affecté à plusieurs formations.
- Tentatives: nombre configurable.
- Déblocage: le module suivant est débloqué après réussite du mini-quiz du module courant.
- Chaque module possède son propre mini-quiz.
- L'évaluation finale couvre les modules de la formation concernée.
- Un certificat est délivré après réussite de l'évaluation finale, selon les critères de validation configurés.
- Un compte ou un contenu désactivé ne doit plus être accessible dans les nouveaux parcours, sans effacer l'historique pédagogique.

## 4. Modèle de données cible proposé

Les noms ci-dessous sont des noms logiques de V2. Les noms SQL définitifs seront fixés dans la migration après validation.

| Entité | Rôle |
|---|---|
| users | Identité, identifiant unique, nom, rôle, statut actif |
| trainer_profiles | Informations propres aux formateurs si nécessaires |
| learner_profiles | Informations propres aux apprenants si nécessaires |
| training_programs | Formation, propriétaire formateur, titre, description, statut |
| training_enrollments | Affectation plusieurs-à-plusieurs apprenants/formations, dates et statut |
| training_modules | Modules ordonnés d'une formation, statut actif/inactif |
| learning_sequences | Séquences ordonnées dans un module |
| content_blocks | Blocs ordonnés de type texte, image, galerie ou audio |
| media_assets | Métadonnées et références des fichiers multimédias stockés hors de la base |
| module_quizzes | Paramètres du mini-quiz, seuil, nombre de tentatives et règle de correction |
| quiz_questions | Questions d'un quiz |
| quiz_options | Choix de réponse et indicateur de bonne réponse conservé côté serveur |
| quiz_attempts | Tentatives, statut, score, résultat, horodatages |
| quiz_answers | Réponses données par question et résultat de correction |
| final_assessments | Évaluation finale liée à une formation |
| assessment_modules | Modules couverts par l'évaluation finale |
| certificates | Numéro/code de vérification, apprenant, formation, score, date et révocation |
| audit_logs | Traçabilité des opérations sensibles |

Relations structurantes:
- Un formateur possède plusieurs formations.
- Une formation contient plusieurs modules ordonnés.
- Un module contient plusieurs séquences ordonnées.
- Une séquence contient plusieurs blocs de contenu ordonnés.
- Un apprenant peut être inscrit à plusieurs formations; une formation accueille plusieurs apprenants.
- Un module possède un mini-quiz; une formation possède une évaluation finale.
- Les tentatives appartiennent à un apprenant et à un quiz/une évaluation.
- Un certificat est rattaché à une réussite finale et à une version des informations certifiées.

## 5. Contenus pédagogiques et médias

Chaque séquence est constituée de blocs ordonnés:
- `text`: texte riche contrôlé et assaini.
- `image`: image unique avec texte alternatif.
- `image_gallery`: galerie/carrousel facultatif, avec ordre des images et légendes.
- `audio`: fichier audio, titre, durée et contrôles de lecture.

Les fichiers binaires ne sont pas stockés directement dans PostgreSQL. La base conserve une clé de stockage, le type MIME, la taille, le nom, les métadonnées et les droits d'accès. Les téléversements doivent vérifier le type réel du fichier, la taille et les autorisations.

## 6. Quiz, correction et déblocage

- Les bonnes réponses ne sont jamais envoyées au navigateur avant la soumission.
- Le serveur corrige les réponses et calcule le score.
- Le mini-quiz enregistre chaque tentative.
- Une réussite valide le module et débloque le module suivant selon l'ordre défini.
- En cas d'échec, une nouvelle tentative est possible dans la limite configurée.
- Le dépassement du nombre de tentatives bloque le quiz jusqu'à une action autorisée du formateur ou de l'administrateur, si cette règle est confirmée.
- L'évaluation finale ne peut être démarrée que lorsque les prérequis de progression sont satisfaits.
- Le nombre de questions, le seuil de réussite et les modalités de correction de l'évaluation finale doivent être configurables par le formateur.

## 7. Authentification et sécurité

### Administrateur et formateur
Identifiant + mot de passe, mot de passe haché avec Argon2id, sessions serveur, cookies HttpOnly/Secure/SameSite, limitation des tentatives, expiration et révocation de session.

### Apprenant
Le besoin exprimé est une connexion sans mot de passe, avec identifiant apprenant. Un identifiant seul ne prouve pas l'identité et permettrait à toute personne le connaissant d'ouvrir le compte. Recommandation: conserver une expérience sans mot de passe permanent, mais ajouter un code d'accès temporaire ou un code à usage unique remis par le formateur/administrateur (ou envoyé sur un canal vérifié si disponible). Cette décision doit être confirmée avant l'implémentation de l'authentification apprenant.

### Autorisations
- Admin: périmètre global.
- Formateur: uniquement ses formations, leurs apprenants affectés, contenus et résultats.
- Apprenant: uniquement ses affectations, contenus débloqués, tentatives et certificats.
- Vérification systématique côté serveur de la propriété des ressources et des affectations.
- Journalisation des actions sensibles: création/désactivation de comptes, publication, modification des bonnes réponses, réinitialisation de tentatives et délivrance/révocation de certificats.

## 8. Certificat PDF

Le certificat doit être généré côté serveur à partir de données vérifiées et inclure au minimum:
- Identité de l'organisation et identité visuelle COMTESSE Academy.
- Nom et prénom de l'apprenant.
- Intitulé de la formation.
- Date de réussite/délivrance.
- Score et mention si la politique le prévoit.
- Identifiant unique du certificat et code/URL de vérification.
- Nom/fonction du responsable signataire si requis.

Un certificat ne doit pas être émis sur la seule base d'une donnée envoyée par le navigateur.

## 9. Audit du code existant sur rebuild-v2

Le dépôt contient déjà une API Fastify/PostgreSQL et des migrations historiques. L'implémentation actuelle ne correspond pas encore au modèle V2:
- rôles existants: `learner`, `manager`, `admin`; le rôle `trainer` n'est pas encore pris en charge;
- les utilisateurs ont tous un `password_hash`, alors que le parcours apprenant demandé est sans mot de passe permanent;
- les modules sont limités par contrainte à six numéros;
- les quiz et l'examen final sont structurés autour d'une banque globale de 20 questions et d'un seuil codé en dur à 16/20;
- la logique d'approbation/publication existante ne correspond pas nécessairement au besoin d'activation/désactivation par formateur.

Ces routes et migrations ne doivent donc pas être simplement branchées à la nouvelle interface. Elles nécessitent une refonte contrôlée ou une couche V2 isolée.

## 10. Découpage de réalisation

1. Valider ce modèle et le mécanisme d'accès apprenant.
2. Créer un schéma V2 isolé et des migrations non destructives.
3. Implémenter l'authentification et les autorisations.
4. Implémenter comptes, formations, affectations et activation/désactivation.
5. Implémenter éditeur de modules, séquences et blocs multimédias.
6. Implémenter mini-quiz, tentatives configurables, correction et déblocage.
7. Implémenter évaluation finale, résultats et certificat PDF vérifiable.
8. Ajouter tests API, tests de permissions, tests de parcours et audit de sécurité.
9. Préparer le déploiement après recette complète.

## 11. Décisions restant à confirmer avant les migrations

1. Accès apprenant: identifiant seul ou identifiant + code temporaire à usage unique?
2. Déblocage après réussite: confirmer si les modules sont séquentiels et si un formateur peut exceptionnellement forcer le déblocage.
3. Nombre de tentatives: configurable séparément pour chaque mini-quiz et pour l'évaluation finale? Recommandation: oui.
4. Certificat: délivrance automatique dès réussite de l'évaluation finale? Recommandation: oui.
5. Édition d'un contenu après qu'un apprenant a commencé: conserver une version figée du contenu/quiz pour les tentatives déjà commencées? Recommandation: oui, pour préserver la fiabilité des résultats.
