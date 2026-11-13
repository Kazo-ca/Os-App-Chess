> [Version française](readme-fr.md)

<!-- Store listing: the same text as store/description.en.md and the same screenshots as the Kazo OS Store (store/screenshots/). Change them together. -->

<img src="store/icon.png" alt="" width="96" align="right">

# Chess

A chessboard in the colours of your Kazo OS theme, on the desktop and on a phone.

## Play

- **Two players on the same screen**, or **against the computer**: Stockfish 19 (lite) in five
  levels, from Beginner to Expert, with the side of your choice (or a coin toss).
- Touch a piece then its square, drag it, or play with the keyboard (arrows, Enter, Escape).
  Promotions ask for the new piece.
- The rules come from chess.js: check, mate, stalemate, draws by repetition, by the fifty-move
  rule and by insufficient material.

## Around the game

- **Clock**: none, 5+0, 10+0, 15+10 or your own minutes and increment.
- **Score sheet**, **undo** (the computer's reply too), **flip the board**.
- **Saved games**: save and open `.pgn` files; a double-click on a `.pgn` in the file explorer
  opens it in Chess.

## Licences

Chess is free software under the GPL-3.0. It bundles Stockfish (stockfish.js, GPL-3.0), chess.js
(BSD-2-Clause) and the "celtic" pieces by Maurizio Monge (MIT).

## Screenshots

<p>
  <img src="store/screenshots/1.png" alt="Chess, screenshot 1" height="240">
  <img src="store/screenshots/2.png" alt="Chess, screenshot 2" height="240">
  <img src="store/screenshots/3.png" alt="Chess, screenshot 3" height="240">
</p>

<!-- /Store listing -->

## Try it

<!-- "Open in Kazo OS" link: https://os.kazo.ca/?autolaunch=ca.kazo.chess goes here once Kazo OS supports it. -->

Open [Kazo OS](https://os.kazo.ca/) and install Chess from the **Kazo OS Store** (category Entertainment), or in the Kazo OS Terminal, as an administrator: `sudo kazopkg install Kazo-ca/Os-App-Chess`.

## About Kazo OS

[Kazo OS](https://github.com/Kazo-ca/Os) is a simulated operating system that runs in the browser, written in C# with Blazor WebAssembly. It gives a complete environment to build and run applications: desktop and windows, a persistent file system, processes, a POSIX shell, a simulated network, the Kazo OS Store, and a public SDK (NuGet packages) to make apps such as this one. Try it at <https://os.kazo.ca/> (PWA, works offline).

## Development

```bash
git clone --recurse-submodules https://github.com/Kazo-ca/Os-App-Chess.git
cd Os-App-Chess
dotnet run --project src/Kazo.Chess.Os -c Release   # a Kazo OS with Chess in the Applications menu
```

The repository follows the `kazoos-solution` template: `external/KazoOs` is Kazo OS as a
submodule on its release tag (3.0.0), which sets the version of every Kazo OS package.

- Plan: [English](doc/en/plan.md) · [Français](doc/fr/plan.md)
- Architecture, build and tests: [English](doc/en/architecture.md) · [Français](doc/fr/architecture.md)
- License: GPL-3.0 (bundles stockfish.js). Third-party files: [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
