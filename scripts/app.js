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

require("runner/reserved");

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
    console.time("interpreter");
    reporter.report(result.accept(interpreter));
    console.timeEnd("interpreter");
    $result.textContent = null;
    $fragment = createResultFragment(document, result.accept(jsVisitor).split("\n"));
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



},{"parser":9,"runner/reserved":20,"tokenizer":24,"views/append_examples":25,"visitor/interpreter":26,"visitor/js_visitor":27,"visitor/to_string_visitor":29,"visitor/tree_view_visitor":30}],2:[function(require,module,exports){
"use strict";
var prefixedKV;

prefixedKV = require("prefixed_kv");

module.exports = prefixedKV("AST", {
  "LIST": "LIST",
  "APPLICATION": "APPLICATION",
  "LAMBDA_ABSTRACTION": "LAMBDA_ABSTRACTION",
  "DEFINITION": "DEFINITION",
  "IDENTIFIER": "IDENTIFIER",
  NUMBER: {
    "NATURAL": "NATURAL"
  }
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
  NUMBER: {
    "NATURAL": "NATURAL"
  },
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
  Env.prototype[CCK] = function() {
    Env.prototype = this;
    return new Env;
  };
  global = new Env;
  return {
    getGlobal: function() {
      return global;
    }
  };
};



},{}],6:[function(require,module,exports){
"use strict";
module.exports = [[0, "_0     := \\f x.x", "[_0{f{x x}}]"], [1, "_1     := \\f x.f x", "[_1{f{x(f x)}}]"], [2, "_2     := \\f x.f (f x)", "[_2{f{x(f(f x))}}]"], [3, "succ   := \\n f x.f (n f x)", "[succ{n{f{x(f((n f)x))}}}]"], [4, "pred   := \\n f x.n (\\g h.h (g f)) (\\u.x) (\\v.v)", "[pred{n{f{x(((n{g{h(h(g f))}}){u x}){v v})}}}]"], [5, "add    := \\m n f x.m f (n f x)", "[add{m{n{f{x((m f)((n f)x))}}}}]"], [6, "mul    := \\m n f.m (n f)", "[mul{m{n{f(m(n f))}}}]"], [7, "exp    := \\m n.n m", "[exp{m{n(n m)}}]"], [8, "true   := \\x y.x", "[true{x{y x}}]"], [9, "false  := \\x y.y", "[false{x{y y}}]"], [10, "and    := \\p q x y.p (q x y) y", "[and{p{q{x{y((p((q x)y))y)}}}}]"], [11, "or     := \\p q x y.p x (q x y)", "[or{p{q{x{y((p x)((q x)y))}}}}]"], [12, "not    := \\p x y.p y x", "[not{p{x{y((p y)x)}}}]"], [13, "if     := \\p x y.p x y", "[if{p{x{y((p x)y)}}}]"], [14, "isZero := \\n.n (\\x. false) true", "[isZero{n((n{x false})true)}]"], [15, "pair   := \\a b p.p a b", "[pair{a{b{p((p a)b)}}}]"], [16, "first  := \\p.p true", "[first{p(p true)}]"], [17, "second := \\p.p false", "[second{p(p false)}]"], [18, "Y      := \\f.(\\x.f (x x)) (\\x.f (x x))", "[Y{f({x(f(x x))}{x(f(x x))})}]"], [19, "Z      := \\f.(\\x.f (\\y.x x y)) (\\x.f (\\y.x x y))", "[Z{f({x(f{y((x x)y)})}{x(f{y((x x)y)})})}]"], [20, "fact   := Y (\\f r n.isZero n r (f (mul r n) (pred n))) 1", "[fact((Y{f{r{n(((isZero n)r)((f((mul r)n))(pred n)))}}})1)]"]];



},{}],7:[function(require,module,exports){
"use strict";
exports.create = function(node, visitor) {
  return this.createWithGetter(function() {
    return node.accept(visitor);
  });
};

exports.createWithGetter = function(getter) {
  var resolved;
  resolved = null;
  return {
    get: function() {
      return resolved != null ? resolved : resolved = getter();
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
var AST, TOKEN, acceptor, applicationNode, definitionNode, identifierNode, lambdaAbstractionNode, listNode, naturalNumberNode, parseApplication, parseApplicationWithBrackets, parseDefinition, parseExpr, parseIdentifier, parseLambdaAbstraction, parseMultiline,
  slice = [].slice;

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
  var app, expr, exprs, i, len, others, rewind, rewindInner;
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
  if (exprs.length === 0) {
    return rewind();
  }
  app = exprs[0], others = 2 <= exprs.length ? slice.call(exprs, 1) : [];
  for (i = 0, len = others.length; i < len; i++) {
    expr = others[i];
    app = applicationNode(app, expr);
  }
  return app;
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
  var argToken, argTokens, body, i, lmda, rewind, token;
  rewind = lexer.memento();
  token = lexer.next();
  if (token.tag !== TOKEN.LAMBDA) {
    return rewind();
  }
  argTokens = [];
  token = lexer.next();
  while (token.tag === TOKEN.IDENTIFIER) {
    argTokens.push(token);
    token = lexer.next();
  }
  if (argTokens.length === 0 || token.tag !== TOKEN.LAMBDA_BODY) {
    return rewind();
  }
  body = parseApplication(lexer);
  if (body == null) {
    return rewind();
  }
  lmda = body;
  for (i = argTokens.length - 1; i >= 0; i += -1) {
    argToken = argTokens[i];
    lmda = lambdaAbstractionNode(argToken.value, lmda);
  }
  return lmda;
};

parseDefinition = function(lexer) {
  var body, idToken, rewind, token;
  rewind = lexer.memento();
  idToken = lexer.next();
  if (idToken.tag !== TOKEN.IDENTIFIER) {
    return rewind();
  }
  token = lexer.next();
  if (token.tag !== TOKEN.DEF_OP) {
    return rewind();
  }
  body = parseApplication(lexer);
  if (body != null) {
    return definitionNode(idToken.value, body);
  }
  return rewind();
};

parseIdentifier = function(lexer) {
  var rewind, token;
  rewind = lexer.memento();
  token = lexer.next();
  switch (token.tag) {
    case TOKEN.IDENTIFIER:
      return identifierNode(token.value);
    case TOKEN.NUMBER.NATURAL:
      return naturalNumberNode(token.value);
    default:
      return rewind();
  }
};

acceptor = function(visitor) {
  var base, name1;
  return typeof (base = visitor.visit)[name1 = this.tag] === "function" ? base[name1](this) : void 0;
};

exports.listNode = listNode = function(exprs) {
  return {
    tag: AST.LIST,
    exprs: exprs,
    accept: acceptor
  };
};

exports.applicationNode = applicationNode = function(left, right) {
  return {
    tag: AST.APPLICATION,
    left: left,
    right: right,
    accept: acceptor
  };
};

exports.lambdaAbstractionNode = lambdaAbstractionNode = function(arg, body) {
  return {
    tag: AST.LAMBDA_ABSTRACTION,
    arg: arg,
    body: body,
    accept: acceptor
  };
};

exports.definitionNode = definitionNode = function(name, body) {
  return {
    tag: AST.DEFINITION,
    name: name,
    body: body,
    accept: acceptor
  };
};

exports.identifierNode = identifierNode = function(name) {
  return {
    tag: AST.IDENTIFIER,
    name: name,
    accept: acceptor
  };
};

exports.naturalNumberNode = naturalNumberNode = function(value) {
  return {
    tag: AST.NUMBER.NATURAL,
    value: +value,
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
var BradeRunner, Runner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Runner = require("runner/runner");

module.exports = BradeRunner = (function(superClass) {
  extend(BradeRunner, superClass);

  function BradeRunner(interpreter, toString, run) {
    this.toString = toString;
    this.run = run;
    void 0;
  }

  return BradeRunner;

})(Runner);



},{"runner/runner":21}],12:[function(require,module,exports){
"use strict";
var DefinitionRunner, Runner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Runner = require("runner/runner");

module.exports = DefinitionRunner = (function(superClass) {
  extend(DefinitionRunner, superClass);

  function DefinitionRunner(interpreter, name, body) {
    this.name = name;
    this.body = body;
    DefinitionRunner.__super__.constructor.call(this, interpreter);
  }

  DefinitionRunner.prototype.toString = function() {
    return this.name + ": OK";
  };

  return DefinitionRunner;

})(Runner);



},{"runner/runner":21}],13:[function(require,module,exports){
"use strict";
var IdentifierRunner, Runner, runners, stdlib,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Runner = require("runner/runner");

stdlib = null;

runners = {};

module.exports = IdentifierRunner = (function(superClass) {
  extend(IdentifierRunner, superClass);

  function IdentifierRunner(interpreter, name1) {
    this.name = name1;
    IdentifierRunner.__super__.constructor.call(this, interpreter);
  }

  IdentifierRunner.prototype.run = function(thunk) {
    var r, ref;
    if ((runners[this.name] != null) && (r = runners[this.name].run(thunk))) {
      return r;
    }
    return ((ref = stdlib.env[this.name]) != null ? ref.get().run(thunk) : void 0) || thunk.get();
  };

  IdentifierRunner.prototype.toString = function() {
    return this.name;
  };

  return IdentifierRunner;

})(Runner);

IdentifierRunner.create = function(interpreter, name) {
  return runners[name] || Runner.create.call(this, interpreter, name);
};

IdentifierRunner.setStdlib = function(s) {
  return stdlib = s;
};

IdentifierRunner.register = function(name, runnerProvider) {
  return runners[name] = runnerProvider.create(stdlib, name);
};



},{"runner/runner":21}],14:[function(require,module,exports){
"use strict";
var IdentifierRunner, IsnilIdentifierRunner, NilIdentifierRunner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdentifierRunner = require("runner/identifier");

NilIdentifierRunner = require("runner/identifier/nil");

module.exports = IsnilIdentifierRunner = (function(superClass) {
  extend(IsnilIdentifierRunner, superClass);

  function IsnilIdentifierRunner() {
    return IsnilIdentifierRunner.__super__.constructor.apply(this, arguments);
  }

  IsnilIdentifierRunner.prototype.run = function(nilThunk) {
    var n;
    n = nilThunk.get();
    if (n instanceof NilIdentifierRunner) {
      return this.interpreter.env["true"].get();
    }
    return this.interpreter.env["false"].get();
  };

  return IsnilIdentifierRunner;

})(IdentifierRunner);

IdentifierRunner.register("isnil", IsnilIdentifierRunner);



},{"runner/identifier":13,"runner/identifier/nil":15}],15:[function(require,module,exports){
"use strict";
var IdentifierRunner, NilIdentifierRunner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdentifierRunner = require("runner/identifier");

module.exports = NilIdentifierRunner = (function(superClass) {
  extend(NilIdentifierRunner, superClass);

  function NilIdentifierRunner() {
    return NilIdentifierRunner.__super__.constructor.apply(this, arguments);
  }

  NilIdentifierRunner.prototype.run = function(thunk) {
    return this;
  };

  return NilIdentifierRunner;

})(IdentifierRunner);

IdentifierRunner.register("nil", NilIdentifierRunner);



},{"runner/identifier":13}],16:[function(require,module,exports){
"use strict";
var IdentifierRunner, NumberRunner, PredIdentifierRunner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdentifierRunner = require("runner/identifier");

NumberRunner = require("runner/number");

module.exports = PredIdentifierRunner = (function(superClass) {
  extend(PredIdentifierRunner, superClass);

  function PredIdentifierRunner() {
    return PredIdentifierRunner.__super__.constructor.apply(this, arguments);
  }

  PredIdentifierRunner.prototype.run = function(nThunk) {
    var n, ref;
    n = nThunk.get();
    if (n instanceof NumberRunner) {
      return NumberRunner.create(this.interpreter, n.value - 1);
    }
    return (ref = this.interpreter.env[this.name]) != null ? ref.get().run(nThunk) : void 0;
  };

  return PredIdentifierRunner;

})(IdentifierRunner);

IdentifierRunner.register("pred", PredIdentifierRunner);



},{"runner/identifier":13,"runner/number":19}],17:[function(require,module,exports){
"use strict";
var IdentifierRunner, NumberRunner, SuccIdentifierRunner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdentifierRunner = require("runner/identifier");

NumberRunner = require("runner/number");

module.exports = SuccIdentifierRunner = (function(superClass) {
  extend(SuccIdentifierRunner, superClass);

  function SuccIdentifierRunner() {
    return SuccIdentifierRunner.__super__.constructor.apply(this, arguments);
  }

  SuccIdentifierRunner.prototype.run = function(nThunk) {
    var n, ref;
    n = nThunk.get();
    if (n instanceof NumberRunner) {
      return NumberRunner.create(this.interpreter, n.value + 1);
    }
    return (ref = this.interpreter.env[this.name]) != null ? ref.get().run(nThunk) : void 0;
  };

  return SuccIdentifierRunner;

})(IdentifierRunner);

IdentifierRunner.register("succ", SuccIdentifierRunner);



},{"runner/identifier":13,"runner/number":19}],18:[function(require,module,exports){
"use strict";
var AST, LambdaAbstractionRunner, Runner, parser, toStringVisitor, tokenizer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Runner = require("runner/runner");

toStringVisitor = require("visitor/to_string_visitor").create();

tokenizer = require("tokenizer");

parser = require("parser");

AST = require("AST");

module.exports = LambdaAbstractionRunner = (function(superClass) {
  extend(LambdaAbstractionRunner, superClass);

  function LambdaAbstractionRunner(interpreter, arg, body, name1) {
    this.arg = arg;
    this.body = body;
    this.name = name1;
    LambdaAbstractionRunner.__super__.constructor.call(this, interpreter);
  }

  LambdaAbstractionRunner.prototype.run = function(thunk) {
    var i;
    i = this.interpreter.createChild();
    i.env[this.arg] = thunk;
    return this.body.accept(i);
  };

  LambdaAbstractionRunner.prototype.toString = function() {
    return this.name || ("\\" + this.arg + "." + (this.body.accept(toStringVisitor)));
  };

  return LambdaAbstractionRunner;

})(Runner);

LambdaAbstractionRunner.runnerWithCode = function(code) {
  var ast;
  ast = parser.parse(tokenizer.tokenize(code)).exprs[0];
  if (ast.tag !== AST.LAMBDA_ABSTRACTION) {
    return Runner.create;
  }
  return {
    createMyself: function(interpreter, name) {
      return LambdaAbstractionRunner.create(interpreter, ast.arg, ast.body, name);
    }
  };
};



},{"AST":2,"parser":9,"runner/runner":21,"tokenizer":24,"visitor/to_string_visitor":29}],19:[function(require,module,exports){
"use strict";
var BradeRunner, FutureEval, NumberRunner, Runner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Runner = require("runner/runner");

BradeRunner = require("runner/brade");

FutureEval = require("future_eval");

module.exports = NumberRunner = (function(superClass) {
  extend(NumberRunner, superClass);

  function NumberRunner(interpreter, value) {
    this.value = value;
    NumberRunner.__super__.constructor.call(this, interpreter);
  }

  NumberRunner.prototype.run = function(fThunk) {
    var f, i, m, toS, val;
    if (this.value === 0) {
      return Runner.create(this.interpreter);
    }
    f = fThunk.get();
    if (this.value === 1) {
      return f;
    }
    if (f instanceof NumberRunner) {
      val = Math.pow(f.value, this.value);
      return NumberRunner.create(this.interpreter, val);
    }
    m = this.value - 1;
    i = this.interpreter;
    toS = function() {
      return "f (" + m + " f x)";
    };
    return BradeRunner.create(i, toS, function(xThunk) {
      return f.run(FutureEval.createWithGetter(function() {
        return NumberRunner.create(i, m).run(fThunk).run(xThunk);
      }));
    });
  };

  NumberRunner.prototype.toString = function() {
    return "" + this.value;
  };

  return NumberRunner;

})(Runner);



},{"future_eval":7,"runner/brade":11,"runner/runner":21}],20:[function(require,module,exports){
"use strict";
var IdentifierRunner, stdlib;

stdlib = require("visitor/stdlib");

IdentifierRunner = require("runner/identifier");

IdentifierRunner.setStdlib(stdlib);

require("runner/identifier/succ");

require("runner/identifier/pred");

require("runner/identifier/nil");

require("runner/identifier/isnil");

require("runner/symbol/plus");

require("runner/symbol/mult");



},{"runner/identifier":13,"runner/identifier/isnil":14,"runner/identifier/nil":15,"runner/identifier/pred":16,"runner/identifier/succ":17,"runner/symbol/mult":22,"runner/symbol/plus":23,"visitor/stdlib":28}],21:[function(require,module,exports){
"use strict";
var Runner,
  slice = [].slice;

module.exports = Runner = (function() {
  function Runner(interpreter) {
    this.interpreter = interpreter;
    void 0;
  }

  Runner.prototype.run = function(thunk) {
    return thunk.get();
  };

  return Runner;

})();

Runner.create = function() {
  return new (Function.prototype.bind.apply(this, [this].concat(slice.call(arguments))));
};



},{}],22:[function(require,module,exports){
"use strict";
var BradeRunner, IdentifierRunner, MultSymbolRunner, NumberRunner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdentifierRunner = require("runner/identifier");

NumberRunner = require("runner/number");

BradeRunner = require("runner/brade");

module.exports = MultSymbolRunner = (function(superClass) {
  extend(MultSymbolRunner, superClass);

  function MultSymbolRunner() {
    return MultSymbolRunner.__super__.constructor.apply(this, arguments);
  }

  MultSymbolRunner.prototype.run = function(mThunk) {
    var i, name, toS;
    i = this.interpreter;
    name = this.name;
    toS = function() {
      return "\\n f.m (n f)";
    };
    return BradeRunner.create(i, toS, function(nThunk) {
      var m, n, ref;
      m = mThunk.get();
      n = nThunk.get();
      if (m instanceof NumberRunner && n instanceof NumberRunner) {
        return NumberRunner.create(i, m.value * n.value);
      }
      return (ref = i.env[name]) != null ? ref.get().run(mThunk).run(nThunk) : void 0;
    });
  };

  return MultSymbolRunner;

})(IdentifierRunner);

IdentifierRunner.register("*", MultSymbolRunner);



},{"runner/brade":11,"runner/identifier":13,"runner/number":19}],23:[function(require,module,exports){
"use strict";
var BradeRunner, IdentifierRunner, NumberRunner, PlusSymbolRunner,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdentifierRunner = require("runner/identifier");

NumberRunner = require("runner/number");

BradeRunner = require("runner/brade");

module.exports = PlusSymbolRunner = (function(superClass) {
  extend(PlusSymbolRunner, superClass);

  function PlusSymbolRunner() {
    return PlusSymbolRunner.__super__.constructor.apply(this, arguments);
  }

  PlusSymbolRunner.prototype.run = function(mThunk) {
    var i, name, toS;
    i = this.interpreter;
    name = this.name;
    toS = function() {
      return "\\n f x.m f (n f x)";
    };
    return BradeRunner.create(i, toS, function(nThunk) {
      var m, n, ref;
      m = mThunk.get();
      n = nThunk.get();
      if (m instanceof NumberRunner && n instanceof NumberRunner) {
        return NumberRunner.create(i, m.value + n.value);
      }
      return (ref = i.env[name]) != null ? ref.get().run(mThunk).run(nThunk) : void 0;
    });
  };

  return PlusSymbolRunner;

})(IdentifierRunner);

IdentifierRunner.register("+", PlusSymbolRunner);



},{"runner/brade":11,"runner/identifier":13,"runner/number":19}],24:[function(require,module,exports){
"use strict";
var COMMENT_LONG, COMMENT_ONELINE, ERROR, IDENTIFIER, LITERAL_CHAR, LITERAL_CHAR2, LITERAL_CLOSER, LITERAL_OPENER, MULTI_DENT, NATURAL_NUMBER, TOKEN, WHITESPACE, cleanCode, commentToken, errorToken, identifierToken, lineToken, literalToken, mementoContainer, naturalNumberToken, updateLocation, whitespaceToken;

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
    consumed = commentToken(context) || whitespaceToken(context) || lineToken(context) || literalToken(context) || identifierToken(context) || naturalNumberToken(context) || errorToken(context);
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

IDENTIFIER = /^(?:[_a-zA-Z]\w*|[!$%&*+\/<=>?@^|\-~]+)/;

identifierToken = function(c) {
  var match;
  if (!(match = c.chunk.match(IDENTIFIER))) {
    return 0;
  }
  c.addToken(TOKEN.IDENTIFIER, match[0]);
  return match[0].length;
};

NATURAL_NUMBER = /^(?:0|[1-9]\d*)(?![_a-zA-Z])/;

naturalNumberToken = function(c) {
  var match;
  if (!(match = c.chunk.match(NATURAL_NUMBER))) {
    return 0;
  }
  c.addToken(TOKEN.NUMBER.NATURAL, match[0]);
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



},{"TOKEN":3,"memento_container":8}],25:[function(require,module,exports){
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



},{"examples":6}],26:[function(require,module,exports){
"use strict";
var AST, CREATE_CHILD_KEY, DefinitionRunner, EnvManager, FutureEval, IdentifierRunner, LambdaAbstractionRunner, NumberRunner, createInterpreter, envManager;

AST = require("AST");

FutureEval = require("future_eval");

EnvManager = require("env_manager");

CREATE_CHILD_KEY = EnvManager.CREATE_CHILD_KEY;

envManager = EnvManager.create();

LambdaAbstractionRunner = require("runner/lambda_abstraction");

DefinitionRunner = require("runner/definition");

IdentifierRunner = require("runner/identifier");

NumberRunner = require("runner/number");

exports.create = createInterpreter = function(env) {
  var self, visit;
  if (env == null) {
    env = envManager.getGlobal();
  }
  visit = {};
  self = {
    env: env,
    visit: visit,
    createChild: function() {
      return createInterpreter(env[CREATE_CHILD_KEY]());
    }
  };
  visit[AST.LIST] = function(node) {
    return node.exprs.map(function(expr) {
      return "" + (expr.accept(self));
    }).join("\n");
  };
  visit[AST.APPLICATION] = function(node) {
    return node.left.accept(self).run(FutureEval.create(node.right, self));
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    return LambdaAbstractionRunner.create(self, node.arg, node.body);
  };
  visit[AST.DEFINITION] = function(node) {
    env[node.name] = FutureEval.create(node.body, self);
    return DefinitionRunner.create(self, node.name, node.body);
  };
  visit[AST.IDENTIFIER] = function(node) {
    var ref;
    return ((ref = env[node.name]) != null ? ref.get() : void 0) || IdentifierRunner.create(self, node.name);
  };
  visit[AST.NUMBER.NATURAL] = function(node) {
    return NumberRunner.create(self, node.value);
  };
  return self;
};



},{"AST":2,"env_manager":5,"future_eval":7,"runner/definition":12,"runner/identifier":13,"runner/lambda_abstraction":18,"runner/number":19}],27:[function(require,module,exports){
"use strict";
var AST, JS_KEYWORDS, NUMBER, normalizeIdentifier;

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
    }).join("\n");
  };
  visit[AST.APPLICATION] = function(node) {
    return "(" + (node.left.accept(self)) + ")(" + (node.right.accept(self)) + ")";
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    return "function(" + node.arg + ") { return " + (node.body.accept(self)) + "; }";
  };
  visit[AST.DEFINITION] = function(node) {
    return "var " + (normalizeIdentifier(node.name)) + " = " + (node.body.accept(self)) + ";";
  };
  visit[AST.IDENTIFIER] = function(node) {
    return normalizeIdentifier(node.name);
  };
  return self;
};



},{"AST":2,"constant":4}],28:[function(require,module,exports){
"use strict";
var Interpreter, codes, envManager, parser, stdlib, tokenizer;

Interpreter = require("visitor/interpreter");

envManager = require("env_manager").create();

tokenizer = require("tokenizer");

parser = require("parser");

module.exports = stdlib = Interpreter.create(envManager.getGlobal());

codes = ["succ   := \\n f x.f (n f x)", "pred   := \\n f x.n (\\g h.h (g f)) (\\u.x) (\\v.v)", "+      := \\m n f x.m f (n f x)", "*      := \\m n f.m (n f)", "true   := \\x y.x", "false  := \\x y.y", "and    := \\p q.p q false", "or     := \\p q.p true q", "not    := \\p x y.p y x", "if     := \\p x y.p x y", "isZero := \\n.n (\\x.false) true", "pair   := \\a b p.p a b", "first  := \\p.p true", "second := \\p.p false", "cons   := pair", "head   := first", "tail   := second", "list   := Y (\\f A m.isnil m (A m) (f (\\x.A (cons m x)))) (\\u.u)", "Y      := \\f.(\\x.f (x x)) (\\x.f (x x))", "K      := \\x y.x", "S      := \\x y z.x z (y z)", "I      := \\x.x", "X      := \\x.x S K", "fact   := Y (\\f r n.isZero n r (f (* r n) (pred n))) 1"];

parser.parse(tokenizer.tokenize(codes.join("\n"))).accept(stdlib);



},{"env_manager":5,"parser":9,"tokenizer":24,"visitor/interpreter":26}],29:[function(require,module,exports){
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
    return "(" + (node.left.accept(self)) + " " + (node.right.accept(self)) + ")";
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    return "(\\" + node.arg + "." + (node.body.accept(self)) + ")";
  };
  visit[AST.DEFINITION] = function(node) {
    return "(" + node.name + " := " + (node.body.accept(self)) + ")";
  };
  visit[AST.IDENTIFIER] = function(node) {
    return node.name;
  };
  return self;
};



},{"AST":2}],30:[function(require,module,exports){
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
    var expr, i, len, ref;
    ref = node.exprs;
    for (i = 0, len = ref.length; i < len; i++) {
      expr = ref[i];
      expr.accept(self);
    }
  };
  visit[AST.APPLICATION] = function(node) {};
  visit[AST.APPLICATION] = function(node) {
    puts(AST.APPLICATION);
    return indent(function() {
      node.left.accept(self);
      return node.right.accept(self);
    });
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    puts(AST.LAMBDA_ABSTRACTION);
    return indent(function() {
      puts(node.arg);
      return node.body.accept(self);
    });
  };
  visit[AST.DEFINITION] = function(node) {
    puts(AST.DEFINITION);
    return indent(function() {
      puts(node.name);
      return node.body.accept(self);
    });
  };
  visit[AST.IDENTIFIER] = function(node) {
    return puts(node.name);
  };
  return self;
};



},{"AST":2}]},{},[1])