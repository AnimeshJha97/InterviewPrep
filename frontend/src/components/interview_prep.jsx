"use client";
import { useState, useEffect, useRef } from "react";

const prepData = {
  groups: [
    {
      id: "javascript", title: "JavaScript", icon: "JS", color: "#F7DF1E", textColor: "#1a1a1a", estimatedHours: 5,
      questions: [
        {
          id: "js1", difficulty: "medium", type: "common",
          question: "Explain the JavaScript Event Loop in depth. How does it handle asynchronous operations?",
          answer: `The Event Loop is the mechanism that allows JavaScript — a single-threaded language — to handle asynchronous operations without blocking.

HOW IT WORKS:
JavaScript has a single Call Stack where function calls execute one at a time. When you call a function, it gets pushed onto the stack; when it returns, it's popped off.

For async operations, the browser provides Web APIs (setTimeout, fetch, DOM events). When you call setTimeout(fn, 1000), the timer is handed off to the Web API environment. The JS engine continues executing the rest of the code.

Once the timer fires, the callback is placed in the Callback Queue (Macrotask Queue).

The Event Loop continuously monitors: "Is the Call Stack empty? If yes, take the first item from the Callback Queue and push it onto the Stack."

MICROTASKS vs MACROTASKS — the critical distinction:
There are actually TWO queues:
• Microtask Queue: Promises (.then, .catch), queueMicrotask(), MutationObserver
• Macrotask Queue: setTimeout, setInterval, setImmediate, I/O

The Event Loop always drains the ENTIRE Microtask Queue before picking up the next Macrotask.

console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2

Why: sync code runs first (1, 4), then microtasks (3 - promise), then macrotasks (2 - setTimeout)

WHY THIS MATTERS:
• Understanding this explains why chaining too many promises can starve the rendering pipeline
• setTimeout(fn, 0) doesn't mean "run immediately" — it means "run after current call stack and all microtasks clear"
• In Node.js, process.nextTick() fires even before Promise microtasks`
        },
        {
          id: "js2", difficulty: "medium", type: "common",
          question: "What is a closure? Give a real-world use case from your work.",
          answer: `A closure is a function that retains access to its outer (enclosing) scope even after the outer function has returned.

function makeCounter() {
  let count = 0;  // "closed over"
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}
const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
// 'count' is private — can't access it directly

REAL USE CASES:

1. Data privacy / encapsulation:
The count above is private — accessible only through the returned functions.

2. Memoization:
function memoize(fn) {
  const cache = {};  // closed over — persists between calls
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key]) return cache[key];
    return cache[key] = fn(...args);
  };
}

3. Partial application:
function multiply(x) {
  return (y) => x * y;  // x is closed over
}
const double = multiply(2);
double(5); // 10

4. In React — every callback inside a component is a closure, capturing props and state at render time.

CLASSIC INTERVIEW TRAP:
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Prints: 3, 3, 3 — NOT 0, 1, 2
// var is function-scoped, all closures share the SAME i
// Fix: use let (block-scoped) — creates a new binding per iteration`
        },
        {
          id: "js3", difficulty: "medium", type: "common",
          question: "Explain prototypal inheritance. How does it differ from classical inheritance?",
          answer: `JavaScript uses prototypal inheritance — objects inherit directly from other objects. Every object has an internal [[Prototype]] link pointing to another object. When you access a property, JS walks up the prototype chain until it finds it or hits null.

const animal = { eat() { return 'eating'; } };
const dog = Object.create(animal); // dog's prototype IS animal
dog.bark = function() { return 'woof'; };

dog.bark(); // 'woof' — own property
dog.eat();  // 'eating' — found up the chain

ES6 CLASSES ARE SYNTACTIC SUGAR — still prototypal underneath:
class Animal {
  constructor(name) { this.name = name; }
  speak() { return this.name + ' makes a sound'; }
}
class Dog extends Animal {
  speak() { return this.name + ' barks'; }
}

WHAT 'new' ACTUALLY DOES (often asked):
1. Creates a new empty object
2. Sets its [[Prototype]] to Constructor.prototype
3. Executes constructor with this = new object
4. Returns the new object (unless constructor returns an object)

KEY DIFFERENCE FROM CLASSICAL INHERITANCE:
• Classical (Java/C++): blueprint is COPIED to create instances
• Prototypal (JS): objects LINK to other objects — delegation, not copying
• JS prototypes can be modified at runtime (though you shouldn't)
• Classical = tight hierarchy. Prototypal = flexible composition`
        },
        {
          id: "js6", difficulty: "medium", type: "common",
          question: "What are Promises? Explain Promise.all, allSettled, race, and any.",
          answer: `A Promise represents the eventual completion or failure of an async operation. States: pending → fulfilled or rejected.

Promise.all(arr):
• Waits for ALL to resolve
• Returns results in original order
• FAILS FAST — one rejection cancels all
• Use: when ALL must succeed (fetch user + settings + permissions)
const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)]);

Promise.allSettled(arr):
• Waits for ALL to settle (any outcome)
• NEVER rejects — returns [{status, value/reason}]
• Use: bulk operations where you want all results regardless of failures
const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => {
  if (r.status === 'fulfilled') use(r.value);
  else logError(r.reason);
});

Promise.race(arr):
• Resolves/rejects as soon as FIRST settles (either way)
• Use: implementing timeouts
const result = await Promise.race([
  fetch('/api/data'),
  new Promise((_, reject) => setTimeout(() => reject('timeout'), 5000))
]);

Promise.any(arr):
• Resolves on FIRST successful resolution
• Only rejects if ALL reject (AggregateError)
• Use: redundant sources — use fastest successful response
const data = await Promise.any([fetchFromCDN1(), fetchFromCDN2()]);

MEMORY AID:
• all = AND logic, fail fast
• allSettled = AND logic, never fail
• race = first to finish wins (good or bad)
• any = first SUCCESS wins`
        },
        {
          id: "js8", difficulty: "medium", type: "common",
          question: "Explain async/await deeply — what happens under the hood and common mistakes.",
          answer: `async/await is syntactic sugar over Promises. An async function ALWAYS returns a Promise. await pauses execution of that async function (not the whole thread) until the Promise settles.

async function fetchUser(id) {
  const res = await fetch('/api/users/' + id);  // pauses here
  const data = await res.json();                // pauses here
  return data;  // auto-wrapped in Promise.resolve(data)
}

COMMON MISTAKE 1 — Sequential when parallel is possible:
// SLOW: each waits for previous — total time = t1 + t2 + t3
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();

// FAST: all fire simultaneously — total time = max(t1, t2, t3)
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);

COMMON MISTAKE 2 — await in forEach (doesn't work!):
ids.forEach(async (id) => {
  await doSomething(id);  // forEach doesn't wait for this!
});
// All iterations fire simultaneously, forEach completes immediately

// Fix: use for...of for sequential, Promise.all for parallel
for (const id of ids) {
  await doSomething(id);  // truly sequential
}

COMMON MISTAKE 3 — Error handling:
// Promise rejections must be caught:
async function example() {
  try {
    const data = await mightFail();
  } catch (err) {
    handleError(err);
  }
}

SUBTLE DIFFERENCE — return vs return await:
async function a() {
  return fetch('/api');          // rejection NOT caught by this function's try/catch
}
async function b() {
  return await fetch('/api');    // rejection IS caught here
}
// Inside a try/catch block, always use 'return await'`
        },
        {
          id: "js4", difficulty: "hard", type: "tricky",
          question: "What is the difference between == and ===? Explain type coercion with examples that trip people up.",
          answer: `=== (strict equality): compares value AND type — no coercion.
== (loose equality): converts both sides to a common type first.

THE COERCION RULES FOR ==:
• null == undefined → TRUE (special rule — only these two are equal to each other with ==)
• One is number, other is string → convert string to number
• One is boolean → convert boolean to number first (true→1, false→0)
• One is object, other is primitive → call valueOf()/toString() on object

EXAMPLES THAT TRIP PEOPLE UP:
0 == false        // true  — false becomes 0
1 == true         // true  — true becomes 1
'' == false       // true  — both become 0
null == undefined // true  — special case
null == 0         // FALSE — null only == undefined, nothing else
undefined == 0    // FALSE
NaN == NaN        // FALSE — NaN is never equal to anything, even itself
[] == false       // true  — [] → '' → 0, false → 0

THE SHOCKING ONE:
[] == ![]  // TRUE
// ![] = false ([] is truthy)
// [] == false
// [] → '' → 0, false → 0
// 0 == 0 → true

CHECKING NaN PROPERLY:
NaN === NaN           // false
Number.isNaN(NaN)     // true — use this
isNaN('hello')        // true — BAD: converts string first!
Number.isNaN('hello') // false — GOOD: doesn't coerce

RULE: Always use ===. The only acceptable use of == is:
if (value == null) {}  // catches both null AND undefined`
        },
        {
          id: "js5", difficulty: "hard", type: "tricky",
          question: "Explain 'this' keyword — all contexts and how arrow functions changed it.",
          answer: `'this' is determined at CALL TIME (not definition time), based on HOW a function is invoked. Arrow functions are the exception — they capture 'this' lexically at definition time.

5 BINDING RULES:

1. DEFAULT BINDING (standalone call):
function show() { console.log(this); }
show(); // window (or undefined in strict mode)

2. IMPLICIT BINDING (method call):
const obj = { name: 'Animesh', greet() { console.log(this.name); } };
obj.greet(); // 'Animesh' — this = obj

3. EXPLICIT BINDING (call/apply/bind):
greet.call({ name: 'Animesh' });       // 'Animesh'
greet.apply({ name: 'Animesh' });      // 'Animesh'
const bound = greet.bind({ name: 'Animesh' });
bound(); // 'Animesh'

4. NEW BINDING (constructor):
function Person(name) { this.name = name; }
// 'this' = new empty object

5. ARROW FUNCTIONS — lexical this:
const obj = {
  name: 'Animesh',
  greet: function() {
    setTimeout(function() {
      console.log(this.name); // undefined — 'this' is window
    }, 100);
    setTimeout(() => {
      console.log(this.name); // 'Animesh' — arrow inherits outer this
    }, 100);
  }
};

CRITICAL GOTCHA — method extraction loses implicit binding:
const obj = { name: 'test', getName() { return this.name; } };
const fn = obj.getName;
fn(); // undefined! 'this' is now window, binding is LOST

IN REACT: Class component event handlers lose 'this' when passed as callbacks.
That's why you bind in constructor OR use arrow class properties.
Function components with hooks sidestep this entirely.`
        },
        {
          id: "js7", difficulty: "hard", type: "tricky",
          question: "What is the difference between a call stack overflow and a memory leak?",
          answer: `These are two distinct problems often confused with each other.

CALL STACK OVERFLOW:
The call stack has a fixed size (~10k-15k frames). Overflow happens with uncontrolled recursion.
function infinite() { return infinite(); }
// RangeError: Maximum call stack size exceeded

Fix 1 — Use iteration instead of recursion for large datasets.
Fix 2 — Trampolining:
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorial(n - 1, n * acc);  // returns function, not recursive call
}
function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    while (typeof result === 'function') result = result();
    return result;
  };
}

MEMORY LEAK:
Memory allocated but never released. JS uses garbage collection, so leaks happen when you keep references alive unintentionally.

Common sources in frontend/React work:

1. Event listeners not removed:
useEffect(() => {
  window.addEventListener('resize', handler);
  // MISSING: return () => window.removeEventListener('resize', handler);
});

2. setInterval not cleared:
useEffect(() => {
  const id = setInterval(poll, 5000);
  return () => clearInterval(id);  // MUST cleanup
}, []);

3. Closures holding large data inadvertently

4. Detached DOM nodes still referenced in JS variables

5. WebSocket handlers accumulating data in global state

DETECTION:
• Chrome DevTools → Memory tab → Heap snapshot
• Compare snapshots over time — look for growing retained size
• Performance timeline — watch for increasing heap usage`
        },
        {
          id: "js9", difficulty: "hard", type: "tricky",
          question: "What are WeakMap and WeakSet? When would you use them over Map and Set?",
          answer: `WeakMap and WeakSet hold WEAK references — they don't prevent garbage collection of their keys. This is the critical distinction.

// Map — strong reference:
const map = new Map();
let obj = { name: 'test' };
map.set(obj, 'data');
obj = null;
// Object is NOT garbage collected — Map still holds a reference!

// WeakMap — weak reference:
const weakMap = new WeakMap();
let obj = { name: 'test' };
weakMap.set(obj, 'data');
obj = null;
// Object CAN now be garbage collected — WeakMap doesn't prevent it

RESTRICTIONS OF WeakMap:
• Keys MUST be objects (not primitives)
• NOT iterable — no .keys(), .values(), .forEach(), no .size
• Only: get, set, has, delete

WHEN TO USE WeakMap:

1. Caching tied to object lifetime:
const cache = new WeakMap();
function processElement(element) {
  if (cache.has(element)) return cache.get(element);
  const result = heavyComputation(element);
  cache.set(element, result);
  return result;
  // When element is removed from DOM, cache entry is auto-cleaned
}

2. Private data for class instances:
const _private = new WeakMap();
class MyClass {
  constructor() { _private.set(this, { secret: 42 }); }
  getSecret() { return _private.get(this).secret; }
}
// When instance is GC'd, private data is too

3. Tracking DOM nodes without leaking:
Store metadata about DOM nodes — when they're removed, data disappears too.

WEAKSET use case:
Track set of processed objects without preventing their GC:
const processed = new WeakSet();
function process(obj) {
  if (processed.has(obj)) return;
  doWork(obj);
  processed.add(obj);
}

SUMMARY: Use WeakMap/WeakSet when the lifetime of your stored data should match the lifetime of the key object.`
        },
        {
          id: "js10", difficulty: "hard", type: "tricky",
          question: "Explain generators and iterators. What practical problems do they solve?",
          answer: `Iterators implement the iteration protocol: a next() method returning {value, done}.
Generators (function*) are functions that can pause/resume execution using yield — they automatically implement the iterator protocol.

function* counter() {
  let i = 0;
  while (true) { yield i++; }  // pauses at yield, sends value out
}
const gen = counter();
gen.next(); // { value: 0, done: false }
gen.next(); // { value: 1, done: false }
// Infinite sequence but LAZY — only computes on demand!

TWO-WAY COMMUNICATION:
function* calculator() {
  let result = 0;
  while (true) {
    const input = yield result;  // send result out, receive input back
    result += input;
  }
}
const calc = calculator();
calc.next();    // start — { value: 0 }
calc.next(5);   // { value: 5 }
calc.next(3);   // { value: 8 }

PRACTICAL USE CASES:

1. Lazy/infinite sequences without memory overflow:
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}

2. Paginated data fetching (async generators):
async function* fetchAllPages(url) {
  let page = 1;
  while (true) {
    const data = await fetch(url + '?page=' + page).then(r => r.json());
    if (!data.items.length) return;
    yield data.items;
    page++;
  }
}
for await (const items of fetchAllPages('/api/employees')) {
  processItems(items);  // handles pagination automatically!
}

3. State machines for complex workflows

4. Redux-Saga is built entirely on generators — pause async flows, handle race conditions, cancel operations.

WHY GENERATORS OVER ASYNC/AWAIT sometimes:
• Can be paused externally (you control when next() is called)
• Can yield multiple values over time (streaming)
• Cancellable — just stop calling next()`
        }
      ]
    },
    {
      id: "typescript", title: "TypeScript", icon: "TS", color: "#3178C6", textColor: "#ffffff", estimatedHours: 4,
      questions: [
        {
          id: "ts1", difficulty: "medium", type: "common",
          question: "Explain generics in TypeScript with real use cases.",
          answer: `Generics allow reusable, type-safe code that works with multiple types without losing type information. They're type parameters — placeholders filled in at usage time.

WITHOUT GENERICS — the problem:
function identity(arg: any): any { return arg; }
const result = identity(42); // result is 'any' — useless

WITH GENERICS:
function identity<T>(arg: T): T { return arg; }
const n = identity(42);      // T inferred as number
const s = identity('hello'); // T inferred as string

REAL USE CASES:

1. API response wrapper (used in your kind of work):
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
type UserResponse = ApiResponse<User>;
type OvertimeResponse = ApiResponse<OvertimeRecord[]>;

2. Generic hooks:
function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  const [data, setData] = useState<T | null>(null);
  // ...
  return { data, loading };
}
const { data } = useFetch<User[]>('/api/users');
// data is User[] | null — fully typed!

3. Constrained generics (extends):
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
// Works with User, OvertimeRecord — anything with an id

4. keyof constraint — type-safe property access:
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: 'Animesh', age: 28 };
getProperty(user, 'name');  // string ✓
getProperty(user, 'xyz');   // Error: 'xyz' not in type ✓`
        },
        {
          id: "ts2", difficulty: "hard", type: "common",
          question: "Explain the difference between 'type' and 'interface'. When to use each?",
          answer: `Both define shapes of objects but have important differences.

KEY DIFFERENCE 1 — Declaration merging (only interface):
interface User { name: string; }
interface User { age: number; }  // Valid! Merges.
// User now has both — this is why React and libraries use interfaces

type UserType = { name: string; };
type UserType = { age: number; };  // Error: Duplicate identifier

KEY DIFFERENCE 2 — Union types (only type):
type ID = string | number;            // can't do this with interface
type Status = 'pending' | 'approved'; // union
type Admin = User & Manager;          // intersection

KEY DIFFERENCE 3 — Mapped/computed types (only type):
type Keys = 'name' | 'age';
type UserForm = { [K in Keys]: string };

EXTENDING:
// Interface extends interface:
interface Admin extends User { permissions: string[]; }

// Type uses intersection:
type Admin = User & { permissions: string[]; };

// Interface can extend type:
type HasName = { name: string };
interface Admin extends HasName { permissions: string[]; }

WHEN TO USE WHICH:

Use interface when:
• Defining shapes of objects or classes
• Building a public API/library (consumers can extend via declaration merging)
• Working with class implements

Use type when:
• Union types: type Status = 'a' | 'b'
• Primitive aliases: type ID = string
• Tuple types: type Point = [number, number]
• Mapped or conditional types
• Template literal types

PRACTICAL RULE: interface for object/class shapes, type for everything else.
React team recommends interface for component props.`
        },
        {
          id: "ts3", difficulty: "hard", type: "tricky",
          question: "Explain TypeScript utility types: Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract, ReturnType, Parameters.",
          answer: `Utility types transform existing types. Master these — they're used constantly in real codebases.

Partial<T> — all properties optional:
type UpdateUser = Partial<User>;
function updateUser(id: string, changes: Partial<User>) {}
// Use for PATCH endpoints

Required<T> — all properties required:
type FullUser = Required<User>;

Readonly<T> — prevents mutation:
const config: Readonly<Config> = { apiUrl: '...' };
config.apiUrl = 'other'; // Error at compile time!

Pick<T, K> — select specific keys:
type UserPreview = Pick<User, 'name' | 'email'>;
// Use for different views of the same data

Omit<T, K> — exclude specific keys:
type PublicUser = Omit<User, 'password' | 'ssn'>;
// Strip sensitive fields before sending to client

Record<K, V> — object type with specific key/value types:
type RolePermissions = Record<'admin' | 'hr' | 'manager', string[]>;
// { admin: string[], hr: string[], manager: string[] }
// Perfect for your RBAC system!

Exclude<T, U> — remove types from union:
type Status = 'pending' | 'approved' | 'rejected' | 'cancelled';
type ActiveStatus = Exclude<Status, 'cancelled'>;

Extract<T, U> — keep only matching types:
type StrOrNum = string | number | boolean;
type OnlyStrNum = Extract<StrOrNum, string | number>;

ReturnType<T> — extract function return type:
function createUser() { return { id: '1', name: 'test', createdAt: new Date() }; }
type User = ReturnType<typeof createUser>;  // infers the shape!

Parameters<T> — extract parameter types as tuple:
function fetchEmployee(id: string, tenantId: string): Promise<Employee> {}
type Params = Parameters<typeof fetchEmployee>;  // [string, string]

COMBINING (advanced):
type CreateUser = Required<Pick<User, 'name' | 'email'>>
                & Partial<Omit<User, 'name' | 'email'>>;`
        },
        {
          id: "ts4", difficulty: "hard", type: "tricky",
          question: "What are conditional types and mapped types? Build a real example.",
          answer: `CONDITIONAL TYPES — ternary for types:
type IsArray<T> = T extends any[] ? true : false;
type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<string>;   // false

DISTRIBUTIVE conditional types — applies to each union member:
type NonNullable<T> = T extends null | undefined ? never : T;
type Clean = NonNullable<string | null | undefined | number>;
// = string | number (null and undefined become never, which drops out)

'infer' KEYWORD — extract types from within:
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
// "If T is a function, infer return type as R, otherwise never"

type UnwrapPromise<T> = T extends Promise<infer V> ? V : T;
type Unwrapped = UnwrapPromise<Promise<User>>; // User
type Plain = UnwrapPromise<string>;            // string

MAPPED TYPES — transform each property:
// How Partial<T> is implemented:
type MyPartial<T> = { [K in keyof T]?: T[K]; };

// Remove readonly (using - modifier):
type Mutable<T> = { -readonly [K in keyof T]: T[K]; };

REAL WORLD EXAMPLE — Form types for your overtime platform:
interface OvertimeForm {
  employeeId: string;
  hours: number;
  date: Date;
  reason: string;
}

// Generate validation error shape automatically:
type FormErrors<T> = { [K in keyof T]?: string };
type FormTouched<T> = { [K in keyof T]: boolean };

interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
}

type OvertimeFormState = FormState<OvertimeForm>;
// errors.hours is string | undefined
// touched.hours is boolean
// All fully type-checked!`
        },
        {
          id: "ts5", difficulty: "medium", type: "common",
          question: "What is the 'unknown' type? How does it differ from 'any'? What about 'never'?",
          answer: `Three special types with very specific purposes.

'any' — escape hatch (avoid it):
let x: any = 'hello';
x.toUpperCase(); // OK
x.foo.bar.baz;   // No error — TypeScript gives up entirely
// any disables ALL type checking

'unknown' — type-safe any:
let x: unknown = 'hello';
x.toUpperCase(); // Error! Can't use unknown without narrowing
if (typeof x === 'string') {
  x.toUpperCase(); // OK — narrowed to string
}
// unknown forces you to validate before using

WHEN TO USE unknown:
1. catch blocks (TS 4.0+ makes error unknown by default):
catch (err: unknown) {
  if (err instanceof Error) console.log(err.message);
}

2. Parsing external data (JSON.parse returns any — consider typing it as unknown)
3. Functions accepting anything that must be validated

'never' — the bottom type (value that never exists):

1. Exhaustive checks — catches missing cases:
type Shape = 'circle' | 'square';
function area(shape: Shape) {
  if (shape === 'circle') return Math.PI * 4;
  if (shape === 'square') return 16;
  // Add 'triangle' to Shape union but forget to handle it here:
  const _exhaustive: never = shape;  // TypeScript error! 'triangle' not assignable to never
  throw new Error('Unhandled shape');
}

2. Functions that never return:
function throwError(msg: string): never { throw new Error(msg); }
function infinite(): never { while (true) {} }

TYPE HIERARCHY:
• unknown = top type (all types assignable TO unknown)
• never = bottom type (never is assignable to all types, nothing is assignable TO never)
• any = breaks both directions of the type system`
        }
      ]
    },
    {
      id: "react", title: "React.js", icon: "⚛", color: "#61DAFB", textColor: "#1a1a1a", estimatedHours: 6,
      questions: [
        {
          id: "r1", difficulty: "medium", type: "common",
          question: "Explain React's reconciliation algorithm and the virtual DOM in depth.",
          answer: `VIRTUAL DOM:
The Virtual DOM is a lightweight JS representation of the actual DOM. When state changes, React creates a NEW virtual DOM tree and diffs it against the PREVIOUS one. It computes the minimal changes and applies only those to the real DOM.

WHY? Direct DOM operations are expensive — they trigger layout recalculations, repaints, reflows. Batching updates minimally is much faster.

THE DIFFING ALGORITHM (O(n) heuristic):

Rule 1 — Different element types = full subtree replacement:
// Old: <div><Counter /></div>
// New: <span><Counter /></span>
// React tears down entire div subtree. Counter's state is LOST.

Rule 2 — Same element type = update attributes, keep DOM node:
// Old: <div className="old" />
// New: <div className="new" />
// React only updates className — keeps the DOM node

Rule 3 — Same component type = update props, preserve instance:
// Old: <Counter count={1} />
// New: <Counter count={2} />
// Props updated, re-rendered, but Counter's state PERSISTS

KEYS — critical for lists:
Without keys, React diffs by position — inserting at start is expensive:
// Old: [A, B, C] → New: [X, A, B, C]
// Without keys: 3 updates + 1 insert instead of 1 insert!
// With stable keys: React correctly identifies "X is new, A/B/C moved"

items.map(item => <Item key={item.id} {...item} />)
// Never use index as key if list can reorder/filter!

REACT FIBER (React 16+):
Fiber rewrote reconciliation to enable:
• Incremental rendering — split work into chunks, pause and resume
• Priority-based scheduling — user input interrupts low-priority updates
• Concurrency (React 18) — Suspense, useTransition, startTransition`
        },
        {
          id: "r2", difficulty: "medium", type: "common",
          question: "Explain all hook rules and explain useState, useEffect, useRef, useMemo, useCallback in depth.",
          answer: `RULES OF HOOKS:
1. Only call hooks at the TOP LEVEL — never inside loops, conditions, or nested functions
2. Only call hooks from React function components or custom hooks
WHY: React relies on call ORDER to associate state with hooks. Conditions can change the order.

useState:
const [state, setState] = useState(initialValue);

// WRONG — stale closure in rapid updates:
setCount(count + 1);
setCount(count + 1); // still uses old count!

// RIGHT — functional update:
setCount(prev => prev + 1);
setCount(prev => prev + 1); // correctly chains

State updates are BATCHED in React 18 (even async code).
Setting same value (Object.is comparison) skips re-render.

useEffect:
useEffect(() => {
  // side effect
  return () => { /* cleanup */ };  // runs before next effect + on unmount
}, [dependencies]);
• No deps: runs after EVERY render
• []: runs once after mount
• [dep]: runs when dep changes (Object.is comparison)
Cleanup is essential for subscriptions, timers, event listeners.

useRef:
1. Access DOM: <input ref={inputRef} /> → inputRef.current.focus()
2. Mutable value that persists WITHOUT triggering re-render
const timerRef = useRef(null); // storing interval ID

useMemo — memoize COMPUTED VALUES:
const filtered = useMemo(
  () => employees.filter(e => e.dept === dept),
  [employees, dept]  // recomputes only when these change
);

useCallback — memoize FUNCTIONS (useMemo for functions):
const handler = useCallback((data) => {
  submitForm(data);
}, [submitForm]);
Use when passing to React.memo children to prevent unnecessary re-renders.`
        },
        {
          id: "r3", difficulty: "hard", type: "tricky",
          question: "What are React render optimizations? Explain React.memo, when re-renders happen, and how to prevent unnecessary ones.",
          answer: `WHEN DOES A COMPONENT RE-RENDER?
1. Its own state changes
2. Its parent re-renders (even if props didn't change!)
3. A context it consumes changes
4. Its key changes (forces remount)

React.memo — skip re-render if props unchanged:
const Child = React.memo(function Child({ data }) {
  return <div>{/* expensive render */}</div>;
});
// Only re-renders if 'data' prop changes (shallow comparison)

THE TRAP — object/function props break React.memo:
function Parent() {
  // NEW object reference every render:
  const config = { theme: 'dark' };  // React.memo sees it as "changed"!
  const handleClick = () => {};       // NEW function reference!
  return <MemoChild config={config} onClick={handleClick} />;
  // React.memo is USELESS here
}

Fix — useMemo and useCallback:
const config = useMemo(() => ({ theme: 'dark' }), []);
const handleClick = useCallback(() => {}, []);

CONTEXT OPTIMIZATION — split contexts:
// BAD: single context → all consumers re-render on ANY change
const AppContext = createContext({ user, theme, notifications });

// GOOD: split by update frequency
const UserContext = createContext(user);
const ThemeContext = createContext(theme);
// Components only re-render when their specific context changes

STRUCTURAL OPTIMIZATION — isolate state:
function Parent() {
  return (
    <div>
      <CounterSection />  {/* isolated — owns its state */}
      <StaticSection />   {/* never re-renders */}
    </div>
  );
}

React 18 — useTransition for expensive updates:
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setFilteredList(heavyFilter(allItems, query));
});
// UI stays responsive — marks update as non-urgent`
        },
        {
          id: "r4", difficulty: "hard", type: "tricky",
          question: "What is the stale closure problem in hooks? How does it manifest and how do you fix it?",
          answer: `The stale closure problem happens when a hook or callback "closes over" a value from a previous render and uses that outdated value.

CLASSIC EXAMPLE:
function Timer() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count);    // Always logs 0! Stale closure.
      setCount(count + 1);   // Always sets to 1! (0 + 1)
    }, 1000);
    return () => clearInterval(interval);
  }, []);  // [] means closes over count=0 FOREVER
}

FIX 1 — Functional updater (best for state):
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1);  // no need to close over count!
  }, 1000);
  return () => clearInterval(interval);
}, []);  // [] is now safe

FIX 2 — useRef for values you need to READ without re-running effects:
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    const tick = () => savedCallback.current();  // always calls latest!
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);  // only restarts if delay changes
}

STALE CLOSURE IN WEBSOCKET/EXTERNAL HANDLERS:
useEffect(() => {
  socket.on('message', (data) => {
    handleMessage(data);  // handleMessage is stale — first render only!
  });
}, []);  // [] = closed over first render's handleMessage

// Fix: ref pattern
const handleMessageRef = useRef(handleMessage);
handleMessageRef.current = handleMessage;  // update every render
useEffect(() => {
  socket.on('message', (data) => handleMessageRef.current(data));
}, []);  // stable subscription, always fresh handler`
        },
        {
          id: "r5", difficulty: "hard", type: "tricky",
          question: "What are custom hooks? Build a production-quality useFetch and useDebounce.",
          answer: `Custom hooks are functions starting with 'use' that can call other hooks. They extract and reuse stateful logic between components.

PRODUCTION useFetch:
function useFetch<T>(url: string) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;  // handles race conditions + unmount!
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch(error => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    
    return () => { cancelled = true; };  // cleanup!
  }, [url, trigger]);

  const refetch = useCallback(() => setTrigger(t => t + 1), []);
  return { ...state, refetch };
}

useDebounce — essential for search:
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);  // cancel on next keystroke
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage: only fires API call 300ms after user stops typing
const debouncedSearch = useDebounce(searchQuery, 300);
useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);

RULES:
• Must start with 'use'
• Can call other hooks (that's the entire point)
• Each call creates ISOLATED state — two components using useFetch get independent state
• Same rules as built-in hooks — top level only`
        },
        {
          id: "r6", difficulty: "hard", type: "tricky",
          question: "Explain useReducer vs useState — when to use each and how to build a proper reducer.",
          answer: `useState is actually implemented using useReducer internally. useState is the specialized simple version.

WHEN useReducer IS BETTER:
• Multiple state fields that update together
• Next state depends on previous state in complex ways
• Complex business logic in state transitions
• You want easily testable state logic (reducers are pure functions)

THE PATTERN — for your overtime platform:
interface OvertimeState {
  records: OvertimeRecord[];
  status: 'idle' | 'loading' | 'success' | 'error';
  filter: 'all' | 'pending' | 'approved';
  error: string | null;
}

// Discriminated union — exhaustive and type-safe:
type OvertimeAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: OvertimeRecord[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'APPROVE_RECORD'; payload: string };

// Pure reducer — no side effects, easy to unit test:
function overtimeReducer(state: OvertimeState, action: OvertimeAction): OvertimeState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS':
      return { ...state, status: 'success', records: action.payload };
    case 'APPROVE_RECORD':
      return {
        ...state,
        records: state.records.map(r =>
          r.id === action.payload ? { ...r, status: 'approved' } : r
        )
      };
    default: return state;
  }
}

const [state, dispatch] = useReducer(overtimeReducer, initialState);
dispatch({ type: 'FETCH_START' });

COMBINING WITH CONTEXT (lightweight Redux alternative):
const OvertimeContext = createContext(null);
function OvertimeProvider({ children }) {
  const [state, dispatch] = useReducer(overtimeReducer, initialState);
  return (
    <OvertimeContext.Provider value={{ state, dispatch }}>
      {children}
    </OvertimeContext.Provider>
  );
}`
        },
        {
          id: "r7", difficulty: "hard", type: "tricky",
          question: "Explain React Suspense and Error Boundaries — how they work together.",
          answer: `ERROR BOUNDARIES catch JS errors in their child tree during rendering. They're class components (hooks support not yet fully available).

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };  // triggers fallback UI
  }
  
  componentDidCatch(error, info) {
    logError(error, info.componentStack);  // send to Sentry etc.
  }
  
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

Error boundaries do NOT catch:
• Event handler errors (use try/catch there)
• Async errors (setTimeout, Promises)
• Errors in the boundary itself

SUSPENSE — wait for something before rendering:

Code splitting with React.lazy:
const Dashboard = React.lazy(() => import('./Dashboard'));
<Suspense fallback={<Spinner />}>
  <Dashboard />  {/* bundle only loaded when needed */}
</Suspense>

Data fetching (React 18 + React Query/SWR):
function EmployeeList() {
  const employees = useSuspenseQuery(fetchEmployees);  // throws Promise if loading
  return employees.map(e => <Card key={e.id} employee={e} />);
}

TOGETHER — the complete async UI pattern:
<Suspense fallback={<Skeleton />}>       {/* handles loading */}
  <ErrorBoundary fallback={<Error />}>  {/* handles errors */}
    <EmployeeList />                     {/* handles success */}
  </ErrorBoundary>
</Suspense>

NESTED SUSPENSE for progressive loading:
<Suspense fallback={<PageSkeleton />}>    {/* outer — page level */}
  <Header />                              {/* loads fast */}
  <Suspense fallback={<TableSkeleton />}> {/* inner — specific component */}
    <DataTable />
  </Suspense>
</Suspense>`
        }
      ]
    },
    {
      id: "nodejs", title: "Node.js & Backend", icon: "⬡", color: "#339933", textColor: "#ffffff", estimatedHours: 5,
      questions: [
        {
          id: "n1", difficulty: "medium", type: "common",
          question: "Explain Node.js event loop — phases and differences from the browser.",
          answer: `Node.js is single-threaded but handles concurrency through its event loop powered by libuv.

NODE.JS EVENT LOOP PHASES (in order):
1. timers — setTimeout/setInterval callbacks whose threshold elapsed
2. pending callbacks — I/O callbacks deferred from previous iteration
3. idle, prepare — internal only
4. poll — retrieve new I/O events; execute I/O callbacks. Node BLOCKS here if nothing pending.
5. check — setImmediate() callbacks
6. close callbacks — socket close events

Between EACH phase, Node drains microtask queues:
• process.nextTick() (higher priority than Promises)
• Promise microtask queue

setImmediate(() => console.log('setImmediate'));
setTimeout(() => console.log('setTimeout'), 0);
Promise.resolve().then(() => console.log('Promise'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');

Output:
sync
nextTick     ← microtask, highest priority
Promise      ← microtask
setTimeout   ← timers phase (order vs setImmediate non-deterministic outside I/O!)
setImmediate ← check phase

INSIDE an I/O callback: setImmediate ALWAYS fires before setTimeout.

THE THREAD POOL (libuv):
For operations without async OS support (file system, crypto, DNS lookup):
libuv uses a thread pool (default 4 threads). 
These run in background threads — when done, callbacks go to event queue.

fs.readFile('large.json', callback);      // thread pool — non-blocking
JSON.parse(fs.readFileSync('large.json')); // BLOCKS main thread!

DIFFERENCES FROM BROWSER:
• Browser has requestAnimationFrame (render pipeline)
• Node has process.nextTick (no browser equivalent)
• Node has setImmediate (no direct browser equivalent)
• Node has explicit phases (poll, check, timers)`
        },
        {
          id: "n2", difficulty: "medium", type: "common",
          question: "How do you design RESTful APIs? Explain versioning, error handling, and authentication.",
          answer: `REST PRINCIPLES:
• Stateless — each request contains all needed info
• Resource-based URLs — nouns, not verbs
• HTTP methods convey action
• Consistent response format

URL DESIGN:
GET    /api/v1/employees       — list
POST   /api/v1/employees       — create
GET    /api/v1/employees/:id   — get one
PATCH  /api/v1/employees/:id   — partial update
DELETE /api/v1/employees/:id   — delete

VERSIONING — URL versioning (/api/v1/) is most common and explicit.

CONSISTENT ERROR RESPONSES:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [{ "field": "hours", "message": "Must be 0-24" }]
  },
  "requestId": "uuid-for-tracing"
}

HTTP STATUS CODES — use correctly:
• 200 OK, 201 Created, 204 No Content
• 400 Bad Request, 401 Unauthorized (not logged in), 403 Forbidden (logged in, no permission)
• 404 Not Found, 409 Conflict, 422 Unprocessable Entity
• 429 Too Many Requests, 500 Internal Server Error

JWT AUTHENTICATION FLOW:
1. User logs in → server validates credentials
2. Server creates JWT: header.payload.signature
3. Payload: { userId, role, tenantId, exp }
4. Client stores in httpOnly cookie (safer than localStorage)
5. Each request: Authorization: Bearer <token>
6. Server verifies signature, checks expiry, extracts user

MIDDLEWARE PATTERN:
function authenticate(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}`
        },
        {
          id: "n3", difficulty: "hard", type: "tricky",
          question: "How do you handle multi-tenancy in Node.js? Explain the architecture you'd use.",
          answer: `Multi-tenancy is central to your experience. Here's the complete architecture.

TENANT ISOLATION STRATEGIES:

1. Separate databases per tenant (highest isolation — your approach):
Each tenant has their own database. Identify tenant and connect dynamically.

const tenantConnections = new Map();

async function getTenantConnection(tenantId) {
  if (tenantConnections.has(tenantId)) return tenantConnections.get(tenantId);
  
  const tenant = await MasterDB.Tenant.findById(tenantId);
  const conn = await mongoose.createConnection(tenant.dbConnectionString);
  tenantConnections.set(tenantId, conn);
  return conn;
}

// Middleware:
async function tenantMiddleware(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ error: 'Tenant not identified' });
  req.tenantDb = await getTenantConnection(tenantId);
  next();
}

// In routes:
app.get('/employees', tenantMiddleware, async (req, res) => {
  const Employee = req.tenantDb.model('Employee');
  res.json(await Employee.find());
});

2. Shared database, separate schemas (PostgreSQL):
SET search_path = tenant_acme;
SELECT * FROM employees;  // hits acme's schema

3. Shared tables with tenantId column (lowest isolation):
Every query MUST include tenantId — easy to miss.

TENANT IDENTIFICATION FROM REQUEST:
function identifyTenant(req) {
  // Option 1: Subdomain — acme.yourapp.com
  const subdomain = req.hostname.split('.')[0];
  
  // Option 2: Custom header (from API gateway)
  const tenantId = req.headers['x-tenant-id'];
  
  // Option 3: JWT claim
  return req.user?.tenantId;
}

CONNECTION POOLING:
• Can't have unlimited connections open
• Use LRU cache — evict idle connections
• Set connection limits per tenant for fairness`
        },
        {
          id: "n4", difficulty: "hard", type: "common",
          question: "How would you implement enterprise SSO with an external source of truth like SAP SuccessFactors?",
          answer: `In enterprise systems, authentication is not just "login works" — it's identity, provisioning, authorization, session management, and failure handling.

HIGH-LEVEL FLOW:
1. User hits app
2. App redirects to enterprise IdP / SAP auth flow
3. IdP authenticates user
4. App receives authorization code or signed assertion
5. Backend exchanges/validates it
6. Backend maps external identity to internal user + tenant
7. Backend issues app session/JWT with tenant-aware claims

CORE PRINCIPLE:
SuccessFactors (or external HR/identity platform) is the source of truth for identity attributes. Your app should enrich that data for app-specific roles, not fight it.

WHAT I WOULD STORE INTERNALLY:
{
  userId: 'u123',
  tenantId: 'acme',
  externalId: 'sf-9981',
  email: 'manager@acme.com',
  roles: ['manager'],
  status: 'active',
  lastLoginAt: new Date()
}

AUTH CALLBACK HANDLER:
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const tokenSet = await exchangeCodeForTokens(code);
  const profile = await fetchUserProfile(tokenSet.accessToken);
  const tenant = await resolveTenantFromDomain(profile.companyDomain);
  const user = await upsertUserFromExternalProfile(profile, tenant.id);
  const appToken = signJwt({
    userId: user.id,
    tenantId: tenant.id,
    roles: user.roles
  });
  res.cookie('token', appToken, { httpOnly: true, secure: true, sameSite: 'lax' });
  res.redirect('/dashboard');
});

IMPORTANT DESIGN DECISIONS:
• Never trust raw client-side claims — validate server-side
• Separate external identity from internal permissions
• Support just-in-time user provisioning on first login
• Keep tenant resolution deterministic — subdomain, domain mapping, or signed tenant claim

FAILURE CASES TO DISCUSS:
• IdP is down — graceful message, retry path, alerting
• User exists in IdP but not in your permission model — allow login but block app actions appropriately
• User moved org/role in source system — reconcile on login or sync
• Clock skew / token expiry — validate exp and refresh carefully

SECURITY DETAILS INTERVIEWERS LIKE:
• Use Authorization Code flow, not implicit flow
• Verify signature / issuer / audience on tokens
• Store app token in httpOnly cookie if browser app
• Log auth events with requestId, tenantId, externalId

REAL-WORLD ENTERPRISE ANSWER:
"I would treat SuccessFactors as the identity source, but keep authorization decisions in our application. Authentication tells me who the user is; my app still decides what that user can do inside a tenant."`
        },
        {
          id: "n5", difficulty: "hard", type: "tricky",
          question: "How do you design idempotent background jobs and retry-safe integrations?",
          answer: `If a sync job or webhook handler can run twice and corrupt data, it's not production-ready.

IDEMPOTENCY means:
Running the same operation once or multiple times produces the same final state.

WHY THIS MATTERS IN YOUR KIND OF SYSTEM:
• Queue retries happen
• External APIs time out after doing the work
• Workers crash mid-processing
• Deployments may restart running jobs

BAD EXAMPLE:
await Overtime.create(payload);
// Retry creates duplicates

BETTER APPROACH — use stable business keys:
await Overtime.updateOne(
  { tenantId, externalRecordId: payload.id },
  { $set: normalize(payload) },
  { upsert: true }
);

JOB-LEVEL IDEMPOTENCY:
const dedupeKey = {tenantId}:{syncType}:{windowStart}';
const existing = await SyncRun.findOne({ dedupeKey, status: 'completed' });
if (existing) return;

await SyncRun.updateOne(
  { dedupeKey },
  { $setOnInsert: { tenantId, syncType, startedAt: new Date(), status: 'running' } },
  { upsert: true }
);

PATTERNS I USE:
1. Upserts instead of blind inserts
2. Unique constraints on business identifiers
3. Idempotency keys for APIs/webhooks
4. Checkpointing for long-running jobs
5. Explicit job state table/log

CHECKPOINTING EXAMPLE:
If syncing 50,000 employees, store last processed page/cursor.
If worker dies on page 38, restart from page 38 — not from scratch.

RETRY DESIGN:
• Retry transient failures: network timeouts, 429, temporary 5xx
• Don't blindly retry validation failures or bad payloads
• Use exponential backoff with jitter
• Dead-letter truly failed jobs for manual inspection

INTERVIEW SOUND BITE:
"Retries are only safe when the write path is idempotent. Otherwise, a reliability feature becomes a data corruption feature."`
        },
        {
          id: "n6", difficulty: "medium", type: "common",
          question: "How do you build audit logging for enterprise systems without turning it into noisy useless data?",
          answer: `Enterprise audit logging is not "console.log but more." It must answer: who did what, to what, when, in which tenant, and what changed.

WHAT SHOULD BE AUDITED:
• Permission-sensitive actions: approve, reject, delete, role change
• Config changes: workflow edits, tenant settings, integrations
• Authentication events: login success/failure, SSO mapping issues
• Data sync events: start, completion, partial failure, record counts

GOOD AUDIT EVENT SHAPE:
{
  tenantId: 'acme',
  actorId: 'u123',
  action: 'overtime.approved',
  entityType: 'overtime_record',
  entityId: 'ot789',
  metadata: { previousStatus: 'pending', newStatus: 'approved' },
  requestId: 'req-456',
  createdAt: new Date()
}

IMPORTANT PRINCIPLES:
1. Structured, queryable logs — not free-text blobs
2. Separate audit logs from app debug logs
3. Capture before/after only where valuable
4. Never log secrets or sensitive tokens

MIDDLEWARE / SERVICE-LAYER APPROACH:
async function approveOvertime(recordId, actor) {
  const before = await Overtime.findById(recordId);
  const updated = await Overtime.findByIdAndUpdate(
    recordId,
    { status: 'approved', approvedBy: actor.userId },
    { new: true }
  );
  await AuditLog.create({
    tenantId: actor.tenantId,
    actorId: actor.userId,
    action: 'overtime.approved',
    entityType: 'overtime_record',
    entityId: recordId,
    metadata: { beforeStatus: before.status, afterStatus: updated.status }
  });
  return updated;
}

HOW TO KEEP IT USEFUL:
• Define event taxonomy up front
• Add requestId / correlationId for tracing
• Retain important business events longer than noisy system logs
• Build admin filters: by tenant, actor, action, entity, date

REAL ENTERPRISE EXPECTATION:
During an incident or compliance review, you should be able to answer in minutes:
"Who changed this workflow, when did they change it, and which records were affected?"`
        }
      ]
    },
    {
      id: "databases", title: "Databases", icon: "🗄", color: "#4DB33D", textColor: "#ffffff", estimatedHours: 5,
      questions: [
        {
          id: "db1", difficulty: "medium", type: "common",
          question: "Explain MongoDB indexing deeply — types, query optimization, pagination.",
          answer: `Without indexes, every query does a full collection scan (COLLSCAN) — reads every document. An index is a B-tree data structure storing data in easy-to-traverse form.

TYPES OF INDEXES:

Single field:
db.employees.createIndex({ tenantId: 1 })  // 1=asc, -1=desc

Compound (column order matters!):
db.employees.createIndex({ tenantId: 1, department: 1, status: 1 })
INDEX PREFIX RULE: also serves queries on { tenantId } and { tenantId, department }
but NOT { department } alone.

ESR RULE for compound indexes: Equality → Sort → Range
// Find employees in tenant X, in IT, hired after 2022, sorted by name:
db.employees.createIndex({ tenantId: 1, department: 1, hireDate: 1, name: 1 })

Sparse index: Only indexes documents where field exists. Good for optional fields.
TTL index: Auto-delete documents after time period:
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })

QUERY OPTIMIZATION — use explain():
db.overtime.find({ tenantId: 'X', status: 'pending' }).explain('executionStats')
Look for: COLLSCAN (bad!) vs IXSCAN (good!)
Check: totalDocsExamined vs nReturned — should be close

COVERED QUERY — all data in index, zero document reads (fastest!):
// Index: { tenantId: 1, status: 1, _id: 1 }
db.overtime.find(
  { tenantId: 'X', status: 'pending' },
  { _id: 1, tenantId: 1, status: 1 }  // only indexed fields in projection
)

PAGINATION:
// Offset pagination (slow for large offsets):
db.records.find().skip(10000).limit(20);  // scans 10,020 docs!

// Cursor-based pagination (fast — uses index directly):
// First page:
db.records.find({ tenantId: 'X' }).sort({ _id: 1 }).limit(20);
// Next page (use last _id):
db.records.find({ tenantId: 'X', _id: { $gt: lastId } }).sort({ _id: 1 }).limit(20);
// O(log n) regardless of how deep you paginate`
        },
        {
          id: "db2", difficulty: "hard", type: "common",
          question: "Explain MongoDB aggregation pipeline — build a complex real-world example.",
          answer: `The aggregation pipeline is a sequence of stages transforming documents — like Unix pipes. Each stage takes output of previous as input.

CORE STAGES:
$match — filter early (like WHERE) — PUT FIRST to reduce docs
$group — aggregate and compute (like GROUP BY)
$project — reshape, include/exclude fields
$lookup — join with another collection
$unwind — flatten arrays
$sort, $limit, $skip — pagination/ordering
$addFields — add computed fields

REAL EXAMPLE — Monthly overtime summary per department for your platform:

db.overtimeRecords.aggregate([
  // Stage 1: Filter early — use indexes!
  { $match: {
    tenantId: 'acme-corp',
    date: { $gte: new Date('2024-01-01'), $lte: new Date('2024-12-31') },
    status: 'approved'
  }},

  // Stage 2: Join with employees for department info
  { $lookup: {
    from: 'employees',
    localField: 'employeeId',
    foreignField: '_id',
    as: 'employee'
  }},
  { $unwind: '$employee' },

  // Stage 3: Add computed time fields
  { $addFields: {
    month: { $month: '$date' },
    year: { $year: '$date' }
  }},

  // Stage 4: Group by year, month, department
  { $group: {
    _id: { year: '$year', month: '$month', department: '$employee.department' },
    totalHours: { $sum: '$hours' },
    uniqueEmployees: { $addToSet: '$employeeId' },
    avgHours: { $avg: '$hours' }
  }},

  // Stage 5: Add count from set
  { $addFields: { employeeCount: { $size: '$uniqueEmployees' } }},

  // Stage 6: Clean up output
  { $project: {
    uniqueEmployees: 0,
    _id: 0,
    year: '$_id.year', month: '$_id.month',
    department: '$_id.department',
    totalHours: 1,
    avgHours: { $round: ['$avgHours', 2] },
    employeeCount: 1
  }},

  { $sort: { year: 1, month: 1, totalHours: -1 } }
]);

PERFORMANCE TIPS:
• $match and $sort at the START can use indexes
• allowDiskUse: true for large pipelines (>100MB memory limit)
• $out to write results to a collection for heavy reporting queries`
        },
        {
          id: "db3", difficulty: "hard", type: "tricky",
          question: "Explain SQL query optimization — execution plans, indexes, common anti-patterns.",
          answer: `EXPLAIN ANALYZE — always start here:
EXPLAIN ANALYZE
SELECT e.name, o.hours FROM employees e
JOIN overtime_records o ON e.id = o.employee_id
WHERE e.tenant_id = 'acme' AND o.status = 'approved';

Look for: Seq Scan (bad for large tables) vs Index Scan vs Index Only Scan (best)

TYPES OF SCANS:
• Seq Scan — reads entire table
• Index Scan — uses index, fetches from table
• Index Only Scan — all data in index, zero table reads (fastest)
• Bitmap Heap Scan — collects index entries first, fetches pages efficiently

SQL INDEXES:
CREATE INDEX idx_overtime_tenant_status_date
ON overtime_records(tenant_id, status, date);

Partial index — smaller, faster for specific queries:
CREATE INDEX idx_pending_overtime
ON overtime_records(tenant_id, date)
WHERE status = 'pending';

JOIN ALGORITHMS (query planner chooses):
• Nested Loop Join — good when one table is small
• Hash Join — good for larger tables, build hash from smaller
• Merge Join — both tables sorted on join key

ANTI-PATTERNS:

Function on indexed column — BREAKS index:
WHERE YEAR(date) = 2024           -- can't use index!
WHERE date >= '2024-01-01' AND date < '2025-01-01'  -- can use index!

Leading wildcard — BREAKS index:
WHERE name LIKE '%animesh%'  -- full scan
WHERE name LIKE 'animesh%'   -- can use index

SELECT * — prevents Index Only Scan:
SELECT * FROM employees          -- fetches unnecessary columns
SELECT id, name FROM employees   -- can potentially be covered

NOT IN with NULL — dangerous:
WHERE id NOT IN (SELECT employee_id FROM blacklist)
-- If blacklist has NULLs, returns 0 rows!
-- Use NOT EXISTS instead

N+1 QUERY — classic ORM problem:
SELECT * FROM employees;          -- 1 query
-- then for each: SELECT * FROM overtime WHERE employee_id = ?  -- N queries!
-- Fix: JOIN or use includes() in your ORM`
        },
        {
          id: "db4", difficulty: "hard", type: "common",
          question: "How would you model a configurable approval workflow engine in the database?",
          answer: `This is a classic "schema must support business flexibility without becoming chaos" problem.

I would separate 3 things:
1. Workflow definition
2. Workflow runtime instance
3. Audit/action history

1. WORKFLOW DEFINITION:
{
  _id: 'wf-standard-overtime',
  tenantId: 'acme',
  name: 'Standard Overtime Workflow',
  triggers: { requestType: 'overtime' },
  steps: [
    { level: 1, approverType: 'manager' },
    { level: 2, approverType: 'department_head', condition: 'hours > 40' },
    { level: 3, approverType: 'hr', condition: 'hours > 80' }
  ],
  version: 3,
  isActive: true
}

2. WORKFLOW RUNTIME INSTANCE:
{
  _id: 'inst-123',
  tenantId: 'acme',
  requestId: 'ot-789',
  workflowId: 'wf-standard-overtime',
  workflowVersion: 3,
  currentStep: 2,
  status: 'pending_department_head',
  startedAt: new Date()
}

3. ACTION HISTORY:
{
  workflowInstanceId: 'inst-123',
  action: 'approved',
  actorId: 'mgr-22',
  step: 1,
  comments: 'Approved for release week support',
  createdAt: new Date()
}

WHY SEPARATE DEFINITION FROM INSTANCE:
If admin changes workflow tomorrow, in-flight requests should continue using the version they started with.
Never let historical approvals mutate because configuration changed later.

KEY DESIGN DECISIONS:
• Version workflow definitions
• Store current step + status denormalized for fast queries
• Keep action history append-only
• Support conditions but validate them carefully

QUERY PATTERNS YOU SHOULD OPTIMIZE:
• "Show my pending approvals"
• "Show all overtime requests pending at HR"
• "Show workflow config for tenant X"
• "Show full history for request Y"

INDEX EXAMPLES:
db.workflowInstances.createIndex({ tenantId: 1, status: 1, currentApproverId: 1 })
db.workflowActions.createIndex({ workflowInstanceId: 1, createdAt: 1 })
db.workflowDefinitions.createIndex({ tenantId: 1, isActive: 1, requestType: 1 })

INTERVIEW TAKE:
"Workflow engines fail when config and runtime state are mixed together. I want config to stay flexible, and execution state to stay deterministic and auditable."`
        },
        {
          id: "db5", difficulty: "hard", type: "tricky",
          question: "When would you choose MongoDB vs MySQL in a multi-tenant enterprise product?",
          answer: `Interviewers are usually testing whether you choose databases by problem shape, not by habit.

WHEN MONGODB FITS WELL:
• Flexible tenant-specific configuration
• Nested documents like workflow definitions
• Rapid iteration on evolving schemas
• High-write sync pipelines with document-style data

WHEN MYSQL FITS WELL:
• Strong relational consistency
• Complex joins and reporting
• Mature transactional workflows
• Clear structured entities with stable schema

HOW I THINK ABOUT IT:
1. Data shape — document-oriented or highly relational?
2. Query patterns — simple lookups or complex joins/aggregations?
3. Consistency requirements — eventual vs strict transactional guarantees?
4. Growth of schema variance across tenants

REAL-WORLD EXAMPLE FROM YOUR PROFILE:
MongoDB made sense for configurable workflow definitions, tenant-specific settings, and sync-heavy app data because document structure can vary.
MySQL made sense in places where reporting, relational integrity, or structured bulk update workflows were central.

TRADEOFFS TO EXPLAIN:
MONGODB:
• Faster iteration on evolving schemas
• Natural fit for nested workflow config
• But joins are weaker and careless indexing hurts quickly

MYSQL:
• Strong query planner and mature joins
• Easier to reason about relational integrity
• But schema changes can be slower when business models evolve rapidly

DON'T SAY:
"MongoDB is for scale, MySQL is old-school."

SAY THIS:
"I'd pick based on access patterns and operational constraints. In a multi-tenant SaaS product, config-heavy and tenant-variable data often fits MongoDB well, while highly relational reporting or transactional workflows may fit MySQL better."`
        }
      ]
    },
    {
      id: "systemdesign", title: "System Design", icon: "⚙", color: "#6366F1", textColor: "#ffffff", estimatedHours: 6,
      questions: [
        {
          id: "sd1", difficulty: "hard", type: "common",
          question: "Design a multi-tenant SaaS overtime management system (directly from your experience).",
          answer: `This is directly your work — answer with confidence. Here's the interview structure:

STEP 1 — REQUIREMENTS CLARIFICATION (always do this first):
• How many tenants? (hundreds to thousands)
• Users per tenant? (1000+ in your case)
• Isolation requirements? (strict — compliance driven)
• SSO? (SAP SuccessFactors in your case)
• Multi-timezone? (yes — global workforce)

STEP 2 — HIGH-LEVEL ARCHITECTURE:

[Load Balancer]
      |
[API Gateway / SAP BTP]
      |
[Auth Service]  [API Service]
                    |
        [Tenant Resolution Middleware]
                    |
            [Master Config DB]  ← tenant metadata, feature flags
                    |
        [Dynamic DB Connection Pool]
          /    |     |    \
      [DB-T1] [DB-T2] [DB-T3]...  (per-tenant isolated databases)

STEP 3 — DATABASE ARCHITECTURE:
Master DB: tenants { id, name, dbConnectionString, config, plan }
Tenant DB: employees, overtime_records, approval_workflows

WHY per-tenant DBs over shared?
• Data isolation for compliance
• No noisy neighbor problem
• Tenant-specific schema flexibility
• Simpler backup/restore per tenant

STEP 4 — CONFIGURABLE APPROVAL WORKFLOW:
{
  workflowId: 'standard-overtime',
  steps: [
    { level: 1, approverType: 'direct_manager', timeout: '48h', onTimeout: 'auto_approve' },
    { level: 2, approverType: 'department_head', condition: 'hours > 40' },
    { level: 3, approverType: 'hr', condition: 'hours > 80' }
  ]
}

STEP 5 — DATA SYNC DESIGN:
SAP SuccessFactors → Sync Service → [Daily Employee Sync] [6-hour Overtime Sync]
                                                    ↓
                                        MongoDB bulk upsert with batching
                                                    ↓
                                     Notify affected workflows if data changed

WHY 6-hour overtime sync? Multi-timezone — "end of day" in Tokyo is mid-day in London.

STEP 6 — SCALABILITY:
• Stateless API servers behind load balancer
• Redis for permission caching (don't hit master DB on every request)
• Bull/BullMQ for job queue — retries, distributed, monitoring
• Connection pool with LRU eviction for tenant DB connections`
        },
        {
          id: "sd2", difficulty: "hard", type: "common",
          question: "Design an RBAC system for an enterprise SaaS platform.",
          answer: `CORE ENTITIES:
Users → assigned → Roles → contain → Permissions → on → Resources

SCHEMA DESIGN:
// Role (can be tenant-specific):
{ _id: 'role_manager', name: 'Manager', tenantId: 'acme',
  permissions: [
    { resource: 'overtime', actions: ['view', 'approve', 'reject'] },
    { resource: 'employee', actions: ['view'] }
  ]
}

// User role assignments with optional scope:
{ userId: 'u123', tenantId: 'acme',
  roles: [
    { roleId: 'role_manager', scope: 'department:engineering' }
    // scope: can only approve overtime for engineering dept
  ]
}

PERMISSION CHECKING — encode in JWT for stateless checks:
// JWT payload: { userId, tenantId, roles: ['manager'], permissions: [...] }

function can(resource, action) {
  return (req, res, next) => {
    // Cross-tenant check:
    if (req.params.tenantId && req.params.tenantId !== req.user.tenantId) {
      return res.status(403).json({ error: 'Cross-tenant access denied' });
    }
    const hasPermission = req.user.permissions.some(p =>
      p.resource === resource && p.actions.includes(action)
    );
    if (!hasPermission) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
router.post('/overtime/:id/approve', authenticate, can('overtime', 'approve'), handler);

SCOPE-BASED FILTERING (manager sees only their team):
async function getOvertimeRecords(user, filters) {
  const baseQuery = { tenantId: user.tenantId, ...filters };
  if (user.roles.includes('manager')) {
    const teamIds = await getTeamMemberIds(user.userId);
    baseQuery.employeeId = { $in: teamIds };
  } else if (!user.roles.includes('hr')) {
    baseQuery.employeeId = user.employeeId;  // employee sees only their own
  }
  return OvertimeRecord.find(baseQuery);
}

CACHING PERMISSIONS IN REDIS:
async function getUserPermissions(userId, tenantId) {
  const key = 'permissions:' + tenantId + ':' + userId;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const permissions = await buildPermissions(userId, tenantId);
  await redis.setex(key, 300, JSON.stringify(permissions));  // 5 min TTL
  return permissions;
}
// On role change: await redis.del(key);  — invalidate cache

AUDIT LOGGING — critical for enterprise:
Log every permission-sensitive action with actor, resource, result, timestamp.`
        },
        {
          id: "sd3", difficulty: "hard", type: "tricky",
          question: "Design a cron job and data sync system with failure handling and monitoring.",
          answer: `ARCHITECTURE using Bull/BullMQ (Redis-backed job queue):

SCHEDULING:
// Daily at 2am UTC (off-peak):
cron.schedule('0 2 * * *', async () => {
  const tenants = await getAllActiveTenants();
  tenants.forEach((tenant, index) => {
    employeeSyncQueue.add('sync', { tenantId: tenant.id }, {
      delay: index * 5000,  // stagger to avoid hammering SAP API
      attempts: 3,
      backoff: { type: 'exponential', delay: 60000 },  // 1min, 2min, 4min
      removeOnComplete: 100,
      removeOnFail: 200
    });
  });
});

WORKER WITH PROPER ERROR HANDLING:
const worker = new Worker('employee-sync', async (job) => {
  const { tenantId } = job.data;
  
  await job.updateProgress(10);
  const sapEmployees = await fetchFromSuccessFactors(tenantId);
  await job.updateProgress(40);
  
  // Batch processing to avoid memory issues:
  const BATCH_SIZE = 500;
  for (let i = 0; i < sapEmployees.length; i += BATCH_SIZE) {
    const batch = sapEmployees.slice(i, i + BATCH_SIZE);
    const ops = batch.map(emp => ({
      updateOne: {
        filter: { sapEmployeeId: emp.id, tenantId },
        update: { $set: mapSapToInternal(emp) },
        upsert: true
      }
    }));
    await Employee.bulkWrite(ops, { ordered: false });  // continue on partial failure!
    await job.updateProgress(40 + (i / sapEmployees.length) * 55);
  }
  
  // Detect deleted employees:
  const syncedIds = sapEmployees.map(e => e.id);
  await Employee.updateMany(
    { tenantId, sapEmployeeId: { $nin: syncedIds } },
    { $set: { status: 'inactive' } }
  );
});

// All retries exhausted — alert:
worker.on('failed', (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    sendSlackAlert('Sync failed for ' + job.data.tenantId + ': ' + err.message);
  }
});

SYNC LOG FOR AUDIT TRAIL:
{ tenantId, type: 'employee', startedAt, completedAt, status, recordCount, error }

MONITORING ENDPOINT:
app.get('/admin/sync-status', authenticate, authorize('admin'), async (req, res) => {
  const queueCounts = await employeeSyncQueue.getJobCounts();
  const recentLogs = await SyncLog.find().sort({ startedAt: -1 }).limit(20);
  res.json({ queueCounts, recentLogs });
});`
        },
        {
          id: "sd4", difficulty: "hard", type: "common",
          question: "Design an offline-first enterprise time tracking mobile application.",
          answer: `This is one of your strongest project stories because it combines product behavior, sync design, mobile constraints, and enterprise trust.

CORE REQUIREMENTS:
• Employees can clock in/out even without internet
• Data eventually syncs when connectivity returns
• Multi-tenant and secure
• Prevent duplicate or conflicting time entries

HIGH-LEVEL ARCHITECTURE:
[React Native App]
   |
[Local Storage / SQLite]
   |
[Sync Manager]
   |
[API Gateway]
   |
[Time Tracking Service]
   |
[Tenant DB]

ON DEVICE, I WOULD STORE:
• Current session state (clocked in / clocked out)
• Pending offline events queue
• Last successful sync timestamp
• Minimal reference data needed for offline UX

EVENT MODEL:
Instead of directly mutating server state offline, queue intent events:
[
  { type: 'CLOCK_IN', localEventId: 'e1', timestamp: '2026-05-01T08:00:00Z' },
  { type: 'CLOCK_OUT', localEventId: 'e2', timestamp: '2026-05-01T17:00:00Z' }
]

WHY THIS HELPS:
An event queue is easier to replay, dedupe, audit, and debug than trying to keep a half-synced mutable record.

SYNC STRATEGY:
1. Detect connectivity regain
2. Send queued events in order
3. Backend acknowledges processed event IDs
4. Client marks only confirmed events as synced

CONFLICT HANDLING:
• Use idempotency keys / localEventId
• If same event is replayed, backend should safely ignore duplicate
• If admin edited times on server meanwhile, mark record for manual review instead of silent overwrite

SECURITY:
• Encrypt sensitive local data where possible
• Keep auth/session renewal separate from sync queue
• Tenant context must be bound to events — no cross-tenant leakage

INTERVIEW CLOSER:
"Offline-first is not just caching screens. It's designing a reliable local source of truth, a replayable sync protocol, and clear conflict rules so the business still trusts the final data."`
        },
        {
          id: "sd5", difficulty: "hard", type: "common",
          question: "Design an admin-configurable approval workflow engine for an enterprise product.",
          answer: `The hardest part is balancing flexibility for admins with predictability for the runtime engine.

WHAT ADMINS WANT:
• Configure approver chains without code changes
• Add conditional levels
• Change SLA / timeout rules
• Enable tenant-specific policies

WHAT ENGINEERING NEEDS:
• Deterministic execution
• Auditability
• Versioning
• Safety against broken config

SYSTEM COMPONENTS:
[Admin UI]
    |
[Workflow Config Service]
    |
[Validation Layer]
    |
[Workflow Definition Store]
    |
[Workflow Runtime Engine] <-> [Notification Service]

VALIDATION BEFORE PUBLISH:
• No circular steps
• Required approver types resolvable
• Conditions syntactically valid
• Timeout actions supported

EXAMPLE CONFIG:
{
  requestType: 'overtime',
  steps: [
    { level: 1, approver: 'direct_manager' },
    { level: 2, approver: 'department_head', when: 'hours > 40' },
    { level: 3, approver: 'hr', when: 'weekend == true' }
  ]
}

RUNTIME LOGIC:
1. Request submitted
2. Engine loads workflow definition version
3. Evaluates conditions against request
4. Resolves next approver
5. Waits for action / timeout
6. Advances state and logs every transition

KEY DECISION:
Never execute directly from the mutable "latest config." Snapshot the version at workflow start.

FAILURE / EDGE CASES:
• Approver no longer exists
• Manager hierarchy unavailable from source system
• Config changed mid-process
• Timeout hits while integration is degraded

HOW TO SOUND SENIOR:
"I'd build the engine around versioned definitions, validated config, and an append-only action log. Flexibility for admins is valuable only if runtime behavior stays deterministic."`
        },
        {
          id: "sd6", difficulty: "hard", type: "tricky",
          question: "How would you scale a people-data platform handling 100K+ employees and peak review-cycle traffic?",
          answer: `At this scale, the key is not one silver bullet. It's removing bottlenecks across reads, writes, sync, caching, and operations.

FIRST, IDENTIFY TRAFFIC SHAPE:
• Heavy bulk reads during review cycles
• Burst writes from approval actions and mass updates
• Expensive permission checks
• Background sync load competing with foreground traffic

SCALING PLAN:
1. Stateless app instances behind load balancer
2. Separate background workers from request-serving APIs
3. Redis cache for hot permission / config data
4. Database indexes driven by actual query patterns
5. Queue heavy bulk work instead of doing it inline

READ PATH OPTIMIZATION:
• Cache tenant config and permission graphs
• Precompute or denormalize where justified
• Use cursor pagination for large lists
• Avoid N+1 calls between services

WRITE PATH OPTIMIZATION:
• Batch updates where possible
• Make long-running changes asynchronous
• Ensure retries are idempotent
• Use optimistic UI only where business risk allows

BACKGROUND LOAD CONTROL:
Don't let sync pipelines starve user-facing traffic.
Separate worker pools, stagger tenant syncs, and cap concurrency.

OBSERVABILITY:
Track:
• p95/p99 API latency
• queue backlog
• sync duration by tenant
• cache hit ratio
• slow query logs

WHAT I WOULD SAY FROM EXPERIENCE:
"When systems approach peak enterprise load, performance work stops being about isolated endpoints. It's about traffic shaping, protecting the critical path, and making background work predictable instead of opportunistic."`
        }
      ]
    },
    {
      id: "dsa", title: "DSA & Problem Solving", icon: "∑", color: "#E11D48", textColor: "#ffffff", estimatedHours: 5,
      questions: [
        {
          id: "dsa1", difficulty: "medium", type: "common",
          question: "Two Sum and the general HashMap pattern for array problems.",
          answer: `TWO SUM: Given array and target, return indices of two numbers that add up to target.

Brute force O(n²):
for (let i = 0; i < nums.length; i++)
  for (let j = i+1; j < nums.length; j++)
    if (nums[i] + nums[j] === target) return [i, j];

Optimized HashMap O(n):
function twoSum(nums, target) {
  const seen = new Map();  // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
}

THE PATTERN: Store seen values in HashMap. For each element, check if its "complement" was seen before. Single pass = O(n).

VARIATIONS TO KNOW:

1. Contains Duplicate (use Set):
function containsDuplicate(nums) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}

2. Group Anagrams (use sorted string as key):
function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.values()];
}

3. Subarray Sum Equals K (prefix sum + HashMap):
function subarraySum(nums, k) {
  const prefixCounts = new Map([[0, 1]]);
  let sum = 0, count = 0;
  for (const num of nums) {
    sum += num;
    count += prefixCounts.get(sum - k) || 0;
    prefixCounts.set(sum, (prefixCounts.get(sum) || 0) + 1);
  }
  return count;
}

ALWAYS DISCUSS: Time/space complexity. Clarify: sorted? duplicates? same element twice?`
        },
        {
          id: "dsa2", difficulty: "medium", type: "common",
          question: "Sliding Window pattern — solve Longest Substring Without Repeating Characters.",
          answer: `SLIDING WINDOW: Optimal for contiguous subarrays/substrings where you need max/min satisfying a condition.

LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS:
function lengthOfLongestSubstring(s) {
  const charIndex = new Map();  // char → last seen index
  let maxLen = 0, left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    
    // If char seen AND inside current window:
    if (charIndex.has(char) && charIndex.get(char) >= left) {
      left = charIndex.get(char) + 1;  // shrink window past duplicate
    }
    
    charIndex.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
// "abcabcbb" → 3, "bbbbb" → 1, "pwwkew" → 3
// Time O(n), Space O(min(n, alphabet))

MINIMUM WINDOW SUBSTRING (hard variant):
function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  
  let have = 0, required = need.size;
  let left = 0, minLen = Infinity, minStart = 0;
  const window = new Map();
  
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    window.set(c, (window.get(c) || 0) + 1);
    if (need.has(c) && window.get(c) === need.get(c)) have++;
    
    while (have === required) {
      if (right - left + 1 < minLen) { minLen = right - left + 1; minStart = left; }
      const lc = s[left];
      window.set(lc, window.get(lc) - 1);
      if (need.has(lc) && window.get(lc) < need.get(lc)) have--;
      left++;
    }
  }
  return minLen === Infinity ? '' : s.slice(minStart, minStart + minLen);
}

WHEN TO USE SLIDING WINDOW:
• "longest/shortest subarray/substring"
• "contiguous" or "consecutive" in problem
• O(n) solution expected
• Two pointer variation for sorted arrays`
        },
        {
          id: "dsa3", difficulty: "medium", type: "common",
          question: "Binary Search — classic and on answer space.",
          answer: `Binary search eliminates HALF the search space each step. O(log n) — not just for sorted arrays.

CLASSIC:
function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);  // avoid overflow
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

FIND FIRST OCCURRENCE (leftmost):
function findFirst(nums, target) {
  let left = 0, right = nums.length - 1, result = -1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) { result = mid; right = mid - 1; }  // keep looking left!
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return result;
}

SEARCH IN ROTATED SORTED ARRAY:
function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) {  // left half is sorted
      if (target >= nums[left] && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {  // right half is sorted
      if (target > nums[mid] && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}

BINARY SEARCH ON ANSWER SPACE — powerful pattern:
// Min eating speed (Koko bananas problem):
function minEatingSpeed(piles, h) {
  let left = 1, right = Math.max(...piles);
  
  const canFinish = speed =>
    piles.reduce((hrs, pile) => hrs + Math.ceil(pile / speed), 0) <= h;
  
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (canFinish(mid)) right = mid;   // might go slower
    else left = mid + 1;               // need faster
  }
  return left;
}

TEMPLATE: left <= right for exact value. left < right for finding boundary.`
        },
        {
          id: "dsa4", difficulty: "medium", type: "common",
          question: "Tree traversals — DFS, BFS, and key tree problems.",
          answer: `TRAVERSAL PATTERNS:

DFS Recursive:
function inorder(root) {   // Left → Root → Right (sorted order for BST)
  if (!root) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}

DFS Iterative (stack) — inorder:
function inorderIterative(root) {
  const result = [], stack = [];
  let curr = root;
  while (curr || stack.length) {
    while (curr) { stack.push(curr); curr = curr.left; }  // go far left
    curr = stack.pop();
    result.push(curr.val);
    curr = curr.right;
  }
  return result;
}

BFS Level Order (queue):
function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

MAX DEPTH:
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

VALIDATE BST — must pass bounds:
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}

LOWEST COMMON ANCESTOR:
function lca(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lca(root.left, p, q);
  const right = lca(root.right, p, q);
  if (left && right) return root;  // p and q on different sides!
  return left || right;
}

PATTERN: Most tree problems = base case (null) + recurse left + recurse right + combine.`
        },
        {
          id: "dsa5", difficulty: "hard", type: "common",
          question: "Dynamic Programming — recognize patterns and solve classic problems.",
          answer: `DP = overlapping subproblems + optimal substructure.
Break into subproblems, store results to avoid recomputation.

FIBONACCI — learn both approaches:
// Memoization (top-down):
function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  return memo[n] = fib(n-1, memo) + fib(n-2, memo);
}

// Tabulation space-optimized (bottom-up):
function fib(n) {
  let [prev, curr] = [0, 1];
  for (let i = 2; i <= n; i++) [prev, curr] = [curr, prev + curr];
  return curr;
}

COIN CHANGE:
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

HOUSE ROBBER (1D DP):
function rob(nums) {
  let [prev2, prev1] = [0, 0];
  for (const num of nums) {
    const curr = Math.max(prev1, prev2 + num);
    [prev2, prev1] = [prev1, curr];
  }
  return prev1;
}

LONGEST COMMON SUBSEQUENCE (2D DP):
function lcs(s1, s2) {
  const dp = Array.from({ length: s1.length+1 }, () => new Array(s2.length+1).fill(0));
  for (let i = 1; i <= s1.length; i++)
    for (let j = 1; j <= s2.length; j++)
      dp[i][j] = s1[i-1] === s2[j-1]
        ? 1 + dp[i-1][j-1]
        : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[s1.length][s2.length];
}

RECOGNIZE DP WHEN YOU SEE:
• "minimum/maximum", "count ways", "is it possible"
• Making choices at each step
• Future choices depend on current choice
• Brute force would recompute same subproblems

FRAMEWORK:
1. What does dp[i] mean?
2. Recurrence: how to get dp[i] from smaller subproblems?
3. Base cases
4. Compute in correct order`
        }
      ]
    },
    {
      id: "leadership", title: "Technical Leadership", icon: "★", color: "#D97706", textColor: "#ffffff", estimatedHours: 3,
      questions: [
        {
          id: "l1", difficulty: "medium", type: "common",
          question: "How do you approach system design as a technical lead?",
          answer: `MY STRUCTURED PROCESS:

1. REQUIREMENTS GATHERING (never skip):
Before touching architecture, clarify:
• Functional: What does it do? What are the user flows?
• Non-functional: Scale? Performance? Availability? Compliance?
• Constraints: Timeline, team size, existing stack, budget

"At Veritas, when starting the overtime platform, I spent time upfront learning three things: data isolation was a compliance requirement (not just a preference), SAP SuccessFactors was the source of truth (not our system), and the workforce was global. Those three constraints shaped every major architectural decision."

2. HIGH-LEVEL DESIGN FIRST:
Sketch major components and data flow. No code yet.
• Identify main entities and their relationships
• Define service boundaries
• Understand read/write patterns and volumes

3. TECHNOLOGY SELECTION WITH JUSTIFICATION:
Not "I used MongoDB because I know it" but "MongoDB because tenant configurations vary significantly between customers — a flexible document model suited that better than a rigid relational schema."

4. IDENTIFY BOTTLENECKS AND FAILURE POINTS:
• What if SAP API is down? (queue the sync, retry with exponential backoff)
• What if a tenant DB is unavailable? (fail that tenant, don't affect others)
• What's the peak load time? (approval submissions at start of workday)

5. ITERATIVE REFINEMENT:
Architecture evolves. I added batching in sync pipeline after hitting performance issues with large tenants. Added Redis caching layer after noticing expensive repeated permission queries.

HOW I INVOLVE THE TEAM:
• Design docs before finalizing — junior devs spot use cases I miss
• Architecture Decision Records (ADRs) — document WHY we made choices
• Track tech debt explicitly — document shortcuts with a plan to fix them`
        },
        {
          id: "l2", difficulty: "medium", type: "common",
          question: "How do you handle code reviews? What do you look for?",
          answer: `Code review is one of the most impactful things a senior dev does — it shapes team quality and spreads knowledge.

WHAT I LOOK FOR (in priority order):

1. CORRECTNESS:
• Does it actually solve the problem?
• Edge cases: empty arrays, null values, concurrent requests, large inputs
• Error handling: what happens when DB call fails? External API times out?

2. SECURITY:
• Inputs validated and sanitized?
• Authorization checked (not just authentication)?
• Secrets ever logged or exposed?
• Injection vulnerabilities?

3. PERFORMANCE:
• N+1 query problems
• Missing indexes on new queries
• Synchronous operations that should be async
• Memory leaks (event listeners not cleaned)

4. MAINTAINABILITY:
• Would a new team member understand it?
• Are complex sections commented?
• Single responsibility? Magic numbers/strings?

5. TEST COVERAGE:
• Happy path AND edge cases?
• Tests for behavior, not implementation?

HOW I GIVE FEEDBACK:
• Distinguish blocking (must fix) from non-blocking (suggestion) — prefix with "nit:" or "blocking:"
• Always explain WHY, not just what — "This will cause N+1 queries because..."
• Ask questions more than make statements — "Would this handle the case where employee has no manager?"
• Acknowledge good work — "This is a clean approach to the batching problem"

FOR JUNIOR DEVELOPERS:
Be specific and educational. If someone writes a nested forEach, I don't just say "fix this" — I show the alternative, explain the performance difference, link to docs. Goal is growth, not just fixing the PR.

PULL REQUESTS I WON'T APPROVE:
• Missing error handling for network calls
• Hardcoded credentials or sensitive data
• Breaking changes without migration path
• No tests for critical business logic`
        },
        {
          id: "l3", difficulty: "medium", type: "common",
          question: "Tell me about a technical decision that didn't go as planned. How did you handle it?",
          answer: `This is a behavioral question testing self-awareness, accountability, and learning ability.
STRUCTURE: Situation → Decision → What went wrong → How you handled it → What you learned

EXAMPLE (adapt to your actual experience):

THE SITUATION:
When building the Mass Changes platform at Veritas, I made an early architecture decision to use a shared database with a tenantId column on every table. Reasoning: simpler to set up, tight deadline to meet.

WHAT WENT WRONG:
About three months in, two problems emerged as we onboarded larger tenants:
1. Query performance degraded — even with indexing, large tenants competed for DB resources (noisy neighbor problem)
2. A compliance review flagged that some enterprise clients required strict data isolation — they couldn't accept sharing a physical database with other companies

THE RESPONSE:
I was upfront with my manager and stakeholders immediately. I didn't try to paper over it or wait for it to become a customer-facing crisis. I presented the problem clearly, with data, and came with a migration proposal — not just a problem.

We designed a migration to per-tenant databases:
• Built migration tooling to move existing tenant data
• Rolled out tenant by tenant — smallest first to validate, then larger
• Kept old system running until migration confirmed successful

WHAT I LEARNED:
For enterprise SaaS, data isolation is a first-class requirement from day one. I now ask compliance questions in the very first architecture conversation, not after build starts.

I also started writing ADRs (Architecture Decision Records) — when requirements change, there's a clear record of what assumptions the original design was based on. If we'd had an ADR that said "this design assumes no strict isolation requirement", the compliance concern would have triggered an immediate architecture review.`
        },
        {
          id: "l4", difficulty: "medium", type: "common",
          question: "How do you mentor engineers and help them grow without micromanaging them?",
          answer: `Strong mentoring is a balance: enough structure that people grow, enough autonomy that they build judgment.

HOW I APPROACH IT:

1. UNDERSTAND THE PERSON FIRST:
I don't mentor everyone the same way. A junior engineer struggling with debugging needs different support than a mid-level engineer who writes code well but hesitates in design discussions.

2. GIVE OWNERSHIP, NOT JUST TASKS:
Instead of saying "build this API exactly this way," I try to give a clear outcome, constraints, and success criteria. Then I review their approach early enough to prevent drift.

3. USE 1:1s FOR GROWTH, NOT STATUS:
Status can happen in standups. In 1:1s, I focus on:
• what's blocking them
• what skill they want to build next
• where they're ready for more ownership

4. TEACH THROUGH CODE REVIEW:
I treat reviews as a teaching surface. If I block a change, I explain the tradeoff:
"This works functionally, but this query pattern will hurt us at scale because..."

5. RAISE THE BAR GRADUALLY:
If someone handled bug fixes well, next I give them a feature.
If they handled a feature well, next I let them own a small design discussion.
Growth should feel stretching, not drowning.

WHAT I AVOID:
• rewriting their code without explanation
• being the bottleneck for every decision
• giving only criticism and no path forward

REAL LEADERSHIP ANSWER:
"My goal is not to be the smartest person in the room every day. My goal is to help the team make more good decisions without needing me in every room."`
        },
        {
          id: "l5", difficulty: "medium", type: "common",
          question: "How do you handle stakeholder pressure when timelines conflict with technical reality?",
          answer: `This happens constantly at senior and lead levels. The key is to avoid two bad extremes: blindly saying yes, or sounding like engineering is just blocking the business.

MY APPROACH:

1. CLARIFY WHAT'S FIXED AND WHAT'S FLEXIBLE:
Is the date fixed?
Is scope fixed?
Is quality/compliance fixed?
Usually not all three can be fixed at once.

2. MAKE TRADEOFFS EXPLICIT:
I don't say "this is hard." I say:
• "We can hit the date if we reduce phase 1 scope"
• "We can ship this path now, but reporting/admin tooling follows in phase 2"
• "We should not cut tenant-isolation checks because that's a compliance risk, not a convenience"

3. BRING OPTIONS, NOT JUST OBJECTIONS:
Stakeholders respond better when engineering comes with choices:
Option A: safer architecture, slower timeline
Option B: faster delivery, limited scope
Option C: temporary workaround with explicit tech debt

4. TRANSLATE TECHNICAL RISK INTO BUSINESS RISK:
Instead of saying "this query design is weak," say
"At peak review-cycle load, this could slow approvals for thousands of managers."

5. DOCUMENT DECISIONS:
If we knowingly take a shortcut, I want it written down with impact and follow-up plan.

GOOD INTERVIEW FRAMING:
"I try to be solution-oriented but firm on high-risk areas. I'll negotiate scope aggressively before I negotiate away data integrity, security, or reliability."`
        },
        {
          id: "l6", difficulty: "medium", type: "common",
          question: "How do you handle technical disagreements with peers or stakeholders?",
          answer: `APPROACH: Separate the technical argument from the personal dynamic. Focus on data, not opinions.

WHEN DISAGREEING WITH A PEER:

Step 1 — Understand their position first:
Ask "Help me understand the reasoning here. What are the main benefits you see?"
Don't argue until you've truly heard their case — often you'll find a valid point.

Step 2 — Present concerns with specifics, not vague discomfort:
"My concern is specifically X — based on what I saw happen with Y in project Z."
Benchmarks and data beat opinions every time.

Step 3 — Find common ground in goals:
Both of you want the system to work well. The disagreement is about approach, not outcome.

Step 4 — Propose a decision mechanism:
"Can we do a 2-hour spike to benchmark both approaches?"
"Let's define success criteria — what would tell us which option is better?"

Step 5 — Disagree and commit once a decision is made:
"I still have reservations but we've discussed it and we're going with X. I'll support it fully."
Teams need to move forward. You don't need to win every argument.

WHEN DISAGREEING WITH STAKEHOLDERS:

Don't say "that's not possible." Say "here's what that involves and here are the trade-offs."
Frame technical concerns in business terms:
"Skipping the indexing step means tenant dashboards load in 8-10 seconds for large clients instead of under 1 second. Is that an acceptable trade-off for the earlier delivery?"

ESCALATION: If a stakeholder pushes something genuinely risky (security, data loss), escalate clearly and document that you raised the concern in writing.`
        },
        {
          id: "l7", difficulty: "medium", type: "common",
          question: "How do you estimate technical work? How do you handle scope creep?",
          answer: `ESTIMATION APPROACH:

1. BREAK DOWN FIRST, then estimate:
Never estimate a vague task. "Build overtime approval workflow" is not estimable.
"Design state machine schema", "Build approval API", "Integrate notification service" — each of these is.

2. THREE-POINT ESTIMATION:
For each task: Optimistic (O), Most Likely (M), Pessimistic (P)
Expected = (O + 4M + P) / 6
Forces you to think about what can actually go wrong.

3. HISTORICAL REFERENCE:
"This is similar to the Mass Changes feature which took 3 weeks."
Keep notes on actual vs estimated time — calibrate future estimates from real data.

4. ADD CONTINGENCY EXPLICITLY AND TRANSPARENTLY:
"This is 2 weeks assuming no major unknowns. The SAP integration adds 30% contingency for undocumented API behavior."
Don't hide buffer — stakeholders need to understand estimates include uncertainty.

5. STATE ASSUMPTIONS CLEARLY:
"I'm estimating 2 weeks assuming the API spec is stable and we have test credentials by day 3."
If assumptions break, the estimate changes — and stakeholders know this upfront.

HANDLING SCOPE CREEP:

Make it visible immediately:
"This change is outside the original scope — it adds approximately X days."
Never absorb scope silently. Silent scope kills deadlines without anyone understanding why.

Impact framing — give choices, not walls:
"We can add this. That means either (a) push deadline by X days, or (b) descope Y to keep deadline."
The business decides, not engineering.

The parking lot:
Keep a running list of "good ideas for v2." Stakeholders feel heard, scope stays controlled, delivery stays on track.`
        },
        {
          id: "l8", difficulty: "medium", type: "common",
          question: "Tell me about yourself. How would you describe your career trajectory?",
          answer: `STRUCTURE: Present -> Past -> Future. Practice this until it's natural — you'll give this answer at every interview.

FRAMEWORK:
1. Current role and key impact (30 seconds)
2. Most relevant past experience (60 seconds)
3. What you're looking for and why this company specifically (30 seconds)

EXAMPLE FOR YOUR PROFILE:
"I'm a Senior Full Stack Developer with 4.5 years of experience, most recently at Veritas Prime Labs where I led development of enterprise SaaS platforms — specifically an overtime management system and a time tracking mobile app serving organizations with 1000+ employees per tenant.

Before that, I built React data visualization dashboards at Next Quarter and worked full-stack on a lending platform at Trustt. My core strength is end-to-end product ownership — I'm comfortable from database schema design and API architecture through to complex frontend state management and mobile deployment. Over the last couple of years I've grown into a technical lead role: managing a team of 3 engineers, owning architecture decisions, and working directly with enterprise clients.

I'm looking for a role where I can have meaningful architectural ownership and continue growing into broader technical leadership. [Tailor: why THIS company specifically — show you researched them]"

TIPS:
- Practice until it flows naturally — not memorized, but well-rehearsed
- Tailor 'why here' for each company — shows genuine interest
- Quantify impact where possible: 100K+ users, 1000+ employees/tenant, team of 3
- Don't apologize for anything — own your story
- End with forward momentum: what you're excited about next`
        },
      ]
    },
    {
      id: "behavioral", title: "Behavioral & HR", icon: "💬", color: "#EC4899", textColor: "#ffffff", estimatedHours: 3,
      questions: [
        {
          id: "bh1", difficulty: "medium", type: "common",
          question: "What is your greatest strength? What is your greatest weakness?",
          answer: `STRENGTHS — be specific, back with evidence:

Don't say "I'm a hard worker" or "I'm a team player." Everyone says this.

STRONG ANSWER (specific and evidenced):
"My strongest skill is connecting system design to real product outcomes. I don't just implement what's asked — I ask why we're building it and what constraints matter. At Veritas, that led me to design the approval workflow engine as a configurable state machine rather than hardcoded logic. Three months later when a large client needed 4-level approvals instead of 2, we handled it with configuration instead of code changes. That kind of thinking has saved significant rework across multiple projects."

WEAKNESSES — be genuine, show self-awareness AND growth:

Red flags: "I'm a perfectionist", "I work too hard" — these aren't real answers and interviewers see through them.

STRONG ANSWER:
"I've historically been reluctant to push back on timelines early enough. When I sense a deadline is unrealistic, I'd optimize and try to make it work rather than flagging the concern early. I've learned that this leads to rushed work or silent stress, and stakeholders would rather know early. I now give estimates with explicit assumptions — 'I can hit the deadline IF X and Y are ready by day 3' — so timeline risk is visible from the start."

KEY FORMULA:
Real weakness + specific impact it had + concrete action you now take to manage it.
The action is what shows self-awareness has turned into actual growth.`
        },
        {
          id: "bh2", difficulty: "medium", type: "common",
          question: "What's your most significant technical achievement?",
          answer: `STRUCTURE: Context -> Challenge -> Your specific actions -> Measurable result.

EXAMPLE (from your Veritas work):

CONTEXT:
"When I joined the Veritas overtime project, the initial brief seemed straightforward — a simple overtime submission and approval system for enterprise HR."

CHALLENGE:
"As we dug deeper, we discovered the real scope: strict multi-tenant data isolation for compliance, integration with SAP SuccessFactors for employee sync across global timezones, and approval workflows that different enterprise clients needed to configure differently — some needed 2 levels, others 4, with conditional logic."

YOUR ACTIONS:
"I designed the entire architecture from scratch:
- Per-tenant database isolation to meet compliance requirements (not shared tables)
- Configurable approval workflow engine — a state machine driven by client config, not hardcoded logic
- Data sync pipeline with staggered cron jobs accounting for multi-timezone consistency
- SAP BTP deployment with multi-instance load balancing for peak usage periods
I also managed a team of 3 engineers and coordinated directly with enterprise clients throughout."

RESULT:
"Successfully deployed to production handling organizations with 1000+ employees per tenant. The configurable workflow engine paid off — multiple clients had unique approval requirements we handled with configuration, not custom code, reducing onboarding time significantly."

WHAT MAKES IT STRONG:
- Scale and complexity of the problem
- Why your approach was non-obvious (configurable engine vs. hardcoded)
- Technical depth (not just "I built a dashboard")
- Leadership dimension (team of 3, client coordination)
- Concrete, reusable outcome`
        },
        {
          id: "bh3", difficulty: "medium", type: "common",
          question: "Where do you see yourself in 5 years?",
          answer: `WHAT THEY'RE REALLY ASKING: Are you ambitious? Will you grow? Are you a flight risk in 6 months?

ANSWER FRAMEWORK:
1. Near-term (1-2 years): deepen technical expertise relevant to this role
2. Medium-term (3-5 years): broader ownership — technical direction, team, product influence
3. Connect back to THIS company: why this role is the right step toward that

EXAMPLE ANSWER:
"In the near term, I want to deepen my expertise in distributed systems and large-scale architecture — I've worked at enterprise SaaS scale but want to go deeper on the fundamentals that make systems truly reliable.

Over the next 3-5 years, I see myself growing into a Staff or Principal Engineer role — someone who shapes technical direction across multiple teams, not just executes within one. I'm genuinely interested in the intersection of technical leadership and product thinking.

I'm attracted to this role because [something specific and real about the company] — it feels like the right environment to grow in that direction."

TIPS:
- Don't say "I want to start my own company" — signals stepping stone mentality
- Don't say "I want your job" unless it's clearly a mentorship culture
- Be specific enough to sound genuine, flexible enough to stay open
- Always end by connecting it back to why THIS role at THIS company`
        },
        {
          id: "bh4", difficulty: "medium", type: "common",
          question: "Why are you leaving your current job?",
          answer: `RULE: Always frame as moving TOWARD something, never running FROM something — even if the reality is the latter.

AVOID:
- Complaining about your current company, manager, or team
- Vague "looking for new challenges" that sounds scripted
- Badmouthing former colleagues

GOOD FRAMEWORKS:

If the project ended / team scaled down:
"The project I was leading shipped successfully and the team scaled down naturally. It felt like the right moment to find a new challenge."

If you want more growth:
"I've learned a lot at Veritas — built and shipped an enterprise SaaS platform end-to-end, grew into a technical lead role. I've hit a point where I want to work at larger scale to keep growing technically."

If the company is going through transitions:
"The company has been going through some changes. I've been heads-down on delivery, but I've started being intentional about where I invest the next few years."

If you want better compensation:
"I've grown significantly — from IC to leading a team and owning architecture. I want to find a role where the compensation reflects that contribution more accurately."

ALWAYS FOLLOW WITH THE PULL:
Whatever you say about leaving, immediately follow with why you're interested in THIS company. That's what they actually care about.`
        },
        {
          id: "bh5", difficulty: "medium", type: "common",
          question: "How do you handle working under pressure or tight deadlines?",
          answer: `WHAT THEY'RE REALLY ASKING: Can you prioritize? Do you communicate when things go wrong? Can you maintain quality under pressure?

WHAT YOU ACTUALLY DO:

1. TRIAGE FIRST:
Understand what ACTUALLY must be done vs. what was assumed.
Often "tight deadline" tasks can be partially descoped without losing 80% of the value.

2. COMMUNICATE EARLY AND SPECIFICALLY:
The worst thing you can do is go silent and miss the deadline without warning.
"I'm 30% through and I can see this will take longer than expected because of X. I can deliver Y by the deadline if we push Z to next sprint."

3. PROTECT QUALITY ON THE CRITICAL PATH, relax elsewhere:
Be explicit about what you're cutting corners on (and why it's acceptable) vs. what you will not compromise on (security, data integrity, core logic).

4. PARALLELIZE WHERE POSSIBLE:
Unblock junior devs on well-scoped parts while you handle the unknown/complex parts.

EXAMPLE FROM YOUR WORK:
"During a peak sprint at Veritas, we had an enterprise client go-live that couldn't move. Two days before, we discovered the SAP sync was producing inconsistent data for employees with multiple roles. I immediately:
1. Triaged — identified 3 blocking bugs vs. 2 edge cases acceptable to go-live with
2. Communicated to the client proactively — go-live proceeds with known minor limitation, documented
3. Fixed the 3 blockers with a junior dev handling test verification in parallel
4. Deployed on time. The 2 edge cases were fixed in the first patch two days later."

That answer shows triage, communication, parallel execution, and a real outcome.`
        },
        {
          id: "bh6", difficulty: "medium", type: "common",
          question: "What are your salary expectations?",
          answer: `This is a negotiation, not a quiz. Your goal: give a range accurate to your worth without anchoring too low.

STRATEGY:

1. RESEARCH FIRST:
- Levels.fyi, Glassdoor, LinkedIn Salary, AmbitionBox (India)
- Talk to peers in similar roles at similar companies
- Know your BATNA — what other offers or options do you have?

2. LET THEM GO FIRST IF POSSIBLE:
"I'm flexible and want to understand the full package first. What's the budget for this role?"
If they press: "What's the typical range for this level at your company?"

3. IF YOU MUST GIVE A NUMBER — anchor high with a range:
The bottom of your range is what you'll likely receive. Make the bottom your actual target.
"Based on my research and experience, I'm targeting X to Y depending on the full compensation package."

4. DON'T UNDERSELL YOUR SENIORITY:
4.5 years + tech lead + enterprise SaaS + multi-tenant at scale is NOT a mid-level profile. Price it accordingly.

5. AFTER AN OFFER — negotiate, it's expected:
"Thank you for the offer. I'm excited about the role. Based on my experience and market rate for this level, I was hoping we could reach X. Is there flexibility?"

6. TOTAL COMPENSATION — look at everything:
Base, variable/bonus, equity (ESOP/RSUs), health insurance, WFH stipend, learning budget, notice period buyout.
Lower base with significant equity at a growth-stage startup can be worth more than a higher base at a stable company.`
        }
      ]
    },
    {
      id: "nextjs", title: "Next.js & SSR", icon: "▲", color: "#1a1a1a", textColor: "#ffffff", estimatedHours: 3,
      questions: [
        {
          id: "nj1", difficulty: "medium", type: "common",
          question: "Explain Next.js rendering strategies — SSR, SSG, ISR, CSR. When to use each?",
          answer: `CSR (Client-Side Rendering) — default React behavior:
HTML is an empty shell. JS downloads, runs, fetches data, then renders.
Good for: authenticated dashboards, highly dynamic content, pages not needing SEO.
// Just use useEffect + fetch — no special config needed

SSG (Static Site Generation) — built at deploy time:
HTML generated once at build time, served from CDN edge. Fastest possible first load.
Good for: marketing pages, blogs, docs — content that doesn't change per user.
export async function getStaticProps() {
  const posts = await fetchBlogPosts();
  return { props: { posts } };
}

SSR (Server-Side Rendering) — generated per request:
HTML generated on server on each request. Fresh data always. Slower than SSG.
Good for: SEO-important pages with user-specific or frequently changing data.
export async function getServerSideProps(context) {
  const data = await fetchUserData(context.req.cookies.token);
  return { props: { data } };
}

ISR (Incremental Static Regeneration) — best of both worlds:
Statically generated but revalidates in the background after N seconds.
Good for: product pages, listing pages — mostly static but need periodic updates.
export async function getStaticProps() {
  const data = await fetchProducts();
  return { props: { data }, revalidate: 60 }; // regenerate every 60 seconds
}

APP ROUTER Server Components (Next.js 13+):
Default is Server Component — renders on server, zero JS shipped to client.
async function ProductPage({ params }) {
  const product = await db.product.findById(params.id); // direct DB access!
  return <div>{product.name}</div>;
}
// Add 'use client' only when you need state, events, or browser APIs

DECISION GUIDE:
No interactivity + SEO + content rarely changes -> SSG
No interactivity + SEO + content changes per user -> SSR
Heavy interactivity + behind auth -> CSR
Mix of static and periodic fresh data -> ISR or Server Components`
        },
        {
          id: "nj2", difficulty: "hard", type: "tricky",
          question: "What are Core Web Vitals and how do you optimize a Next.js app for them?",
          answer: `CORE WEB VITALS — what Google uses to rank pages:
- LCP (Largest Contentful Paint): main content load speed. Target: < 2.5s
- INP (Interaction to Next Paint): responsiveness to input. Target: < 200ms
- CLS (Cumulative Layout Shift): visual stability, no content jumping. Target: < 0.1

OPTIMIZATION STRATEGIES:

1. IMAGE OPTIMIZATION — biggest LCP win:
Use the built-in Image component (wraps native img with optimizations).
Add the 'priority' prop to your LCP image — tells browser to preload it.
Automatically serves WebP, lazy-loads, prevents layout shift.

2. FONTS — prevent CLS:
Use the built-in font system (next/font). Downloads in background, never causes layout shift.
const inter = Inter({ subsets: ['latin'], display: 'swap' });

3. CODE SPLITTING — reduce initial JS:
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false
});

4. SERVER COMPONENTS — zero JS to client:
// Move data fetching server-side — no useEffect, no loading spinner needed:
async function Dashboard() {
  const data = await db.query(); // runs on server only
  return <DataTable data={data} />;
}

5. REACT CACHE — deduplicate server-side fetches:
// cache() from React 18 deduplicates calls across Server Components:
const getUser = cache(async (id) => db.user.findById(id));
// Multiple components calling getUser(id) = only ONE DB query

6. LINK PREFETCHING:
<Link href="/dashboard" prefetch>Dashboard</Link>
// Prefetches the page JS bundle when link enters the viewport

MEASURING: Lighthouse in DevTools, PageSpeed Insights for production URLs.`
        },
        {
          id: "nj3", difficulty: "hard", type: "tricky",
          question: "How does Next.js App Router differ from Pages Router? What changed in the mental model?",
          answer: `PAGES ROUTER (legacy, still supported):
- Every file in /pages is a route
- Data fetching via getStaticProps / getServerSideProps (special exports)
- All components are client-side by default
- API routes in /pages/api/

APP ROUTER (Next.js 13+, recommended):
- Files in /app directory. Folder = route segment.
- layout.tsx wraps child routes — persists across navigation
- loading.tsx auto-becomes a Suspense boundary
- error.tsx auto-becomes an Error Boundary
- Server Components are DEFAULT — zero JS to client

THE FUNDAMENTAL MENTAL SHIFT:

Pages Router: "Everything is a client component with optional server-side data fetching"
App Router: "Everything is a server component by default — opt INTO client only when needed"

WHEN TO ADD 'use client':
- useState, useEffect, useReducer (state and lifecycle)
- Browser-only APIs (window, localStorage, navigator)
- Event handlers (onClick, onChange)
- Context providers wrapping interactive components

SERVER COMPONENT SUPERPOWER — async component:
async function UserProfile({ userId }) {
  const user = await db.users.findById(userId);  // runs on server
  const posts = await db.posts.findByUserId(userId);
  return <div>{user.name} — {posts.length} posts</div>;
  // No fetch(), no loading state, no useEffect needed!
}

LAYOUT NESTING:
app/
  layout.tsx         <- wraps ALL pages (nav, footer)
  dashboard/
    layout.tsx       <- wraps all dashboard pages (sidebar)
    page.tsx         <- /dashboard
    settings/
      page.tsx       <- /dashboard/settings

MIGRATION GOTCHA:
Third-party providers using React Context need 'use client' wrappers:
'use client';
export function Providers({ children }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}`
        }
      ]
    },
    {
      id: "reactnative", title: "React Native", icon: "📱", color: "#0ea5e9", textColor: "#ffffff", estimatedHours: 3,
      questions: [
        {
          id: "rn1", difficulty: "medium", type: "common",
          question: "Explain React Native architecture — how JS talks to native, old bridge vs new JSI.",
          answer: `OLD ARCHITECTURE (Bridge-based):
JavaScript Thread <-> Bridge (async JSON serialization) <-> Native Thread

Problems:
- Asynchronous — JS and native can't communicate synchronously
- JSON serialization overhead on every single interaction
- Large data structures were slow to pass across

NEW ARCHITECTURE (JSI — JavaScript Interface, RN 0.68+):
JSI replaces the Bridge with a C++ layer. JS calls native code DIRECTLY via host objects.
- No JSON serialization overhead
- Shared memory for large data
- Native modules can call JS synchronously when needed

THREE MAIN THREADS:
1. JS Thread — runs your React/JS code (the bundle)
2. Main/UI Thread — handles rendering and touch events
3. Shadow Thread — layout calculations via Yoga engine

METRO BUNDLER:
Bundles your JS code (equivalent of webpack for RN).
Fast Refresh watches for changes and updates the running app without a full restart.

EXPO MANAGED vs BARE:
- Expo Managed: easiest setup, OTA updates, limited native module access
- Expo Bare: full native access, still uses Expo tooling
- Bare RN: maximum control, requires Xcode/Android Studio, most complex

FOR YOUR TIME TRACKING APP:
- Offline storage: AsyncStorage or MMKV for local clock records
- Background sync: background fetch library for periodic server sync
- App Store + Play Store: EAS Build handles both platform builds`
        },
        {
          id: "rn2", difficulty: "hard", type: "tricky",
          question: "How do you implement offline support in React Native? Explain the sync strategy.",
          answer: `OFFLINE-FIRST ARCHITECTURE:

1. LOCAL STORAGE OPTIONS:
- AsyncStorage — simple key/value, fine for small data, slow for large datasets
- MMKV — 10x faster than AsyncStorage, synchronous reads, ideal for most cases
- WatermelonDB / SQLite — relational, queryable, best for complex offline apps with relationships

2. DETECT NETWORK STATE:
const [isOnline, setIsOnline] = useState(true);
useEffect(() => {
  const unsub = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected && state.isInternetReachable);
  });
  return unsub;
}, []);

3. OFFLINE-FIRST CLOCK IN/OUT (your time tracking app):
async function clockIn(employeeId, timestamp) {
  const record = { id: uuid(), employeeId, timestamp, type: 'clockIn', synced: false };
  await MMKV.set('record:' + record.id, JSON.stringify(record));
  addToSyncQueue(record.id);
  if (isOnline) await syncRecord(record); // optimistic online sync
}

4. SYNC QUEUE — process when back online:
async function processSyncQueue() {
  const pendingIds = await getSyncQueue();
  for (const id of pendingIds) {
    const record = JSON.parse(await MMKV.get('record:' + id));
    try {
      await api.post('/clock-records', record);
      await markSynced(id);
    } catch (err) {
      if (err.status === 409) await resolveConflict(record);
      else break; // stop on network error, retry later
    }
  }
}
// Trigger on app foreground AND network reconnection:
AppState.addEventListener('change', s => { if (s === 'active' && isOnline) processSyncQueue(); });

5. CONFLICT RESOLUTION:
- Last-write-wins: simplest, good for most cases
- Server-wins: server is authoritative (your SAP sync case)
- Merge: complex, for collaborative editing scenarios`
        },
        {
          id: "rn3", difficulty: "medium", type: "common",
          question: "How do you optimize performance in React Native? What are the main pitfalls?",
          answer: `KEY PITFALLS AND FIXES:

1. FLATLIST OVER SCROLLVIEW for dynamic lists:
<FlatList
  data={employees}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <EmployeeCard employee={item} />}
  getItemLayout={(_, i) => ({ length: 80, offset: 80 * i, index: i })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
// ScrollView renders ALL children at once — catastrophic for 100+ items

2. AVOID ANONYMOUS FUNCTIONS IN renderItem:
// BAD — new function reference every render:
renderItem={({ item }) => <Card onPress={() => navigate(item.id)} />}
// GOOD — stable reference:
const handlePress = useCallback(id => navigate(id), [navigate]);

3. IMAGES — use a caching image library (e.g. rn-fast-image):
Aggressive caching, better memory management than the default Image component.

4. HEAVY JS WORK — don't block the JS thread:
InteractionManager.runAfterInteractions(() => {
  loadHeavyData(); // runs after animations complete
});
// For animations: rn-reanimated runs on the UI thread, stays 60fps even if JS is busy

5. HERMES ENGINE (default in RN 0.70+):
Compiles JS to bytecode ahead of time — faster startup, lower memory usage.

6. PROFILING TOOLS:
- Flipper: network inspector, React DevTools, layout inspector
- Performance Monitor (shake device): shows JS/UI FPS and RAM in real time
- React DevTools Profiler: find unnecessary re-renders`
        }
      ]
    }
  ]
};

