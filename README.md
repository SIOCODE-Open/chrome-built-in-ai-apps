# Chrome Built-in AI Apps

_This is a working progress repository, and documentation is also not complete yet._

This repository contains source code for our [Google Chrome Built-in AI Challenge](https://googlechromeai.devpost.com/?ref_feature=challenge&ref_medium=discover) hackathon entry.

We have created two applications, that use the [`window.ai.languageModel`](https://github.com/explainers-by-googlers/prompt-api) capabilities.

* [Brainstormer](packages/app-brainstorm/package.json) was our first try at using the API. It is a note pad, with a split-screen layout. When you type in the left side, and start the brainstorming process, the AI will continously offer suggestions for tasks to perform on your input. You can run any of these tasks to get some new text. It is probably not the best application, but this was our first try at using the new APIs.
* [The Crooked Tankard](packages/app-game/package.json) is a text-based adventure game, and we have spent _most of our time_ working on this game. The AI is used in many ways to generate content and narration for the game. We have also implemented command parsing, which although possible was later replaced with user interface elements for controlling the game.

# Licenses

All source code in this repository in licensed under the MIT license.

[ProJor](https://projor.io) is licensed under the [ProJor Licenses](https://license.projor.io).
