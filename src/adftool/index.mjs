
var Module = (() => {
  var _scriptDir = import.meta.url;
  
  return (
async function(moduleArg = {}) {

var Module = moduleArg;

var readyPromiseResolve, readyPromiseReject;

Module["ready"] = new Promise((resolve, reject) => {
 readyPromiseResolve = resolve;
 readyPromiseReject = reject;
});

var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
 throw toThrow;
};

var ENVIRONMENT_IS_WEB = typeof window == "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";

var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 }
 return scriptDirectory + path;
}

var read_, readAsync, readBinary, setWindowTitle;

if (ENVIRONMENT_IS_NODE) {
 const {createRequire: createRequire} = await import("module");
 var require = createRequire(import.meta.url);
 var fs = require("fs");
 var nodePath = require("path");
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = nodePath.dirname(scriptDirectory) + "/";
 } else {
  scriptDirectory = require("url").fileURLToPath(new URL("./", import.meta.url));
 }
 read_ = (filename, binary) => {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
   return binary ? ret : ret.toString();
  }
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  return fs.readFileSync(filename, binary ? undefined : "utf8");
 };
 readBinary = filename => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  return ret;
 };
 readAsync = (filename, onload, onerror, binary = true) => {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
   onload(ret);
  }
  filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
  fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
   if (err) onerror(err); else onload(binary ? data.buffer : data);
  });
 };
 if (!Module["thisProgram"] && process.argv.length > 1) {
  thisProgram = process.argv[1].replace(/\\/g, "/");
 }
 arguments_ = process.argv.slice(2);
 quit_ = (status, toThrow) => {
  process.exitCode = status;
  throw toThrow;
 };
 Module["inspect"] = () => "[Emscripten Module object]";
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (typeof document != "undefined" && document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (_scriptDir) {
  scriptDirectory = _scriptDir;
 }
 if (scriptDirectory.indexOf("blob:") !== 0) {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
 } else {
  scriptDirectory = "";
 }
 {
  read_ = url => {
   try {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    return xhr.responseText;
   } catch (err) {
    var data = tryParseAsDataURI(url);
    if (data) {
     return intArrayToString(data);
    }
    throw err;
   }
  };
  if (ENVIRONMENT_IS_WORKER) {
   readBinary = url => {
    try {
     var xhr = new XMLHttpRequest();
     xhr.open("GET", url, false);
     xhr.responseType = "arraybuffer";
     xhr.send(null);
     return new Uint8Array(xhr.response);
    } catch (err) {
     var data = tryParseAsDataURI(url);
     if (data) {
      return data;
     }
     throw err;
    }
   };
  }
  readAsync = (url, onload, onerror) => {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, true);
   xhr.responseType = "arraybuffer";
   xhr.onload = () => {
    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
     onload(xhr.response);
     return;
    }
    var data = tryParseAsDataURI(url);
    if (data) {
     onload(data.buffer);
     return;
    }
    onerror();
   };
   xhr.onerror = onerror;
   xhr.send(null);
  };
 }
 setWindowTitle = title => document.title = title;
} else {}

var out = Module["print"] || console.log.bind(console);

var err = Module["printErr"] || console.error.bind(console);

Object.assign(Module, moduleOverrides);

moduleOverrides = null;

if (Module["arguments"]) arguments_ = Module["arguments"];

if (Module["thisProgram"]) thisProgram = Module["thisProgram"];

if (Module["quit"]) quit_ = Module["quit"];

var wasmBinary;

if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];

var noExitRuntime = Module["noExitRuntime"] || true;

if (typeof WebAssembly != "object") {
 abort("no native wasm support detected");
}

var wasmMemory;

var ABORT = false;

var EXITSTATUS;

function assert(condition, text) {
 if (!condition) {
  abort(text);
 }
}

var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateMemoryViews() {
 var b = wasmMemory.buffer;
 Module["HEAP8"] = HEAP8 = new Int8Array(b);
 Module["HEAP16"] = HEAP16 = new Int16Array(b);
 Module["HEAP32"] = HEAP32 = new Int32Array(b);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
}

var wasmTable;

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
 return noExitRuntime || runtimeKeepaliveCounter > 0;
}

function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
 runtimeInitialized = true;
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
 FS.ignorePermissions = false;
 TTY.init();
 callRuntimeCallbacks(__ATINIT__);
}

function postRun() {
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
 __ATINIT__.unshift(cb);
}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
 return id;
}

function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
}

function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

function abort(what) {
 if (Module["onAbort"]) {
  Module["onAbort"](what);
 }
 what = "Aborted(" + what + ")";
 err(what);
 ABORT = true;
 EXITSTATUS = 1;
 what += ". Build with -sASSERTIONS for more info.";
 var e = new WebAssembly.RuntimeError(what);
 readyPromiseReject(e);
 throw e;
}

var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
 return filename.startsWith(dataURIPrefix);
}

function isFileURI(filename) {
 return filename.startsWith("file://");
}

var wasmBinaryFile;


if (!isDataURI(wasmBinaryFile)) {
 wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary(file) {
 try {
  if (file == wasmBinaryFile && wasmBinary) {
   return new Uint8Array(wasmBinary);
  }
  var binary = tryParseAsDataURI(file);
  if (binary) {
   return binary;
  }
  if (readBinary) {
   return readBinary(file);
  }
  throw "both async and sync fetching of the wasm failed";
 } catch (err) {
  abort(err);
 }
}

function getBinaryPromise(binaryFile) {
 if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
  if (typeof fetch == "function" && !isFileURI(binaryFile)) {
   return fetch(binaryFile, {
    credentials: "same-origin"
   }).then(response => {
    if (!response["ok"]) {
     throw "failed to load wasm binary file at '" + binaryFile + "'";
    }
    return response["arrayBuffer"]();
   }).catch(() => getBinary(binaryFile));
  } else {
   if (readAsync) {
    return new Promise((resolve, reject) => {
     readAsync(binaryFile, response => resolve(new Uint8Array(response)), reject);
    });
   }
  }
 }
 return Promise.resolve().then(() => getBinary(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
 return getBinaryPromise(binaryFile).then(binary => {
  return WebAssembly.instantiate(binary, imports);
 }).then(instance => {
  return instance;
 }).then(receiver, reason => {
  err("failed to asynchronously prepare wasm: " + reason);
  abort(reason);
 });
}

function instantiateAsync(binary, binaryFile, imports, callback) {
 if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
  return fetch(binaryFile, {
   credentials: "same-origin"
  }).then(response => {
   var result = WebAssembly.instantiateStreaming(response, imports);
   return result.then(callback, function(reason) {
    err("wasm streaming compile failed: " + reason);
    err("falling back to ArrayBuffer instantiation");
    return instantiateArrayBuffer(binaryFile, imports, callback);
   });
  });
 } else {
  return instantiateArrayBuffer(binaryFile, imports, callback);
 }
}

function createWasm() {
 var info = {
  "a": wasmImports
 };
 function receiveInstance(instance, module) {
  var exports = instance.exports;
  Module["asm"] = exports;
  wasmMemory = Module["asm"]["M"];
  updateMemoryViews();
  wasmTable = Module["asm"]["Rb"];
  addOnInit(Module["asm"]["N"]);
  removeRunDependency("wasm-instantiate");
  return exports;
 }
 addRunDependency("wasm-instantiate");
 function receiveInstantiationResult(result) {
  receiveInstance(result["instance"]);
 }
 if (Module["instantiateWasm"]) {
  try {
   return Module["instantiateWasm"](info, receiveInstance);
  } catch (e) {
   err("Module.instantiateWasm callback failed with error: " + e);
   readyPromiseReject(e);
  }
 }
 instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(readyPromiseReject);
 return {};
}

var tempDouble;

var tempI64;

function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = `Program terminated with exit(${status})`;
 this.status = status;
}

Module["ExitStatus"] = ExitStatus;

var callRuntimeCallbacks = callbacks => {
 while (callbacks.length > 0) {
  callbacks.shift()(Module);
 }
};

Module["callRuntimeCallbacks"] = callRuntimeCallbacks;

function getValue(ptr, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  return HEAP8[ptr >> 0];

 case "i8":
  return HEAP8[ptr >> 0];

 case "i16":
  return HEAP16[ptr >> 1];

 case "i32":
  return HEAP32[ptr >> 2];

 case "i64":
  abort("to do getValue(i64) use WASM_BIGINT");

 case "float":
  return HEAPF32[ptr >> 2];

 case "double":
  return HEAPF64[ptr >> 3];

 case "*":
  return HEAPU32[ptr >> 2];

 default:
  abort(`invalid type for getValue: ${type}`);
 }
}

Module["getValue"] = getValue;

function intArrayToString(array) {
 var ret = [];
 for (var i = 0; i < array.length; i++) {
  var chr = array[i];
  if (chr > 255) {
   chr &= 255;
  }
  ret.push(String.fromCharCode(chr));
 }
 return ret.join("");
}

Module["intArrayToString"] = intArrayToString;

function setValue(ptr, value, type = "i8") {
 if (type.endsWith("*")) type = "*";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;

 case "i8":
  HEAP8[ptr >> 0] = value;
  break;

 case "i16":
  HEAP16[ptr >> 1] = value;
  break;

 case "i32":
  HEAP32[ptr >> 2] = value;
  break;

 case "i64":
  abort("to do setValue(i64) use WASM_BIGINT");

 case "float":
  HEAPF32[ptr >> 2] = value;
  break;

 case "double":
  HEAPF64[ptr >> 3] = value;
  break;

 case "*":
  HEAPU32[ptr >> 2] = value;
  break;

 default:
  abort(`invalid type for setValue: ${type}`);
 }
}

Module["setValue"] = setValue;

var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

Module["UTF8Decoder"] = UTF8Decoder;

var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
  return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
 }
 var str = "";
 while (idx < endPtr) {
  var u0 = heapOrArray[idx++];
  if (!(u0 & 128)) {
   str += String.fromCharCode(u0);
   continue;
  }
  var u1 = heapOrArray[idx++] & 63;
  if ((u0 & 224) == 192) {
   str += String.fromCharCode((u0 & 31) << 6 | u1);
   continue;
  }
  var u2 = heapOrArray[idx++] & 63;
  if ((u0 & 240) == 224) {
   u0 = (u0 & 15) << 12 | u1 << 6 | u2;
  } else {
   u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
  }
  if (u0 < 65536) {
   str += String.fromCharCode(u0);
  } else {
   var ch = u0 - 65536;
   str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
  }
 }
 return str;
};

Module["UTF8ArrayToString"] = UTF8ArrayToString;

var UTF8ToString = (ptr, maxBytesToRead) => {
 return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
};

Module["UTF8ToString"] = UTF8ToString;

var ___assert_fail = (condition, filename, line, func) => {
 abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
};

Module["___assert_fail"] = ___assert_fail;

var wasmTableMirror = [];

Module["wasmTableMirror"] = wasmTableMirror;

var getWasmTableEntry = funcPtr => {
 var func = wasmTableMirror[funcPtr];
 if (!func) {
  if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
  wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
 }
 return func;
};

Module["getWasmTableEntry"] = getWasmTableEntry;

var ___call_sighandler = (fp, sig) => getWasmTableEntry(fp)(sig);

Module["___call_sighandler"] = ___call_sighandler;

var PATH = {
 isAbs: path => path.charAt(0) === "/",
 splitPath: filename => {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 },
 normalizeArray: (parts, allowAboveRoot) => {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (;up; up--) {
    parts.unshift("..");
   }
  }
  return parts;
 },
 normalize: path => {
  var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 },
 dirname: path => {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 },
 basename: path => {
  if (path === "/") return "/";
  path = PATH.normalize(path);
  path = path.replace(/\/$/, "");
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 },
 join: function() {
  var paths = Array.prototype.slice.call(arguments);
  return PATH.normalize(paths.join("/"));
 },
 join2: (l, r) => {
  return PATH.normalize(l + "/" + r);
 }
};

Module["PATH"] = PATH;

var initRandomFill = () => {
 if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
  return view => crypto.getRandomValues(view);
 } else if (ENVIRONMENT_IS_NODE) {
  try {
   var crypto_module = require("crypto");
   var randomFillSync = crypto_module["randomFillSync"];
   if (randomFillSync) {
    return view => crypto_module["randomFillSync"](view);
   }
   var randomBytes = crypto_module["randomBytes"];
   return view => (view.set(randomBytes(view.byteLength)), view);
  } catch (e) {}
 }
 abort("initRandomDevice");
};

Module["initRandomFill"] = initRandomFill;

var randomFill = view => {
 return (randomFill = initRandomFill())(view);
};

Module["randomFill"] = randomFill;

