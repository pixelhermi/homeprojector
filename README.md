# homeprojector
Pour l'extention, modifier le manifest selon le navigateur :
- Chrome

Modifier le manifest :
```
"background": { "service_worker": "background.js" }
```

- Firefox

Modifier le manifest : 
```
"background": { "scripts": ["config.local.js", "background.js"] }
```
Accepter les extention sans signature : 
Dans about:config → xpinstall.signatures.required → false

