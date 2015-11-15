(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Reporter, createFragment, createP, interpreter, interpreterProvider, parser, tokenizer;

tokenizer = require("tokenizer");

parser = require("parser");

interpreterProvider = require("visitor/interpreter");

require("runner/reserved");

createFragment = function(d, cls, items) {
  var $fragment, item, j, len;
  $fragment = d.createDocumentFragment();
  for (j = 0, len = items.length; j < len; j++) {
    item = items[j];
    if (item.trim() !== "") {
      $fragment.appendChild(createP(d, cls, item));
    }
  }
  return $fragment;
};

createP = function(d, cls, text) {
  var $p;
  $p = d.createElement("p");
  $p.textContent = text;
  $p.classList.add(cls);
  return $p;
};

Reporter = function(d, $result) {
  return {
    code: {
      report: function(code) {
        return $result.appendChild(createFragment(d, "ce-out-code", code.split("\n")));
      }
    },
    result: {
      report: function(result) {
        return $result.appendChild(createFragment(d, "ce-out-result", result.split("\n")));
      }
    }
  };
};

interpreter = interpreterProvider.create();

window.addEventListener("load", function() {
  var $input, $result, compile, i, reporter;
  $input = document.getElementById("input");
  $result = document.getElementById("result");
  reporter = Reporter(document, $result);
  i = 0;
  compile = function(code) {
    var lexer, result;
    reporter.code.report(code);
    console.log("[" + i + "] code =");
    console.log(code);
    console.time("[" + i + "] tokenizer");
    lexer = tokenizer.tokenize(code);
    console.timeEnd("[" + i + "] tokenizer");
    console.time("[" + i + "] parser");
    result = parser.parse(lexer);
    console.timeEnd("[" + i + "] parser");
    console.time("[" + i + "] interpreter");
    reporter.result.report(result.accept(interpreter));
    console.timeEnd("[" + i + "] interpreter");
    return i += 1;
  };
  return $input.addEventListener("keypress", function(e) {
    if (e.keyCode !== 13) {
      return;
    }
    if (e.shiftKey) {
      return;
    }
    compile($input.value);
    $input.value = "";
    return e.preventDefault();
  });
});



},{"parser":7,"runner/reserved":19,"tokenizer":24,"visitor/interpreter":25}],2:[function(require,module,exports){
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
  },
  "STRING": "STRING"
});



},{"prefixed_kv":8}],3:[function(require,module,exports){
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
  "STRING": "STRING",
  "LINE_BREAK": "LINE_BREAK",
  "INDENT": "INDENT",
  "EOF": "EOF",
  ERROR: {
    "UNKNOWN_TOKEN": "UNKNOWN_TOKEN",
    "UNMATCHED_BRACKET": "UNMATCHED_BRACKET"
  }
});



},{"prefixed_kv":8}],4:[function(require,module,exports){
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



},{}],5:[function(require,module,exports){
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



},{}],6:[function(require,module,exports){
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



},{}],7:[function(require,module,exports){
"use strict";
var AST, TOKEN, acceptor, applicationNode, definitionNode, identifierNode, lambdaAbstractionNode, listNode, naturalNumberNode, parseApplication, parseApplicationWithBrackets, parseConstant, parseDefinition, parseExpr, parseLambdaAbstraction, parseMultiline, stringNode,
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
  return parseApplicationWithBrackets(lexer) || parseLambdaAbstraction(lexer) || parseDefinition(lexer) || parseConstant(lexer);
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

parseConstant = function(lexer) {
  var rewind, token;
  rewind = lexer.memento();
  token = lexer.next();
  switch (token.tag) {
    case TOKEN.IDENTIFIER:
      return identifierNode(token.value);
    case TOKEN.NUMBER.NATURAL:
      return naturalNumberNode(token.value);
    case TOKEN.STRING:
      return stringNode(token.value, token.text);
    default:
      return rewind();
  }
};

acceptor = function(visitor) {
  return visitor.visit(this);
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

exports.stringNode = stringNode = function(value, text) {
  return {
    tag: AST.STRING,
    value: value,
    text: text,
    accept: acceptor
  };
};



},{"AST":2,"TOKEN":3}],8:[function(require,module,exports){
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



},{}],9:[function(require,module,exports){
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



},{"runner/runner":20}],10:[function(require,module,exports){
"use strict";
var DefinitionRunner, Runner, runnerFactory,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

runnerFactory = require("runner/factory");

Runner = require("runner/runner");

module.exports = DefinitionRunner = (function(superClass) {
  extend(DefinitionRunner, superClass);

  function DefinitionRunner(interpreter, name1, body1) {
    this.name = name1;
    this.body = body1;
    DefinitionRunner.__super__.constructor.call(this, interpreter);
  }

  DefinitionRunner.prototype.toString = function() {
    return "OK: " + this.name;
  };

  return DefinitionRunner;

})(Runner);

runnerFactory.register("DEFINITION", function(interpreter, name, body) {
  return DefinitionRunner.create(interpreter, name, body);
});



},{"runner/factory":11,"runner/runner":20}],11:[function(require,module,exports){
"use strict";
var RunnerFactory, runnerFactory,
  slice = [].slice;

RunnerFactory = (function() {
  function RunnerFactory() {
    this.runners = {};
  }

  RunnerFactory.prototype.create = function() {
    var args, name;
    name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return this.runners[name].apply(this, args);
  };

  RunnerFactory.prototype.register = function(name, func) {
    return this.runners[name] = func;
  };

  return RunnerFactory;

})();

module.exports = runnerFactory = new RunnerFactory;



},{}],12:[function(require,module,exports){
"use strict";
var IdentifierRunner, Runner, runnerFactory, runners, stdlib,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

runnerFactory = require("runner/factory");

stdlib = require("visitor/stdlib");

Runner = require("runner/runner");

runners = {};

module.exports = IdentifierRunner = (function(superClass) {
  extend(IdentifierRunner, superClass);

  function IdentifierRunner(interpreter, name1) {
    this.name = name1;
    IdentifierRunner.__super__.constructor.call(this, interpreter);
  }

  IdentifierRunner.prototype.run = function(thunk) {
    var ref, ref1;
    return ((ref = runners[this.name]) != null ? ref.run(thunk) : void 0) || ((ref1 = stdlib.env[this.name]) != null ? ref1.get().run(thunk) : void 0) || thunk.get();
  };

  IdentifierRunner.prototype.toString = function() {
    return this.name;
  };

  return IdentifierRunner;

})(Runner);

runnerFactory.register("IDENTIFIER", function(interpreter, name) {
  return runners[name] || IdentifierRunner.create(interpreter, name);
});

IdentifierRunner.register = function(name, runnerProvider) {
  return runners[name] = runnerProvider.create(stdlib, name);
};



},{"runner/factory":11,"runner/runner":20,"visitor/stdlib":26}],13:[function(require,module,exports){
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



},{"runner/identifier":12,"runner/identifier/nil":14}],14:[function(require,module,exports){
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



},{"runner/identifier":12}],15:[function(require,module,exports){
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
      return NumberRunner.create(this.interpreter, Math.max(0, n.value - 1));
    }
    return (ref = this.interpreter.env[this.name]) != null ? ref.get().run(nThunk) : void 0;
  };

  return PredIdentifierRunner;

})(IdentifierRunner);