const difficultyConfig = {
  easy: { label: "Easy", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  hard: { label: "Hard", color: "#ef4444", bg: "rgba(239,68,68,0.15)" }
};

function formatAnswer(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 8 }} />;
    if (/^[A-Z][A-Z\s&\/\-]+:$/.test(line.trim())) {
      return <div key={i} style={{ fontFamily: "'Fira Code', monospace", fontWeight: 700, fontSize: 11, letterSpacing: 1.5, color: '#a78bfa', marginTop: 16, marginBottom: 4, textTransform: 'uppercase' }}>{line}</div>;
    }
    if (line.trim().startsWith('//')) {
      return <div key={i} style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: '#6b7280', paddingLeft: 16, lineHeight: 1.7 }}>{line}</div>;
    }
    if (/^[A-Z][A-Z\s0-9]+\s*\(/.test(line.trim()) && !line.includes('=>') && !line.includes('function')) {
      return <div key={i} style={{ fontFamily: "'Fira Code', monospace", fontWeight: 600, fontSize: 12, color: '#93c5fd', marginTop: 10, marginBottom: 2 }}>{line}</div>;
    }
    const isCode = /^(const|let|var|function|class|if|for|while|return|type|interface|async|await|import|export|\{|\}|\[|\]|\/\/|\/\*|\*|db\.|app\.|router\.|cron\.)/.test(line.trim()) || line.includes('=>') || (line.includes('(') && line.includes(')') && line.includes('{'));
    if (isCode) {
      return <div key={i} style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: '#e2e8f0', backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 8px', borderLeft: '2px solid rgba(99,102,241,0.5)', marginBottom: 1, lineHeight: 1.8, whiteSpace: 'pre' }}>{line}</div>;
    }
    if (line.trim().startsWith('•')) {
      return <div key={i} style={{ fontSize: 13, color: '#d1d5db', paddingLeft: 16, lineHeight: 1.7, display: 'flex', gap: 8 }}><span style={{ color: '#6366f1', flexShrink: 0 }}>•</span><span>{line.trim().slice(1).trim()}</span></div>;
    }
    return <div key={i} style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.7 }}>{line}</div>;
  });
}

