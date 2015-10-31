(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var createResultFragment, jsVisitor, jsVisitorProvider, jsonVisitorProvider, parser, reporter, tokenizer, visitor, visitorProvider;

tokenizer = require("tokenizer");

parser = require("parser");

visitorProvider = require("visitor/tree_view_visitor");

jsonVisitorProvider = require("visitor/json_visitor");

jsVisitorProvider = require("visitor/js_visitor");

reporter = {
  report: console.log.bind(console)
};

visitor = visitorProvider.create(reporter);

jsVisitor = jsVisitorProvider.create();

createResultFragment = function(d, tokens) {
  var $fragment;
  $fragment = d.createDocumentFragment();
  tokens.forEach(function(token) {
    var $p;
    $p = d.createElement("p");
    $p.textContent = JSON.stringify(token);
    return $fragment.appendChild($p);
  });
  return $fragment;
};

window.addEventListener("load", function() {
  var $input, $result;
  $input = document.getElementById("input");
  $result = document.getElementById("result");
  return $input.addEventListener("change", function() {
    var $fragment, expr, i, len, lexer, results, s;
    s = $input.value;
    console.time("tokenizer");
    lexer = tokenizer(s);
    console.timeEnd("tokenizer");
    console.time("parser");
    results = parser.parse(lexer);
    console.timeEnd("parser");
    for (i = 0, len = results.length; i < len; i++) {
      expr = results[i];
      expr.accept(visitor);
    }
    $result.textContent = null;
    $fragment = createResultFragment(document, results.map(function(expr) {
      return expr.accept(jsVisitor);
    }));
    return $result.appendChild($fragment);
  });
});



},{"parser":5,"tokenizer":7,"visitor/js_visitor":8,"visitor/json_visitor":9,"visitor/tree_view_visitor":10}],2:[function(require,module,exports){
"use strict";
var prefixedKV;

prefixedKV = require("prefixed_kv");

module.exports = prefixedKV("AST", {
  "IDENTIFIER": "IDENTIFIER",
  "LAMBDA_ABSTRACTION": "LAMBDA_ABSTRACTION",
  "APPLICATION": "APPLICATION",
  "DEFINITION": "DEFINITION"
});



},{"prefixed_kv":6}],3:[function(require,module,exports){
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
    "STRING": "STRING",
    "UNKNOWN_TOKEN": "UNKNOWN_TOKEN"
  }
});



},{"prefixed_kv":6}],4:[function(require,module,exports){
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



},{}],5:[function(require,module,exports){
"use strict";
var AST, TOKEN, acceptor, applicationNode, definitionNode, identifierNode, lambdaAbstractionNode, parse, parseApplication, parseDefinition, parseExpr, parseExprWithBrackets, parseIdentifier, parseLambdaAbstraction;

TOKEN = require("TOKEN");

AST = require("AST");

acceptor = function(visitor) {
  var base, name;
  return typeof (base = visitor.visit)[name = this.tag] === "function" ? base[name](this) : void 0;
};

identifierNode = function(idToken) {
  return {
    tag: AST.IDENTIFIER,
    token: idToken,
    accept: acceptor
  };
};

lambdaAbstractionNode = function(identifiers, expr) {
  return {
    tag: AST.LAMBDA_ABSTRACTION,
    args: identifiers,
    body: expr,
    accept: acceptor
  };
};

applicationNode = function(args) {
  return {
    tag: AST.APPLICATION,
    args: args,
    accept: acceptor
  };
};

definitionNode = function(idToken, expr) {
  return {
    tag: AST.DEFINITION,
    token: idToken,
    body: expr,
    accept: acceptor
  };
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

parseLambdaAbstraction = function(lexer) {
  var expr, identifiers, rewind, token;
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
  expr = parseExpr(lexer);
  if (expr != null) {
    return lambdaAbstractionNode(identifiers, expr);
  }
  return rewind();
};

parseApplication = function(lexer) {
  var args, expr, idNode, rewind, rewindInner, token;
  rewind = lexer.memento();
  rewindInner = lexer.memento();
  args = [];
  while (true) {
    rewindInner = lexer.memento();
    idNode = parseIdentifier(lexer);
    if (idNode != null) {
      args.push(idNode);
      continue;
    }
    token = lexer.next();
    if (token.tag !== TOKEN.BRACKETS_OPEN) {
      break;
    }
    expr = parseExpr(lexer);
    if (expr == null) {
      break;
    }
    token = lexer.next();
    if (token.tag !== TOKEN.BRACKETS_CLOSE) {
      break;
    }
    args.push(expr);
  }
  rewindInner();
  if (args.length > 1) {
    return applicationNode(args);
  }
  return rewind();
};

parseDefinition = function(lexer) {
  var expr, idToken, rewind, token;
  rewind = lexer.memento();
  idToken = lexer.next();
  if (idToken.tag !== TOKEN.IDENTIFIER) {
    return rewind();
  }
  token = lexer.next();
  if (token.tag !== TOKEN.DEF_OP) {
    return rewind();
  }
  expr = parseExpr(lexer);
  if (expr != null) {
    return definitionNode(idToken, expr);
  }
  return rewind();
};

parseExprWithBrackets = function(lexer) {
  var expr, rewind, token;
  rewind = lexer.memento();
  token = lexer.next();
  if (token.tag !== TOKEN.BRACKETS_OPEN) {
    return rewind();
  }
  expr = parseExpr(lexer);
  if (expr == null) {
    return rewind();
  }
  token = lexer.next();
  if (token.tag === TOKEN.BRACKETS_CLOSE) {
    return expr;
  }
  return rewind();
};

parseExpr = function(lexer) {
  return parseExprWithBrackets(lexer) || parseDefinition(lexer) || parseApplication(lexer) || parseLambdaAbstraction(lexer) || parseIdentifier(lexer);
};

parse = function(lexer) {
  var expr, exprs;
  exprs = [];
  while ((expr = parseExpr(lexer)) != null) {
    exprs.push(expr);
  }
  return exprs;
};

module.exports = {
  parse: parse
};



},{"AST":2,"TOKEN":3}],6:[function(require,module,exports){
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



},{}],7:[function(require,module,exports){
"use strict";
var COMMENT_LONG, COMMENT_ONELINE, ERROR, IDENTIFIER, LITERAL_CHAR, LITERAL_CHAR2, MULTI_DENT, TOKEN, WHITESPACE, cleanCode, commentToken, errorToken, identifierToken, lineToken, literalToken, locationDiff, mementoContainer, tokenize, whitespaceToken;

TOKEN = require("TOKEN");

mementoContainer = require("memento_container");

module.exports = tokenize = function(code) {
  var addToken, column, consumed, context, dc, dl, i, line, ref, tokens;
  code = cleanCode(code);
  tokens = [];
  line = 0;
  column = 0;
  addToken = function(tag, value) {
    var token;
    token = {
      tag: tag,
      value: value,
      line: line,
      column: column
    };
    tokens.push(token);
    return token;
  };
  context = {
    code: code,
    chunk: code,
    addToken: addToken
  };
  i = 0;
  while (context.chunk = code.slice(i)) {
    consumed = commentToken(context) || whitespaceToken(context) || lineToken(context) || literalToken(context) || identifierToken(context) || errorToken(context);
    i += consumed;
    ref = locationDiff(context.chunk, consumed), dl = ref[0], dc = ref[1];
    line += dl;
    column += dc;
  }
  addToken(TOKEN.EOF, "");
  return mementoContainer.create(tokens);
};

cleanCode = function(code) {
  return code = code.split("\r\n").join("\n").split("\r").join("\n");
};

COMMENT_LONG = /^#-(?:[^-]|-(?!#))*-#/;

COMMENT_ONELINE = /^#[^\n]*\n/;

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
  c.addToken(TOKEN.LINE_BREAK, "\n");
  return match[0].length;
};

LITERAL_CHAR = {
  "\\": TOKEN.LAMBDA,
  ".": TOKEN.LAMBDA_BODY,
  "(": TOKEN.BRACKETS_OPEN,
  ")": TOKEN.BRACKETS_CLOSE
};

LITERAL_CHAR2 = {
  ":=": TOKEN.DEF_OP
};

literalToken = function(c) {
  var t, v;
  if ((t = LITERAL_CHAR[v = c.chunk[0]]) != null) {
    c.addToken(t, v);
    return 1;
  }
  if ((t = LITERAL_CHAR2[v = c.chunk.slice(0, 2)]) != null) {
    c.addToken(t, v);
    return 2;
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

locationDiff = function(chunk, offset) {
  var ls, str;
  if (offset === 0) {
    return [0, 0];
  }
  str = chunk.slice(0, offset);
  ls = str.split("\n");
  return [ls.length - 1, ls[ls.length - 1].length];
};



},{"TOKEN":3,"memento_container":4}],8:[function(require,module,exports){
"use strict";
var AST;

AST = require("AST");

exports.create = function() {
  var self, visit;
  visit = {};
  self = {
    visit: visit
  };
  visit[AST.IDENTIFIER] = function(node) {
    return node.token.value;
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    var res, template;
    template = "function (%arg%) { return (%body%); }";
    res = "%body%";
    node.args.forEach(function(id) {
      return res = res.split("%body%").join(template.split("%arg%").join(id.value));
    });
    return res.split("%body%").join(node.body.accept(self));
  };
  visit[AST.APPLICATION] = function(node) {
    var res;
    res = node.args.reduce((function(p, c) {
      return "(" + p + ")(" + (c.accept(self)) + ")";
    }), "\\dummy\\");
    return res.split("(\\dummy\\)").join("");
  };
  visit[AST.DEFINITION] = function(node) {
    return "var " + node.token.value + " = (" + (node.body.accept(self)) + ");";
  };
  return self;
};



},{"AST":2}],9:[function(require,module,exports){
"use strict";
var AST;

AST = require("AST");

exports.create = function() {
  var self, visit;
  visit = {};
  self = {
    visit: visit
  };
  visit[AST.IDENTIFIER] = function(node) {
    return node.token.value;
  };
  visit[AST.LAMBDA_ABSTRACTION] = function(node) {
    return {
      args: node.args.map(function(id) {
        return id.value;
      }),
      body: node.body.accept(self)
    };
  };
  visit[AST.APPLICATION] = function(node) {
    return node.args.map(function(expr) {
      return expr.accept(self);
    });
  };
  visit[AST.DEFINITION] = function(node) {
    return {
      name: node.token.value,
      body: node.body.accept(self)
    };
  };
  return self;
};



},{"AST":2}],10:[function(require,module,exports){
"use strict";
var AST, create;

AST = require("AST");

create = function(reporter, tab) {
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
  visit[AST.IDENTIFIER] = function(node) {
    puts(AST.IDENTIFIER);
    return indent(function() {
      return puts(node.token.value);
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
  visit[AST.APPLICATION] = function(node) {
    puts(AST.APPLICATION);
    return indent(function() {
      var expr, i, len, ref, results;
      ref = node.args;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        expr = ref[i];
        results.push(expr.accept(self));
      }
      return results;
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
  return self;
};

module.exports = {
  create: create
};



},{"AST":2}]},{},[1])