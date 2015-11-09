(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var createResultFragment, examplesAppender, interpreter, interpreterProvider, jsVisitor, jsVisitorProvider, parser, reporter, toStringVisitor, toStringVisitorProvider, tokenizer, visitor, visitorProvider;

tokenizer = require("tokenizer");

parser = require("parser");

visitorProvider = require("visitor/tree_view_visitor");

jsVisitorProvider = require("visitor/js_visitor");

toStringVisitorProvider = require("visitor/to_string_visitor");

interpreterProvider = require("visitor/interpreter");

examplesAppender = require("views/append_examples");

reporter = {
  report: console.log.bind(console)
};

visitor = visitorProvider.create(reporter);

jsVisitor = jsVisitorProvider.create();

toStringVisitor = toStringVisitorProvider.create();

interpreter = interpreterProvider.create();

createResultFragment = function(d, results) {
  var $fragment;
  $fragment = d.createDocumentFragment();
  results.forEach(function(result) {
    var $p;
    $p = d.createElement("p");
    $p.textContent = result;
    return $fragment.appendChild($p);
  });
  return $fragment;
};

window.addEventListener("load", function() {
  var $examples, $input, $result, compile;
  $examples = document.getElementById("examples");
  $input = document.getElementById("input");
  $result = document.getElementById("result");
  compile = function(code) {
    var $fragment, lexer, result;
    console.time("tokenizer");
    lexer = tokenizer.tokenize(code);
    console.timeEnd("tokenizer");
    console.time("parser");
    result = parser.parse(lexer);
    console.timeEnd("parser");
    reporter.report(interpreter.run(result));
    $result.textContent = null;
    $fragment = createResultFragment(document, result.accept(jsVisitor));
    return $result.appendChild($fragment);
  };
  (function() {
    var $fragment, key, seed;
    seed = $examples.getAttribute("data-seed");
    key = $examples.getAttribute("data-key");
    $fragment = examplesAppender.createFragment(document, seed, key, function(example) {
      $input.value = ((($input.value || "").trim()) + "\n" + example).trim();
      return compile($input.value);
    });
    return $examples.appendChild($fragment);
  })();
  return $input.addEventListener("change", function() {
    return compile($input.value);
  });
});



},{"parser":9,"tokenizer":11,"views/append_examples":12,"visitor/interpreter":13,"visitor/js_visitor":14,"visitor/to_string_visitor":15,"visitor/tree_view_visitor":16}],2:[function(require,module,exports){
"use strict";
var prefixedKV;

prefixedKV = require("prefixed_kv");

module.exports = prefixedKV("AST", {
  "LIST": "LIST",
  "APPLICATION": "APPLICATION",
  "LAMBDA_ABSTRACTION": "LAMBDA_ABSTRACTION",
  "DEFINITION": "DEFINITION",
  "IDENTIFIER": "IDENTIFIER"
});



},{"prefixed_kv":10}],3:[function(require,module,exports){
"use strict";
var prefixedKV;

prefixedKV = require("prefixed_kv");

module.exports = prefixedKV("TOKEN", {
  "LAMBDA": "LAMBDA",
  "LAMBDA_BODY": "LAMBDA_BODY",
  "BRACKETS_OPEN": "BRACKETS_OPEN",
  "BRACKETS_CLOSE": "BRACKETS_CLOSE",
  "DEF_OP": "DEF_OP",
  "IDENTIFIER": "IDENTIFIER",
  "LINE_BREAK": "LINE_BREAK",
  "INDENT": "INDENT",
  "EOF": "EOF",
  ERROR: {
    "UNKNOWN_TOKEN": "UNKNOWN_TOKEN",
    "UNMATCHED_BRACKET": "UNMATCHED_BRACKET"
  }
});



},{"prefixed_kv":10}],4:[function(require,module,exports){
"use strict";
var CS_KEYWORDS, JS_KEYWORDS;

JS_KEYWORDS = {
  "break": "break",
  "case": "case",
  "catch": "catch",
  "const": "const",
  "continue": "continue",
  "debugger": "debugger",
  "default": "default",
  "delete": "delete",
  "do": "do",
  "else": "else",
  "enum": "enum",
  "export": "export",
  "false": "false",
  "finally": "finally",
  "for": "for",
  "function": "function",
  "if": "if",
  "implements": "implements",
  "import": "import",
  "in": "in",
  "instanceof": "instanceof",
  "interface": "interface",
  "let": "let",
  "native": "native",
  "new": "new",
  "null": "null",
  "package": "package",
  "private": "private",
  "protected": "protected",
  "public": "public",
  "return": "return",
  "static": "static",
  "switch": "switch",
  "this": "this",
  "throw": "throw",
  "true": "true",
  "try": "try",
  "typeof": "typeof",
  "undefined": "undefined",
  "var": "var",
  "void": "void",
  "while": "while",
  "with": "with",
  "yield": "yield"
};

CS_KEYWORDS = {
  "and": "and",
  "by": "by",
  "is": "is",
  "isnt": "isnt",
  "loop": "loop",
  "no": "no",
  "not": "not",
  "of": "of",
  "off": "off",
  "on": "on",
  "or": "or",
  "then": "then",
  "unless": "unless",
  "until": "until",
  "when": "when",
  "yes": "yes"
};

module.exports = {
  JS_KEYWORDS: JS_KEYWORDS,
  CS_KEYWORDS: CS_KEYWORDS
};



},{}],5:[function(require,module,exports){
"use strict";
var CCK;

exports.CREATE_CHILD_KEY = CCK = "<";

exports.create = function() {
  var Env, global;
  Env = function() {
    return void 0;
  };
  global = new Env;
  Env.prototype[CCK] = function() {
    Env.prototype = this;
    return new Env;
  };
  return {
    getGlobal: function() {
      return global;
    }
  };
};



},{}],6:[function(require,module,exports){
"use strict";
module.exports = [[0, "0      := \\f x.x", ["$_0 = (f) -> (x) -> x"]], [1, "1      := \\f x.f x", ["$_1 = (f) -> (x) -> (f)(x)"]], [2, "2      := \\f x.f (f x)", ["$_2 = (f) -> (x) -> (f)((f)(x))"]], [3, "succ   := \\n f x.f (n f x)", ["succ = (n) -> (f) -> (x) -> (f)(((n)(f))(x))"]], [4, "pred   := \\n f x.n (\\g h.h (g f)) (\\u.x) (\\v.v)", ["pred = (n) -> (f) -> (x) -> (((n)((g) -> (h) -> (h)((g)(f))))((u) -> x))((v) -> v)"]], [5, "add    := \\m n f x.m f (n f x)", ["add = (m) -> (n) -> (f) -> (x) -> ((m)(f))(((n)(f))(x))"]], [6, "mul    := \\m n f.m (n f)", ["mul = (m) -> (n) -> (f) -> (m)((n)(f))"]], [7, "exp    := \\m n.n m", ["exp = (m) -> (n) -> (n)(m)"]], [8, "true   := \\x y.x", ["$true = (x) -> (y) -> x"]], [9, "false  := \\x y.y", ["$false = (x) -> (y) -> y"]], [10, "and    := \\p q x y.p (q x y) y", ["$and = (p) -> (q) -> (x) -> (y) -> ((p)(((q)(x))(y)))(y)"]], [11, "or     := \\p q x y.p x (q x y)", ["$or = (p) -> (q) -> (x) -> (y) -> ((p)(x))(((q)(x))(y))"]], [12, "not    := \\p x y.p y x", ["$not = (p) -> (x) -> (y) -> ((p)(y))(x)"]], [13, "if     := \\p x y.p x y", ["$if = (p) -> (x) -> (y) -> ((p)(x))(y)"]], [14, "isZero := \\n.n (\\x. false) true", ["isZero = (n) -> ((n)((x) -> $false))($true)"]], [15, "pair   := \\a b p.p a b", ["pair = (a) -> (b) -> (p) -> ((p)(a))(b)"]], [16, "first  := \\p.p true", ["first = (p) -> (p)($true)"]], [17, "second := \\p.p false", ["second = (p) -> (p)($false)"]], [18, "Y      := \\f.(\\x.f (x x)) (\\x.f (x x))", ["Y = (f) -> ((x) -> (f)((x)(x)))((x) -> (f)((x)(x)))"]], [19, "Z      := \\f.(\\x.f (\\y.x x y)) (\\x.f (\\y.x x y))", ["Z = (f) -> ((x) -> (f)((y) -> ((x)(x))(y)))((x) -> (f)((y) -> ((x)(x))(y)))"]], [20, "fact   := \\f n.if (isZero n) 1 (\\x.mul n (f (pred n)) x)", ["fact = (f) -> (n) -> ((($if)((isZero)(n)))($_1))((x) -> (((mul)(n))((f)((pred)(n))))(x))"]]];



},{}],7:[function(require,module,exports){
"use strict";
exports.create = function(node, visitor) {
  var resolved;
  resolved = null;
  return {
    get: function() {
      return resolved != null ? resolved : resolved = node.accept(visitor);
    }
  };
};



},{}],8:[function(require,module,exports){
"use strict";
var create;

create = function(list) {
  var curr, max, memento, next;
  curr = 0;
  max = list.length - 1;
  next = function() {
    var item;
    item = list[curr];
    curr = Math.min(curr + 1, max);
    return item;
  };
  memento = function() {
    return (function(mem) {
      return function() {
        curr = mem;
      };
    })(curr);
  };
  return {
    next: next,
    memento: memento
  };
};

module.exports = {
  create: create
};



},{}],9:[function(require,module,exports){
"use strict";
var AST, TOKEN, acceptor, applicationNode, definitionNode, identifierNode, lambdaAbstractionNode, listNode, parseApplication, parseApplicationWithBrackets, parseDefinition, parseExpr, parseIdentifier, parseLambdaAbstraction, parseMultiline;

TOKEN = require("TOKEN");

AST = require("AST");

exports.parse = function(lexer) {
  return parseMultiline(lexer);
};

parseMultiline = function(lexer) {
  var app, apps, rewind, rewindInner, token;
  rewind = lexer.memento();
  rewindInner = lexer.memento();
  apps = [];
  while (true) {
    if (app = parseApplication(lexer)) {
      apps.push(app);
    }
    rewindInner = lexer.memento;
    token = lexer.next();
    if (token.tag === TOKEN.LINE_BREAK) {
      continue;
    }
    rewindInner();
    break;
  }
  return listNode(apps);
};

parseApplication = function(lexer) {
  var expr, exprs, rewind, rewindInner;
  rewind = lexer.memento();
  rewindInner = lexer.memento();
  exprs = [];
  while (true) {
    rewindInner = lexer.memento();
    if (!(expr = parseExpr(lexer))) {
      break;
    }
    exprs.push(expr);
  }
  rewindInner();
  if (exprs.length > 0) {
    return applicationNode(exprs);
  }
  return rewind();
};

parseExpr = function(lexer) {
  return parseApplicationWithBrackets(lexer) || parseLambdaAbstraction(lexer) || parseDefinition(lexer) || parseIdentifier(lexer);
};

parseApplicationWithBrackets = function(lexer) {
  var app, rewind, token;
  rewind = lexer.memento();
  token = lexer.next();
  if (token.tag !== TOKEN.BRACKETS_OPEN) {
    return rewind();
  }
  app = parseApplication(lexer);
  if (app == null) {
    return rewind();
  }
  token = lexer.next();
  if (token.tag !== TOKEN.BRACKETS_CLOSE) {
    return rewind();
  }
  return app;
};

parseLambdaAbstraction = function(lexer) {
  var app, identifiers, rewind, token;
  rewind = lexer.memento();
  token = lexer.next();
  if (token.tag !== TOKEN.LAMBDA) {
    return rewind();
  }
  identifiers = [];
  token = lexer.next();
  while (token.tag === TOKEN.IDENTIFIER) {
    identifiers.push(token);
    token = lexer.next();
  }
  if (identifiers.length === 0 || token.tag !== TOKEN.LAMBDA_BODY) {
    return rewind();
  }
  app = parseApplication(lexer);
  if (app != null) {
    return lambdaAbstractionNode(identifiers, app);
  }
  return rewind();
};

parseDefinition = function(lexer) {
  var app, idToken, rewind, token;
  rewind = lexer.memento();
  idToken = lexer.next();
  if (idToken.tag !== TOKEN.IDENTIFIER) {
    return rewind();
  }
  token = lexer.next();
  if (token.tag !== TOKEN.DEF_OP) {
    return rewind();
  }
  app = parseApplication(lexer);
  if (app != null) {
    return definitionNode(idToken, app);
  }
  return rewind();
};

parseIdentifier = function(lexer) {
  var rewind, token;
  rewind = lexer.memento();
  token = lexer.next();
  if (token.tag === TOKEN.IDENTIFIER) {
    return identifierNode(token);
  }
  return rewind();
};

acceptor = function(visitor) {
  var base, name;
  return typeof (base = visitor.visit)[name = this.tag] === "function" ? base[name](this) : void 0;
};

listNode = function(exprs) {
  return {
    tag: AST.LIST,
    exprs: exprs,
    accept: acceptor
  };
};

applicationNode = function(exprs) {
  return {
    tag: AST.APPLICATION,
    exprs: exprs,
    accept: acceptor
  };
};

lambdaAbstractionNode = function(args, app) {
  return {
    tag: AST.LAMBDA_ABSTRACTION,
    args: args,
    body: app,
    accept: acceptor
  };
};

definitionNode = function(idToken, app) {
  return {
    tag: AST.DEFINITION,
    token: idToken,
    body: app,
    accept: acceptor
  };
};

identifierNode = function(idToken) {
  return {
    tag: AST.IDENTIFIER,
    token: idToken,
    accept: acceptor
  };
};



},{"AST":2,"TOKEN":3}],10:[function(require,module,exports){
"use strict";
module.exports = (function() {
  var prefixedKV;
  prefixedKV = function(prefix, kv) {
    var k, res, v;
    res = {};
    for (k in kv) {
      v = kv[k];
      if (Object.prototype.toString.call(v).slice(8, -1) === "Object") {
        res[k] = prefixedKV(prefix + "_" + k, v);
      } else {
        res[k] = prefix + "_" + v;
      }
    }
    return res;
  };
  return prefixedKV;
})();



},{}],11:[function(require,module,exports){
"use strict";
var COMMENT_LONG, COMMENT_ONELINE, ERROR, IDENTIFIER, LITERAL_CHAR, LITERAL_CHAR2, LITERAL_CLOSER, LITERAL_OPENER, MULTI_DENT, TOKEN, WHITESPACE, cleanCode, commentToken, errorToken, identifierToken, lineToken, literalToken, mementoContainer, updateLocation, whitespaceToken;

TOKEN = require("TOKEN");

mementoContainer = require("memento_container");

exports.tokenize = function(code) {
  var addToken, brackets, column, consumed, context, i, latestBracket, line, popBracket, pushBracket, ref, tokens;
  code = cleanCode(code);
  tokens = [];
  line = 0;
  column = 0;
  brackets = [];
  addToken = function(tag, value, length) {
    var token;
    if (length == null) {
      length = value.length;
    }
    token = {
      tag: tag,
      value: value,
      line: line,
      column: column
    };
    tokens.push(token);
    return length;
  };
  pushBracket = function(b) {
    return brackets.push(b);
  };
  popBracket = function() {
    return brackets.pop();
  };
  latestBracket = function() {
    return brackets[brackets.length - 1];
  };
  context = {
    code: code,
    chunk: code,
    parenthesisStack: [],
    addToken: addToken,
    brackets: {
      push: pushBracket,
      pop: popBracket,
      latest: latestBracket
    }
  };
  i = 0;
  while (context.chunk = code.slice(i)) {
    consumed = commentToken(context) || whitespaceToken(context) || lineToken(context) || literalToken(context) || identifierToken(context) || errorToken(context);
    i += consumed;
    ref = updateLocation(line, column, context.chunk, consumed), line = ref[0], column = ref[1];
  }
  addToken(TOKEN.EOF, "");
  return mementoContainer.create(tokens);
};

cleanCode = function(code) {
  return code = code.split("\r\n").join("\n").split("\r").join("\n");
};

COMMENT_LONG = /^#-(?:[^-]|-(?!#))*-#/;

COMMENT_ONELINE = /^#[^\n]*(?=\n|$)/;

commentToken = function(c) {
  var match;
  match = c.chunk.match(COMMENT_LONG) || c.chunk.match(COMMENT_ONELINE);
  return (match != null ? match[0].length : void 0) || 0;
};

WHITESPACE = /^[^\n\S]+/;

whitespaceToken = function(c) {
  var match;
  match = c.chunk.match(WHITESPACE);
  return (match != null ? match[0].length : void 0) || 0;
};

MULTI_DENT = /^\s*\n([^\n\S]*)/;

lineToken = function(c) {
  var match;
  if (!(match = c.chunk.match(MULTI_DENT))) {
    return 0;
  }
  if (c.brackets.latest() != null) {
    return match[0].length;
  }
  return c.addToken(TOKEN.LINE_BREAK, "\n", match[0].length);
};

LITERAL_CHAR = {
  "\\": TOKEN.LAMBDA,
  ".": TOKEN.LAMBDA_BODY
};

LITERAL_OPENER = {
  "(": {
    token: TOKEN.BRACKETS_OPEN,
    opposite: ")"
  }
};

LITERAL_CLOSER = {
  ")": TOKEN.BRACKETS_CLOSE
};

LITERAL_CHAR2 = {
  ":=": TOKEN.DEF_OP
};

literalToken = function(c) {
  var t, v;
  v = c.chunk[0];
  if ((t = LITERAL_CHAR[v]) != null) {
    return c.addToken(t, v);
  }
  if ((t = LITERAL_OPENER[v]) != null) {
    c.brackets.push(t.opposite);
    return c.addToken(t.token, v);
  }
  if ((t = LITERAL_CLOSER[v]) != null) {
    if (c.brackets.latest() !== v) {
      return c.addToken(TOKEN.ERROR.UNMATCHED_BRACKET, v);
    }
    c.brackets.pop();
    return c.addToken(t, v);
  }
  v = c.chunk.slice(0, 2);
  if ((t = LITERAL_CHAR2[v]) != null) {
    return c.addToken(t, v);
  }
  return 0;
};

IDENTIFIER = /^[_a-zA-Z0-9]+/;

identifierToken = function(c) {
  var match;
  if (!(match = c.chunk.match(IDENTIFIER))) {
    return 0;
  }
  c.addToken(TOKEN.IDENTIFIER, match[0]);
  return match[0].length;
};

ERROR = /^\S+/;

errorToken = function(c) {
  var match;
  if (!(match = c.chunk.match(ERROR))) {
    return 0;
  }
  c.addToken(TOKEN.ERROR.UNKNOWN_TOKEN, match[0]);
  return match[0].length;
};

updateLocation = function(l, c, chunk, offset) {
  var dl, ls, str;
  if (offset === 0) {
    return [0, 0];
  }
  str = chunk.slice(0, offset);
  ls = str.split("\n");
  dl = ls.length - 1;
  if (dl === 0) {
    return [l, c + ls[dl].length];
  }
  return [l + dl, ls[dl].length];
};



},{"TOKEN":3,"memento_container":8}],12:[function(require,module,exports){
"use strict";
var examples;

examples = require("examples");

exports.createFragment = function(d, seed, key, click) {
  var $div, $fragment, example, i, len;
  $fragment = d.createDocumentFragment();
  for (i = 0, len = examples.length; i < len; i++) {
    example = examples[i];
    $div = d.createElement("div");
    $div.innerHTML = seed.split(key).join(example[1]);
    $div.addEventListener("click", (function(code) {
      return function() {
        return click(code);
      };
    })(example[1]));
    $fragment.appendChild($div);
  }
  return $fragment;
};



},{"examples":6}],13:[function(require,module,exports){
"use strict";
var AST, Applicable, CREATE_CHILD_KEY, Definition, EnvManager, FutureEval, Lambda, createVisitor, envManager, toStringVisitor,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

AST = require("AST");

FutureEval = require("future_eval");

EnvManager = require("env_manager");

CREATE_CHILD_KEY = EnvManager.CREATE_CHILD_KEY;

envManager = EnvManager.create();

toStringVisitor = require("visitor/to_string_visitor").create();

Applicable = (function() {
  function Applicable(apply) {
    this.apply = apply;
    void 0;
  }

  return Applicable;

})();

Lambda = (function(superClass) {
  extend(Lambda, superClass);

  function Lambda(env1, args1, body1) {
    this.env = env1;
    this.args = args1;
    this.body = body1;
    Lambda.__super__.constructor.call(this, function(x) {
      var arg, e, others, ref, v;
      ref = this.args, arg = ref[0], others = 2 <= ref.length ? slice.call(ref, 1) : [];
      e = this.env[CREATE_CHILD_KEY]();
      e[arg] = x;
      v = createVisitor(e);
      if (others.length === 0) {
        return this.body.accept(v);
      }
      return Lambda.create(e, others, this.body);
    });
  }

  Lambda.prototype.toString = function() {
    var a, b;
    a = this.args.join(" ");
    b = this.body.accept(toStringVisitor);
    return "(\\" + a + "." + b + ")";
  };

  return Lambda;

})(Applicable);

Lambda.create = function(env, args, body) {
  return new Lambda(env, args, body);
};

Definition = (function(superClass) {
  extend(Definition, superClass);

  function Definition(node1) {
    this.node = node1;
    Definition.__super__.constructor.call(this, function(x) {
      return x;
    });
  }

  Definition.prototype.toString = function() {
    return this.node.accept(toStringVisitor);
  };

  return Definition;

})(Applicable);

Definition.create = function(node) {
  return new Definition(node);
};

createVisitor = function(env) {
  var self, visit, visitApp;
  visit = {};
  self = {
    visit: visit
  };
  visit[AST.LIST] = function(node) {
    var expr, i, len, ref, res;
    res = null;
    ref = node.exprs;
    for (i = 0, len = ref.length; i < len; i++) {
      expr = ref[i];
      res = expr.accept(self);
    }
    return res;
  };
  visitApp = function(exprs) {
    var i, left, lefts, right;
    if (exprs.length === 1) {
      return exprs[0].accept(self);
    }
    lefts = 2 <= exprs.length ? slice.call(exprs, 0, i = exprs.length - 1) : (i = 0, []), right = exprs[i++];
    left = visitApp(lefts);
    if (left instanceof Applicable) {
      return left.apply(FutureEval.create(right, self));
    }
    return left + " " + (right.accept(toStringVisitor));
  };
  visit[AST.APPLICATION] = function(node) {
    return visitApp(node.exprs);
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    var args;
    args = node.args.map(function(id) {
      return id.value;
    });
    return Lambda.create(env, args, node.body);
  };
  visit[AST.DEFINITION] = function(node) {
    var name;
    name = node.token.value;
    env[name] = FutureEval.create(node.body, self);
    return Definition.create(node);
  };
  visit[AST.IDENTIFIER] = function(node) {
    var ref;
    return ((ref = env[node.token.value]) != null ? ref.get() : void 0) || node.accept(toStringVisitor);
  };
  self.run = function(ast) {
    return "" + (ast.accept(self));
  };
  return self;
};

exports.create = function(env) {
  if (env == null) {
    env = envManager.getGlobal();
  }
  return createVisitor(env);
};



},{"AST":2,"env_manager":5,"future_eval":7,"visitor/to_string_visitor":15}],14:[function(require,module,exports){
"use strict";
var AST, JS_KEYWORDS, NUMBER, normalizeIdentifier,
  slice = [].slice;

AST = require("AST");

JS_KEYWORDS = require("constant").JS_KEYWORDS;

NUMBER = "0123456789";

normalizeIdentifier = function(s) {
  if (JS_KEYWORDS[s] != null) {
    return "$" + s;
  }
  if (NUMBER[s[0]] != null) {
    return "$_" + s;
  }
  return s;
};

exports.create = function() {
  var self, visit;
  visit = {};
  self = {
    visit: visit
  };
  visit[AST.LIST] = function(node) {
    return node.exprs.map(function(expr) {
      return expr.accept(self);
    });
  };
  visit[AST.APPLICATION] = function(node) {
    var first, others, ref, s;
    ref = node.exprs, first = ref[0], others = 2 <= ref.length ? slice.call(ref, 1) : [];
    s = first.accept(self);
    if (others.length === 0) {
      return s;
    }
    return others.reduce((function(p, c) {
      return "(" + p + ")(" + (c.accept(self)) + ")";
    }), s);
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    var res, template;
    template = "function (%arg%) { return %body%; }";
    res = "%body%";
    node.args.forEach(function(id) {
      return res = res.split("%body%").join(template.split("%arg%").join(normalizeIdentifier(id.value)));
    });
    return res.split("%body%").join(node.body.accept(self));
  };
  visit[AST.DEFINITION] = function(node) {
    return "var " + (normalizeIdentifier(node.token.value)) + " = " + (node.body.accept(self)) + ";";
  };
  visit[AST.IDENTIFIER] = function(node) {
    return normalizeIdentifier(node.token.value);
  };
  return self;
};



},{"AST":2,"constant":4}],15:[function(require,module,exports){
"use strict";
var AST;

AST = require("AST");

exports.create = function() {
  var self, visit;
  visit = {};
  self = {
    visit: visit
  };
  visit[AST.LIST] = function(node) {
    return node.exprs.map(function(expr) {
      return expr.accept(self);
    }).join("\n");
  };
  visit[AST.APPLICATION] = function(node) {
    var tmp;
    if (node.exprs.length === 1) {
      return node.exprs[0].accept(self);
    }
    tmp = node.exprs.map(function(expr) {
      return "" + (expr.accept(self));
    }).join(" ");
    return "(" + tmp + ")";
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    var args, body;
    args = node.args.map(function(id) {
      return id.value;
    }).join(" ");
    body = node.body.accept(self);
    return "(\\" + args + "." + body + ")";
  };
  visit[AST.DEFINITION] = function(node) {
    return node.token.value + " := " + (node.body.accept(self));
  };
  visit[AST.IDENTIFIER] = function(node) {
    return node.token.value;
  };
  return self;
};



},{"AST":2}],16:[function(require,module,exports){
"use strict";
var AST;

AST = require("AST");

exports.create = function(reporter, tab) {
  var depth, indent, puts, self, visit;
  if (tab == null) {
    tab = "  ";
  }
  depth = "";
  indent = function(f) {
    var original;
    original = depth;
    depth += tab;
    f();
    return depth = original;
  };
  puts = function(s) {
    return reporter.report("" + depth + s);
  };
  visit = {};
  self = {
    visit: visit
  };
  visit[AST.LIST] = function(node) {
    return node.exprs.map(function(expr) {
      return expr.accept(self);
    });
  };
  visit[AST.APPLICATION] = function(node) {
    puts(AST.APPLICATION);
    return indent(function() {
      var expr, i, len, ref, results;
      ref = node.exprs;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        expr = ref[i];
        results.push(expr.accept(self));
      }
      return results;
    });
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    puts(AST.LAMBDA_ABSTRACTION);
    return indent(function() {
      puts("arguments:");
      indent(function() {
        var i, id, len, ref, results;
        ref = node.args;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          id = ref[i];
          results.push(puts(id.value));
        }
        return results;
      });
      puts("body:");
      return indent(function() {
        return node.body.accept(self);
      });
    });
  };
  visit[AST.DEFINITION] = function(node) {
    puts(AST.DEFINITION);
    return indent(function() {
      puts("name:");
      indent(function() {
        return puts(node.token.value);
      });
      puts("body:");
      return indent(function() {
        return node.body.accept(self);
      });
    });
  };
  visit[AST.IDENTIFIER] = function(node) {
    puts(AST.IDENTIFIER);
    return indent(function() {
      return puts(node.token.value);
    });
  };
  return self;
};



},{"AST":2}]},{},[1])