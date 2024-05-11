// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import contents from './elm/index.txt';
import { AnsiUp } from 'ansi_up'
const ansi_up = new AnsiUp();
import { execSync } from 'child_process';

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

  let disposable8 = vscode.commands.registerCommand('fzf-haskell.findFile', () => {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace opened")
      return
    }

    let terminal = getTerminal();
    terminal.sendText(`findFile`);

    terminal.show();
  });

  let disposable9 = vscode.commands.registerCommand('fzf-haskell.switchTabVS', async () => {
    let tabs: string [] = [];
    let fileUri: vscode.Uri | undefined = undefined;
    vscode.window.tabGroups.activeTabGroup.tabs.forEach(t => {
      let input = t.input as {uri? : vscode.Uri};
      if (input && input.uri && input.uri.fsPath) {
        if (fileUri === undefined) {
          fileUri = input.uri;
        }
        tabs.push(input.uri.fsPath);
      }
    });

    if (!fileUri) {
      vscode.window.showErrorMessage("No file opened");
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'html',
      'Switch Tabs',
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    let editor = vscode.window.activeTextEditor
    if (!editor) {
      return;
    }

    let tabsItems = tabs.map(t => ({value: t, showValue: t}));
    
    panel.webview.html = contents;
    panel.webview.onDidReceiveMessage(async message => {
      switch (message.action) {
        case "display":
          let code = getHighlightedCode(message.value);
          panel.webview.postMessage({preview: code});
          break;
        case "open":
          await openFile(message.value);
          panel.dispose();
          break;
        case "filter":
          let filteredTabs = getFilteredTabs(message.value, tabsItems);
          panel.webview.postMessage({tabs: filteredTabs});
          break;
        default:
          break;
      }
      
    });

    vscode.commands.executeCommand('workbench.action.output.toggleOutput');
    let code = getHighlightedCode(fileUri.fsPath);
    panel.webview.postMessage({tabs: tabsItems, preview: code});
    setTimeout(() => {
      vscode.commands.executeCommand('workbench.action.output.toggleOutput');
    }, 100);
  });

  let disposable10 = vscode.commands.registerCommand('fzf-haskell.findFileVS', async () => {
    let tabs: string [] = [];
    let fileUri: vscode.Uri | undefined = undefined;
    let workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (workspaceRoot === undefined) {
      return;
    }
    getAllFiles(workspaceRoot);

    if (!fileUri) {
      vscode.window.showErrorMessage("No file opened");
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'html',
      'Switch Tabs',
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    let editor = vscode.window.activeTextEditor
    if (!editor) {
      return;
    }

    let tabsItems = tabs.map(t => ({value: t, showValue: t}));
    
    panel.webview.html = contents;
    panel.webview.onDidReceiveMessage(async message => {
      switch (message.action) {
        case "display":
          let code = getHighlightedCode(message.value);
          panel.webview.postMessage({preview: code});
          break;
        case "open":
          await openFile(message.value);
          panel.dispose();
          break;
        case "filter":
          let filteredTabs = getFilteredTabs(message.value, tabsItems);
          panel.webview.postMessage({tabs: filteredTabs});
          break;
        default:
          break;
      }
      
    });

    vscode.commands.executeCommand('workbench.action.output.toggleOutput');
    let code = getHighlightedCode(fileUri.fsPath);
    panel.webview.postMessage({tabs: tabsItems, preview: code});
    setTimeout(() => {
      vscode.commands.executeCommand('workbench.action.output.toggleOutput');
    }, 100);
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
  context.subscriptions.push(disposable3);
  context.subscriptions.push(disposable4);
  context.subscriptions.push(disposable5);
  context.subscriptions.push(disposable6);
  context.subscriptions.push(disposable7);
  context.subscriptions.push(disposable8);
  context.subscriptions.push(disposable9);
}

function getHighlightedCode(filepath: string): string {
    return ansi_up.ansi_to_html(execSync(`unbuffer bat --paging=never ${filepath}`, {encoding: 'utf-8'}));
}

function getFilteredTabs(filter: string, tabs: {value: string, showValue: string}[]): {value: string, showValue: string}[] {
  if (tabs.length === 0 || filter === "") {
    return tabs;
  }
  let result = execSync(`echo "${tabs.map(t => t.showValue).join("\n")}" | fzf -f ${filter}`, {encoding: 'utf-8'});
  console.log(result);
  let resultSet = new Set(result.split("\n"));

  return tabs.filter(t => resultSet.has(t.showValue));
}

function getAllFiles(dirPath: string) {
  let result = execSync(`fd -t f -H`, {encoding: 'utf-8'});
  console.log(result);
  return result.split("\n");
}

async function openFile(filePath: string) {
  try {
      // Open the text document
      const document = await vscode.workspace.openTextDocument(filePath);
      
      // Show the document in the editor
      await vscode.window.showTextDocument(document);
  } catch (error) {
      vscode.window.showErrorMessage(`Failed to open ${filePath}: ${error}`);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
