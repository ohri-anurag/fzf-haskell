// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function getCurrentWord (): string | undefined {
  let editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage("No active editor")
    return
  }

  const cursorPosition = editor.selection.active;
  const wordRange = editor.document.getWordRangeAtPosition(cursorPosition);
  if (!wordRange) {
      vscode.window.showErrorMessage("No word found under the cursor.");
      return;
  }

  return editor.document.getText(wordRange);
}

function getTerminal (): vscode.Terminal {
  let terminal = vscode.window.terminals.find(t => t.name === "fzf-haskell")
  if (!terminal) {
    terminal = vscode.window.createTerminal({
      name: "fzf-haskell",
      location: vscode.TerminalLocation.Editor,
      cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
    });
  }

  return terminal;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "fzf-haskell" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('fzf-haskell.findTag', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    const currentWord = getCurrentWord();
    if (!currentWord) {
      return
    }
    let terminal = getTerminal();
    terminal.sendText(`findTag ${currentWord}`);

    terminal.show();
  });

  let disposable2 = vscode.commands.registerCommand('fzf-haskell.findAll', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    const currentWord = getCurrentWord();
    if (!currentWord) {
      return
    }
    let terminal = getTerminal();
    terminal.sendText(`findAll ${currentWord}`);

    terminal.show();
  });

  let disposable3 = vscode.commands.registerCommand('fzf-haskell.regenerateTags', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    let terminal = getTerminal();
    terminal.sendText(`regenerateTags`);

    terminal.show();
  });


  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
  context.subscriptions.push(disposable3);
}

// This method is called when your extension is deactivated
export function deactivate() {}