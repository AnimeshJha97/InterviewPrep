export const reactNativeGroup = {
  "id": "reactnative",
  "title": "React Native",
  "icon": "📱",
  "color": "#0ea5e9",
  "textColor": "#ffffff",
  "estimatedHours": 3,
  "questions": [
    {
      "id": "rn1",
      "difficulty": "medium",
      "type": "common",
      "question": "Explain React Native architecture — how JS talks to native, old bridge vs new JSI.",
      "answer": "OLD ARCHITECTURE (Bridge-based):\n>> JavaScript Thread <-> Bridge (async JSON serialization) <-> Native Thread\n\nProblems:\n- Asynchronous — JS and native can't communicate synchronously\n- JSON serialization overhead on every single interaction\n- Large data structures were slow to pass across\n\n>> NEW ARCHITECTURE (JSI — JavaScript Interface, RN 0.68+):\n>> JSI replaces the Bridge with a C++ layer. JS calls native code DIRECTLY via host objects.\n- No JSON serialization overhead\n- Shared memory for large data\n- Native modules can call JS synchronously when needed\n\nTHREE MAIN THREADS:\n>> 1. JS Thread — runs your React/JS code (the bundle)\n2. Main/UI Thread — handles rendering and touch events\n3. Shadow Thread — layout calculations via Yoga engine\n\nMETRO BUNDLER:\nBundles your JS code (equivalent of webpack for RN).\nFast Refresh watches for changes and updates the running app without a full restart.\n\nEXPO MANAGED vs BARE:\n- Expo Managed: easiest setup, OTA updates, limited native module access\n- Expo Bare: full native access, still uses Expo tooling\n- Bare RN: maximum control, requires Xcode/Android Studio, most complex\n\nFOR YOUR TIME TRACKING APP:\n- Offline storage: AsyncStorage or MMKV for local clock records\n- Background sync: background fetch library for periodic server sync\n- App Store + Play Store: EAS Build handles both platform builds"
    },
    {
      "id": "rn2",
      "difficulty": "hard",
      "type": "tricky",
      "question": "How do you implement offline support in React Native? Explain the sync strategy.",
      "answer": "OFFLINE-FIRST ARCHITECTURE:\n\n1. LOCAL STORAGE OPTIONS:\n- AsyncStorage — simple key/value, fine for small data, slow for large datasets\n- MMKV — 10x faster than AsyncStorage, synchronous reads, ideal for most cases\n- WatermelonDB / SQLite — relational, queryable, best for complex offline apps with relationships\n\n2. DETECT NETWORK STATE:\n>> const [isOnline, setIsOnline] = useState(true);\n>> useEffect(() => {\n>>   const unsub = NetInfo.addEventListener(state => {\n>>     setIsOnline(state.isConnected && state.isInternetReachable);\n>>   });\n>>   return unsub;\n>> }, []);\n\n>> 3. OFFLINE-FIRST CLOCK IN/OUT (your time tracking app):\n>> async function clockIn(employeeId, timestamp) {\n>>   const record = { id: uuid(), employeeId, timestamp, type: 'clockIn', synced: false };\n>>   await MMKV.set('record:' + record.id, JSON.stringify(record));\n>>   addToSyncQueue(record.id);\n>>   if (isOnline) await syncRecord(record); // optimistic online sync\n>> }\n\n4. SYNC QUEUE — process when back online:\n>> async function processSyncQueue() {\n>>   const pendingIds = await getSyncQueue();\n>>   for (const id of pendingIds) {\n>>     const record = JSON.parse(await MMKV.get('record:' + id));\n>>     try {\n>>       await api.post('/clock-records', record);\n>>       await markSynced(id);\n>>     } catch (err) {\n>>       if (err.status === 409) await resolveConflict(record);\n>>       else break; // stop on network error, retry later\n>>     }\n>>   }\n>> }\n>> // Trigger on app foreground AND network reconnection:\n>> AppState.addEventListener('change', s => { if (s === 'active' && isOnline) processSyncQueue(); });\n\n5. CONFLICT RESOLUTION:\n- Last-write-wins: simplest, good for most cases\n- Server-wins: server is authoritative (your SAP sync case)\n- Merge: complex, for collaborative editing scenarios"
    },
    {
      "id": "rn3",
      "difficulty": "medium",
      "type": "common",
      "question": "How do you optimize performance in React Native? What are the main pitfalls?",
      "answer": "KEY PITFALLS AND FIXES:\n\n1. FLATLIST OVER SCROLLVIEW for dynamic lists:\n<FlatList\n>>   data={employees}\n>>   keyExtractor={item => item.id}\n>>   renderItem={({ item }) => <EmployeeCard employee={item} />}\n>>   getItemLayout={(_, i) => ({ length: 80, offset: 80 * i, index: i })}\n>>   removeClippedSubviews={true}\n>>   maxToRenderPerBatch={10}\n>>   windowSize={5}\n/>\n>> // ScrollView renders ALL children at once — catastrophic for 100+ items\n\n2. AVOID ANONYMOUS FUNCTIONS IN renderItem:\n>> // BAD — new function reference every render:\n>> renderItem={({ item }) => <Card onPress={() => navigate(item.id)} />}\n>> // GOOD — stable reference:\n>> const handlePress = useCallback(id => navigate(id), [navigate]);\n\n>> 3. IMAGES — use a caching image library (e.g. rn-fast-image):\nAggressive caching, better memory management than the default Image component.\n\n4. HEAVY JS WORK — don't block the JS thread:\n>> InteractionManager.runAfterInteractions(() => {\n>>   loadHeavyData(); // runs after animations complete\n>> });\n>> // For animations: rn-reanimated runs on the UI thread, stays 60fps even if JS is busy\n\n>> 5. HERMES ENGINE (default in RN 0.70+):\nCompiles JS to bytecode ahead of time — faster startup, lower memory usage.\n\n6. PROFILING TOOLS:\n- Flipper: network inspector, React DevTools, layout inspector\n- Performance Monitor (shake device): shows JS/UI FPS and RAM in real time\n- React DevTools Profiler: find unnecessary re-renders"
    }
  ]
};
