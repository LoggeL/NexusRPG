// Statische Prüfung der Schichtgrenzen aus docs/design.md (Abschnitt „Architektur“).
//
//   modules/       → nur modules/ (keine Pakete, keine Browser-/IO-Globals, keine dynamischen Importe)
//   content/       → content/ sowie modules/ ausschließlich per `import type`/`export type`
//   platform/      → modules/ und platform/ (Pakete erlaubt)
//   presentation/  → alles außer app/ (und Dateien direkt unter src/, die zur Komposition gehören)
//   app/ und Dateien direkt unter src/ → alles
//
// Tests (*.test.*, *.spec.*, __fixtures__/, __tests__/) sind ausgenommen, dürfen aber nicht aus
// Produktionscode importiert werden. Ausgabe: Datei:Zeile:Spalte [Regel] Meldung.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../game/package.json', import.meta.url));
const ts = require('typescript');

const defaultRoot = fileURLToPath(new URL('../game/src/', import.meta.url));
const LAYERS = new Set(['modules', 'content', 'platform', 'presentation', 'app']);
const PURE = new Set(['modules', 'content']);
const CODE = /\.(?:[cm]?[jt]sx?)$/;
const DECLARATION = /\.d\.[cm]?ts$/;
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/;
const TEST_DIR = /(?:^|\/)(?:__fixtures__|__tests__)\//;

/** Browser-, Laufzeit- und IO-Globals, die reine Schichten nicht anfassen dürfen. */
const FORBIDDEN_GLOBALS = new Set([
  'window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'indexedDB', 'fetch',
  'globalThis', 'global', 'self', 'Buffer', 'process', 'require', 'console',
  'XMLHttpRequest', 'WebSocket', 'Audio', 'AudioContext', 'Image', 'Worker',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame',
  'performance', 'Phaser', 'Element', 'Node', 'Event', 'EventTarget', 'CustomEvent',
  'PointerEvent', 'KeyboardEvent', 'MouseEvent', 'TouchEvent', 'DOMRect', 'DOMParser', 'Storage',
  'URL', 'URLSearchParams', 'Blob', 'File', 'FileReader', 'BroadcastChannel', 'location', 'history', 'screen',
  'CanvasRenderingContext2D', 'OffscreenCanvas', 'ImageData', 'MediaStream', 'MessagePort',
  'Request', 'Response', 'Headers', 'FormData', 'Document', 'Window',
]);

const slash = value => value.split(sep).join('/');
export const isTestPath = path => TEST_FILE.test(path) || TEST_DIR.test(`/${path}`);

/** Schicht eines Pfads relativ zu src/. Dateien direkt unter src/ gehören zur Komposition (app). */
export function layerOf(path) {
  const parts = path.split('/');
  return parts.length === 1 ? 'app' : parts[0];
}

function collect(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) files.push(...collect(path));
    else if (entry.isFile() && CODE.test(entry.name) && !DECLARATION.test(entry.name)) files.push(path);
  }
  return files.sort();
}

function isTypeOnly(node) {
  if (ts.isImportTypeNode(node)) return true;
  if (ts.isImportEqualsDeclaration(node)) return node.isTypeOnly;
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause;
    if (!clause) return false; // Seiteneffekt-Import
    if (clause.isTypeOnly) return true;
    const bindings = clause.namedBindings;
    return !clause.name && !!bindings && ts.isNamedImports(bindings) &&
      bindings.elements.length > 0 && bindings.elements.every(item => item.isTypeOnly);
  }
  if (ts.isExportDeclaration(node)) {
    if (node.isTypeOnly) return true;
    const clause = node.exportClause;
    return !!clause && ts.isNamedExports(clause) && clause.elements.length > 0 && clause.elements.every(item => item.isTypeOnly);
  }
  return false;
}

/** Alle in der Datei deklarierten Namen; gleichnamige lokale Bindungen sind keine Globals. */
function declaredNames(source) {
  const names = new Set();
  const addBinding = name => {
    if (!name) return;
    if (ts.isIdentifier(name)) names.add(name.text);
    else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
      for (const element of name.elements) if (!ts.isOmittedExpression(element)) addBinding(element.name);
    }
  };
  const visit = node => {
    if (ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isBindingElement(node)) addBinding(node.name);
    else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isFunctionExpression(node) ||
              ts.isClassExpression(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) ||
              ts.isEnumDeclaration(node)) && node.name) names.add(node.name.text);
    else if (ts.isImportClause(node) && node.name) names.add(node.name.text);
    else if (ts.isNamespaceImport(node) || ts.isImportSpecifier(node) || ts.isImportEqualsDeclaration(node)) names.add(node.name.text);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return names;
}

function inTypePosition(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isExpressionWithTypeArguments(current)) {
      // `class A extends B` ist ein Laufzeitbezug, `implements`/Interface-`extends` nicht.
      const clause = current.parent;
      const runtime = clause && ts.isHeritageClause(clause) && clause.token === ts.SyntaxKind.ExtendsKeyword &&
        clause.parent && (ts.isClassDeclaration(clause.parent) || ts.isClassExpression(clause.parent));
      if (runtime) return false;
      return true;
    }
    if (ts.isTypeNode(current)) return true;
    if (ts.isInterfaceDeclaration(current) || ts.isTypeAliasDeclaration(current)) return true;
  }
  return false;
}

function isReference(node) {
  const parent = node.parent;
  if (!parent) return false;
  if ((ts.isPropertyAccessExpression(parent) || ts.isQualifiedName(parent)) && parent.name === node) return false;
  if ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent) || ts.isPropertyDeclaration(parent) ||
       ts.isMethodDeclaration(parent) || ts.isMethodSignature(parent) || ts.isGetAccessor(parent) ||
       ts.isSetAccessor(parent) || ts.isEnumMember(parent) || ts.isLabeledStatement(parent)) && parent.name === node) return false;
  if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent) || ts.isImportClause(parent)) return false;
  return !inTypePosition(node);
}