var PATH_FS = {
 resolve: function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = i >= 0 ? arguments[i] : FS.cwd();
   if (typeof path != "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = PATH.isAbs(path);
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
 },
 relative: (from, to) => {
  from = PATH_FS.resolve(from).substr(1);
  to = PATH_FS.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (;start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (;end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 }
};

Module["PATH_FS"] = PATH_FS;

var lengthBytesUTF8 = str => {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var c = str.charCodeAt(i);
  if (c <= 127) {
   len++;
  } else if (c <= 2047) {
   len += 2;
  } else if (c >= 55296 && c <= 57343) {
   len += 4;
   ++i;
  } else {
   len += 3;
  }
 }
 return len;
};

Module["lengthBytesUTF8"] = lengthBytesUTF8;

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | u1 & 1023;
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   heap[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   heap[outIdx++] = 192 | u >> 6;
   heap[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   heap[outIdx++] = 224 | u >> 12;
   heap[outIdx++] = 128 | u >> 6 & 63;
   heap[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 3 >= endIdx) break;
   heap[outIdx++] = 240 | u >> 18;
   heap[outIdx++] = 128 | u >> 12 & 63;
   heap[outIdx++] = 128 | u >> 6 & 63;
   heap[outIdx++] = 128 | u & 63;
  }
 }
 heap[outIdx] = 0;
 return outIdx - startIdx;
};

Module["stringToUTF8Array"] = stringToUTF8Array;

function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

Module["intArrayFromString"] = intArrayFromString;

var TTY = {
 ttys: [],
 init: function() {},
 shutdown: function() {},
 register: function(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 },
 stream_ops: {
  open: function(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(43);
   }
   stream.tty = tty;
   stream.seekable = false;
  },
  close: function(stream) {
   stream.tty.ops.fsync(stream.tty);
  },
  fsync: function(stream) {
   stream.tty.ops.fsync(stream.tty);
  },
  read: function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(60);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(29);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(6);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  },
  write: function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(60);
   }
   try {
    for (var i = 0; i < length; i++) {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    }
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  }
 },
 default_tty_ops: {
  get_char: function(tty) {
   if (!tty.input.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
     var BUFSIZE = 256;
     var buf = Buffer.alloc(BUFSIZE);
     var bytesRead = 0;
     try {
      bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
     } catch (e) {
      if (e.toString().includes("EOF")) bytesRead = 0; else throw e;
     }
     if (bytesRead > 0) {
      result = buf.slice(0, bytesRead).toString("utf-8");
     } else {
      result = null;
     }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
     result = window.prompt("Input: ");
     if (result !== null) {
      result += "\n";
     }
    } else if (typeof readline == "function") {
     result = readline();
     if (result !== null) {
      result += "\n";
     }
    }
    if (!result) {
     return null;
    }
    tty.input = intArrayFromString(result, true);
   }
   return tty.input.shift();
  },
  put_char: function(tty, val) {
   if (val === null || val === 10) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  fsync: function(tty) {
   if (tty.output && tty.output.length > 0) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  },
  ioctl_tcgets: function(tty) {
   return {
    c_iflag: 25856,
    c_oflag: 5,
    c_cflag: 191,
    c_lflag: 35387,
    c_cc: [ 3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
   };
  },
  ioctl_tcsets: function(tty, optional_actions, data) {
   return 0;
  },
  ioctl_tiocgwinsz: function(tty) {
   return [ 24, 80 ];
  }
 },
 default_tty1_ops: {
  put_char: function(tty, val) {
   if (val === null || val === 10) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  fsync: function(tty) {
   if (tty.output && tty.output.length > 0) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 }
};

Module["TTY"] = TTY;

var zeroMemory = (address, size) => {
 HEAPU8.fill(0, address, address + size);
 return address;
};

Module["zeroMemory"] = zeroMemory;

var alignMemory = (size, alignment) => {
 return Math.ceil(size / alignment) * alignment;
};

Module["alignMemory"] = alignMemory;

var mmapAlloc = size => {
 abort();
};

Module["mmapAlloc"] = mmapAlloc;

var MEMFS = {
 ops_table: null,
 mount: function(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, 0);
 },
 createNode: function(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(63);
  }
  if (!MEMFS.ops_table) {
   MEMFS.ops_table = {
    dir: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      lookup: MEMFS.node_ops.lookup,
      mknod: MEMFS.node_ops.mknod,
      rename: MEMFS.node_ops.rename,
      unlink: MEMFS.node_ops.unlink,
      rmdir: MEMFS.node_ops.rmdir,
      readdir: MEMFS.node_ops.readdir,
      symlink: MEMFS.node_ops.symlink
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek
     }
    },
    file: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek,
      read: MEMFS.stream_ops.read,
      write: MEMFS.stream_ops.write,
      allocate: MEMFS.stream_ops.allocate,
      mmap: MEMFS.stream_ops.mmap,
      msync: MEMFS.stream_ops.msync
     }
    },
    link: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      readlink: MEMFS.node_ops.readlink
     },
     stream: {}
    },
    chrdev: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: FS.chrdev_stream_ops
    }
   };
  }
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
   parent.timestamp = node.timestamp;
  }
  return node;
 },
 getFileDataAsTypedArray: function(node) {
  if (!node.contents) return new Uint8Array(0);
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 },
 expandFileStorage: function(node, newCapacity) {
  var prevCapacity = node.contents ? node.contents.length : 0;
  if (prevCapacity >= newCapacity) return;
  var CAPACITY_DOUBLING_MAX = 1024 * 1024;
  newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
  if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
  var oldContents = node.contents;
  node.contents = new Uint8Array(newCapacity);
  if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
 },
 resizeFileStorage: function(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
  } else {
   var oldContents = node.contents;
   node.contents = new Uint8Array(newSize);
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
  }
 },
 node_ops: {
  getattr: function(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  },
  setattr: function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  },
  lookup: function(parent, name) {
   throw FS.genericErrors[44];
  },
  mknod: function(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  },
  rename: function(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(55);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.parent.timestamp = Date.now();
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   new_dir.timestamp = old_node.parent.timestamp;
   old_node.parent = new_dir;
  },
  unlink: function(parent, name) {
   delete parent.contents[name];
   parent.timestamp = Date.now();
  },
  rmdir: function(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(55);
   }
   delete parent.contents[name];
   parent.timestamp = Date.now();
  },
  readdir: function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  },
  symlink: function(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
   node.link = oldpath;
   return node;
  },
  readlink: function(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(28);
   }
   return node.link;
  }
 },
 stream_ops: {
  read: function(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  },
  write: function(stream, buffer, offset, length, position, canOwn) {
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = buffer.slice(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) {
    node.contents.set(buffer.subarray(offset, offset + length), position);
   } else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  },
  llseek: function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(28);
   }
   return position;
  },
  allocate: function(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  },
  mmap: function(stream, length, position, prot, flags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(43);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < contents.length) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    ptr = mmapAlloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(48);
    }
    HEAP8.set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  },
  msync: function(stream, buffer, offset, length, mmapFlags) {
   MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  }
 }
};

Module["MEMFS"] = MEMFS;

var asyncLoad = (url, onload, onerror, noRunDep) => {
 var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
 readAsync(url, arrayBuffer => {
  assert(arrayBuffer, `Loading data file "${url}" failed (no arrayBuffer).`);
  onload(new Uint8Array(arrayBuffer));
  if (dep) removeRunDependency(dep);
 }, event => {
  if (onerror) {
   onerror();
  } else {
   throw `Loading data file "${url}" failed.`;
  }
 });
 if (dep) addRunDependency(dep);
};

Module["asyncLoad"] = asyncLoad;

var preloadPlugins = Module["preloadPlugins"] || [];

Module["preloadPlugins"] = preloadPlugins;

function FS_handledByPreloadPlugin(byteArray, fullname, finish, onerror) {
 if (typeof Browser != "undefined") Browser.init();
 var handled = false;
 preloadPlugins.forEach(function(plugin) {
  if (handled) return;
  if (plugin["canHandle"](fullname)) {
   plugin["handle"](byteArray, fullname, finish, onerror);
   handled = true;
  }
 });
 return handled;
}

Module["FS_handledByPreloadPlugin"] = FS_handledByPreloadPlugin;

function FS_createPreloadedFile(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
 var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
 var dep = getUniqueRunDependency(`cp ${fullname}`);
 function processData(byteArray) {
  function finish(byteArray) {
   if (preFinish) preFinish();
   if (!dontCreateFile) {
    FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
   }
   if (onload) onload();
   removeRunDependency(dep);
  }
  if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
   if (onerror) onerror();
   removeRunDependency(dep);
  })) {
   return;
  }
  finish(byteArray);
 }
 addRunDependency(dep);
 if (typeof url == "string") {
  asyncLoad(url, byteArray => processData(byteArray), onerror);
 } else {
  processData(url);
 }
}

Module["FS_createPreloadedFile"] = FS_createPreloadedFile;

function FS_modeStringToFlags(str) {
 var flagModes = {
  "r": 0,
  "r+": 2,
  "w": 512 | 64 | 1,
  "w+": 512 | 64 | 2,
  "a": 1024 | 64 | 1,
  "a+": 1024 | 64 | 2
 };
 var flags = flagModes[str];
 if (typeof flags == "undefined") {
  throw new Error(`Unknown file open mode: ${str}`);
 }
 return flags;
}

Module["FS_modeStringToFlags"] = FS_modeStringToFlags;

function FS_getMode(canRead, canWrite) {
 var mode = 0;
 if (canRead) mode |= 292 | 73;
 if (canWrite) mode |= 146;
 return mode;
}

Module["FS_getMode"] = FS_getMode;