IdentifierRunner.register("pred", PredIdentifierRunner);



},{"runner/identifier":12,"runner/number":18}],16:[function(require,module,exports){
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



},{"runner/identifier":12,"runner/number":18}],17:[function(require,module,exports){
"use strict";
var LambdaAbstractionRunner, Runner, runnerFactory, toStringVisitor,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

runnerFactory = require("runner/factory");

Runner = require("runner/runner");

toStringVisitor = require("visitor/to_string_visitor").create();

module.exports = LambdaAbstractionRunner = (function(superClass) {
  extend(LambdaAbstractionRunner, superClass);

  function LambdaAbstractionRunner(interpreter, arg1, body1) {
    this.arg = arg1;
    this.body = body1;
    LambdaAbstractionRunner.__super__.constructor.call(this, interpreter);
  }

  LambdaAbstractionRunner.prototype.run = function(thunk) {
    var i;
    i = this.interpreter.createChild();
    i.env[this.arg] = thunk;
    return this.body.accept(i);
  };

  LambdaAbstractionRunner.prototype.toString = function() {
    return "\\" + this.arg + "." + (this.body.accept(toStringVisitor));
  };

  return LambdaAbstractionRunner;

})(Runner);

runnerFactory.register("LAMBDA_ABSTRACTION", function(interpreter, arg, body) {
  return LambdaAbstractionRunner.create(interpreter, arg, body);
});



},{"runner/factory":11,"runner/runner":20,"visitor/to_string_visitor":27}],18:[function(require,module,exports){
"use strict";
var BradeRunner, FutureEval, NumberRunner, Runner, runnerFactory,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

runnerFactory = require("runner/factory");

Runner = require("runner/runner");

BradeRunner = require("runner/brade");

FutureEval = require("future_eval");

module.exports = NumberRunner = (function(superClass) {
  extend(NumberRunner, superClass);

  function NumberRunner(interpreter, value1) {
    this.value = value1;
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

runnerFactory.register("NUMBER", function(interpreter, value) {
  return NumberRunner.create(interpreter, value);
});



},{"future_eval":5,"runner/brade":9,"runner/factory":11,"runner/runner":20}],19:[function(require,module,exports){
"use strict";
require("runner/lambda_abstraction");

require("runner/definition");

require("runner/identifier");

require("runner/number");

require("runner/string");

require("runner/identifier/succ");

require("runner/identifier/pred");

require("runner/identifier/nil");

require("runner/identifier/isnil");

require("runner/symbol/plus");

require("runner/symbol/mult");



},{"runner/definition":10,"runner/identifier":12,"runner/identifier/isnil":13,"runner/identifier/nil":14,"runner/identifier/pred":15,"runner/identifier/succ":16,"runner/lambda_abstraction":17,"runner/number":18,"runner/string":21,"runner/symbol/mult":22,"runner/symbol/plus":23}],20:[function(require,module,exports){
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



},{}],21:[function(require,module,exports){
"use strict";
var FutureEval, NumberRunner, Runner, StringRunner, runnerFactory,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

runnerFactory = require("runner/factory");

Runner = require("runner/runner");

NumberRunner = require("runner/number");

FutureEval = require("future_eval");

module.exports = StringRunner = (function(superClass) {
  extend(StringRunner, superClass);

  function StringRunner(interpreter, text1) {
    this.text = text1;
    StringRunner.__super__.constructor.call(this, interpreter);
  }

  StringRunner.prototype.run = function(pThunk) {
    var i, t;
    i = this.interpreter;
    t = this.text;
    if (t === "") {
      return this;
    }
    return pThunk.get().run(FutureEval.createWithGetter(function() {
      return NumberRunner.create(i, t.charCodeAt(0));
    })).run(FutureEval.createWithGetter(function() {
      return StringRunner.create(i, t.slice(1));
    }));
  };

  StringRunner.prototype.toString = function() {
    return "\"" + this.text + "\"";
  };

  return StringRunner;

})(Runner);

runnerFactory.register("STRING", function(interpreter, text) {
  return StringRunner.create(interpreter, text);
});



},{"future_eval":5,"runner/factory":11,"runner/number":18,"runner/runner":20}],22:[function(require,module,exports){
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



},{"runner/brade":9,"runner/identifier":12,"runner/number":18}],23:[function(require,module,exports){
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



},{"runner/brade":9,"runner/identifier":12,"runner/number":18}],24:[function(require,module,exports){
"use strict";
var COMMENT_LONG, COMMENT_ONELINE, ERROR, IDENTIFIER, LITERAL_CHAR, LITERAL_CHAR2, LITERAL_CLOSER, LITERAL_OPENER, MULTI_DENT, NATURAL_NUMBER, STRING, TOKEN, WHITESPACE, cleanCode, commentToken, errorToken, identifierToken, lineToken, literalToken, mementoContainer, naturalNumberToken, stringToken, updateLocation, whitespaceToken;

TOKEN = require("TOKEN");

mementoContainer = require("memento_container");

exports.tokenize = function(code) {
  var addToken, brackets, column, consumed, context, i, latestBracket, line, popBracket, pushBracket, ref, tokens;
  code = cleanCode(code);
  tokens = [];
  line = 0;
  column = 0;
  brackets = [];
  addToken = function(tag, value, length, token) {
    if (length == null) {
      length = value.length;
    }
    if (token == null) {
      token = {};
    }
    token.tag = tag;
    token.value = value;
    token.line = line;
    token.column = column;
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
    consumed = commentToken(context) || whitespaceToken(context) || lineToken(context) || literalToken(context) || identifierToken(context) || naturalNumberToken(context) || stringToken(context) || errorToken(context);
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
  return c.addToken(TOKEN.IDENTIFIER, match[0]);
};

NATURAL_NUMBER = /^(?:0|[1-9]\d*)(?![_a-zA-Z])/;

naturalNumberToken = function(c) {
  var match;
  if (!(match = c.chunk.match(NATURAL_NUMBER))) {
    return 0;
  }
  return c.addToken(TOKEN.NUMBER.NATURAL, match[0]);
};

STRING = /^(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/;

stringToken = function(c) {
  var match, s;
  if (!(match = c.chunk.match(STRING))) {
    return 0;
  }
  s = match[0];
  return c.addToken(TOKEN.STRING, s, s.length, {
    text: eval(s)
  });
};

ERROR = /^\S+/;

errorToken = function(c) {
  var match;
  if (!(match = c.chunk.match(ERROR))) {
    return 0;
  }
  return c.addToken(TOKEN.ERROR.UNKNOWN_TOKEN, match[0]);
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



},{"TOKEN":3,"memento_container":6}],25:[function(require,module,exports){
"use strict";
var AST, CREATE_CHILD_KEY, EnvManager, FutureEval, Interpreter, Visitor, envManager, runnerFactory,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AST = require("AST");

FutureEval = require("future_eval");

EnvManager = require("env_manager");

CREATE_CHILD_KEY = EnvManager.CREATE_CHILD_KEY;

envManager = EnvManager.create();

Visitor = require("visitor/visitor");

runnerFactory = require("runner/factory");

module.exports = Interpreter = (function(superClass) {
  extend(Interpreter, superClass);

  function Interpreter(env1) {
    this.env = env1 != null ? env1 : envManager.getGlobal();
    void 0;
  }

  Interpreter.prototype.createChild = function() {
    return new Interpreter(this.env[CREATE_CHILD_KEY]());
  };

  return Interpreter;

})(Visitor);

Interpreter.create = function(env) {
  if (env == null) {
    env = envManager.getGlobal();
  }
  return Visitor.create.call(this, env);
};

Interpreter.registerVisit(AST.LIST, function(node) {
  var self;
  self = this;
  return node.exprs.map(function(expr) {
    return "" + (expr.accept(self));
  }).join("\n");
});

Interpreter.registerVisit(AST.APPLICATION, function(node) {
  return node.left.accept(this).run(FutureEval.create(node.right, this));
});

Interpreter.registerVisit(AST.LAMBDA_ABSTRACTION, function(node) {
  return runnerFactory.create("LAMBDA_ABSTRACTION", this, node.arg, node.body);
});

Interpreter.registerVisit(AST.DEFINITION, function(node) {
  this.env[node.name] = FutureEval.create(node.body, this);
  return runnerFactory.create("DEFINITION", this, node.name, node.body);
});

Interpreter.registerVisit(AST.IDENTIFIER, function(node) {
  var ref;
  return ((ref = this.env[node.name]) != null ? ref.get() : void 0) || runnerFactory.create("IDENTIFIER", this, node.name);
});

Interpreter.registerVisit(AST.NUMBER.NATURAL, function(node) {
  return runnerFactory.create("NUMBER", this, node.value);
});

Interpreter.registerVisit(AST.STRING, function(node) {
  return runnerFactory.create("STRING", this, node.text);
});



},{"AST":2,"env_manager":4,"future_eval":5,"runner/factory":11,"visitor/visitor":28}],26:[function(require,module,exports){
"use strict";
var AST, CREATE_CHILD_KEY, EnvManager, Interpreter, Stdlib, codes, envManager, global, parser, runnerFactory, stdlib, stdlibEnv, tokenizer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AST = require("AST");

Interpreter = require("visitor/interpreter");

EnvManager = require("env_manager");

CREATE_CHILD_KEY = EnvManager.CREATE_CHILD_KEY;

envManager = EnvManager.create();

global = envManager.getGlobal();

stdlibEnv = global[CREATE_CHILD_KEY]();

stdlibEnv[CREATE_CHILD_KEY] = function() {
  return global[CREATE_CHILD_KEY]();
};

runnerFactory = require("runner/factory");

Stdlib = (function(superClass) {
  extend(Stdlib, superClass);

  function Stdlib() {
    return Stdlib.__super__.constructor.apply(this, arguments);
  }

  return Stdlib;

})(Interpreter);

Stdlib.registerVisit(AST.IDENTIFIER, function(node) {
  return runnerFactory.create("IDENTIFIER", this, node.name);
});

module.exports = stdlib = Stdlib.create(stdlibEnv);

tokenizer = require("tokenizer");

parser = require("parser");

codes = ["succ   := \\n f x.f (n f x)", "pred   := \\n f x.n (\\g h.h (g f)) (\\u.x) (\\v.v)", "+      := \\m n f x.m f (n f x)", "*      := \\m n f.m (n f)", "sub    := \\m n.n pred m", "div    := \\n.Y (\\f q m n.(s := sub m n) isZero s q (f (succ q) s n)) 0 (succ n)", "true   := \\x y.x", "false  := \\x y.y", "and    := \\p q.p q false", "or     := \\p q.p true q", "not    := \\p x y.p y x", "if     := \\p x y.p x y", "isZero := \\n.n (\\x.false) true", "pair   := \\a b p.p a b", "first  := \\p.p true", "second := \\p.p false", "cons   := pair", "head   := first", "tail   := second", "list   := Y (\\f A m.isnil m (A m) (f (\\x.A (cons m x)))) (\\u.u)", "Y      := \\f.(\\x.f (x x)) (\\x.f (x x))", "K      := \\x y.x", "S      := \\x y z.x z (y z)", "I      := \\x.x", "X      := \\x.x S K", "fact   := Y (\\f r n.isZero n r (f (* r n) (pred n))) 1"];

parser.parse(tokenizer.tokenize(codes.join("\n"))).accept(stdlib);



},{"AST":2,"env_manager":4,"parser":7,"runner/factory":11,"tokenizer":24,"visitor/interpreter":25}],27:[function(require,module,exports){
"use strict";
var AST, ToStringVisitor, Visitor,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AST = require("AST");

Visitor = require("visitor/visitor");

module.exports = ToStringVisitor = (function(superClass) {
  extend(ToStringVisitor, superClass);

  function ToStringVisitor() {
    return ToStringVisitor.__super__.constructor.apply(this, arguments);
  }

  return ToStringVisitor;

})(Visitor);

ToStringVisitor.registerVisit(AST.LIST, function(node) {
  var self;
  self = this;
  return node.exprs.map(function(expr) {
    return expr.accept(self);
  }).join("\n");
});

ToStringVisitor.registerVisit(AST.APPLICATION, function(node) {
  return "(" + (node.left.accept(this)) + " " + (node.right.accept(this)) + ")";
});

ToStringVisitor.registerVisit(AST.LAMBDA_ABSTRACTION, function(node) {
  return "(\\" + node.arg + "." + (node.body.accept(this)) + ")";
});

ToStringVisitor.registerVisit(AST.DEFINITION, function(node) {
  return "(" + node.name + " := " + (node.body.accept(this)) + ")";
});

ToStringVisitor.registerVisit(AST.IDENTIFIER, function(node) {
  return node.name;
});

ToStringVisitor.registerVisit(AST.NUMBER.NATURAL, function(node) {
  return node.value;
});

ToStringVisitor.registerVisit(AST.STRING, function(node) {
  return node.value;
});



},{"AST":2,"visitor/visitor":28}],28:[function(require,module,exports){
"use strict";
var AST, Visitor,
  slice = [].slice;

AST = require("AST");

module.exports = Visitor = (function() {
  function Visitor() {
    void 0;
  }

  Visitor.prototype.visit = function(node) {
    return this["visit_" + node.tag](node);
  };

  return Visitor;

})();

Visitor.registerVisit = function(tag, func) {
  return this.prototype["visit_" + tag] = func;
};

Visitor.create = function() {
  return new (Function.prototype.bind.apply(this, [this].concat(slice.call(arguments))));
};



},{"AST":2}]},{},[1])