const compilerOptions = {
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  resolveJsonModule: true,
  allowJs: true,
};

/** Löst einen relativen Pfad auf; Nicht-Code-Dateien (CSS, Bilder) werden über das Dateisystem gefunden. */
function resolveRelative(specifier, file) {
  const clean = specifier.replace(/[?#].*$/, '');
  const resolved = ts.resolveModuleName(clean, file, compilerOptions, ts.sys).resolvedModule?.resolvedFileName;
  if (resolved) return { path: resolved, code: true };
  const direct = resolve(dirname(file), clean);
  if (existsSync(direct) && statSync(direct).isFile()) return { path: direct, code: CODE.test(direct) || direct.endsWith('.json') };
  return null;
}

/**
 * Prüft den Quellbaum `sourceRoot` (Standard game/src) und liefert sortierte Befunde
 * `{ path, line, column, rule, message }`; `path` ist relativ zu `sourceRoot`.
 */
export function checkArchitecture(sourceRoot = defaultRoot) {
  const root = resolve(sourceRoot);
  const diagnostics = [];
  for (const file of collect(root)) {
    const path = slash(relative(root, file));
    if (isTestPath(path)) continue;
    const layer = layerOf(path);
    const text = readFileSync(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const report = (node, rule, message) => {
      const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
      diagnostics.push({ path, line: line + 1, column: character + 1, rule, message });
    };

    if (!LAYERS.has(layer)) {
      report(source, 'unknown-layer', `Unbekannte Schicht „${layer}“; erlaubt sind modules, content, platform, presentation, app.`);
      continue;
    }

    const checkImport = (node, specifier) => {
      if (!specifier || !ts.isStringLiteralLike(specifier)) {
        report(node, 'dynamic-import', 'Importpfade müssen Literale sein, damit die Grenze prüfbar ist.');
        return;
      }
      const name = specifier.text;
      if (!name.startsWith('.') && !name.startsWith('/')) {
        if (PURE.has(layer)) report(node, 'external-import', `${layer} darf kein Paket importieren („${name}“).`);
        return;
      }
      const target = resolveRelative(name, file);
      if (!target) { report(node, 'unresolved-import', `„${name}“ lässt sich nicht auflösen.`); return; }
      const targetPath = slash(relative(root, target.path));
      if (targetPath.startsWith('../')) {
        report(node, 'source-boundary', `Import außerhalb von src/: „${name}“.`);
        return;
      }
      if (isTestPath(targetPath)) {
        report(node, 'test-import', `Produktionscode darf keine Tests oder Testdaten importieren („${targetPath}“).`);
        return;
      }
      const targetLayer = layerOf(targetPath);
      if (!target.code && PURE.has(layer)) {
        report(node, 'asset-import', `${layer} darf keine Dateien wie „${targetPath}“ importieren.`);
        return;
      }
      if (!target.code) return;
      if (layer === 'modules' && targetLayer !== 'modules') {
        report(node, 'module-boundary', `modules darf nur modules importieren, nicht „${targetPath}“.`);
      } else if (layer === 'content') {
        if (targetLayer === 'modules') {
          if (!isTypeOnly(node)) report(node, 'content-types', `content darf aus modules nur per „import type“ importieren („${targetPath}“).`);
        } else if (targetLayer !== 'content') {
          report(node, 'content-boundary', `content darf nur content und Typen aus modules importieren, nicht „${targetPath}“.`);
        }
      } else if (layer === 'platform' && targetLayer !== 'modules' && targetLayer !== 'platform') {
        report(node, 'platform-boundary', `platform darf nur modules und platform importieren, nicht „${targetPath}“.`);
      } else if (layer === 'presentation' && targetLayer === 'app') {
        report(node, 'presentation-boundary', `presentation darf app nicht importieren („${targetPath}“).`);
      }
    };

    const locals = PURE.has(layer) ? declaredNames(source) : new Set();
    const visit = node => {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) checkImport(node, node.moduleSpecifier);
      else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) checkImport(node, node.moduleReference.expression);
      else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) checkImport(node, node.argument.literal);
      else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        checkImport(node, node.arguments[0]);
        if (PURE.has(layer)) report(node, 'pure-load', `${layer} darf keinen Code dynamisch nachladen.`);
      }
      if (PURE.has(layer) && ts.isIdentifier(node) && (FORBIDDEN_GLOBALS.has(node.text) || /^HTML\w*Element$/.test(node.text)) &&
          !locals.has(node.text) && isReference(node)) {
        report(node, 'pure-code', `${layer} darf das Laufzeit-/DOM-/IO-Global „${node.text}“ nicht verwenden.`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return diagnostics.sort((a, b) =>
    a.path.localeCompare(b.path, 'en') || a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule, 'en'));
}

export const formatDiagnostic = (d, prefix = '') => `${prefix}${d.path}:${d.line}:${d.column} [${d.rule}] ${d.message}`;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ? resolve(process.argv[2]) : defaultRoot;
  const diagnostics = checkArchitecture(root);
  const prefix = slash(relative(process.cwd(), root));
  for (const d of diagnostics) console.error(formatDiagnostic(d, prefix ? `${prefix}/` : ''));
  if (diagnostics.length) {
    console.error(`\n${diagnostics.length} Verstoß/Verstöße gegen die Schichtgrenzen.`);
    process.exitCode = 1;
  } else {
    console.log('Architekturgrenzen eingehalten.');
  }
}
