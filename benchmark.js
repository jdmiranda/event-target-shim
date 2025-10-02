const { EventTarget, Event } = require('./dist/index.js');

// Performance benchmark for event dispatch optimizations
function benchmark(name, iterations, fn) {
    // Warm up
    for (let i = 0; i < 100; i++) fn();

    // Measure
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
    const opsPerSec = (iterations / duration) * 1000;

    console.log(`${name}:`);
    console.log(`  Total: ${duration.toFixed(2)}ms`);
    console.log(`  Per operation: ${(duration / iterations * 1000).toFixed(3)}μs`);
    console.log(`  Ops/sec: ${opsPerSec.toFixed(0)}`);
    console.log();
}

console.log('EventTarget Performance Benchmarks');
console.log('===================================\n');

// Benchmark 1: Event dispatch with no listeners (fast path)
benchmark('Dispatch event with no listeners', 1000000, () => {
    const target = new EventTarget();
    const event = new Event('test');
    target.dispatchEvent(event);
});

// Benchmark 2: Event dispatch with empty listener list (fast path)
benchmark('Dispatch event with empty listener list', 500000, () => {
    const target = new EventTarget();
    target.addEventListener('test', () => {});
    target.removeEventListener('test', () => {});
    const event = new Event('test');
    target.dispatchEvent(event);
});

// Benchmark 3: Event dispatch with single listener
benchmark('Dispatch event with single listener', 500000, () => {
    const target = new EventTarget();
    let counter = 0;
    target.addEventListener('test', () => { counter++; });
    const event = new Event('test');
    target.dispatchEvent(event);
});

// Benchmark 4: Event dispatch with multiple listeners
benchmark('Dispatch event with 5 listeners', 200000, () => {
    const target = new EventTarget();
    let counter = 0;
    for (let i = 0; i < 5; i++) {
        target.addEventListener('test', () => { counter++; });
    }
    const event = new Event('test');
    target.dispatchEvent(event);
});

// Benchmark 5: Event dispatch with 10 listeners
benchmark('Dispatch event with 10 listeners', 100000, () => {
    const target = new EventTarget();
    let counter = 0;
    for (let i = 0; i < 10; i++) {
        target.addEventListener('test', () => { counter++; });
    }
    const event = new Event('test');
    target.dispatchEvent(event);
});

// Benchmark 6: Add/remove listener operations
benchmark('Add and remove listener', 500000, () => {
    const target = new EventTarget();
    const handler = () => {};
    target.addEventListener('test', handler);
    target.removeEventListener('test', handler);
});

// Benchmark 7: Finding existing listener
let targetCache7;
let handlerCache7;
benchmark('Find existing listener (duplicate add)', 200000, () => {
    if (!targetCache7) {
        targetCache7 = new EventTarget();
        handlerCache7 = () => {};
        targetCache7.addEventListener('test', handlerCache7);
    }
    targetCache7.addEventListener('test', handlerCache7); // Should find existing
});

// Benchmark 8: Once listeners
benchmark('Dispatch with once listeners', 100000, () => {
    const target = new EventTarget();
    let counter = 0;
    target.addEventListener('test', () => { counter++; }, { once: true });
    target.addEventListener('test', () => { counter++; }, { once: true });
    const event = new Event('test');
    target.dispatchEvent(event);
    target.dispatchEvent(event); // Second call should have no listeners
});

// Benchmark 9: Passive listeners
benchmark('Dispatch with passive listeners', 200000, () => {
    const target = new EventTarget();
    let counter = 0;
    target.addEventListener('test', () => { counter++; }, { passive: true });
    const event = new Event('test');
    target.dispatchEvent(event);
});

// Benchmark 10: Mixed capture/bubble listeners
let targetCache10;
benchmark('Dispatch with mixed capture/bubble (5 each)', 100000, () => {
    if (!targetCache10) {
        targetCache10 = new EventTarget();
        let counter = 0;
        for (let i = 0; i < 5; i++) {
            targetCache10.addEventListener('test', () => { counter++; }, true);
            targetCache10.addEventListener('test', () => { counter++; }, false);
        }
    }
    const event = new Event('test');
    targetCache10.dispatchEvent(event);
});

console.log('Benchmarks complete!');
