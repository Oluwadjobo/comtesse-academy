# Intégration dans le dépôt local

1. Décompresser cette livraison dans `C:\Users\HP\Documents\comtesse-academy`, en conservant les dossiers `docs` et `question-bank`.
2. Vérifier les changements avec `git status`.
3. Enregistrer et publier avec :

```powershell
git add docs/cahier-des-charges-fonctionnel-v1.0.md question-bank/README.md question-bank/questions-initiales.json question-bank/questions-initiales.md
git commit -m "Ajoute le cahier des charges v1.0 et la banque pilote"
git push
```

Ne pas ajouter le PowerPoint à GitHub sans avoir vérifié que sa publication dans ce dépôt privé est autorisée. Les questions et la criticité restent en statut de proposition jusqu'à validation métier.