var FS = {
 root: null,
 mounts: [],
 devices: {},
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 ErrnoError: null,
 genericErrors: {},
 filesystems: null,
 syncFSRequests: 0,
 lookupPath: (path, opts = {}) => {
  path = PATH_FS.resolve(path);
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  opts = Object.assign(defaults, opts);
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(32);
  }
  var parts = path.split("/").filter(p => !!p);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = i === parts.length - 1;
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || islast && opts.follow_mount) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count + 1
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(32);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 },
 getPath: node => {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
   }
   path = path ? `${node.name}/${path}` : node.name;
   node = node.parent;
  }
 },
 hashName: (parentid, name) => {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
  }
  return (parentid + hash >>> 0) % FS.nameTable.length;
 },
 hashAddNode: node => {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 },
 hashRemoveNode: node => {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 },
 lookupNode: (parent, name) => {
  var errCode = FS.mayLookup(parent);
  if (errCode) {
   throw new FS.ErrnoError(errCode, parent);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 },
 createNode: (parent, name, mode, rdev) => {
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 },
 destroyNode: node => {
  FS.hashRemoveNode(node);
 },
 isRoot: node => {
  return node === node.parent;
 },
 isMountpoint: node => {
  return !!node.mounted;
 },
 isFile: mode => {
  return (mode & 61440) === 32768;
 },
 isDir: mode => {
  return (mode & 61440) === 16384;
 },
 isLink: mode => {
  return (mode & 61440) === 40960;
 },
 isChrdev: mode => {
  return (mode & 61440) === 8192;
 },
 isBlkdev: mode => {
  return (mode & 61440) === 24576;
 },
 isFIFO: mode => {
  return (mode & 61440) === 4096;
 },
 isSocket: mode => {
  return (mode & 49152) === 49152;
 },
 flagsToPermissionString: flag => {
  var perms = [ "r", "w", "rw" ][flag & 3];
  if (flag & 512) {
   perms += "w";
  }
  return perms;
 },
 nodePermissions: (node, perms) => {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.includes("r") && !(node.mode & 292)) {
   return 2;
  } else if (perms.includes("w") && !(node.mode & 146)) {
   return 2;
  } else if (perms.includes("x") && !(node.mode & 73)) {
   return 2;
  }
  return 0;
 },
 mayLookup: dir => {
  var errCode = FS.nodePermissions(dir, "x");
  if (errCode) return errCode;
  if (!dir.node_ops.lookup) return 2;
  return 0;
 },
 mayCreate: (dir, name) => {
  try {
   var node = FS.lookupNode(dir, name);
   return 20;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 },
 mayDelete: (dir, name, isdir) => {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var errCode = FS.nodePermissions(dir, "wx");
  if (errCode) {
   return errCode;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return 54;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return 10;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return 31;
   }
  }
  return 0;
 },
 mayOpen: (node, flags) => {
  if (!node) {
   return 44;
  }
  if (FS.isLink(node.mode)) {
   return 32;
  } else if (FS.isDir(node.mode)) {
   if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
    return 31;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 },
 MAX_OPEN_FDS: 4096,
 nextfd: () => {
  for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(33);
 },
 getStreamChecked: fd => {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(8);
  }
  return stream;
 },
 getStream: fd => FS.streams[fd],
 createStream: (stream, fd = -1) => {
  if (!FS.FSStream) {
   FS.FSStream = function() {
    this.shared = {};
   };
   FS.FSStream.prototype = {};
   Object.defineProperties(FS.FSStream.prototype, {
    object: {
     get: function() {
      return this.node;
     },
     set: function(val) {
      this.node = val;
     }
    },
    isRead: {
     get: function() {
      return (this.flags & 2097155) !== 1;
     }
    },
    isWrite: {
     get: function() {
      return (this.flags & 2097155) !== 0;
     }
    },
    isAppend: {
     get: function() {
      return this.flags & 1024;
     }
    },
    flags: {
     get: function() {
      return this.shared.flags;
     },
     set: function(val) {
      this.shared.flags = val;
     }
    },
    position: {
     get: function() {
      return this.shared.position;
     },
     set: function(val) {
      this.shared.position = val;
     }
    }
   });
  }
  stream = Object.assign(new FS.FSStream(), stream);
  if (fd == -1) {
   fd = FS.nextfd();
  }
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 },
 closeStream: fd => {
  FS.streams[fd] = null;
 },
 chrdev_stream_ops: {
  open: stream => {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
  },
  llseek: () => {
   throw new FS.ErrnoError(70);
  }
 },
 major: dev => dev >> 8,
 minor: dev => dev & 255,
 makedev: (ma, mi) => ma << 8 | mi,
 registerDevice: (dev, ops) => {
  FS.devices[dev] = {
   stream_ops: ops
  };
 },
 getDevice: dev => FS.devices[dev],
 getMounts: mount => {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push.apply(check, m.mounts);
  }
  return mounts;
 },
 syncfs: (populate, callback) => {
  if (typeof populate == "function") {
   callback = populate;
   populate = false;
  }
  FS.syncFSRequests++;
  if (FS.syncFSRequests > 1) {
   err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function doCallback(errCode) {
   FS.syncFSRequests--;
   return callback(errCode);
  }
  function done(errCode) {
   if (errCode) {
    if (!done.errored) {
     done.errored = true;
     return doCallback(errCode);
    }
    return;
   }
   if (++completed >= mounts.length) {
    doCallback(null);
   }
  }
  mounts.forEach(mount => {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  });
 },
 mount: (type, opts, mountpoint) => {
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(10);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(10);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(54);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 },
 unmount: mountpoint => {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(28);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach(hash => {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.includes(current.mount)) {
     FS.destroyNode(current);
    }
    current = next;
   }
  });
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  node.mount.mounts.splice(idx, 1);
 },
 lookup: (parent, name) => {
  return parent.node_ops.lookup(parent, name);
 },
 mknod: (path, mode, dev) => {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.mayCreate(parent, name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 },
 create: (path, mode) => {
  mode = mode !== undefined ? mode : 438;
  mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 },
 mkdir: (path, mode) => {
  mode = mode !== undefined ? mode : 511;
  mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 },
 mkdirTree: (path, mode) => {
  var dirs = path.split("/");
  var d = "";
  for (var i = 0; i < dirs.length; ++i) {
   if (!dirs[i]) continue;
   d += "/" + dirs[i];
   try {
    FS.mkdir(d, mode);
   } catch (e) {
    if (e.errno != 20) throw e;
   }
  }
 },
 mkdev: (path, mode, dev) => {
  if (typeof dev == "undefined") {
   dev = mode;
   mode = 438;
  }
  mode |= 8192;
  return FS.mknod(path, mode, dev);
 },
 symlink: (oldpath, newpath) => {
  if (!PATH_FS.resolve(oldpath)) {
   throw new FS.ErrnoError(44);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var newname = PATH.basename(newpath);
  var errCode = FS.mayCreate(parent, newname);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(63);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 },
 rename: (old_path, new_path) => {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  lookup = FS.lookupPath(old_path, {
   parent: true
  });
  old_dir = lookup.node;
  lookup = FS.lookupPath(new_path, {
   parent: true
  });
  new_dir = lookup.node;
  if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(75);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH_FS.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(28);
  }
  relative = PATH_FS.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(55);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var errCode = FS.mayDelete(old_dir, old_name, isdir);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
   throw new FS.ErrnoError(10);
  }
  if (new_dir !== old_dir) {
   errCode = FS.nodePermissions(old_dir, "w");
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
 },
 rmdir: path => {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, true);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
 },
 readdir: path => {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(54);
  }
  return node.node_ops.readdir(node);
 },
 unlink: path => {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(44);
  }
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var errCode = FS.mayDelete(parent, name, false);
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(10);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
 },
 readlink: path => {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(44);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(28);
  }
  return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
 },
 stat: (path, dontFollow) => {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(63);
  }
  return node.node_ops.getattr(node);
 },
 lstat: path => {
  return FS.stat(path, true);
 },
 chmod: (path, mode, dontFollow) => {
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   mode: mode & 4095 | node.mode & ~4095,
   timestamp: Date.now()
  });
 },
 lchmod: (path, mode) => {
  FS.chmod(path, mode, true);
 },
 fchmod: (fd, mode) => {
  var stream = FS.getStreamChecked(fd);
  FS.chmod(stream.node, mode);
 },
 chown: (path, uid, gid, dontFollow) => {
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 },
 lchown: (path, uid, gid) => {
  FS.chown(path, uid, gid, true);
 },
 fchown: (fd, uid, gid) => {
  var stream = FS.getStreamChecked(fd);
  FS.chown(stream.node, uid, gid);
 },
 truncate: (path, len) => {
  if (len < 0) {
   throw new FS.ErrnoError(28);
  }
  var node;
  if (typeof path == "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(63);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(28);
  }
  var errCode = FS.nodePermissions(node, "w");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 },
 ftruncate: (fd, len) => {
  var stream = FS.getStreamChecked(fd);
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(28);
  }
  FS.truncate(stream.node, len);
 },
 utime: (path, atime, mtime) => {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 },
 open: (path, flags, mode) => {
  if (path === "") {
   throw new FS.ErrnoError(44);
  }
  flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
  mode = typeof mode == "undefined" ? 438 : mode;
  if (flags & 64) {
   mode = mode & 4095 | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path == "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if (flags & 64) {
   if (node) {
    if (flags & 128) {
     throw new FS.ErrnoError(20);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(44);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if (flags & 65536 && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(54);
  }
  if (!created) {
   var errCode = FS.mayOpen(node, flags);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
  }
  if (flags & 512 && !created) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512 | 131072);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  });
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
   }
  }
  return stream;
 },
 close: stream => {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (stream.getdents) stream.getdents = null;
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
  stream.fd = null;
 },
 isClosed: stream => {
  return stream.fd === null;
 },
 llseek: (stream, offset, whence) => {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(70);
  }
  if (whence != 0 && whence != 1 && whence != 2) {
   throw new FS.ErrnoError(28);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 },
 read: (stream, buffer, offset, length, position) => {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(28);
  }
  var seeking = typeof position != "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 },
 write: (stream, buffer, offset, length, position, canOwn) => {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(28);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(31);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(28);
  }
  if (stream.seekable && stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = typeof position != "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(70);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  return bytesWritten;
 },
 allocate: (stream, offset, length) => {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(8);
  }
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(28);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(8);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(43);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(138);
  }
  stream.stream_ops.allocate(stream, offset, length);
 },
 mmap: (stream, length, position, prot, flags) => {
  if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
   throw new FS.ErrnoError(2);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(2);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(43);
  }
  return stream.stream_ops.mmap(stream, length, position, prot, flags);
 },
 msync: (stream, buffer, offset, length, mmapFlags) => {
  if (!stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 },
 munmap: stream => 0,
 ioctl: (stream, cmd, arg) => {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(59);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 },
 readFile: (path, opts = {}) => {
  opts.flags = opts.flags || 0;
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error(`Invalid encoding type "${opts.encoding}"`);
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 },
 writeFile: (path, data, opts = {}) => {
  opts.flags = opts.flags || 577;
  var stream = FS.open(path, opts.flags, opts.mode);
  if (typeof data == "string") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
  } else if (ArrayBuffer.isView(data)) {
   FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
  } else {
   throw new Error("Unsupported data type");
  }
  FS.close(stream);
 },
 cwd: () => FS.currentPath,
 chdir: path => {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (lookup.node === null) {
   throw new FS.ErrnoError(44);
  }
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(54);
  }
  var errCode = FS.nodePermissions(lookup.node, "x");
  if (errCode) {
   throw new FS.ErrnoError(errCode);
  }
  FS.currentPath = lookup.path;
 },
 createDefaultDirectories: () => {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 },
 createDefaultDevices: () => {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: () => 0,
   write: (stream, buffer, offset, length, pos) => length
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var randomBuffer = new Uint8Array(1024), randomLeft = 0;
  var randomByte = () => {
   if (randomLeft === 0) {
    randomLeft = randomFill(randomBuffer).byteLength;
   }
   return randomBuffer[--randomLeft];
  };
  FS.createDevice("/dev", "random", randomByte);
  FS.createDevice("/dev", "urandom", randomByte);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 },
 createSpecialDirectories: () => {
  FS.mkdir("/proc");
  var proc_self = FS.mkdir("/proc/self");
  FS.mkdir("/proc/self/fd");
  FS.mount({
   mount: () => {
    var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
    node.node_ops = {
     lookup: (parent, name) => {
      var fd = +name;
      var stream = FS.getStreamChecked(fd);
      var ret = {
       parent: null,
       mount: {
        mountpoint: "fake"
       },
       node_ops: {
        readlink: () => stream.path
       }
      };
      ret.parent = ret;
      return ret;
     }
    };
    return node;
   }
  }, {}, "/proc/self/fd");
 },
 createStandardStreams: () => {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", 0);
  var stdout = FS.open("/dev/stdout", 1);
  var stderr = FS.open("/dev/stderr", 1);
 },
 ensureErrnoError: () => {
  if (FS.ErrnoError) return;
  FS.ErrnoError = function ErrnoError(errno, node) {
   this.name = "ErrnoError";
   this.node = node;
   this.setErrno = function(errno) {
    this.errno = errno;
   };
   this.setErrno(errno);
   this.message = "FS error";
  };
  FS.ErrnoError.prototype = new Error();
  FS.ErrnoError.prototype.constructor = FS.ErrnoError;
  [ 44 ].forEach(code => {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  });
 },
 staticInit: () => {
  FS.ensureErrnoError();
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
  FS.createSpecialDirectories();
  FS.filesystems = {
   "MEMFS": MEMFS
  };
 },
 init: (input, output, error) => {
  FS.init.initialized = true;
  FS.ensureErrnoError();
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 },
 quit: () => {
  FS.init.initialized = false;
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 },
 findObject: (path, dontResolveLastLink) => {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (!ret.exists) {
   return null;
  }
  return ret.object;
 },
 analyzePath: (path, dontResolveLastLink) => {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 },
 createPath: (parent, path, canRead, canWrite) => {
  parent = typeof parent == "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 },
 createFile: (parent, name, properties, canRead, canWrite) => {
  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
  var mode = FS_getMode(canRead, canWrite);
  return FS.create(path, mode);
 },
 createDataFile: (parent, name, data, canRead, canWrite, canOwn) => {
  var path = name;
  if (parent) {
   parent = typeof parent == "string" ? parent : FS.getPath(parent);
   path = name ? PATH.join2(parent, name) : parent;
  }
  var mode = FS_getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data == "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, 577);
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
  return node;
 },
 createDevice: (parent, name, input, output) => {
  var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
  var mode = FS_getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open: stream => {
    stream.seekable = false;
   },
   close: stream => {
    if (output && output.buffer && output.buffer.length) {
     output(10);
    }
   },
   read: (stream, buffer, offset, length, pos) => {
    var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(6);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   },
   write: (stream, buffer, offset, length, pos) => {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   }
  });
  return FS.mkdev(path, mode, dev);
 },
 forceLoadFile: obj => {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  if (typeof XMLHttpRequest != "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (read_) {
   try {
    obj.contents = intArrayFromString(read_(obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    throw new FS.ErrnoError(29);
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
 },
 createLazyFile: (parent, name, url, canRead, canWrite) => {
  function LazyUint8Array() {
   this.lengthKnown = false;
   this.chunks = [];
  }
  LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
   if (idx > this.length - 1 || idx < 0) {
    return undefined;
   }
   var chunkOffset = idx % this.chunkSize;
   var chunkNum = idx / this.chunkSize | 0;
   return this.getter(chunkNum)[chunkOffset];
  };
  LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
   this.getter = getter;
  };
  LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
   var xhr = new XMLHttpRequest();
   xhr.open("HEAD", url, false);
   xhr.send(null);
   if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
   var datalength = Number(xhr.getResponseHeader("Content-length"));
   var header;
   var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
   var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
   var chunkSize = 1024 * 1024;
   if (!hasByteServing) chunkSize = datalength;
   var doXHR = (from, to) => {
    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    xhr.responseType = "arraybuffer";
    if (xhr.overrideMimeType) {
     xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    if (xhr.response !== undefined) {
     return new Uint8Array(xhr.response || []);
    }
    return intArrayFromString(xhr.responseText || "", true);
   };
   var lazyArray = this;
   lazyArray.setDataGetter(chunkNum => {
    var start = chunkNum * chunkSize;
    var end = (chunkNum + 1) * chunkSize - 1;
    end = Math.min(end, datalength - 1);
    if (typeof lazyArray.chunks[chunkNum] == "undefined") {
     lazyArray.chunks[chunkNum] = doXHR(start, end);
    }
    if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
    return lazyArray.chunks[chunkNum];
   });
   if (usesGzip || !datalength) {
    chunkSize = datalength = 1;
    datalength = this.getter(0).length;
    chunkSize = datalength;
    out("LazyFiles on gzip forces download of the whole file when length is accessed");
   }
   this._length = datalength;
   this._chunkSize = chunkSize;
   this.lengthKnown = true;
  };
  if (typeof XMLHttpRequest != "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array();
   Object.defineProperties(lazyArray, {
    length: {
     get: function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._length;
     }
    },
    chunkSize: {
     get: function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._chunkSize;
     }
    }
   });
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperties(node, {
   usedBytes: {
    get: function() {
     return this.contents.length;
    }
   }
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach(key => {
   var fn = node.stream_ops[key];
   stream_ops[key] = function forceLoadLazyFile() {
    FS.forceLoadFile(node);
    return fn.apply(null, arguments);
   };
  });
  function writeChunks(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  }
  stream_ops.read = (stream, buffer, offset, length, position) => {
   FS.forceLoadFile(node);
   return writeChunks(stream, buffer, offset, length, position);
  };
  stream_ops.mmap = (stream, length, position, prot, flags) => {
   FS.forceLoadFile(node);
   var ptr = mmapAlloc(length);
   if (!ptr) {
    throw new FS.ErrnoError(48);
   }
   writeChunks(stream, HEAP8, ptr, length, position);
   return {
    ptr: ptr,
    allocated: true
   };
  };
  node.stream_ops = stream_ops;
  return node;
 }
};

Module["FS"] = FS;

var SYSCALLS = {
 DEFAULT_POLLMASK: 5,
 calculateAt: function(dirfd, path, allowEmpty) {
  if (PATH.isAbs(path)) {
   return path;
  }
  var dir;
  if (dirfd === -100) {
   dir = FS.cwd();
  } else {
   var dirstream = SYSCALLS.getStreamFromFD(dirfd);
   dir = dirstream.path;
  }
  if (path.length == 0) {
   if (!allowEmpty) {
    throw new FS.ErrnoError(44);
   }
   return dir;
  }
  return PATH.join2(dir, path);
 },
 doStat: function(func, path, buf) {
  try {
   var stat = func(path);
  } catch (e) {
   if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
    return -54;
   }
   throw e;
  }
  HEAP32[buf >> 2] = stat.dev;
  HEAP32[buf + 4 >> 2] = stat.mode;
  HEAPU32[buf + 8 >> 2] = stat.nlink;
  HEAP32[buf + 12 >> 2] = stat.uid;
  HEAP32[buf + 16 >> 2] = stat.gid;
  HEAP32[buf + 20 >> 2] = stat.rdev;
  tempI64 = [ stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 24 >> 2] = tempI64[0], HEAP32[buf + 28 >> 2] = tempI64[1];
  HEAP32[buf + 32 >> 2] = 4096;
  HEAP32[buf + 36 >> 2] = stat.blocks;
  var atime = stat.atime.getTime();
  var mtime = stat.mtime.getTime();
  var ctime = stat.ctime.getTime();
  tempI64 = [ Math.floor(atime / 1e3) >>> 0, (tempDouble = Math.floor(atime / 1e3), 
  +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
  HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3;
  tempI64 = [ Math.floor(mtime / 1e3) >>> 0, (tempDouble = Math.floor(mtime / 1e3), 
  +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 56 >> 2] = tempI64[0], HEAP32[buf + 60 >> 2] = tempI64[1];
  HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3;
  tempI64 = [ Math.floor(ctime / 1e3) >>> 0, (tempDouble = Math.floor(ctime / 1e3), 
  +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 72 >> 2] = tempI64[0], HEAP32[buf + 76 >> 2] = tempI64[1];
  HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3;
  tempI64 = [ stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[buf + 88 >> 2] = tempI64[0], HEAP32[buf + 92 >> 2] = tempI64[1];
  return 0;
 },
 doMsync: function(addr, stream, len, flags, offset) {
  if (!FS.isFile(stream.node.mode)) {
   throw new FS.ErrnoError(43);
  }
  if (flags & 2) {
   return 0;
  }
  var buffer = HEAPU8.slice(addr, addr + len);
  FS.msync(stream, buffer, offset, len, flags);
 },
 varargs: undefined,
 get: function() {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 },
 getStr: function(ptr) {
  var ret = UTF8ToString(ptr);
  return ret;
 },
 getStreamFromFD: function(fd) {
  var stream = FS.getStreamChecked(fd);
  return stream;
 }
};

Module["SYSCALLS"] = SYSCALLS;

function ___syscall_dup3(fd, newfd, flags) {
 try {
  var old = SYSCALLS.getStreamFromFD(fd);
  if (old.fd === newfd) return -28;
  var existing = FS.getStream(newfd);
  if (existing) FS.close(existing);
  return FS.createStream(old, newfd).fd;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_dup3"] = ___syscall_dup3;

function ___syscall_faccessat(dirfd, path, amode, flags) {
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  if (amode & ~7) {
   return -28;
  }
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node) {
   return -44;
  }
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && FS.nodePermissions(node, perms)) {
   return -2;
  }
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_faccessat"] = ___syscall_faccessat;

var setErrNo = value => {
 HEAP32[___errno_location() >> 2] = value;
 return value;
};

Module["setErrNo"] = setErrNo;

function ___syscall_fcntl64(fd, cmd, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -28;
    }
    var newStream;
    newStream = FS.createStream(stream, arg);
    return newStream.fd;
   }

  case 1:
  case 2:
   return 0;

  case 3:
   return stream.flags;

  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }

  case 5:
   {
    var arg = SYSCALLS.get();
    var offset = 0;
    HEAP16[arg + offset >> 1] = 2;
    return 0;
   }

  case 6:
  case 7:
   return 0;

  case 16:
  case 8:
   return -28;

  case 9:
   setErrNo(28);
   return -1;

  default:
   {
    return -28;
   }
  }
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_fcntl64"] = ___syscall_fcntl64;

function ___syscall_fstat64(fd, buf) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  return SYSCALLS.doStat(FS.stat, stream.path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_fstat64"] = ___syscall_fstat64;

function convertI32PairToI53Checked(lo, hi) {
 return hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
}

Module["convertI32PairToI53Checked"] = convertI32PairToI53Checked;

function ___syscall_ftruncate64(fd, length_low, length_high) {
 try {
  var length = convertI32PairToI53Checked(length_low, length_high);
  if (isNaN(length)) return -61;
  FS.ftruncate(fd, length);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_ftruncate64"] = ___syscall_ftruncate64;

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
};

Module["stringToUTF8"] = stringToUTF8;

function ___syscall_getcwd(buf, size) {
 try {
  if (size === 0) return -28;
  var cwd = FS.cwd();
  var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
  if (size < cwdLengthInBytes) return -68;
  stringToUTF8(cwd, buf, size);
  return cwdLengthInBytes;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_getcwd"] = ___syscall_getcwd;

function ___syscall_getdents64(fd, dirp, count) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  if (!stream.getdents) {
   stream.getdents = FS.readdir(stream.path);
  }
  var struct_size = 280;
  var pos = 0;
  var off = FS.llseek(stream, 0, 1);
  var idx = Math.floor(off / struct_size);
  while (idx < stream.getdents.length && pos + struct_size <= count) {
   var id;
   var type;
   var name = stream.getdents[idx];
   if (name === ".") {
    id = stream.node.id;
    type = 4;
   } else if (name === "..") {
    var lookup = FS.lookupPath(stream.path, {
     parent: true
    });
    id = lookup.node.id;
    type = 4;
   } else {
    var child = FS.lookupNode(stream.node, name);
    id = child.id;
    type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
   }
   tempI64 = [ id >>> 0, (tempDouble = id, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
   HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
   tempI64 = [ (idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, 
   +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
   HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
   HEAP16[dirp + pos + 16 >> 1] = 280;
   HEAP8[dirp + pos + 18 >> 0] = type;
   stringToUTF8(name, dirp + pos + 19, 256);
   pos += struct_size;
   idx += 1;
  }
  FS.llseek(stream, idx * struct_size, 0);
  return pos;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_getdents64"] = ___syscall_getdents64;

function ___syscall_ioctl(fd, op, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  switch (op) {
  case 21509:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21505:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tcgets) {
     var termios = stream.tty.ops.ioctl_tcgets(stream);
     var argp = SYSCALLS.get();
     HEAP32[argp >> 2] = termios.c_iflag || 0;
     HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
     HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
     HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
     for (var i = 0; i < 32; i++) {
      HEAP8[argp + i + 17 >> 0] = termios.c_cc[i] || 0;
     }
     return 0;
    }
    return 0;
   }

  case 21510:
  case 21511:
  case 21512:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21506:
  case 21507:
  case 21508:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tcsets) {
     var argp = SYSCALLS.get();
     var c_iflag = HEAP32[argp >> 2];
     var c_oflag = HEAP32[argp + 4 >> 2];
     var c_cflag = HEAP32[argp + 8 >> 2];
     var c_lflag = HEAP32[argp + 12 >> 2];
     var c_cc = [];
     for (var i = 0; i < 32; i++) {
      c_cc.push(HEAP8[argp + i + 17 >> 0]);
     }
     return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
      c_iflag: c_iflag,
      c_oflag: c_oflag,
      c_cflag: c_cflag,
      c_lflag: c_lflag,
      c_cc: c_cc
     });
    }
    return 0;
   }

  case 21519:
   {
    if (!stream.tty) return -59;
    var argp = SYSCALLS.get();
    HEAP32[argp >> 2] = 0;
    return 0;
   }

  case 21520:
   {
    if (!stream.tty) return -59;
    return -28;
   }

  case 21531:
   {
    var argp = SYSCALLS.get();
    return FS.ioctl(stream, op, argp);
   }

  case 21523:
   {
    if (!stream.tty) return -59;
    if (stream.tty.ops.ioctl_tiocgwinsz) {
     var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
     var argp = SYSCALLS.get();
     HEAP16[argp >> 1] = winsize[0];
     HEAP16[argp + 2 >> 1] = winsize[1];
    }
    return 0;
   }

  case 21524:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  case 21515:
   {
    if (!stream.tty) return -59;
    return 0;
   }

  default:
   return -28;
  }
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_ioctl"] = ___syscall_ioctl;

function ___syscall_lstat64(path, buf) {
 try {
  path = SYSCALLS.getStr(path);
  return SYSCALLS.doStat(FS.lstat, path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_lstat64"] = ___syscall_lstat64;

function ___syscall_newfstatat(dirfd, path, buf, flags) {
 try {
  path = SYSCALLS.getStr(path);
  var nofollow = flags & 256;
  var allowEmpty = flags & 4096;
  flags = flags & ~6400;
  path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
  return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_newfstatat"] = ___syscall_newfstatat;

function ___syscall_openat(dirfd, path, flags, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  var mode = varargs ? SYSCALLS.get() : 0;
  return FS.open(path, flags, mode).fd;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_openat"] = ___syscall_openat;

function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  if (bufsize <= 0) return -28;
  var ret = FS.readlink(path);
  var len = Math.min(bufsize, lengthBytesUTF8(ret));
  var endChar = HEAP8[buf + len];
  stringToUTF8(ret, buf, bufsize + 1);
  HEAP8[buf + len] = endChar;
  return len;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_readlinkat"] = ___syscall_readlinkat;

function ___syscall_rmdir(path) {
 try {
  path = SYSCALLS.getStr(path);
  FS.rmdir(path);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_rmdir"] = ___syscall_rmdir;

function ___syscall_stat64(path, buf) {
 try {
  path = SYSCALLS.getStr(path);
  return SYSCALLS.doStat(FS.stat, path, buf);
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_stat64"] = ___syscall_stat64;

function ___syscall_unlinkat(dirfd, path, flags) {
 try {
  path = SYSCALLS.getStr(path);
  path = SYSCALLS.calculateAt(dirfd, path);
  if (flags === 0) {
   FS.unlink(path);
  } else if (flags === 512) {
   FS.rmdir(path);
  } else {
   abort("Invalid flags passed to unlinkat");
  }
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return -e.errno;
 }
}

Module["___syscall_unlinkat"] = ___syscall_unlinkat;

var nowIsMonotonic = true;

Module["nowIsMonotonic"] = nowIsMonotonic;

var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;

Module["__emscripten_get_now_is_monotonic"] = __emscripten_get_now_is_monotonic;

function readI53FromI64(ptr) {
 return HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296;
}

Module["readI53FromI64"] = readI53FromI64;

var __gmtime_js = (time, tmPtr) => {
 var date = new Date(readI53FromI64(time) * 1e3);
 HEAP32[tmPtr >> 2] = date.getUTCSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
 HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
 HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
 HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
 var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
 var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
};

Module["__gmtime_js"] = __gmtime_js;

var isLeapYear = year => {
 return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

Module["isLeapYear"] = isLeapYear;

var MONTH_DAYS_LEAP_CUMULATIVE = [ 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335 ];

Module["MONTH_DAYS_LEAP_CUMULATIVE"] = MONTH_DAYS_LEAP_CUMULATIVE;

var MONTH_DAYS_REGULAR_CUMULATIVE = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334 ];

Module["MONTH_DAYS_REGULAR_CUMULATIVE"] = MONTH_DAYS_REGULAR_CUMULATIVE;

var ydayFromDate = date => {
 var leap = isLeapYear(date.getFullYear());
 var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
 var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
 return yday;
};

Module["ydayFromDate"] = ydayFromDate;

var __localtime_js = (time, tmPtr) => {
 var date = new Date(readI53FromI64(time) * 1e3);
 HEAP32[tmPtr >> 2] = date.getSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getHours();
 HEAP32[tmPtr + 12 >> 2] = date.getDate();
 HEAP32[tmPtr + 16 >> 2] = date.getMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
 HEAP32[tmPtr + 24 >> 2] = date.getDay();
 var yday = ydayFromDate(date) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
 var start = new Date(date.getFullYear(), 0, 1);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
 HEAP32[tmPtr + 32 >> 2] = dst;
};

Module["__localtime_js"] = __localtime_js;

var __mktime_js = tmPtr => {
 var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
 var dst = HEAP32[tmPtr + 32 >> 2];
 var guessedOffset = date.getTimezoneOffset();
 var start = new Date(date.getFullYear(), 0, 1);
 var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
 var winterOffset = start.getTimezoneOffset();
 var dstOffset = Math.min(winterOffset, summerOffset);
 if (dst < 0) {
  HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
 } else if (dst > 0 != (dstOffset == guessedOffset)) {
  var nonDstOffset = Math.max(winterOffset, summerOffset);
  var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
  date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
 }
 HEAP32[tmPtr + 24 >> 2] = date.getDay();
 var yday = ydayFromDate(date) | 0;
 HEAP32[tmPtr + 28 >> 2] = yday;
 HEAP32[tmPtr >> 2] = date.getSeconds();
 HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
 HEAP32[tmPtr + 8 >> 2] = date.getHours();
 HEAP32[tmPtr + 12 >> 2] = date.getDate();
 HEAP32[tmPtr + 16 >> 2] = date.getMonth();
 HEAP32[tmPtr + 20 >> 2] = date.getYear();
 return date.getTime() / 1e3 | 0;
};

Module["__mktime_js"] = __mktime_js;

var stringToNewUTF8 = str => {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8(str, ret, size);
 return ret;
};

Module["stringToNewUTF8"] = stringToNewUTF8;

var __tzset_js = (timezone, daylight, tzname) => {
 var currentYear = new Date().getFullYear();
 var winter = new Date(currentYear, 0, 1);
 var summer = new Date(currentYear, 6, 1);
 var winterOffset = winter.getTimezoneOffset();
 var summerOffset = summer.getTimezoneOffset();
 var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
 HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
 HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
 function extractZone(date) {
  var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
  return match ? match[1] : "GMT";
 }
 var winterName = extractZone(winter);
 var summerName = extractZone(summer);
 var winterNamePtr = stringToNewUTF8(winterName);
 var summerNamePtr = stringToNewUTF8(summerName);
 if (summerOffset < winterOffset) {
  HEAPU32[tzname >> 2] = winterNamePtr;
  HEAPU32[tzname + 4 >> 2] = summerNamePtr;
 } else {
  HEAPU32[tzname >> 2] = summerNamePtr;
  HEAPU32[tzname + 4 >> 2] = winterNamePtr;
 }
};

Module["__tzset_js"] = __tzset_js;

var _abort = () => {
 abort("");
};

Module["_abort"] = _abort;

function _emscripten_date_now() {
 return Date.now();
}

Module["_emscripten_date_now"] = _emscripten_date_now;

var _emscripten_get_now;

_emscripten_get_now = () => performance.now();

Module["_emscripten_get_now"] = _emscripten_get_now;

var _emscripten_memcpy_big = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);

Module["_emscripten_memcpy_big"] = _emscripten_memcpy_big;

var getHeapMax = () => HEAPU8.length;

Module["getHeapMax"] = getHeapMax;

var abortOnCannotGrowMemory = requestedSize => {
 abort("OOM");
};

Module["abortOnCannotGrowMemory"] = abortOnCannotGrowMemory;

var _emscripten_resize_heap = requestedSize => {
 var oldSize = HEAPU8.length;
 requestedSize = requestedSize >>> 0;
 abortOnCannotGrowMemory(requestedSize);
};

Module["_emscripten_resize_heap"] = _emscripten_resize_heap;

var ENV = {};

Module["ENV"] = ENV;

var getExecutableName = () => {
 return thisProgram || "./this.program";
};

Module["getExecutableName"] = getExecutableName;

var getEnvStrings = () => {
 if (!getEnvStrings.strings) {
  var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
  var env = {
   "USER": "web_user",
   "LOGNAME": "web_user",
   "PATH": "/",
   "PWD": "/",
   "HOME": "/home/web_user",
   "LANG": lang,
   "_": getExecutableName()
  };
  for (var x in ENV) {
   if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
  }
  var strings = [];
  for (var x in env) {
   strings.push(`${x}=${env[x]}`);
  }
  getEnvStrings.strings = strings;
 }
 return getEnvStrings.strings;
};

Module["getEnvStrings"] = getEnvStrings;

var stringToAscii = (str, buffer) => {
 for (var i = 0; i < str.length; ++i) {
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 HEAP8[buffer >> 0] = 0;
};

Module["stringToAscii"] = stringToAscii;

var _environ_get = (__environ, environ_buf) => {
 var bufSize = 0;
 getEnvStrings().forEach(function(string, i) {
  var ptr = environ_buf + bufSize;
  HEAPU32[__environ + i * 4 >> 2] = ptr;
  stringToAscii(string, ptr);
  bufSize += string.length + 1;
 });
 return 0;
};

Module["_environ_get"] = _environ_get;

var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
 var strings = getEnvStrings();
 HEAPU32[penviron_count >> 2] = strings.length;
 var bufSize = 0;
 strings.forEach(function(string) {
  bufSize += string.length + 1;
 });
 HEAPU32[penviron_buf_size >> 2] = bufSize;
 return 0;
};

Module["_environ_sizes_get"] = _environ_sizes_get;

var _proc_exit = code => {
 EXITSTATUS = code;
 if (!keepRuntimeAlive()) {
  if (Module["onExit"]) Module["onExit"](code);
  ABORT = true;
 }
 quit_(code, new ExitStatus(code));
};

Module["_proc_exit"] = _proc_exit;

var exitJS = (status, implicit) => {
 EXITSTATUS = status;
 _proc_exit(status);
};

Module["exitJS"] = exitJS;

var _exit = exitJS;

Module["_exit"] = _exit;

function _fd_close(fd) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

Module["_fd_close"] = _fd_close;

function _fd_fdstat_get(fd, pbuf) {
 try {
  var rightsBase = 0;
  var rightsInheriting = 0;
  var flags = 0;
  {
   var stream = SYSCALLS.getStreamFromFD(fd);
   var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
  }
  HEAP8[pbuf >> 0] = type;
  HEAP16[pbuf + 2 >> 1] = flags;
  tempI64 = [ rightsBase >>> 0, (tempDouble = rightsBase, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[pbuf + 8 >> 2] = tempI64[0], HEAP32[pbuf + 12 >> 2] = tempI64[1];
  tempI64 = [ rightsInheriting >>> 0, (tempDouble = rightsInheriting, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[pbuf + 16 >> 2] = tempI64[0], HEAP32[pbuf + 20 >> 2] = tempI64[1];
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

Module["_fd_fdstat_get"] = _fd_fdstat_get;

var doReadv = (stream, iov, iovcnt, offset) => {
 var ret = 0;
 for (var i = 0; i < iovcnt; i++) {
  var ptr = HEAPU32[iov >> 2];
  var len = HEAPU32[iov + 4 >> 2];
  iov += 8;
  var curr = FS.read(stream, HEAP8, ptr, len, offset);
  if (curr < 0) return -1;
  ret += curr;
  if (curr < len) break;
  if (typeof offset !== "undefined") {
   offset += curr;
  }
 }
 return ret;
};

Module["doReadv"] = doReadv;

function _fd_pread(fd, iov, iovcnt, offset_low, offset_high, pnum) {
 try {
  var offset = convertI32PairToI53Checked(offset_low, offset_high);
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doReadv(stream, iov, iovcnt, offset);
  HEAPU32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

Module["_fd_pread"] = _fd_pread;

var doWritev = (stream, iov, iovcnt, offset) => {
 var ret = 0;
 for (var i = 0; i < iovcnt; i++) {
  var ptr = HEAPU32[iov >> 2];
  var len = HEAPU32[iov + 4 >> 2];
  iov += 8;
  var curr = FS.write(stream, HEAP8, ptr, len, offset);
  if (curr < 0) return -1;
  ret += curr;
  if (typeof offset !== "undefined") {
   offset += curr;
  }
 }
 return ret;
};

Module["doWritev"] = doWritev;

function _fd_pwrite(fd, iov, iovcnt, offset_low, offset_high, pnum) {
 try {
  var offset = convertI32PairToI53Checked(offset_low, offset_high);
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doWritev(stream, iov, iovcnt, offset);
  HEAPU32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

Module["_fd_pwrite"] = _fd_pwrite;

function _fd_read(fd, iov, iovcnt, pnum) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doReadv(stream, iov, iovcnt);
  HEAPU32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

Module["_fd_read"] = _fd_read;

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
 try {
  var offset = convertI32PairToI53Checked(offset_low, offset_high);
  if (isNaN(offset)) return 61;
  var stream = SYSCALLS.getStreamFromFD(fd);
  FS.llseek(stream, offset, whence);
  tempI64 = [ stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

Module["_fd_seek"] = _fd_seek;

function _fd_write(fd, iov, iovcnt, pnum) {
 try {
  var stream = SYSCALLS.getStreamFromFD(fd);
  var num = doWritev(stream, iov, iovcnt);
  HEAPU32[pnum >> 2] = num;
  return 0;
 } catch (e) {
  if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
  return e.errno;
 }
}

Module["_fd_write"] = _fd_write;

var arraySum = (array, index) => {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) {}
 return sum;
};

Module["arraySum"] = arraySum;

var MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

Module["MONTH_DAYS_LEAP"] = MONTH_DAYS_LEAP;

var MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

Module["MONTH_DAYS_REGULAR"] = MONTH_DAYS_REGULAR;

var addDays = (date, days) => {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= daysInCurrentMonth - newDate.getDate() + 1;
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
};

Module["addDays"] = addDays;

var writeArrayToMemory = (array, buffer) => {
 HEAP8.set(array, buffer);
};

Module["writeArrayToMemory"] = writeArrayToMemory;

var _strftime = (s, maxsize, format, tm) => {
 var tm_zone = HEAP32[tm + 40 >> 2];
 var date = {
  tm_sec: HEAP32[tm >> 2],
  tm_min: HEAP32[tm + 4 >> 2],
  tm_hour: HEAP32[tm + 8 >> 2],
  tm_mday: HEAP32[tm + 12 >> 2],
  tm_mon: HEAP32[tm + 16 >> 2],
  tm_year: HEAP32[tm + 20 >> 2],
  tm_wday: HEAP32[tm + 24 >> 2],
  tm_yday: HEAP32[tm + 28 >> 2],
  tm_isdst: HEAP32[tm + 32 >> 2],
  tm_gmtoff: HEAP32[tm + 36 >> 2],
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S",
  "%Ec": "%c",
  "%EC": "%C",
  "%Ex": "%m/%d/%y",
  "%EX": "%H:%M:%S",
  "%Ey": "%y",
  "%EY": "%Y",
  "%Od": "%d",
  "%Oe": "%e",
  "%OH": "%H",
  "%OI": "%I",
  "%Om": "%m",
  "%OM": "%M",
  "%OS": "%S",
  "%Ou": "%u",
  "%OU": "%U",
  "%OV": "%V",
  "%Ow": "%w",
  "%OW": "%W",
  "%Oy": "%y"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value == "number" ? value.toString() : value || "";
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : value > 0 ? 1 : 0;
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   }
   return thisDate.getFullYear();
  }
  return thisDate.getFullYear() - 1;
 }
 var EXPANSION_RULES_2 = {
  "%a": date => WEEKDAYS[date.tm_wday].substring(0, 3),
  "%A": date => WEEKDAYS[date.tm_wday],
  "%b": date => MONTHS[date.tm_mon].substring(0, 3),
  "%B": date => MONTHS[date.tm_mon],
  "%C": date => {
   var year = date.tm_year + 1900;
   return leadingNulls(year / 100 | 0, 2);
  },
  "%d": date => leadingNulls(date.tm_mday, 2),
  "%e": date => leadingSomething(date.tm_mday, 2, " "),
  "%g": date => {
   return getWeekBasedYear(date).toString().substring(2);
  },
  "%G": date => getWeekBasedYear(date),
  "%H": date => leadingNulls(date.tm_hour, 2),
  "%I": date => {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": date => {
   return leadingNulls(date.tm_mday + arraySum(isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
  },
  "%m": date => leadingNulls(date.tm_mon + 1, 2),
  "%M": date => leadingNulls(date.tm_min, 2),
  "%n": () => "\n",
  "%p": date => {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   }
   return "PM";
  },
  "%S": date => leadingNulls(date.tm_sec, 2),
  "%t": () => "\t",
  "%u": date => date.tm_wday || 7,
  "%U": date => {
   var days = date.tm_yday + 7 - date.tm_wday;
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%V": date => {
   var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
   if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
    val++;
   }
   if (!val) {
    val = 52;
    var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
    if (dec31 == 4 || dec31 == 5 && isLeapYear(date.tm_year % 400 - 1)) {
     val++;
    }
   } else if (val == 53) {
    var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
    if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
   }
   return leadingNulls(val, 2);
  },
  "%w": date => date.tm_wday,
  "%W": date => {
   var days = date.tm_yday + 7 - (date.tm_wday + 6) % 7;
   return leadingNulls(Math.floor(days / 7), 2);
  },
  "%y": date => {
   return (date.tm_year + 1900).toString().substring(2);
  },
  "%Y": date => date.tm_year + 1900,
  "%z": date => {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = off / 60 * 100 + off % 60;
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": date => date.tm_zone,
  "%%": () => "%"
 };
 pattern = pattern.replace(/%%/g, "\0\0");
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.includes(rule)) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 pattern = pattern.replace(/\0\0/g, "%");
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
};

Module["_strftime"] = _strftime;

function getCFunc(ident) {
 var func = Module["_" + ident];
 return func;
}

Module["getCFunc"] = getCFunc;

var stringToUTF8OnStack = str => {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8(str, ret, size);
 return ret;
};

Module["stringToUTF8OnStack"] = stringToUTF8OnStack;

var ccall = function(ident, returnType, argTypes, args, opts) {
 var toC = {
  "string": str => {
   var ret = 0;
   if (str !== null && str !== undefined && str !== 0) {
    ret = stringToUTF8OnStack(str);
   }
   return ret;
  },
  "array": arr => {
   var ret = stackAlloc(arr.length);
   writeArrayToMemory(arr, ret);
   return ret;
  }
 };
 function convertReturnValue(ret) {
  if (returnType === "string") {
   return UTF8ToString(ret);
  }
  if (returnType === "boolean") return Boolean(ret);
  return ret;
 }
 var func = getCFunc(ident);
 var cArgs = [];
 var stack = 0;
 if (args) {
  for (var i = 0; i < args.length; i++) {
   var converter = toC[argTypes[i]];
   if (converter) {
    if (stack === 0) stack = stackSave();
    cArgs[i] = converter(args[i]);
   } else {
    cArgs[i] = args[i];
   }
  }
 }
 var ret = func.apply(null, cArgs);
 function onDone(ret) {
  if (stack !== 0) stackRestore(stack);
  return convertReturnValue(ret);
 }
 ret = onDone(ret);
 return ret;
};

Module["ccall"] = ccall;

var cwrap = function(ident, returnType, argTypes, opts) {
 var numericArgs = !argTypes || argTypes.every(type => type === "number" || type === "boolean");
 var numericRet = returnType !== "string";
 if (numericRet && numericArgs && !opts) {
  return getCFunc(ident);
 }
 return function() {
  return ccall(ident, returnType, argTypes, arguments, opts);
 };
};

Module["cwrap"] = cwrap;

var FSNode = function(parent, name, mode, rdev) {
 if (!parent) {
  parent = this;
 }
 this.parent = parent;
 this.mount = parent.mount;
 this.mounted = null;
 this.id = FS.nextInode++;
 this.name = name;
 this.mode = mode;
 this.node_ops = {};
 this.stream_ops = {};
 this.rdev = rdev;
};

var readMode = 292 | 73;

var writeMode = 146;

Object.defineProperties(FSNode.prototype, {
 read: {
  get: function() {
   return (this.mode & readMode) === readMode;
  },
  set: function(val) {
   val ? this.mode |= readMode : this.mode &= ~readMode;
  }
 },
 write: {
  get: function() {
   return (this.mode & writeMode) === writeMode;
  },
  set: function(val) {
   val ? this.mode |= writeMode : this.mode &= ~writeMode;
  }
 },
 isFolder: {
  get: function() {
   return FS.isDir(this.mode);
  }
 },
 isDevice: {
  get: function() {
   return FS.isChrdev(this.mode);
  }
 }
});

FS.FSNode = FSNode;

FS.createPreloadedFile = FS_createPreloadedFile;

FS.staticInit();

var wasmImports = {
 "a": ___assert_fail,
 "L": ___call_sighandler,
 "K": ___syscall_dup3,
 "J": ___syscall_faccessat,
 "g": ___syscall_fcntl64,
 "I": ___syscall_fstat64,
 "n": ___syscall_ftruncate64,
 "H": ___syscall_getcwd,
 "G": ___syscall_getdents64,
 "F": ___syscall_ioctl,
 "E": ___syscall_lstat64,
 "D": ___syscall_newfstatat,
 "i": ___syscall_openat,
 "C": ___syscall_readlinkat,
 "B": ___syscall_rmdir,
 "A": ___syscall_stat64,
 "z": ___syscall_unlinkat,
 "v": __emscripten_get_now_is_monotonic,
 "u": __gmtime_js,
 "t": __localtime_js,
 "s": __mktime_js,
 "r": __tzset_js,
 "b": _abort,
 "e": _emscripten_date_now,
 "d": _emscripten_get_now,
 "q": _emscripten_memcpy_big,
 "p": _emscripten_resize_heap,
 "y": _environ_get,
 "x": _environ_sizes_get,
 "o": _exit,
 "c": _fd_close,
 "w": _fd_fdstat_get,
 "m": _fd_pread,
 "l": _fd_pwrite,
 "h": _fd_read,
 "k": _fd_seek,
 "f": _fd_write,
 "j": _strftime
};

var asm = createWasm();

var ___wasm_call_ctors = function() {
 return (___wasm_call_ctors = Module["asm"]["N"]).apply(null, arguments);
};

var _adftool_array_size_t_alloc = Module["_adftool_array_size_t_alloc"] = function() {
 return (_adftool_array_size_t_alloc = Module["_adftool_array_size_t_alloc"] = Module["asm"]["O"]).apply(null, arguments);
};

var _adftool_array_size_t_free = Module["_adftool_array_size_t_free"] = function() {
 return (_adftool_array_size_t_free = Module["_adftool_array_size_t_free"] = Module["asm"]["P"]).apply(null, arguments);
};

var _adftool_array_size_t_address = Module["_adftool_array_size_t_address"] = function() {
 return (_adftool_array_size_t_address = Module["_adftool_array_size_t_address"] = Module["asm"]["Q"]).apply(null, arguments);
};

var _adftool_array_size_t_set = Module["_adftool_array_size_t_set"] = function() {
 return (_adftool_array_size_t_set = Module["_adftool_array_size_t_set"] = Module["asm"]["R"]).apply(null, arguments);
};

var _adftool_array_size_t_get = Module["_adftool_array_size_t_get"] = function() {
 return (_adftool_array_size_t_get = Module["_adftool_array_size_t_get"] = Module["asm"]["S"]).apply(null, arguments);
};

var _adftool_array_pointer_alloc = Module["_adftool_array_pointer_alloc"] = function() {
 return (_adftool_array_pointer_alloc = Module["_adftool_array_pointer_alloc"] = Module["asm"]["T"]).apply(null, arguments);
};

var _adftool_array_pointer_free = Module["_adftool_array_pointer_free"] = function() {
 return (_adftool_array_pointer_free = Module["_adftool_array_pointer_free"] = Module["asm"]["U"]).apply(null, arguments);
};

var _adftool_array_pointer_address = Module["_adftool_array_pointer_address"] = function() {
 return (_adftool_array_pointer_address = Module["_adftool_array_pointer_address"] = Module["asm"]["V"]).apply(null, arguments);
};

var _adftool_array_pointer_set = Module["_adftool_array_pointer_set"] = function() {
 return (_adftool_array_pointer_set = Module["_adftool_array_pointer_set"] = Module["asm"]["W"]).apply(null, arguments);
};

var _adftool_array_pointer_get = Module["_adftool_array_pointer_get"] = function() {
 return (_adftool_array_pointer_get = Module["_adftool_array_pointer_get"] = Module["asm"]["X"]).apply(null, arguments);
};

var _adftool_array_uint64_t_alloc = Module["_adftool_array_uint64_t_alloc"] = function() {
 return (_adftool_array_uint64_t_alloc = Module["_adftool_array_uint64_t_alloc"] = Module["asm"]["Y"]).apply(null, arguments);
};

var _adftool_array_uint64_t_free = Module["_adftool_array_uint64_t_free"] = function() {
 return (_adftool_array_uint64_t_free = Module["_adftool_array_uint64_t_free"] = Module["asm"]["Z"]).apply(null, arguments);
};

var _adftool_array_uint64_t_address = Module["_adftool_array_uint64_t_address"] = function() {
 return (_adftool_array_uint64_t_address = Module["_adftool_array_uint64_t_address"] = Module["asm"]["_"]).apply(null, arguments);
};

var _adftool_array_uint64_t_set = Module["_adftool_array_uint64_t_set"] = function() {
 return (_adftool_array_uint64_t_set = Module["_adftool_array_uint64_t_set"] = Module["asm"]["$"]).apply(null, arguments);
};

var _adftool_array_uint64_t_get = Module["_adftool_array_uint64_t_get"] = function() {
 return (_adftool_array_uint64_t_get = Module["_adftool_array_uint64_t_get"] = Module["asm"]["aa"]).apply(null, arguments);
};

var _adftool_array_long_alloc = Module["_adftool_array_long_alloc"] = function() {
 return (_adftool_array_long_alloc = Module["_adftool_array_long_alloc"] = Module["asm"]["ba"]).apply(null, arguments);
};

var _adftool_array_long_free = Module["_adftool_array_long_free"] = function() {
 return (_adftool_array_long_free = Module["_adftool_array_long_free"] = Module["asm"]["ca"]).apply(null, arguments);
};

var _adftool_array_long_address = Module["_adftool_array_long_address"] = function() {
 return (_adftool_array_long_address = Module["_adftool_array_long_address"] = Module["asm"]["da"]).apply(null, arguments);
};

var _adftool_array_long_set = Module["_adftool_array_long_set"] = function() {
 return (_adftool_array_long_set = Module["_adftool_array_long_set"] = Module["asm"]["ea"]).apply(null, arguments);
};

var _adftool_array_long_get = Module["_adftool_array_long_get"] = function() {
 return (_adftool_array_long_get = Module["_adftool_array_long_get"] = Module["asm"]["fa"]).apply(null, arguments);
};

var _adftool_array_double_alloc = Module["_adftool_array_double_alloc"] = function() {
 return (_adftool_array_double_alloc = Module["_adftool_array_double_alloc"] = Module["asm"]["ga"]).apply(null, arguments);
};

var _adftool_array_double_free = Module["_adftool_array_double_free"] = function() {
 return (_adftool_array_double_free = Module["_adftool_array_double_free"] = Module["asm"]["ha"]).apply(null, arguments);
};

var _adftool_array_double_address = Module["_adftool_array_double_address"] = function() {
 return (_adftool_array_double_address = Module["_adftool_array_double_address"] = Module["asm"]["ia"]).apply(null, arguments);
};

var _adftool_array_double_set = Module["_adftool_array_double_set"] = function() {
 return (_adftool_array_double_set = Module["_adftool_array_double_set"] = Module["asm"]["ja"]).apply(null, arguments);
};

var _adftool_array_double_get = Module["_adftool_array_double_get"] = function() {
 return (_adftool_array_double_get = Module["_adftool_array_double_get"] = Module["asm"]["ka"]).apply(null, arguments);
};

var _adftool_timespec_alloc = Module["_adftool_timespec_alloc"] = function() {
 return (_adftool_timespec_alloc = Module["_adftool_timespec_alloc"] = Module["asm"]["la"]).apply(null, arguments);
};

var _adftool_timespec_free = Module["_adftool_timespec_free"] = function() {
 return (_adftool_timespec_free = Module["_adftool_timespec_free"] = Module["asm"]["ma"]).apply(null, arguments);
};

var _adftool_timespec_set_js = Module["_adftool_timespec_set_js"] = function() {
 return (_adftool_timespec_set_js = Module["_adftool_timespec_set_js"] = Module["asm"]["na"]).apply(null, arguments);
};

var _adftool_timespec_get_js = Module["_adftool_timespec_get_js"] = function() {
 return (_adftool_timespec_get_js = Module["_adftool_timespec_get_js"] = Module["asm"]["oa"]).apply(null, arguments);
};

var _adftool_array_uint64_t_set_js = Module["_adftool_array_uint64_t_set_js"] = function() {
 return (_adftool_array_uint64_t_set_js = Module["_adftool_array_uint64_t_set_js"] = Module["asm"]["pa"]).apply(null, arguments);
};

var _adftool_array_uint64_t_get_js_high = Module["_adftool_array_uint64_t_get_js_high"] = function() {
 return (_adftool_array_uint64_t_get_js_high = Module["_adftool_array_uint64_t_get_js_high"] = Module["asm"]["qa"]).apply(null, arguments);
};

var _adftool_array_uint64_t_get_js_low = Module["_adftool_array_uint64_t_get_js_low"] = function() {
 return (_adftool_array_uint64_t_get_js_low = Module["_adftool_array_uint64_t_get_js_low"] = Module["asm"]["ra"]).apply(null, arguments);
};

var _adftool_find_channel_identifier = Module["_adftool_find_channel_identifier"] = function() {
 return (_adftool_find_channel_identifier = Module["_adftool_find_channel_identifier"] = Module["asm"]["sa"]).apply(null, arguments);
};

var _adftool_get_channel_decoder = Module["_adftool_get_channel_decoder"] = function() {
 return (_adftool_get_channel_decoder = Module["_adftool_get_channel_decoder"] = Module["asm"]["ta"]).apply(null, arguments);
};

var _adftool_set_channel_decoder = Module["_adftool_set_channel_decoder"] = function() {
 return (_adftool_set_channel_decoder = Module["_adftool_set_channel_decoder"] = Module["asm"]["ua"]).apply(null, arguments);
};

var _adftool_get_channel_column = Module["_adftool_get_channel_column"] = function() {
 return (_adftool_get_channel_column = Module["_adftool_get_channel_column"] = Module["asm"]["va"]).apply(null, arguments);
};

var _adftool_add_channel_type = Module["_adftool_add_channel_type"] = function() {
 return (_adftool_add_channel_type = Module["_adftool_add_channel_type"] = Module["asm"]["wa"]).apply(null, arguments);
};

var _adftool_get_channel_types = Module["_adftool_get_channel_types"] = function() {
 return (_adftool_get_channel_types = Module["_adftool_get_channel_types"] = Module["asm"]["xa"]).apply(null, arguments);
};

var _adftool_find_channels_by_type = Module["_adftool_find_channels_by_type"] = function() {
 return (_adftool_find_channels_by_type = Module["_adftool_find_channels_by_type"] = Module["asm"]["ya"]).apply(null, arguments);
};

var _adftool_eeg_set_data = Module["_adftool_eeg_set_data"] = function() {
 return (_adftool_eeg_set_data = Module["_adftool_eeg_set_data"] = Module["asm"]["za"]).apply(null, arguments);
};

var _adftool_eeg_get_data = Module["_adftool_eeg_get_data"] = function() {
 return (_adftool_eeg_get_data = Module["_adftool_eeg_get_data"] = Module["asm"]["Aa"]).apply(null, arguments);
};

var _adftool_eeg_get_time = Module["_adftool_eeg_get_time"] = function() {
 return (_adftool_eeg_get_time = Module["_adftool_eeg_get_time"] = Module["asm"]["Ba"]).apply(null, arguments);
};

var _adftool_eeg_set_time = Module["_adftool_eeg_set_time"] = function() {
 return (_adftool_eeg_set_time = Module["_adftool_eeg_set_time"] = Module["asm"]["Ca"]).apply(null, arguments);
};

var _adftool_file_open = Module["_adftool_file_open"] = function() {
 return (_adftool_file_open = Module["_adftool_file_open"] = Module["asm"]["Da"]).apply(null, arguments);
};

var _adftool_file_open_data = Module["_adftool_file_open_data"] = function() {
 return (_adftool_file_open_data = Module["_adftool_file_open_data"] = Module["asm"]["Ea"]).apply(null, arguments);
};

var _adftool_file_open_generated = Module["_adftool_file_open_generated"] = function() {
 return (_adftool_file_open_generated = Module["_adftool_file_open_generated"] = Module["asm"]["Fa"]).apply(null, arguments);
};

var _adftool_file_close = Module["_adftool_file_close"] = function() {
 return (_adftool_file_close = Module["_adftool_file_close"] = Module["asm"]["Ga"]).apply(null, arguments);
};

var _adftool_file_get_data = Module["_adftool_file_get_data"] = function() {
 return (_adftool_file_get_data = Module["_adftool_file_get_data"] = Module["asm"]["Ha"]).apply(null, arguments);
};

var _adftool_dictionary_get = Module["_adftool_dictionary_get"] = function() {
 return (_adftool_dictionary_get = Module["_adftool_dictionary_get"] = Module["asm"]["Ia"]).apply(null, arguments);
};

var _adftool_dictionary_lookup = Module["_adftool_dictionary_lookup"] = function() {
 return (_adftool_dictionary_lookup = Module["_adftool_dictionary_lookup"] = Module["asm"]["Ja"]).apply(null, arguments);
};

var _adftool_dictionary_insert = Module["_adftool_dictionary_insert"] = function() {
 return (_adftool_dictionary_insert = Module["_adftool_dictionary_insert"] = Module["asm"]["Ka"]).apply(null, arguments);
};

var _adftool_fir_auto_bandwidth = Module["_adftool_fir_auto_bandwidth"] = function() {
 return (_adftool_fir_auto_bandwidth = Module["_adftool_fir_auto_bandwidth"] = Module["asm"]["La"]).apply(null, arguments);
};

var _adftool_fir_auto_order = Module["_adftool_fir_auto_order"] = function() {
 return (_adftool_fir_auto_order = Module["_adftool_fir_auto_order"] = Module["asm"]["Ma"]).apply(null, arguments);
};

var _adftool_fir_alloc = Module["_adftool_fir_alloc"] = function() {
 return (_adftool_fir_alloc = Module["_adftool_fir_alloc"] = Module["asm"]["Na"]).apply(null, arguments);
};

var _adftool_fir_order = Module["_adftool_fir_order"] = function() {
 return (_adftool_fir_order = Module["_adftool_fir_order"] = Module["asm"]["Oa"]).apply(null, arguments);
};

var _adftool_fir_coefficients = Module["_adftool_fir_coefficients"] = function() {
 return (_adftool_fir_coefficients = Module["_adftool_fir_coefficients"] = Module["asm"]["Pa"]).apply(null, arguments);
};

var _adftool_fir_free = Module["_adftool_fir_free"] = function() {
 return (_adftool_fir_free = Module["_adftool_fir_free"] = Module["asm"]["Qa"]).apply(null, arguments);
};

var _adftool_fir_design_bandpass = Module["_adftool_fir_design_bandpass"] = function() {
 return (_adftool_fir_design_bandpass = Module["_adftool_fir_design_bandpass"] = Module["asm"]["Ra"]).apply(null, arguments);
};

var _adftool_fir_apply = Module["_adftool_fir_apply"] = function() {
 return (_adftool_fir_apply = Module["_adftool_fir_apply"] = Module["asm"]["Sa"]).apply(null, arguments);
};

var _adftool_lookup = Module["_adftool_lookup"] = function() {
 return (_adftool_lookup = Module["_adftool_lookup"] = Module["asm"]["Ta"]).apply(null, arguments);
};

var _adftool_lookup_objects = Module["_adftool_lookup_objects"] = function() {
 return (_adftool_lookup_objects = Module["_adftool_lookup_objects"] = Module["asm"]["Ua"]).apply(null, arguments);
};

var _adftool_lookup_integer = Module["_adftool_lookup_integer"] = function() {
 return (_adftool_lookup_integer = Module["_adftool_lookup_integer"] = Module["asm"]["Va"]).apply(null, arguments);
};

var _adftool_lookup_double = Module["_adftool_lookup_double"] = function() {
 return (_adftool_lookup_double = Module["_adftool_lookup_double"] = Module["asm"]["Wa"]).apply(null, arguments);
};

var _adftool_lookup_date = Module["_adftool_lookup_date"] = function() {
 return (_adftool_lookup_date = Module["_adftool_lookup_date"] = Module["asm"]["Xa"]).apply(null, arguments);
};

var _adftool_lookup_string = Module["_adftool_lookup_string"] = function() {
 return (_adftool_lookup_string = Module["_adftool_lookup_string"] = Module["asm"]["Ya"]).apply(null, arguments);
};

var _adftool_lookup_subjects = Module["_adftool_lookup_subjects"] = function() {
 return (_adftool_lookup_subjects = Module["_adftool_lookup_subjects"] = Module["asm"]["Za"]).apply(null, arguments);
};

var _adftool_delete = Module["_adftool_delete"] = function() {
 return (_adftool_delete = Module["_adftool_delete"] = Module["asm"]["_a"]).apply(null, arguments);
};

var _adftool_insert = Module["_adftool_insert"] = function() {
 return (_adftool_insert = Module["_adftool_insert"] = Module["asm"]["$a"]).apply(null, arguments);
};

var _adftool_term_parse_n3 = Module["_adftool_term_parse_n3"] = function() {
 return (_adftool_term_parse_n3 = Module["_adftool_term_parse_n3"] = Module["asm"]["ab"]).apply(null, arguments);
};

var _adftool_term_to_n3 = Module["_adftool_term_to_n3"] = function() {
 return (_adftool_term_to_n3 = Module["_adftool_term_to_n3"] = Module["asm"]["bb"]).apply(null, arguments);
};

var _adftool_statement_alloc = Module["_adftool_statement_alloc"] = function() {
 return (_adftool_statement_alloc = Module["_adftool_statement_alloc"] = Module["asm"]["cb"]).apply(null, arguments);
};

var _adftool_statement_free = Module["_adftool_statement_free"] = function() {
 return (_adftool_statement_free = Module["_adftool_statement_free"] = Module["asm"]["db"]).apply(null, arguments);
};

var _adftool_statement_set = Module["_adftool_statement_set"] = function() {
 return (_adftool_statement_set = Module["_adftool_statement_set"] = Module["asm"]["eb"]).apply(null, arguments);
};

var _adftool_statement_get = Module["_adftool_statement_get"] = function() {
 return (_adftool_statement_get = Module["_adftool_statement_get"] = Module["asm"]["fb"]).apply(null, arguments);
};

var _adftool_quads_get = Module["_adftool_quads_get"] = function() {
 return (_adftool_quads_get = Module["_adftool_quads_get"] = Module["asm"]["gb"]).apply(null, arguments);
};

var _adftool_quads_delete = Module["_adftool_quads_delete"] = function() {
 return (_adftool_quads_delete = Module["_adftool_quads_delete"] = Module["asm"]["hb"]).apply(null, arguments);
};

var _adftool_quads_insert = Module["_adftool_quads_insert"] = function() {
 return (_adftool_quads_insert = Module["_adftool_quads_insert"] = Module["asm"]["ib"]).apply(null, arguments);
};

var _adftool_statement_compare = Module["_adftool_statement_compare"] = function() {
 return (_adftool_statement_compare = Module["_adftool_statement_compare"] = Module["asm"]["jb"]).apply(null, arguments);
};

var _adftool_statement_copy = Module["_adftool_statement_copy"] = function() {
 return (_adftool_statement_copy = Module["_adftool_statement_copy"] = Module["asm"]["kb"]).apply(null, arguments);
};

var _adftool_term_alloc = Module["_adftool_term_alloc"] = function() {
 return (_adftool_term_alloc = Module["_adftool_term_alloc"] = Module["asm"]["lb"]).apply(null, arguments);
};

var _adftool_term_free = Module["_adftool_term_free"] = function() {
 return (_adftool_term_free = Module["_adftool_term_free"] = Module["asm"]["mb"]).apply(null, arguments);
};

var _adftool_term_set_blank = Module["_adftool_term_set_blank"] = function() {
 return (_adftool_term_set_blank = Module["_adftool_term_set_blank"] = Module["asm"]["nb"]).apply(null, arguments);
};

var _adftool_term_set_named = Module["_adftool_term_set_named"] = function() {
 return (_adftool_term_set_named = Module["_adftool_term_set_named"] = Module["asm"]["ob"]).apply(null, arguments);
};

var _adftool_term_set_literal = Module["_adftool_term_set_literal"] = function() {
 return (_adftool_term_set_literal = Module["_adftool_term_set_literal"] = Module["asm"]["pb"]).apply(null, arguments);
};

var _adftool_term_is_blank = Module["_adftool_term_is_blank"] = function() {
 return (_adftool_term_is_blank = Module["_adftool_term_is_blank"] = Module["asm"]["qb"]).apply(null, arguments);
};

var _adftool_term_is_named = Module["_adftool_term_is_named"] = function() {
 return (_adftool_term_is_named = Module["_adftool_term_is_named"] = Module["asm"]["rb"]).apply(null, arguments);
};

var _adftool_term_is_literal = Module["_adftool_term_is_literal"] = function() {
 return (_adftool_term_is_literal = Module["_adftool_term_is_literal"] = Module["asm"]["sb"]).apply(null, arguments);
};

var _adftool_term_is_typed_literal = Module["_adftool_term_is_typed_literal"] = function() {
 return (_adftool_term_is_typed_literal = Module["_adftool_term_is_typed_literal"] = Module["asm"]["tb"]).apply(null, arguments);
};

var _adftool_term_is_langstring = Module["_adftool_term_is_langstring"] = function() {
 return (_adftool_term_is_langstring = Module["_adftool_term_is_langstring"] = Module["asm"]["ub"]).apply(null, arguments);
};

var _adftool_term_value = Module["_adftool_term_value"] = function() {
 return (_adftool_term_value = Module["_adftool_term_value"] = Module["asm"]["vb"]).apply(null, arguments);
};

var _adftool_term_meta = Module["_adftool_term_meta"] = function() {
 return (_adftool_term_meta = Module["_adftool_term_meta"] = Module["asm"]["wb"]).apply(null, arguments);
};

var _adftool_term_compare = Module["_adftool_term_compare"] = function() {
 return (_adftool_term_compare = Module["_adftool_term_compare"] = Module["asm"]["xb"]).apply(null, arguments);
};

var _adftool_term_decode = Module["_adftool_term_decode"] = function() {
 return (_adftool_term_decode = Module["_adftool_term_decode"] = Module["asm"]["yb"]).apply(null, arguments);
};

var _adftool_term_encode = Module["_adftool_term_encode"] = function() {
 return (_adftool_term_encode = Module["_adftool_term_encode"] = Module["asm"]["zb"]).apply(null, arguments);
};

var _adftool_term_copy = Module["_adftool_term_copy"] = function() {
 return (_adftool_term_copy = Module["_adftool_term_copy"] = Module["asm"]["Ab"]).apply(null, arguments);
};

var _adftool_term_set_mpz = Module["_adftool_term_set_mpz"] = function() {
 return (_adftool_term_set_mpz = Module["_adftool_term_set_mpz"] = Module["asm"]["Bb"]).apply(null, arguments);
};

var _adftool_term_set_mpf = Module["_adftool_term_set_mpf"] = function() {
 return (_adftool_term_set_mpf = Module["_adftool_term_set_mpf"] = Module["asm"]["Cb"]).apply(null, arguments);
};

var _adftool_term_set_integer = Module["_adftool_term_set_integer"] = function() {
 return (_adftool_term_set_integer = Module["_adftool_term_set_integer"] = Module["asm"]["Db"]).apply(null, arguments);
};

var _adftool_term_set_double = Module["_adftool_term_set_double"] = function() {
 return (_adftool_term_set_double = Module["_adftool_term_set_double"] = Module["asm"]["Eb"]).apply(null, arguments);
};

var _adftool_term_as_mpz = Module["_adftool_term_as_mpz"] = function() {
 return (_adftool_term_as_mpz = Module["_adftool_term_as_mpz"] = Module["asm"]["Fb"]).apply(null, arguments);
};

var _adftool_term_as_mpf = Module["_adftool_term_as_mpf"] = function() {
 return (_adftool_term_as_mpf = Module["_adftool_term_as_mpf"] = Module["asm"]["Gb"]).apply(null, arguments);
};

var _adftool_term_as_integer = Module["_adftool_term_as_integer"] = function() {
 return (_adftool_term_as_integer = Module["_adftool_term_as_integer"] = Module["asm"]["Hb"]).apply(null, arguments);
};

var _adftool_term_as_double = Module["_adftool_term_as_double"] = function() {
 return (_adftool_term_as_double = Module["_adftool_term_as_double"] = Module["asm"]["Ib"]).apply(null, arguments);
};

var _adftool_term_set_date = Module["_adftool_term_set_date"] = function() {
 return (_adftool_term_set_date = Module["_adftool_term_set_date"] = Module["asm"]["Jb"]).apply(null, arguments);
};

var _adftool_term_as_date = Module["_adftool_term_as_date"] = function() {
 return (_adftool_term_as_date = Module["_adftool_term_as_date"] = Module["asm"]["Kb"]).apply(null, arguments);
};

var ___errno_location = function() {
 return (___errno_location = Module["asm"]["Lb"]).apply(null, arguments);
};

var _malloc = Module["_malloc"] = function() {
 return (_malloc = Module["_malloc"] = Module["asm"]["Mb"]).apply(null, arguments);
};

var _free = Module["_free"] = function() {
 return (_free = Module["_free"] = Module["asm"]["Nb"]).apply(null, arguments);
};

var stackSave = function() {
 return (stackSave = Module["asm"]["Ob"]).apply(null, arguments);
};

var stackRestore = function() {
 return (stackRestore = Module["asm"]["Pb"]).apply(null, arguments);
};

var stackAlloc = function() {
 return (stackAlloc = Module["asm"]["Qb"]).apply(null, arguments);
};

var dynCall_jiji = Module["dynCall_jiji"] = function() {
 return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["Sb"]).apply(null, arguments);
};

var dynCall_iiijiiii = Module["dynCall_iiijiiii"] = function() {
 return (dynCall_iiijiiii = Module["dynCall_iiijiiii"] = Module["asm"]["Tb"]).apply(null, arguments);
};

var dynCall_iiijji = Module["dynCall_iiijji"] = function() {
 return (dynCall_iiijji = Module["dynCall_iiijji"] = Module["asm"]["Ub"]).apply(null, arguments);
};

var dynCall_iij = Module["dynCall_iij"] = function() {
 return (dynCall_iij = Module["dynCall_iij"] = Module["asm"]["Vb"]).apply(null, arguments);
};

var dynCall_ijiii = Module["dynCall_ijiii"] = function() {
 return (dynCall_ijiii = Module["dynCall_ijiii"] = Module["asm"]["Wb"]).apply(null, arguments);
};

var dynCall_ijjj = Module["dynCall_ijjj"] = function() {
 return (dynCall_ijjj = Module["dynCall_ijjj"] = Module["asm"]["Xb"]).apply(null, arguments);
};

var dynCall_ji = Module["dynCall_ji"] = function() {
 return (dynCall_ji = Module["dynCall_ji"] = Module["asm"]["Yb"]).apply(null, arguments);
};

var dynCall_iiijii = Module["dynCall_iiijii"] = function() {
 return (dynCall_iiijii = Module["dynCall_iiijii"] = Module["asm"]["Zb"]).apply(null, arguments);
};

var dynCall_iiij = Module["dynCall_iiij"] = function() {
 return (dynCall_iiij = Module["dynCall_iiij"] = Module["asm"]["_b"]).apply(null, arguments);
};

var dynCall_iiji = Module["dynCall_iiji"] = function() {
 return (dynCall_iiji = Module["dynCall_iiji"] = Module["asm"]["$b"]).apply(null, arguments);
};

var dynCall_ijjii = Module["dynCall_ijjii"] = function() {
 return (dynCall_ijjii = Module["dynCall_ijjii"] = Module["asm"]["ac"]).apply(null, arguments);
};

var dynCall_iijiii = Module["dynCall_iijiii"] = function() {
 return (dynCall_iijiii = Module["dynCall_iijiii"] = Module["asm"]["bc"]).apply(null, arguments);
};

var dynCall_iijiiiiiii = Module["dynCall_iijiiiiiii"] = function() {
 return (dynCall_iijiiiiiii = Module["dynCall_iijiiiiiii"] = Module["asm"]["cc"]).apply(null, arguments);
};

var dynCall_iijiiiii = Module["dynCall_iijiiiii"] = function() {
 return (dynCall_iijiiiii = Module["dynCall_iijiiiii"] = Module["asm"]["dc"]).apply(null, arguments);
};

var dynCall_iiiiji = Module["dynCall_iiiiji"] = function() {
 return (dynCall_iiiiji = Module["dynCall_iiiiji"] = Module["asm"]["ec"]).apply(null, arguments);
};

var dynCall_ijii = Module["dynCall_ijii"] = function() {
 return (dynCall_ijii = Module["dynCall_ijii"] = Module["asm"]["fc"]).apply(null, arguments);
};

var dynCall_iijii = Module["dynCall_iijii"] = function() {
 return (dynCall_iijii = Module["dynCall_iijii"] = Module["asm"]["gc"]).apply(null, arguments);
};

var dynCall_iijiiii = Module["dynCall_iijiiii"] = function() {
 return (dynCall_iijiiii = Module["dynCall_iijiiii"] = Module["asm"]["hc"]).apply(null, arguments);
};

var dynCall_iijjii = Module["dynCall_iijjii"] = function() {
 return (dynCall_iijjii = Module["dynCall_iijjii"] = Module["asm"]["ic"]).apply(null, arguments);
};

var dynCall_iiiijjjjji = Module["dynCall_iiiijjjjji"] = function() {
 return (dynCall_iiiijjjjji = Module["dynCall_iiiijjjjji"] = Module["asm"]["jc"]).apply(null, arguments);
};

var dynCall_iiiijji = Module["dynCall_iiiijji"] = function() {
 return (dynCall_iiiijji = Module["dynCall_iiiijji"] = Module["asm"]["kc"]).apply(null, arguments);
};

var dynCall_iijiji = Module["dynCall_iijiji"] = function() {
 return (dynCall_iijiji = Module["dynCall_iijiji"] = Module["asm"]["lc"]).apply(null, arguments);
};

var dynCall_iiiji = Module["dynCall_iiiji"] = function() {
 return (dynCall_iiiji = Module["dynCall_iiiji"] = Module["asm"]["mc"]).apply(null, arguments);
};

var dynCall_iiiijjjjjji = Module["dynCall_iiiijjjjjji"] = function() {
 return (dynCall_iiiijjjjjji = Module["dynCall_iiiijjjjjji"] = Module["asm"]["nc"]).apply(null, arguments);
};

var dynCall_iiiiiijii = Module["dynCall_iiiiiijii"] = function() {
 return (dynCall_iiiiiijii = Module["dynCall_iiiiiijii"] = Module["asm"]["oc"]).apply(null, arguments);
};

var dynCall_iiijjji = Module["dynCall_iiijjji"] = function() {
 return (dynCall_iiijjji = Module["dynCall_iiijjji"] = Module["asm"]["pc"]).apply(null, arguments);
};

var dynCall_iiiijjjji = Module["dynCall_iiiijjjji"] = function() {
 return (dynCall_iiiijjjji = Module["dynCall_iiiijjjji"] = Module["asm"]["qc"]).apply(null, arguments);
};

var dynCall_iiiijjji = Module["dynCall_iiiijjji"] = function() {
 return (dynCall_iiiijjji = Module["dynCall_iiiijjji"] = Module["asm"]["rc"]).apply(null, arguments);
};

var dynCall_iiiiijjji = Module["dynCall_iiiiijjji"] = function() {
 return (dynCall_iiiiijjji = Module["dynCall_iiiiijjji"] = Module["asm"]["sc"]).apply(null, arguments);
};

var dynCall_iiiiiiijjji = Module["dynCall_iiiiiiijjji"] = function() {
 return (dynCall_iiiiiiijjji = Module["dynCall_iiiiiiijjji"] = Module["asm"]["tc"]).apply(null, arguments);
};

var dynCall_jijiijj = Module["dynCall_jijiijj"] = function() {
 return (dynCall_jijiijj = Module["dynCall_jijiijj"] = Module["asm"]["uc"]).apply(null, arguments);
};

var dynCall_ij = Module["dynCall_ij"] = function() {
 return (dynCall_ij = Module["dynCall_ij"] = Module["asm"]["vc"]).apply(null, arguments);
};

var dynCall_ijjiiiiii = Module["dynCall_ijjiiiiii"] = function() {
 return (dynCall_ijjiiiiii = Module["dynCall_ijjiiiiii"] = Module["asm"]["wc"]).apply(null, arguments);
};

var dynCall_j = Module["dynCall_j"] = function() {
 return (dynCall_j = Module["dynCall_j"] = Module["asm"]["xc"]).apply(null, arguments);
};

var dynCall_iiijj = Module["dynCall_iiijj"] = function() {
 return (dynCall_iiijj = Module["dynCall_iiijj"] = Module["asm"]["yc"]).apply(null, arguments);
};

var dynCall_jii = Module["dynCall_jii"] = function() {
 return (dynCall_jii = Module["dynCall_jii"] = Module["asm"]["zc"]).apply(null, arguments);
};

var dynCall_iiijjii = Module["dynCall_iiijjii"] = function() {
 return (dynCall_iiijjii = Module["dynCall_iiijjii"] = Module["asm"]["Ac"]).apply(null, arguments);
};

var dynCall_jiijj = Module["dynCall_jiijj"] = function() {
 return (dynCall_jiijj = Module["dynCall_jiijj"] = Module["asm"]["Bc"]).apply(null, arguments);
};

var dynCall_iiijjj = Module["dynCall_iiijjj"] = function() {
 return (dynCall_iiijjj = Module["dynCall_iiijjj"] = Module["asm"]["Cc"]).apply(null, arguments);
};

var dynCall_iji = Module["dynCall_iji"] = function() {
 return (dynCall_iji = Module["dynCall_iji"] = Module["asm"]["Dc"]).apply(null, arguments);
};

function intArrayFromBase64(s) {
 if (typeof ENVIRONMENT_IS_NODE != "undefined" && ENVIRONMENT_IS_NODE) {
  var buf = Buffer.from(s, "base64");
  return new Uint8Array(buf["buffer"], buf["byteOffset"], buf["byteLength"]);
 }
 try {
  var decoded = atob(s);
  var bytes = new Uint8Array(decoded.length);
  for (var i = 0; i < decoded.length; ++i) {
   bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
 } catch (_) {
  throw new Error("Converting base64 string to bytes failed.");
 }
}

function tryParseAsDataURI(filename) {
 if (!isDataURI(filename)) {
  return;
 }
 return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}

Module["ccall"] = ccall;

Module["cwrap"] = cwrap;

Module["UTF8ToString"] = UTF8ToString;

Module["stringToUTF8"] = stringToUTF8;

Module["lengthBytesUTF8"] = lengthBytesUTF8;

var calledRun;

dependenciesFulfilled = function runCaller() {
 if (!calledRun) run();
 if (!calledRun) dependenciesFulfilled = runCaller;
};

function run() {
 if (runDependencies > 0) {
  return;
 }
 preRun();
 if (runDependencies > 0) {
  return;
 }
 function doRun() {
  if (calledRun) return;
  calledRun = true;
  Module["calledRun"] = true;
  if (ABORT) return;
  initRuntime();
  readyPromiseResolve(Module);
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
}

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

run();


  return moduleArg.ready
}

);
})();
export default Module;