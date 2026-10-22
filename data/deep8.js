/* Forge Academy: deeper material for JavaScript lessons.
   Keyed by lesson reference ("module-index"). Each entry: more (HTML), example {t, intro, lang, code, after},
   mistakes [HTML], practice [[question, answer]]. All original content. */
window.DEEP = window.DEEP || {};
Object.assign(DEEP, {
  "57-1": {
    more: `<p><b>Why a closure keeps variables alive.</b> It helps to picture memory. When a function runs, JavaScript makes a small record of its local variables. Normally, the moment the function returns, that record can be cleaned up because nothing can reach it any more. But if the function returned (or saved) an <i>inner</i> function that still refers to those variables, the record cannot be cleaned up — something still needs it. So JavaScript keeps it. The inner function and that surviving record together are the closure. Nothing magic: a variable stays alive exactly as long as some living function can still reach it.</p>
<p><b>Each call makes a fresh backpack.</b> Every time you call the outer function you get a brand-new set of its local variables, and therefore a brand-new closure. Call <code>makeCounter()</code> three times and you get three independent counters, each with its own private <code>count</code>. They do not share anything. This is the key to using closures as factories: one factory function, many independent instances.</p>
<p><b>A closure captures the variable, not a snapshot of its value.</b> This is the single most important subtlety. The inner function does not copy the value at the moment it was created; it holds a live link to the variable itself. If the variable changes later, the closure sees the new value. That is exactly what you want for a counter — and exactly what surprises people when they create functions inside a loop (see the common mistakes).</p>
<p><b>Arrow functions and <code>this</code>, restated.</b> A regular function gets a fresh <code>this</code> decided by its call site. An arrow function has no <code>this</code> of its own, so when you write <code>this</code> inside an arrow it means the <code>this</code> of the surrounding code — resolved once, where the arrow is written, and never changed by how it is called. That is why arrows are perfect for callbacks inside an object or class (they keep pointing at the right object) and wrong for defining an object's own methods (there is no surrounding object <code>this</code> to borrow).</p>`,
    example: {
      t: "Building debounce from scratch",
      intro: "debounce is a classic helper that only makes sense once closures click. The goal: given a function, return a new function that waits until things go quiet before actually running — so a search box fires one request after the user stops typing, not one per keystroke. Watch how a closure holds the pending timer between calls.",
      lang: "javascript",
      code: `function debounce(fn, waitMs) {
  // 'timer' lives in debounce's scope. The inner function below closes
  // over it, so it survives between calls and is private to this one
  // debounced function — nothing outside can see or reset it.
  let timer = null;

  // We return a NEW function. Each time it is called we cancel any
  // pending run and schedule a fresh one. Only when the calls stop
  // for 'waitMs' does the timer finally fire.
  return function (...args) {
    clearTimeout(timer);                 // cancel the previous plan
    timer = setTimeout(() => {           // arrow: keeps the outer 'this'
      fn.apply(this, args);              // run the real function at last
    }, waitMs);
  };
}

// Use it: one search runs 300ms after the user stops typing
const search = debounce((text) => {
  console.log("searching for:", text);
}, 300);

search("r");
search("re");
search("rea");
search("react");   // only THIS one runs, 300ms after the last keystroke`,
      after: "Trace it: each call to the returned function reaches the same <code>timer</code> variable (that is the closure), cancels the old <code>setTimeout</code>, and starts a new one. Because every call resets the clock, only the final call survives to actually run <code>fn</code>. Without the closure there would be nowhere to keep <code>timer</code> between calls, and the cancelling trick would be impossible."
    },
    mistakes: [
      `<b>Creating functions in a loop with <code>var</code>.</b> <code>for (var i = 0; i &lt; 3; i++) buttons[i].onclick = () =&gt; alert(i);</code> alerts <code>3</code> every time. With <code>var</code> there is one shared <code>i</code>, and the closures all captured that one variable, which ends at 3. Fix: use <code>let i</code>, which creates a fresh <code>i</code> per iteration, so each closure captures its own.`,
      `<b>Passing a method and losing <code>this</code>.</b> <code>setTimeout(user.greet, 1000)</code> calls a bare function with no <code>user.</code> at the call site, so <code>this</code> is undefined inside <code>greet</code>. Fix: <code>setTimeout(() =&gt; user.greet(), 1000)</code> or <code>setTimeout(user.greet.bind(user), 1000)</code>.`,
      `<b>Using an arrow for an object's own method.</b> <code>const user = { name: "Ada", greet: () =&gt; "hi " + this.name };</code> gives "hi undefined" because the arrow has no <code>this</code> of its own and there is no surrounding object to borrow from. Fix: write the method as a normal function: <code>greet() { return "hi " + this.name; }</code>.`,
      `<b>Expecting a closure to capture a value, not the variable.</b> A closure sees the variable's <i>current</i> value whenever it runs, not the value at the time it was created. If you need to freeze a value, copy it into a new <code>const</code> inside the loop or pass it as an argument.`
    ],
    practice: [
      ["Write <code>once(fn)</code>: it returns a function that runs <code>fn</code> the first time it is called and then does nothing (returning the first result) on every later call. Which variables must the closure remember?",
       "It must remember whether it has run yet, and the first result. <pre><code>function once(fn) {\n  let called = false, result;\n  return function (...args) {\n    if (!called) { called = true; result = fn.apply(this, args); }\n    return result;\n  };\n}</code></pre> The closure keeps <code>called</code> and <code>result</code> private between calls — exactly the 'remember something between calls' pattern."],
      ["Predict the output: <pre><code>const fns = [];\nfor (let i = 0; i &lt; 3; i++) fns.push(() =&gt; i);\nconsole.log(fns.map(f =&gt; f()));</code></pre> Then change <code>let</code> to <code>var</code> and predict again.",
       "With <code>let</code>: <code>[0, 1, 2]</code>, because each loop iteration creates a fresh <code>i</code> and each arrow closes over its own. With <code>var</code>: <code>[3, 3, 3]</code>, because there is a single shared <code>i</code> that all three closures point at, and the loop left it at 3."],
      ["Write <code>memoize(fn)</code> that caches results so calling it twice with the same argument does the slow work only once. Use a closure to hold the cache.",
       "<pre><code>function memoize(fn) {\n  const cache = new Map();\n  return function (arg) {\n    if (cache.has(arg)) return cache.get(arg);\n    const result = fn(arg);\n    cache.set(arg, result);\n    return result;\n  };\n}</code></pre> The <code>cache</code> lives in the closure, private to this memoized function. The second call with the same <code>arg</code> returns the stored result instantly instead of re-running <code>fn</code>."]
    ]
  }
});
