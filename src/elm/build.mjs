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
        background-color: transparent;
        color: white;
      }
      input {
        background-color: transparent;
        color: white;
        border: none;
        border-top: 2px solid red;
        margin: 0;
        margin-top: 1px;
        outline: none;
      }
      input:focus {
        outline: none;
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
      // var iframe = document.getElementById('preview');
      // var style = document.createElement('style');
      // style.innerText = '* {color: white;}';
      var preview = document.getElementById('preview');

      app.ports.sendMessage.subscribe(function(message) {
        console.log(message);
        vscode.postMessage(message);
      });
      window.addEventListener('message', event => {
        console.log(event.data);
        if (event.data.tabs) {
          app.ports.messageReceiver.send(event.data.tabs);
        }
        // iframe.setAttribute('srcdoc', event.data.preview);
        // setTimeout(() => {iframe.contentDocument.head.appendChild(style);});
        if (event.data.preview) {
          preview.innerHTML = event.data.preview;
        }
      })
      window.onload = function () {
        console.log('GOTTTTTTTTTTTTTTTTTTT onload');
        console.log(window.document.querySelector('.files'));
        window.document.querySelector('.files').onfocus = function () {
          console.log('GOTTTTTTTTTTTTTTTTTTT focus');
          window.getElementById('input').focus();
        };
      };
    </script>
  </body>

  </html>
  `
}

let js = fs.readFileSync("index.js", "utf8")
fs.writeFileSync("index.txt", getHtml(js))