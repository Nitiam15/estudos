// Compila app.jsx -> app.js (JSX para React.createElement) sem dependências externas
const ts = require('/home/claude/.npm-global/lib/node_modules/typescript');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/app.jsx', 'utf8');
const out = ts.transpileModule(src, {
  fileName: 'app.jsx', reportDiagnostics: true,
  compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, removeComments: false },
});
const diag = (out.diagnostics || []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
if (diag.length) { console.error(diag.join('\n')); process.exit(1); }
fs.writeFileSync(__dirname + '/../app.js', '/* gerado a partir de app.jsx */\n' + out.outputText);
console.log('app.js', out.outputText.length, 'bytes');
