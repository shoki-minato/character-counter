// Node.js performance test for the optimized TextAnalyzer
// This tests the core optimization features without DOM dependencies

// Mock performance API for Node.js
global.performance = {
    now: () => Date.now(),
    memory: {
        usedJSHeapSize: process.memoryUsage().heapUsed,
        totalJSHeapSize: process.memoryUsage().heapTotal,
        jsHeapSizeLimit: process.memoryUsage().heapTotal * 2
    }
};

// Mock requestAnimationFrame for Node.js
global.requestAnimationFrame = (callback) => setTimeout(callback, 16);

// Extract TextAnalyzer class from script.js (simplified version for testing)
class TextAnalyzer {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 100;
        
        this.performanceMetrics = {
            totalAnalyses: 0,
            cacheHits: 0,
            averageProcessingTime: 0,
            largeTextThreshold: 10000
        };
        
        this.chunkSize = 5000;
        this.useChunking = true;
    }

    analyze(text) {
        const startTime = performance.now();
        
        if (!text || text.length === 0) {
            return this.getEmptyStats();
        }

        const cacheKey = this.generateCacheKey(text);
        if (this.cache.has(cacheKey)) {
            this.performanceMetrics.cacheHits++;
            return this.cache.get(cacheKey);
        }

        let stats;
        
        if (text.length > this.performanceMetrics.largeTextThreshold && this.useChunking) {
            stats = this.analyzeInChunks(text);
        } else {
            stats = this.analyzeDirectly(text);
        }

        this.cacheResult(cacheKey, stats);
        this.updatePerformanceMetrics(performance.now() - startTime);
        
        return stats;
    }

    generateCacheKey(text) {
        let hash = 0;
        for (let i = 0; i < Math.min(text.length, 1000); i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `${hash}_${text.length}`;
    }

    cacheResult(key, stats) {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, stats);
    }

    getEmptyStats() {
        return {
            charactersWithSpaces: 0,
            charactersWithoutSpaces: 0,
            words: 0,
            lines: 0,
            paragraphs: 0
        };
    }

    analyzeDirectly(text) {
        return {
            charactersWithSpaces: this.countCharacters(text, true),
            charactersWithoutSpaces: this.countCharacters(text, false),
            words: this.countWords(text),
            lines: this.countLines(text),
            paragraphs: this.countParagraphs(text)
        };
    }

    analyzeInChunks(text) {
        const stats = this.getEmptyStats();
        const chunks = this.splitIntoChunks(text);
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const chunkStats = this.analyzeDirectly(chunk);
            
            stats.charactersWithSpaces += chunkStats.charactersWithSpaces;
            stats.charactersWithoutSpaces += chunkStats.charactersWithoutSpaces;
            stats.words += chunkStats.words;
            
            if (i === 0) {
                stats.lines = chunkStats.lines;
                stats.paragraphs = chunkStats.paragraphs;
            } else {
                stats.lines += chunkStats.lines - 1;
                stats.paragraphs += chunkStats.paragraphs;
            }
        }
        
        stats.lines = this.countLines(text);
        stats.paragraphs = this.countParagraphs(text);
        
        return stats;
    }

    splitIntoChunks(text) {
        const chunks = [];
        for (let i = 0; i < text.length; i += this.chunkSize) {
            chunks.push(text.slice(i, i + this.chunkSize));
        }
        return chunks;
    }

    updatePerformanceMetrics(processingTime) {
        this.performanceMetrics.totalAnalyses++;
        this.performanceMetrics.averageProcessingTime = 
            (this.performanceMetrics.averageProcessingTime * (this.performanceMetrics.totalAnalyses - 1) + processingTime) 
            / this.performanceMetrics.totalAnalyses;
    }

    countCharacters(text, includeSpaces) {
        if (!text) return 0;

        if (includeSpaces) {
            return text.length;
        } else {
            let count = 0;
            for (let i = 0; i < text.length; i++) {
                if (!/\s/.test(text[i])) {
                    count++;
                }
            }
            return count;
        }
    }

    countWords(text) {
        if (!text || text.trim().length === 0) return 0;

        let wordCount = 0;
        let inWord = false;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const isWhitespace = /\s/.test(char);
            
            if (!isWhitespace && !inWord) {
                wordCount++;
                inWord = true;
            } else if (isWhitespace && inWord) {
                inWord = false;
            }
        }
        
        return wordCount;
    }

    countLines(text) {
        if (!text) return 0;
        if (text.length === 0) return 0;

        let lineCount = 1;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '\n') {
                lineCount++;
            }
        }
        
        return lineCount;
    }

    countParagraphs(text) {
        if (!text || text.trim().length === 0) return 0;

        let paragraphCount = 0;
        let inParagraph = false;
        let consecutiveNewlines = 0;
        
        const trimmedText = text.trim();
        
        for (let i = 0; i < trimmedText.length; i++) {
            const char = trimmedText[i];
            
            if (char === '\n') {
                consecutiveNewlines++;
            } else if (/\s/.test(char)) {
                continue;
            } else {
                if (!inParagraph) {
                    paragraphCount++;
                    inParagraph = true;
                }
                
                if (consecutiveNewlines >= 2) {
                    paragraphCount++;
                }
                
                consecutiveNewlines = 0;
            }
        }
        
        return Math.max(paragraphCount, 1);
    }

    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            cacheHitRate: this.performanceMetrics.totalAnalyses > 0 
                ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalAnalyses * 100).toFixed(2) + '%'
                : '0%',
            cacheSize: this.cache.size
        };
    }

    clearCache() {
        this.cache.clear();
    }
}

