// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function getCurrentWord (): string {
  let editor = vscode.window.activeTextEditor
  if (!editor) {
    return "";
  }

  // Try and get the user's selection if they have selected something
  const selection = editor.selection;
  const text = editor.document.getText(selection);
  if (text !== "") {
      return text;
  }

  const cursorPosition = editor.selection.active;
  const wordRange = editor.document.getWordRangeAtPosition(cursorPosition);
  if (!wordRange) {
      return "";
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
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    const currentWord = getCurrentWord();
    let terminal = getTerminal();
    terminal.sendText(`findTag ${currentWord}`);

    terminal.show();
  });

  let disposable2 = vscode.commands.registerCommand('fzf-haskell.findAll', () => {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    const currentWord = getCurrentWord();
    let terminal = getTerminal();
    terminal.sendText(`findAll ${currentWord}`);

    terminal.show();
  });

  let disposable3 = vscode.commands.registerCommand('fzf-haskell.regenerateTags', () => {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    let terminal = getTerminal();
    terminal.sendText(`regenerateTags`);

    terminal.show();
  });

  let disposable4 = vscode.commands.registerCommand('fzf-haskell.switchTab', () => {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    let tabs: string [] = [];
    vscode.window.tabGroups.activeTabGroup.tabs.forEach(t => {
      let input = t.input as {uri? : vscode.Uri};
      if (input && input.uri) {
        tabs.push(input.uri.fsPath);
      }
    });

    let terminal = getTerminal();
    terminal.sendText(`echo "${tabs.join("\n")}" | switchTab`);

    terminal.show();
  });

  let disposable5 = vscode.commands.registerCommand('fzf-haskell.openFolder', () => {
    let terminal = getTerminal();
    terminal.sendText(`openFolder`);

    terminal.show();
  });

  let disposable6 = vscode.commands.registerCommand('fzf-haskell.openFile', () => {
    let currentTab = vscode.window.activeTextEditor?.document.uri.fsPath;
    // If there is an active tab, open ranger with the current tab's directory
    let dirPath = "";
    if (currentTab) {
      dirPath = currentTab.substring(0, currentTab.lastIndexOf("/"));
    }

    let terminal = getTerminal();
    terminal.sendText(`openFile ${dirPath}`);

    terminal.show();
  });

  let disposable7 = vscode.commands.registerCommand('fzf-haskell.hoogleSearch', async () => {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    // First, we try to get the user's selection or the current word
    const currentWord = getCurrentWord();
    let searchWord = currentWord;
      // Since there is nothing that the user has selected or the cursor is on, we ask the user for input

    const userInput = await vscode.window.showInputBox({
      placeHolder: "A hoogle Query",
      prompt: "Search Hoogle for:",
      value: searchWord
    });

    if (userInput !== undefined) {
      // Handle the input
      searchWord = userInput;
    }

    let terminal = getTerminal();
    terminal.sendText(`hoogleSearch ${searchWord}`);

    terminal.show();
  });


  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
  context.subscriptions.push(disposable3);
  context.subscriptions.push(disposable4);
  context.subscriptions.push(disposable5);
  context.subscriptions.push(disposable6);
  context.subscriptions.push(disposable7);
}

// This method is called when your extension is deactivated
export function deactivate() {}
