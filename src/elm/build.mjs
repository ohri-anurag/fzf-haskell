import fs from 'fs';

function getHtml(js) {
  let fileName = 'Main.elm';
  return `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <style>
      * {
        font-family: 'Hasklug Nerd Font';
        margin: 0;
      }

      body {
        padding: 0;
        overflow: hidden;
        position: absolute;
        height: 100%;
        width: 100%;
      }

      .split {
        display: flex;
        height: 100%;
      }

      .files,
      .preview {
        width: 50%;
      }

      .preview {
        overflow: scroll;
      }

      .files {
        display: flex;
        flex-direction: column-reverse;
        height: 100%;
      }

      .file {
        border-top: 1px solid transparent;
        border-bottom: 1px solid transparent;
      }

      .selected {
        border-top: 1px solid white;
        border-bottom: 1px solid white;
      }

      code {
        position: absolute;
        width: 50%;
        height: 100%;
        overflow-y: auto;
      }

      pre code.hljs {
        display: block;
        overflow-x: auto;
        padding: 1em
      }

      code.hljs {
        padding: 3px 5px
      }

      .hljs {
        color: #abb2bf;
        background: #282c34
      }

      .hljs-comment,
      .hljs-quote {
        color: #5c6370;
        font-style: italic
      }

      .hljs-doctag,
      .hljs-keyword,
      .hljs-formula {
        color: #c678dd
      }

      .hljs-section,
      .hljs-name,
      .hljs-selector-tag,
      .hljs-deletion,
      .hljs-subst {
        color: #e06c75
      }

      .hljs-literal {
        color: #56b6c2
      }

      .hljs-string,
      .hljs-regexp,
      .hljs-addition,
      .hljs-attribute,
      .hljs-meta .hljs-string {
        color: #98c379
      }

      .hljs-attr,
      .hljs-variable,
      .hljs-template-variable,
      .hljs-type,
      .hljs-selector-class,
      .hljs-selector-attr,
      .hljs-selector-pseudo,
      .hljs-number {
        color: #d19a66
      }

      .hljs-symbol,
      .hljs-bullet,
      .hljs-link,
      .hljs-meta,
      .hljs-selector-id,
      .hljs-title {
        color: #61aeee
      }

      .hljs-built_in,
      .hljs-title.class_,
      .hljs-class .hljs-title {
        color: #e6c07b
      }

      .hljs-emphasis {
        font-style: italic
      }

      .hljs-strong {
        font-weight: 700
      }

      .hljs-link {
        text-decoration: underline
      }
    </style>
    <script>
      const vscode = acquireVsCodeApi(); // acquireVsCodeApi can only be invoked once
    </script>
    <script>
      ${js}
    </script>
  </head>

  <body>
    <div id="myapp"></div>
    <script>
      var app = Elm.Main.init({
        node: document.getElementById('myapp')
      });
      app.ports.sendMessage.subscribe(function(message) {
        console.log(message);
        vscode.postMessage(message);
      });
      window.addEventListener('message', event => {
        console.log(event.data);
        if (event.data.tabs) {
          app.ports.messageReceiver.send(event.data.tabs);
        }
        document.getElementById('code').innerHTML = event.data.preview;
      })
      setTimeout(() => {
        let elem = document.querySelector('.files');
        elem.focus();
        console.log(elem);
      }, 100);
    </script>
  </body>

  </html>
  `
}

let js = fs.readFileSync("index.js", "utf8")
fs.writeFileSync("index.txt", getHtml(js))