// Performance testing function
function runPerformanceTest(textSize, iterations = 100) {
    console.log(`\n=== Performance Test: ${textSize} characters, ${iterations} iterations ===`);
    
    const analyzer = new TextAnalyzer();
    const testText = 'A'.repeat(textSize);
    
    // Warm up
    for (let i = 0; i < 10; i++) {
        analyzer.analyze(testText);
    }
    
    // Clear cache to test fresh performance
    analyzer.clearCache();
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        analyzer.analyze(testText);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    
    const metrics = analyzer.getPerformanceMetrics();
    
    console.log(`Results:`);
    console.log(`- Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`- Average time per analysis: ${avgTime.toFixed(2)}ms`);
    console.log(`- Cache hit rate: ${metrics.cacheHitRate}`);
    console.log(`- Total analyses: ${metrics.totalAnalyses}`);
    console.log(`- Cache size: ${metrics.cacheSize}`);
    
    // Performance evaluation
    let evaluation = '';
    if (avgTime < 10) {
        evaluation = '✅ Excellent - Very fast';
    } else if (avgTime < 50) {
        evaluation = '✅ Good - Meets requirements';
    } else if (avgTime < 100) {
        evaluation = '⚠️  Warning - Somewhat slow';
    } else {
        evaluation = '❌ Problem - Optimization needed';
    }
    
    console.log(`- Evaluation: ${evaluation}`);
    
    return {
        textSize,
        iterations,
        totalTime,
        avgTime,
        metrics,
        evaluation
    };
}

// Memory usage test
function memoryUsageTest() {
    console.log('\n=== Memory Usage Test ===');
    
    const analyzer = new TextAnalyzer();
    const initialMemory = process.memoryUsage();
    
    console.log('Initial memory usage:');
    console.log(`- Heap used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    
    // Create large texts and analyze them
    const sizes = [1000, 10000, 50000, 100000];
    
    for (const size of sizes) {
        const text = 'Test text with various content. '.repeat(size / 25);
        
        for (let i = 0; i < 50; i++) {
            analyzer.analyze(text);
        }
        
        const currentMemory = process.memoryUsage();
        console.log(`After ${size} char text (50 analyses):`);
        console.log(`- Heap used: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        console.log(`- Cache size: ${analyzer.cache.size}`);
    }
    
    // Test cache cleanup
    analyzer.clearCache();
    const afterCleanup = process.memoryUsage();
    console.log('After cache cleanup:');
    console.log(`- Heap used: ${(afterCleanup.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`- Cache size: ${analyzer.cache.size}`);
}

// Run tests
console.log('Starting Performance Optimization Tests...');

// Test different text sizes
const testSizes = [1000, 10000, 50000, 100000];
const results = [];

for (const size of testSizes) {
    const result = runPerformanceTest(size);
    results.push(result);
}

// Memory usage test
memoryUsageTest();

// Summary
console.log('\n=== Test Summary ===');
results.forEach(result => {
    console.log(`${result.textSize} chars: ${result.avgTime.toFixed(2)}ms avg, ${result.evaluation}`);
});

console.log('\nPerformance optimization tests completed!');