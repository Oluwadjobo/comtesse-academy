# COMTESSE Academy V2 — état du chantier

## Décision de réalisation

La nouvelle version est développée sur la branche isolée `rebuild-v2`. La branche `main` et l'application historique ne sont pas remplacées.

## Premier incrément livré

- Nouvelle entrée React dédiée à Academy V2.
- Écran de connexion avec sélection des trois profils : administrateur, formateur, apprenant.
- Navigation adaptée à chaque profil.
- Première direction artistique responsive basée sur le logo COMTESSE : bleu, bleu profond, jaune et blanc.
- Premiers tableaux de bord et vues de démonstration : formations, apprenants, résultats et certificats.
- Aucun changement destructif apporté à la branche principale.

## Limites explicites de cet incrément

Cette livraison est un prototype d'interface. Les données affichées sont fictives. Les formulaires de connexion ne sont pas encore raccordés à une authentification réelle. Les créations, affectations, évaluations, corrections, progressions et certificats ne sont pas encore persistés ni opérationnels.

Ne pas déployer cette version auprès des apprenants avant raccordement du backend et validation de sécurité.

## Étapes suivantes

1. Valider localement le build et l'affichage responsive.
2. Définir le modèle PostgreSQL V2 et les migrations sans toucher aux données historiques.
3. Construire l'authentification et les autorisations côté API.
4. Développer les parcours administrateur et formateur.
5. Construire l'éditeur de formation et les contenus multimédias.
6. Développer les quiz, les tentatives, les règles de déblocage et l'examen final.
7. Développer le parcours apprenant et les certificats PDF vérifiables.
8. Ajouter tests automatisés, audit de sécurité et procédure de déploiement.

## Vérification locale

Depuis le dossier du dépôt :

```powershell
git fetch origin
git checkout rebuild-v2
cd apps/web
npm install
npm run build
npm run dev
```

Le build doit être validé avant de poursuivre les lots suivants. Si des dépendances ou fichiers locaux diffèrent, conserver les changements locaux et signaler l'erreur exacte.
