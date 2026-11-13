> [English version](README.md)

<!-- Fiche du Store : le même texte que store/description.fr.md et les mêmes captures que le Kazo OS Store (store/screenshots/). Les changer ensemble. -->

<img src="store/icon.png" alt="" width="96" align="right">

# Échecs

Un échiquier aux couleurs de votre thème Kazo OS, sur le bureau comme sur un téléphone.

## Jouer

- **Deux joueurs sur le même écran**, ou **contre l'ordinateur** : Stockfish 19 (lite) en cinq
  niveaux, de Débutant à Expert, avec la couleur de votre choix (ou au hasard).
- Touchez une pièce puis sa case, glissez-la, ou jouez au clavier (flèches, Entrée, Échap).
  La promotion demande la nouvelle pièce.
- Les règles viennent de chess.js : échec, mat, pat, nulles par répétition, par la règle des
  cinquante coups et par matériel insuffisant.

## Autour de la partie

- **Pendule** : sans, 5+0, 10+0, 15+10 ou vos propres minutes et incrément.
- **Feuille de partie**, **annuler** (la réponse de l'ordinateur aussi), **retourner le plateau**.
- **Parties enregistrées** : enregistrez et ouvrez des fichiers `.pgn` ; un double-clic sur un
  `.pgn` dans l'explorateur de fichiers l'ouvre dans Échecs.

## Licences

Échecs est un logiciel libre sous GPL-3.0. Il embarque Stockfish (stockfish.js, GPL-3.0), chess.js
(BSD-2-Clause) et les pièces « celtic » de Maurizio Monge (MIT).

## Captures d'écran

<p>
  <img src="store/screenshots/1.png" alt="Échecs, capture 1" height="240">
  <img src="store/screenshots/2.png" alt="Échecs, capture 2" height="240">
  <img src="store/screenshots/3.png" alt="Échecs, capture 3" height="240">
</p>

<!-- /Fiche du Store -->

## Essayer

<!-- Lien « Ouvrir dans Kazo OS » : https://os.kazo.ca/?autolaunch=ca.kazo.chess va ici quand Kazo OS le prendra en charge. -->

Ouvrez [Kazo OS](https://os.kazo.ca/) et installez Échecs depuis le **Kazo OS Store** (catégorie Divertissement), ou dans le Terminal de Kazo OS, en administrateur : `sudo kazopkg install Kazo-ca/Os-App-Chess`.

## À propos de Kazo OS

[Kazo OS](https://github.com/Kazo-ca/Os) est un système d'exploitation simulé qui tourne dans le navigateur, écrit en C# avec Blazor WebAssembly. Il offre un environnement complet pour développer et exécuter des applications : bureau et fenêtres, système de fichiers persistant, processus, shell POSIX, réseau simulé, le Kazo OS Store, et un SDK public (paquets NuGet) pour créer des apps comme celle-ci. Essayez-le sur <https://os.kazo.ca/> (PWA, fonctionne hors ligne).

## Développement

```bash
git clone --recurse-submodules https://github.com/Kazo-ca/Os-App-Chess.git
cd Os-App-Chess
dotnet run --project src/Kazo.Chess.Os -c Release   # un Kazo OS avec Chess dans le menu Applications
```

Le dépôt suit le modèle `kazoos-solution` : `external/KazoOs` est Kazo OS en sous-module sur
son tag de release (3.0.0), qui fixe la version de tous les paquets Kazo OS.

- Plan : [Français](doc/fr/plan.md) · [English](doc/en/plan.md)
- Architecture, build et tests : [Français](doc/fr/architecture.md) · [English](doc/en/architecture.md)
- Licence : GPL-3.0 (embarque stockfish.js). Fichiers tiers : [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
