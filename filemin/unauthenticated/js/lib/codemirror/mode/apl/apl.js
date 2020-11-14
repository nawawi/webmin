// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("apl", function() {
  var builtInOps = {
    ".": "innerProduct",
    "\\": "scan",
    "/": "reduce",
    "â¿": "reduce1Axis",
    "â": "scan1Axis",
    "Â¨": "each",
    "â£": "power"
  };
  var builtInFuncs = {
    "+": ["conjugate", "add"],
    "â": ["negate", "subtract"],
    "Ã": ["signOf", "multiply"],
    "Ã·": ["reciprocal", "divide"],
    "â": ["ceiling", "greaterOf"],
    "â": ["floor", "lesserOf"],
    "â£": ["absolute", "residue"],
    "â³": ["indexGenerate", "indexOf"],
    "?": ["roll", "deal"],
    "â": ["exponentiate", "toThePowerOf"],
    "â": ["naturalLog", "logToTheBase"],
    "â": ["piTimes", "circularFuncs"],
    "!": ["factorial", "binomial"],
    "â¹": ["matrixInverse", "matrixDivide"],
    "<": [null, "lessThan"],
    "â¤": [null, "lessThanOrEqual"],
    "=": [null, "equals"],
    ">": [null, "greaterThan"],
    "â¥": [null, "greaterThanOrEqual"],
    "â ": [null, "notEqual"],
    "â¡": ["depth", "match"],
    "â¢": [null, "notMatch"],
    "â": ["enlist", "membership"],
    "â·": [null, "find"],
    "âª": ["unique", "union"],
    "â©": [null, "intersection"],
    "â¼": ["not", "without"],
    "â¨": [null, "or"],
    "â§": [null, "and"],
    "â±": [null, "nor"],
    "â²": [null, "nand"],
    "â´": ["shapeOf", "reshape"],
    ",": ["ravel", "catenate"],
    "âª": [null, "firstAxisCatenate"],
    "â½": ["reverse", "rotate"],
    "â": ["axis1Reverse", "axis1Rotate"],
    "â": ["transpose", null],
    "â": ["first", "take"],
    "â": [null, "drop"],
    "â": ["enclose", "partitionWithAxis"],
    "â": ["diclose", "pick"],
    "â·": [null, "index"],
    "â": ["gradeUp", null],
    "â": ["gradeDown", null],
    "â¤": ["encode", null],
    "â¥": ["decode", null],
    "â": ["format", "formatByExample"],
    "â": ["execute", null],
    "â£": ["stop", "left"],
    "â¢": ["pass", "right"]
  };

  var isOperator = /[\.\/â¿âÂ¨â£]/;
  var isNiladic = /â¬/;
  var isFunction = /[\+âÃÃ·âââ£â³\?âââ!â¹<â¤=>â¥â â¡â¢ââ·âªâ©â¼â¨â§â±â²â´,âªâ½âââââââ·âââ¤â¥âââ£â¢]/;
  var isArrow = /â/;
  var isComment = /[â#].*$/;

  var stringEater = function(type) {
    var prev;
    prev = false;
    return function(c) {
      prev = c;
      if (c === type) {
        return prev === "\\";
      }
      return true;
    };
  };
  return {
    startState: function() {
      return {
        prev: false,
        func: false,
        op: false,
        string: false,
        escape: false
      };
    },
    token: function(stream, state) {
      var ch, funcName;
      if (stream.eatSpace()) {
        return null;
      }
      ch = stream.next();
      if (ch === '"' || ch === "'") {
        stream.eatWhile(stringEater(ch));
        stream.next();
        state.prev = true;
        return "string";
      }
      if (/[\[{\(]/.test(ch)) {
        state.prev = false;
        return null;
      }
      if (/[\]}\)]/.test(ch)) {
        state.prev = true;
        return null;
      }
      if (isNiladic.test(ch)) {
        state.prev = false;
        return "niladic";
      }
      if (/[Â¯\d]/.test(ch)) {
        if (state.func) {
          state.func = false;
          state.prev = false;
        } else {
          state.prev = true;
        }
        stream.eatWhile(/[\w\.]/);
        return "number";
      }
      if (isOperator.test(ch)) {
        return "operator apl-" + builtInOps[ch];
      }
      if (isArrow.test(ch)) {
        return "apl-arrow";
      }
      if (isFunction.test(ch)) {
        funcName = "apl-";
        if (builtInFuncs[ch] != null) {
          if (state.prev) {
            funcName += builtInFuncs[ch][1];
          } else {
            funcName += builtInFuncs[ch][0];
          }
        }
        state.func = true;
        state.prev = false;
        return "function " + funcName;
      }
      if (isComment.test(ch)) {
        stream.skipToEnd();
        return "comment";
      }
      if (ch === "â" && stream.peek() === ".") {
        stream.next();
        return "function jot-dot";
      }
      stream.eatWhile(/[\w\$_]/);
      state.prev = true;
      return "keyword";
    }
  };
});

CodeMirror.defineMIME("text/apl", "apl");

});
