# Contribuer à Chrono-Histoire

Merci de l'intérêt que vous portez à **Chrono-Histoire** ! 🎉

Nous encourageons vivement les contributions de la communauté, qu'il s'agisse de signaler un bug, de proposer une nouvelle fonctionnalité, d'ajouter des événements historiques ou d'améliorer la documentation.

## Comment contribuer ?

### 1. Signaler un bug ou suggérer une fonctionnalité

Utilisez l'onglet [Issues](https://github.com/yoanbernabeu/chrono-histoire/issues) du dépôt GitHub.
- Vérifiez d'abord si le problème n'a pas déjà été signalé.
- Soyez précis et donnez le maximum de détails (contexte, captures d'écran, comportement attendu).

### 2. Proposer des modifications (Code ou Données)

Si vous souhaitez modifier le code ou ajouter des dates :

1. **Forkez** le projet.
2. Créez une **branche** pour votre modification (`git checkout -b ma-nouvelle-feature`).
3. Faites vos modifications.
   - Si vous ajoutez une date, respectez la structure du fichier `src/data.json`.
4. Testez vos modifications localement (`npm run dev`).
5. **Commitez** vos changements (`git commit -m "Ajout de la date X"`).
6. **Pushez** vers votre fork (`git push origin ma-nouvelle-feature`).
7. Ouvrez une **Pull Request** vers la branche `main` du dépôt principal.

## Structure des données (`src/data.json`)

Pour ajouter un événement historique, ajoutez un objet JSON dans le tableau existant :

```json
{
    "id": 123, 
    "year": 1900, 
    "title": "Titre de l'événement", 
    "desc": "Courte description adaptée aux enfants.", 
    "type": "fr", 
    "wiki": "https://fr.wikipedia.org/wiki/Lien_Wikipedia" 
}
```

- **id** : Un identifiant unique (nombre entier). Assurez-vous qu'il n'est pas déjà utilisé.
- **year** : L'année de l'événement.
- **type** : `"fr"` pour Histoire de France, `"int"` pour Histoire du Monde.

## Code de Conduite

En participant à ce projet, vous acceptez de respecter notre [Code de Conduite](CODE_OF_CONDUCT.md). Nous voulons maintenir un environnement accueillant et inclusif pour tous.

Merci pour votre aide ! 🚀