export function InterviewPrep() {
  const [activeGroup, setActiveGroup] = useState("javascript");
  const [expandedQ, setExpandedQ] = useState(null);
  const [completed, setCompleted] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const group = prepData.groups.find(g => g.id === activeGroup);

  const filtered = group?.questions.filter(q => {
    if (filter !== "all" && q.difficulty !== filter) return false;
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const totalQ = prepData.groups.reduce((a, g) => a + g.questions.length, 0);
  const totalDone = Object.keys(completed).length;
  const progress = Math.round((totalDone / totalQ) * 100);

  const groupDone = (g) => g.questions.filter(q => completed[q.id]).length;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0f1a', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: 260, background: '#13131f', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#6366f1', fontWeight: 700, marginBottom: 4 }}>INTERVIEW PREP</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>Animesh Jha</div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12 }}>Senior Full Stack Developer</div>
          
          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 5, overflow: 'hidden' }}>
            <div style={{ width: progress + '%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #a78bfa)', borderRadius: 100, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 10, color: '#64748b' }}>{totalDone} / {totalQ} completed</span>
            <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 600 }}>{progress}%</span>
          </div>
        </div>

        {/* Groups */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {prepData.groups.map(g => {
            const done = groupDone(g);
            const active = activeGroup === g.id;
            return (
              <div key={g.id} onClick={() => { setActiveGroup(g.id); setExpandedQ(null); setSearch(''); }}
                style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', transition: 'all 0.15s', background: active ? 'rgba(99,102,241,0.15)' : 'transparent', border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: active ? g.color : 'rgba(255,255,255,0.06)', color: active ? g.textColor : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0, transition: 'all 0.15s' }}>
                    {g.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#f8fafc' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{g.questions.length} Q · ~{g.estimatedHours}h</div>
                  </div>
                  <div style={{ fontSize: 10, color: done === g.questions.length ? '#22c55e' : '#475569', fontWeight: 600 }}>{done}/{g.questions.length}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Hard', value: prepData.groups.reduce((a,g) => a + g.questions.filter(q=>q.difficulty==='hard').length, 0), color: '#ef4444' },
            { label: 'Medium', value: prepData.groups.reduce((a,g) => a + g.questions.filter(q=>q.difficulty==='medium').length, 0), color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 16, background: '#13131f', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 5, background: group?.color, color: group?.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>{group?.icon}</div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>{group?.title}</span>
              <span style={{ fontSize: 11, color: '#475569', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: 100 }}>~{group?.estimatedHours}h</span>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px 6px 32px', color: '#e2e8f0', fontSize: 12, outline: 'none', width: 200 }} />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#475569' }}>🔍</span>
            </div>
            
            {/* Filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'medium', 'hard'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                    background: filter === f ? (f === 'all' ? '#6366f1' : f === 'hard' ? '#ef4444' : '#f59e0b') : 'rgba(255,255,255,0.06)',
                    color: filter === f ? '#fff' : '#64748b' }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>No questions match your filter.</div>
          )}
          
          {filtered.map((q, idx) => {
            const isOpen = expandedQ === q.id;
            const isDone = completed[q.id];
            const diff = difficultyConfig[q.difficulty];
            
            return (
              <div key={q.id} style={{ marginBottom: 10, borderRadius: 10, border: `1px solid ${isOpen ? 'rgba(99,102,241,0.4)' : isDone ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}`, background: isOpen ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s', overflow: 'hidden' }}>
                
                {/* Question header */}
                <div onClick={() => setExpandedQ(isOpen ? null : q.id)}
                  style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  
                  {/* Number */}
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: isDone ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: isDone ? '#22c55e' : '#475569', flexShrink: 0, marginTop: 1 }}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: isDone ? '#94a3b8' : '#e2e8f0', lineHeight: 1.5, marginBottom: 6 }}>{q.question}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: diff.bg, color: diff.color }}>{diff.label}</span>
                      {q.type === 'tricky' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>⚡ Tricky</span>}
                      {q.tags?.slice(0,2).map(t => <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>#{t}</span>)}
                    </div>
                  </div>
                  
                  <div style={{ color: '#475569', fontSize: 14, flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</div>
                </div>
                
                {/* Answer */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ padding: '16px 20px', maxHeight: 500, overflowY: 'auto' }}>
                      {formatAnswer(q.answer)}
                    </div>
                    <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 }}>
                      <button onClick={() => setCompleted(prev => isDone ? (delete prev[q.id], {...prev}) : {...prev, [q.id]: true})}
                        style={{ padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: isDone ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)', color: isDone ? '#22c55e' : '#a78bfa', transition: 'all 0.15s' }}>
                        {isDone ? '✓ Completed' : '○ Mark Complete'}
                      </button>
                      <button onClick={() => setExpandedQ(null)}
                        style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: 12, background: 'transparent', color: '#64748b' }}>
                        Collapse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
