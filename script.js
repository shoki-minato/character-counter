/**
 * TextStats interface - defines the structure for text analysis results
 * @typedef {Object} TextStats
 * @property {number} charactersWithSpaces - Total character count including spaces
 * @property {number} charactersWithoutSpaces - Character count excluding spaces
 * @property {number} lines - Line count
 * @property {number} paragraphs - Paragraph count
 */

/**
 * UIController class - Manages user interface interactions and updates
 * Handles DOM element management, statistics display updates, and user feedback
 */
class UIController {
    /**
     * Initialize the UIController with DOM element references
     */
    constructor() {
        // DOM element references - requirement 3.2, 3.4
        this.textInput = null;
        this.statsElements = {
            charactersWithSpaces: null,
            charactersWithoutSpaces: null,
            lines: null,
            paragraphs: null
        };
        this.clearButton = null;
        this.copyButton = null;
        this.feedbackElement = null;
        this.feedbackTimeout = null;

        // Initialize DOM elements
        this.initialize();
    }

    /**
     * Initialize DOM element references and basic setup
     * Requirement 3.2: Clear organization of statistics display
     * Requirement 3.4: Clear labels for each statistic item
     */
    initialize() {
        // Get text input element
        this.textInput = document.getElementById('text-input');
        if (!this.textInput) {
            console.error('Text input element not found');
            return;
        }

        // Get statistics display elements - requirement 3.2, 3.4
        this.statsElements.charactersWithSpaces = document.getElementById('chars-with-spaces');
        this.statsElements.charactersWithoutSpaces = document.getElementById('chars-without-spaces');
        this.statsElements.lines = document.getElementById('line-count');
        this.statsElements.paragraphs = document.getElementById('paragraph-count');

        // Get action buttons
        this.clearButton = document.getElementById('clear-button');
        this.copyButton = document.getElementById('copy-button');

        // Get feedback element
        this.feedbackElement = document.getElementById('feedback');

        // Validate all required elements are found
        this.validateElements();
    }

    /**
     * Validate that all required DOM elements are present
     * @private
     */
    validateElements() {
        const requiredElements = [
            { name: 'textInput', element: this.textInput },
            { name: 'clearButton', element: this.clearButton },
            { name: 'copyButton', element: this.copyButton },
            { name: 'feedbackElement', element: this.feedbackElement }
        ];

        // Check statistics elements
        Object.entries(this.statsElements).forEach(([key, element]) => {
            requiredElements.push({ name: `statsElements.${key}`, element });
        });

        // Log warnings for missing elements
        requiredElements.forEach(({ name, element }) => {
            if (!element) {
                console.warn(`Required DOM element not found: ${name}`);
            }
        });
    }

    /**
     * Update statistics display with new values
     * Requirement 3.2: Statistics information clearly organized format
     * Requirement 3.4: Clear labels provided for each statistic item
     * @param {TextStats} stats - The statistics object to display
     */
    updateStats(stats) {
        if (!stats) {
            console.warn('No stats provided to updateStats');
            return;
        }

        // Update each statistic display element
        this.updateStatElement(this.statsElements.charactersWithSpaces, stats.charactersWithSpaces);
        this.updateStatElement(this.statsElements.charactersWithoutSpaces, stats.charactersWithoutSpaces);
        this.updateStatElement(this.statsElements.lines, stats.lines);
        this.updateStatElement(this.statsElements.paragraphs, stats.paragraphs);
    }

    /**
     * Update a single statistic element with proper formatting
     * @private
     * @param {HTMLElement} element - The DOM element to update
     * @param {number} value - The numeric value to display
     */
    updateStatElement(element, value) {
        if (!element) {
            return;
        }

        // Format number with proper locale formatting
        const formattedValue = typeof value === 'number' ? value.toLocaleString() : '0';
        element.textContent = formattedValue;
    }

    /**
     * Clear the text input area
     * Requirement 4.1: Empty the text input area when clear button is clicked
     */
    clearText() {
        if (!this.textInput) {
            console.warn('Text input element not available for clearing');
            return;
        }

        try {
            // Clear the text content
            this.textInput.value = '';

            // Trigger input event to ensure any listeners are notified of the change
            // This ensures real-time statistics are updated immediately
            const inputEvent = new Event('input', {
                bubbles: true,
                cancelable: true
            });
            this.textInput.dispatchEvent(inputEvent);

            // Also trigger change event for compatibility
            const changeEvent = new Event('change', {
                bubbles: true,
                cancelable: true
            });
            this.textInput.dispatchEvent(changeEvent);
        } catch (error) {
            console.error('Failed to clear text input:', error);
        }
    }

    /**
     * Focus the text input area
     * Requirement 4.3: Return focus to input area after clear button is clicked
     */
    focusTextArea() {
        if (!this.textInput) {
            console.warn('Text input element not available for focusing');
            return;
        }

        try {
            // Use setTimeout to ensure focus happens after any other DOM updates
            setTimeout(() => {
                // Check if element is still available and focusable
                if (this.textInput && typeof this.textInput.focus === 'function') {
                    this.textInput.focus();

                    // Position cursor at the beginning of the text area
                    if (typeof this.textInput.setSelectionRange === 'function') {
                        this.textInput.setSelectionRange(0, 0);
                    }
                }
            }, 0);
        } catch (error) {
            console.error('Failed to focus text input:', error);
        }
    }

    /**
     * Show visual feedback for copy operations
     * Requirement 5.2: Visual feedback for successful copy operations
     * @param {string} message - The feedback message to display
     * @param {string} type - The type of feedback ('success', 'error', 'warning', 'info')
     * @param {number} duration - Duration in milliseconds to show feedback (default: 3000)
     */
    showFeedback(message, type = 'success', duration = 3000) {
        if (!this.feedbackElement) {
            return;
        }

        // Clear any existing timeout
        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
        }

        // Clear previous feedback classes
        this.feedbackElement.className = 'feedback';

        // Add new feedback class and message
        if (type) {
            this.feedbackElement.classList.add(type);
        }

        // Add special animation for copy success
        if (type === 'success' && message.includes('コピー')) {
            this.feedbackElement.classList.add('copy-success');
        }

        this.feedbackElement.textContent = message;

        // Auto-clear feedback after specified duration
        this.feedbackTimeout = setTimeout(() => {
            this.clearFeedback();
        }, duration);
    }

    /**
     * Show copy button feedback animation
     * Requirement 5.2: Visual feedback for copy operations
     * @param {string} state - The state of copy operation ('copying', 'copied', 'error')
     */
    showCopyButtonFeedback(state) {
        if (!this.copyButton) {
            return;
        }

        // Clear previous states
        this.copyButton.classList.remove('copying', 'copied');

        if (state === 'copying') {
            this.copyButton.classList.add('copying');
            this.copyButton.textContent = 'コピー中...';
        } else if (state === 'copied') {
            this.copyButton.classList.add('copied');
            this.copyButton.textContent = '✓ コピー完了';

            // Reset button after animation
            setTimeout(() => {
                this.resetCopyButton();
            }, 1500);
        } else if (state === 'error') {
            this.copyButton.textContent = '✗ エラー';

            // Reset button after delay
            setTimeout(() => {
                this.resetCopyButton();
            }, 2000);
        }
    }

    /**
     * Reset copy button to original state
     * @private
     */
    resetCopyButton() {
        if (!this.copyButton) {
            return;
        }

        this.copyButton.classList.remove('copying', 'copied');
        this.copyButton.textContent = 'コピー';
    }

    /**
     * Clear feedback display
     * @private
     */
    clearFeedback() {
        if (this.feedbackElement) {
            this.feedbackElement.className = 'feedback';
            this.feedbackElement.textContent = '';
        }
    }

    /**
     * Get the current text from the input area
     * @returns {string} The current text content
     */
    getCurrentText() {
        return this.textInput ? this.textInput.value : '';
    }

    /**
     * Handle window resize events for responsive behavior
     * Can be extended for responsive optimizations
     */
    handleResize() {
        // Future implementation for responsive optimizations
        // Currently handled by CSS media queries
    }

    /**
     * Set up event listeners for real-time text analysis
     * Requirement 1.1: Immediate display of character count when user inputs text
     * Requirement 1.2: Real-time updates when text is deleted
     * @param {TextAnalyzer} textAnalyzer - The text analyzer instance
     */
    setupEventListeners(textAnalyzer) {
        if (!this.textInput || !textAnalyzer) {
            console.error('Cannot setup event listeners: missing textInput or textAnalyzer');
            return;
        }

        // Create optimized update function with both debouncing and throttling
        // Requirement: 50ms or less response time
        const debouncedUpdate = this.debounce((text) => {
            const stats = textAnalyzer.analyze(text);
            this.updateStats(stats);
        }, 30); // 30ms debounce for optimal performance (under 50ms requirement)
        
        // Throttled update for very rapid input to prevent excessive processing
        const throttledUpdate = this.throttle((text) => {
            const stats = textAnalyzer.analyze(text);
            this.updateStats(stats);
        }, 16); // ~60fps for smooth updates

        // Input event for real-time updates - requirement 1.1, 1.2
        // Use different strategies based on text length for optimal performance
        this.textInput.addEventListener('input', (event) => {
            const text = event.target.value;
            
            // Use throttling for very large texts to maintain responsiveness
            if (text.length > 50000) {
                throttledUpdate(text);
            } else {
                debouncedUpdate(text);
            }
        });

        // Paste event for immediate updates
        this.textInput.addEventListener('paste', (event) => {
            // Use setTimeout to ensure pasted content is processed
            setTimeout(() => {
                const text = this.textInput.value;
                const stats = textAnalyzer.analyze(text);
                this.updateStats(stats);
            }, 0);
        });

        // Keyup event as fallback for certain input methods
        this.textInput.addEventListener('keyup', (event) => {
            const text = event.target.value;
            debouncedUpdate(text);
        });

        // Initial analysis on page load - requirement 1.3
        const initialText = this.textInput.value;
        const initialStats = textAnalyzer.analyze(initialText);
        this.updateStats(initialStats);
    }

    /**
     * Advanced debounce function with performance optimizations
     * Ensures response time stays under 50ms requirement with adaptive timing
     * @private
     * @param {Function} func - The function to debounce
     * @param {number} delay - The base delay in milliseconds
     * @returns {Function} The debounced function with performance optimizations
     */
    debounce(func, delay) {
        let timeoutId;
        let lastCallTime = 0;
        let consecutiveCalls = 0;
        
        return function (...args) {
            const now = performance.now();
            const timeSinceLastCall = now - lastCallTime;
            
            // Clear existing timeout
            clearTimeout(timeoutId);
            
            // Adaptive delay based on input frequency
            consecutiveCalls++;
            let adaptiveDelay = delay;
            
            // Reduce delay for rapid consecutive calls to maintain responsiveness
            if (timeSinceLastCall < 100 && consecutiveCalls > 3) {
                adaptiveDelay = Math.max(10, delay * 0.5); // Minimum 10ms, max 50% reduction
            }
            
            // Reset consecutive calls counter after pause
            if (timeSinceLastCall > 500) {
                consecutiveCalls = 0;
            }
            
            lastCallTime = now;
            
            // Use requestAnimationFrame for immediate updates when possible
            if (adaptiveDelay <= 16) { // ~60fps
                timeoutId = requestAnimationFrame(() => {
                    func.apply(this, args);
                });
            } else {
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, adaptiveDelay);
            }
        };
    }

    /**
     * Throttle function for high-frequency events
     * Ensures consistent performance during continuous input
     * @private
     * @param {Function} func - The function to throttle
     * @param {number} limit - The time limit in milliseconds
     * @returns {Function} The throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        let lastResult;
        
        return function (...args) {
            if (!inThrottle) {
                lastResult = func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
            return lastResult;
        };
    }
}

/**
 * TextAnalyzer class - Core text analysis functionality with performance optimizations
 * Handles all text statistics calculations including character, word, line, and paragraph counts
 * Optimized for large text processing and memory efficiency
 */
class TextAnalyzer {
    constructor() {
        // Cache for memoization
        this.cache = new Map();
        this.maxCacheSize = 100;
        
        // Performance monitoring
        this.performanceMetrics = {
            totalAnalyses: 0,
            cacheHits: 0,
            averageProcessingTime: 0,
            largeTextThreshold: 10000
        };
        
        // Chunk processing configuration for large texts
        this.chunkSize = 5000;
        this.useChunking = true;
    }

    /**
     * Analyzes the provided text and returns comprehensive statistics
     * Optimized with caching and chunked processing for large texts
     * @param {string} text - The text to analyze
     * @returns {TextStats} Object containing all text statistics
     */
    analyze(text) {
        const startTime = performance.now();
        
        // Handle empty or null input - requirement 1.3
        if (!text || text.length === 0) {
            return this.getEmptyStats();
        }

        // Check cache first for performance optimization
        const cacheKey = this.generateCacheKey(text);
        if (this.cache.has(cacheKey)) {
            this.performanceMetrics.cacheHits++;
            return this.cache.get(cacheKey);
        }

        let stats;
        
        // Use chunked processing for large texts to prevent UI blocking
        if (text.length > this.performanceMetrics.largeTextThreshold && this.useChunking) {
            stats = this.analyzeInChunks(text);
        } else {
            stats = this.analyzeDirectly(text);
        }

        // Cache the result with size management
        this.cacheResult(cacheKey, stats);
        
        // Update performance metrics
        this.updatePerformanceMetrics(performance.now() - startTime);
        
        return stats;
    }

    /**
     * Generate cache key for text (using hash for memory efficiency)
     * @private
     * @param {string} text - The text to generate key for
     * @returns {string} Cache key
     */
    generateCacheKey(text) {
        // Use a simple hash for memory efficiency instead of storing full text
        let hash = 0;
        for (let i = 0; i < Math.min(text.length, 1000); i++) { // Only hash first 1000 chars
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `${hash}_${text.length}`;
    }

    /**
     * Cache analysis result with size management
     * @private
     * @param {string} key - Cache key
     * @param {TextStats} stats - Statistics to cache
     */
    cacheResult(key, stats) {
        // Implement LRU cache behavior
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, stats);
    }

    /**
     * Get empty statistics object
     * @private
     * @returns {TextStats} Empty statistics
     */
    getEmptyStats() {
        return {
            charactersWithSpaces: 0,
            charactersWithoutSpaces: 0,
            lines: 0,
            paragraphs: 0
        };
    }

    /**
     * Analyze text directly (for smaller texts)
     * @private
     * @param {string} text - Text to analyze
     * @returns {TextStats} Analysis results
     */
    analyzeDirectly(text) {
        return {
            charactersWithSpaces: this.countCharacters(text, true),
            charactersWithoutSpaces: this.countCharacters(text, false),
            lines: this.countLines(text),
            paragraphs: this.countParagraphs(text)
        };
    }

    /**
     * Analyze large text in chunks to prevent UI blocking
     * @private
     * @param {string} text - Text to analyze
     * @returns {TextStats} Analysis results
     */
    analyzeInChunks(text) {
        const stats = this.getEmptyStats();
        const chunks = this.splitIntoChunks(text);
        
        // Process chunks with yield points for UI responsiveness
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const chunkStats = this.analyzeDirectly(chunk);
            
            // Accumulate statistics
            stats.charactersWithSpaces += chunkStats.charactersWithSpaces;
            stats.charactersWithoutSpaces += chunkStats.charactersWithoutSpaces;
            
            // Lines and paragraphs need special handling for chunks
            if (i === 0) {
                stats.lines = chunkStats.lines;
                stats.paragraphs = chunkStats.paragraphs;
            } else {
                // Adjust for chunk boundaries
                stats.lines += chunkStats.lines - 1; // Subtract 1 to avoid double-counting boundary
                stats.paragraphs += chunkStats.paragraphs;
            }
        }
        
        // Final adjustment for actual line and paragraph counts
        stats.lines = this.countLines(text);
        stats.paragraphs = this.countParagraphs(text);
        
        return stats;
    }

    /**
     * Split text into processing chunks
     * @private
     * @param {string} text - Text to split
     * @returns {string[]} Array of text chunks
     */
    splitIntoChunks(text) {
        const chunks = [];
        for (let i = 0; i < text.length; i += this.chunkSize) {
            chunks.push(text.slice(i, i + this.chunkSize));
        }
        return chunks;
    }

    /**
     * Update performance metrics
     * @private
     * @param {number} processingTime - Time taken for analysis
     */
    updatePerformanceMetrics(processingTime) {
        this.performanceMetrics.totalAnalyses++;
        this.performanceMetrics.averageProcessingTime = 
            (this.performanceMetrics.averageProcessingTime * (this.performanceMetrics.totalAnalyses - 1) + processingTime) 
            / this.performanceMetrics.totalAnalyses;
    }

    /**
     * Get performance metrics for monitoring
     * @returns {Object} Performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            cacheHitRate: this.performanceMetrics.totalAnalyses > 0 
                ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalAnalyses * 100).toFixed(2) + '%'
                : '0%',
            cacheSize: this.cache.size
        };
    }

    /**
     * Clear cache to free memory
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Optimized character counting with memory efficiency
     * @param {string} text - The text to count characters in
     * @param {boolean} includeSpaces - Whether to include spaces in the count
     * @returns {number} Character count
     */
    countCharacters(text, includeSpaces) {
        if (!text) return 0;

        if (includeSpaces) {
            // Requirement 2.1: Count all characters including spaces
            return text.length;
        } else {
            // Requirement 2.2: Count characters excluding spaces
            // Optimized approach: iterate once instead of using regex replace
            let count = 0;
            for (let i = 0; i < text.length; i++) {
                if (!/\s/.test(text[i])) {
                    count++;
                }
            }
            return count;
        }
    }

    /**
     * Optimized line counting with single pass
     * @param {string} text - The text to count lines in
     * @returns {number} Line count
     */
    countLines(text) {
        if (!text) return 0;

        // Requirement 2.3: Count lines
        if (text.length === 0) return 0;

        // Optimized: single pass counting
        let lineCount = 1; // Start with 1 for the first line
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '\n') {
                lineCount++;
            }
        }
        
        return lineCount;
    }

    /**
     * Optimized paragraph counting with memory efficiency
     * @param {string} text - The text to count paragraphs in
     * @returns {number} Paragraph count
     */
    countParagraphs(text) {
        if (!text || text.trim().length === 0) return 0;

        // Requirement 2.4: Count paragraphs
        // Optimized approach: single pass with state tracking
        let paragraphCount = 0;
        let inParagraph = false;
        let consecutiveNewlines = 0;
        
        const trimmedText = text.trim();
        
        for (let i = 0; i < trimmedText.length; i++) {
            const char = trimmedText[i];
            
            if (char === '\n') {
                consecutiveNewlines++;
            } else if (/\s/.test(char)) {
                // Other whitespace, continue
                continue;
            } else {
                // Non-whitespace character
                if (!inParagraph) {
                    // Starting a new paragraph
                    paragraphCount++;
                    inParagraph = true;
                }
                
                if (consecutiveNewlines >= 2) {
                    // Double newline indicates paragraph break
                    paragraphCount++;
                }
                
                consecutiveNewlines = 0;
            }
        }
        
        // If no paragraphs were found but text exists, count as 1
        return Math.max(paragraphCount, 1);
    }
}

/**
 * ClipboardManager class - Handles clipboard operations with fallback support
 * Provides copy functionality using modern Clipboard API with graceful degradation
 */
class ClipboardManager {
    /**
     * Initialize the ClipboardManager
     */
    constructor() {
        this.clipboardSupported = this.isClipboardAPISupported();
    }

    /**
     * Check if the Clipboard API is supported in the current browser
     * @returns {boolean} True if Clipboard API is supported
     */
    isClipboardAPISupported() {
        return navigator.clipboard &&
            typeof navigator.clipboard.writeText === 'function' &&
            window.isSecureContext; // Clipboard API requires secure context (HTTPS)
    }

    /**
     * Copy text to clipboard using the most appropriate method
     * Requirement 5.1: Copy text to clipboard when copy button is clicked
     * Requirement 5.3: Provide fallback when Clipboard API is not available
     * @param {string} text - The text to copy to clipboard
     * @returns {Promise<boolean>} Promise that resolves to true if copy was successful
     */
    async copyToClipboard(text) {
        if (!text) {
            return false;
        }

        try {
            if (this.clipboardSupported) {
                // Use modern Clipboard API - requirement 5.1
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback to text selection method - requirement 5.3
                return this.fallbackCopy(text);
            }
        } catch (error) {
            console.warn('Clipboard copy failed:', error);
            // Try fallback method if Clipboard API fails
            return this.fallbackCopy(text);
        }
    }

    /**
     * Fallback copy method using text selection
     * Requirement 5.3: Select all text for manual copy when Clipboard API unavailable
     * @private
     * @param {string} text - The text to prepare for copying
     * @returns {boolean} True if text selection was successful
     */
    fallbackCopy(text) {
        try {
            // Create a temporary textarea element
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = text;
            tempTextArea.style.position = 'fixed';
            tempTextArea.style.left = '-9999px';
            tempTextArea.style.top = '-9999px';
            tempTextArea.setAttribute('readonly', '');

            // Add to DOM, select, and attempt copy
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            tempTextArea.setSelectionRange(0, text.length);

            // Try to execute copy command
            const successful = document.execCommand('copy');

            // Clean up
            document.body.removeChild(tempTextArea);

            return successful;
        } catch (error) {
            console.warn('Fallback copy failed:', error);
            return false;
        }
    }

    /**
     * Select all text in a given element
     * Used as alternative when clipboard operations fail
     * Requirement 5.3: Select all text for manual copy
     * @param {HTMLElement} element - The element containing text to select
     */
    selectAllText(element) {
        if (!element) {
            return;
        }

        try {
            if (element.select) {
                // For input/textarea elements
                element.select();
                element.setSelectionRange(0, element.value.length);
            } else {
                // For other elements, use Selection API
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } catch (error) {
            console.warn('Text selection failed:', error);
        }
    }

    /**
     * Get information about clipboard capabilities
     * @returns {Object} Object containing clipboard capability information
     */
    getCapabilities() {
        return {
            clipboardAPISupported: this.clipboardSupported,
            secureContext: window.isSecureContext,
            fallbackAvailable: document.queryCommandSupported && document.queryCommandSupported('copy')
        };
    }
}

/**
 * ErrorHandler class - Manages error handling and user notifications
 * Provides graceful degradation and user feedback for various error scenarios
 */
class ErrorHandler {
    /**
     * Initialize the ErrorHandler
     */
    constructor() {
        this.notificationQueue = [];
        this.isProcessingQueue = false;
    }

    /**
     * Handle clipboard-related errors
     * @param {Error} error - The clipboard error that occurred
     * @param {UIController} uiController - UI controller for user feedback
     * @returns {Object} Error handling result with fallback options
     */
    handleClipboardError(error, uiController) {
        console.warn('Clipboard error occurred:', error);

        const errorInfo = {
            type: 'clipboard',
            error: error,
            fallbackAvailable: true,
            userMessage: '',
            fallbackAction: null
        };

        // Determine specific error type and appropriate response
        if (error.name === 'NotAllowedError') {
            errorInfo.userMessage = 'クリップボードへのアクセスが許可されていません。テキストを選択してCtrl+C (Cmd+C)でコピーしてください';
            errorInfo.fallbackAction = 'selectText';
        } else if (error.name === 'NotSupportedError') {
            errorInfo.userMessage = 'お使いのブラウザではクリップボード機能がサポートされていません。テキストを選択してCtrl+C (Cmd+C)でコピーしてください';
            errorInfo.fallbackAction = 'selectText';
        } else if (error.name === 'SecurityError') {
            errorInfo.userMessage = 'セキュリティ上の理由でクリップボードにアクセスできません。HTTPSでアクセスするか、テキストを手動でコピーしてください';
            errorInfo.fallbackAction = 'selectText';
        } else {
            errorInfo.userMessage = 'クリップボードへのコピーに失敗しました。テキストを選択してCtrl+C (Cmd+C)でコピーしてください';
            errorInfo.fallbackAction = 'selectText';
        }

        // Show user notification
        if (uiController) {
            this.showUserNotification(errorInfo.userMessage, 'warning', uiController);
        }

        return errorInfo;
    }

    /**
     * Handle storage-related errors (localStorage, sessionStorage)
     * @param {Error} error - The storage error that occurred
     * @param {UIController} uiController - UI controller for user feedback
     * @returns {Object} Error handling result with fallback options
     */
    handleStorageError(error, uiController) {
        console.warn('Storage error occurred:', error);

        const errorInfo = {
            type: 'storage',
            error: error,
            fallbackAvailable: false,
            userMessage: '',
            fallbackAction: null
        };

        // Determine specific error type and appropriate response
        if (error.name === 'QuotaExceededError') {
            errorInfo.userMessage = 'ストレージの容量が不足しています。ブラウザのデータを削除してください';
            errorInfo.fallbackAvailable = false;
        } else if (error.name === 'SecurityError') {
            errorInfo.userMessage = 'プライベートモードまたはセキュリティ設定によりデータの保存ができません';
            errorInfo.fallbackAvailable = false;
        } else {
            errorInfo.userMessage = 'データの保存に失敗しました。設定は一時的なものになります';
            errorInfo.fallbackAvailable = false;
        }

        // Show user notification
        if (uiController) {
            this.showUserNotification(errorInfo.userMessage, 'warning', uiController);
        }

        return errorInfo;
    }

    /**
     * Handle Service Worker registration errors
     * @param {Error} error - The service worker error that occurred
     * @param {UIController} uiController - UI controller for user feedback
     * @returns {Object} Error handling result
     */
    handleServiceWorkerError(error, uiController) {
        console.warn('Service Worker error occurred:', error);

        const errorInfo = {
            type: 'serviceWorker',
            error: error,
            fallbackAvailable: true,
            userMessage: 'オフライン機能の初期化に失敗しました。アプリケーションはオンラインでのみ動作します',
            fallbackAction: 'continueOnline'
        };

        // Show user notification (less intrusive for service worker errors)
        if (uiController) {
            this.showUserNotification(errorInfo.userMessage, 'info', uiController, 2000);
        }

        return errorInfo;
    }

    /**
     * Handle general application errors
     * @param {Error} error - The general error that occurred
     * @param {string} context - Context where the error occurred
     * @param {UIController} uiController - UI controller for user feedback
     * @returns {Object} Error handling result
     */
    handleGeneralError(error, context, uiController) {
        console.error(`General error in ${context}:`, error);

        const errorInfo = {
            type: 'general',
            error: error,
            context: context,
            fallbackAvailable: false,
            userMessage: `${context}でエラーが発生しました。ページを再読み込みしてください`,
            fallbackAction: 'reload'
        };

        // Show user notification
        if (uiController) {
            this.showUserNotification(errorInfo.userMessage, 'error', uiController);
        }

        return errorInfo;
    }

    /**
     * Show user notification with appropriate styling and timing
     * @param {string} message - The message to display to the user
     * @param {string} type - The type of notification ('error', 'warning', 'info', 'success')
     * @param {UIController} uiController - UI controller for displaying the notification
     * @param {number} duration - Duration in milliseconds (optional)
     */
    showUserNotification(message, type = 'info', uiController, duration = null) {
        if (!uiController || !message) {
            return;
        }

        // Set appropriate duration based on type
        if (duration === null) {
            switch (type) {
                case 'error':
                    duration = 5000; // Longer for errors
                    break;
                case 'warning':
                    duration = 4000;
                    break;
                case 'info':
                    duration = 3000;
                    break;
                case 'success':
                    duration = 2000; // Shorter for success
                    break;
                default:
                    duration = 3000;
            }
        }

        // Add notification to queue for sequential processing
        this.notificationQueue.push({
            message,
            type,
            duration,
            timestamp: Date.now()
        });

        // Process queue if not already processing
        if (!this.isProcessingQueue) {
            this.processNotificationQueue(uiController);
        }
    }

    /**
     * Process notification queue to avoid overlapping notifications
     * @private
     * @param {UIController} uiController - UI controller for displaying notifications
     */
    async processNotificationQueue(uiController) {
        this.isProcessingQueue = true;

        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();
            
            // Show the notification
            uiController.showFeedback(notification.message, notification.type, notification.duration);
            
            // Wait for the notification to complete before showing the next one
            await new Promise(resolve => setTimeout(resolve, notification.duration + 100));
        }

        this.isProcessingQueue = false;
    }

    /**
     * Implement graceful degradation for various features
     * @param {string} feature - The feature that needs degradation
     * @param {Object} options - Options for the degradation
     * @returns {Object} Degradation strategy and fallback options
     */
    implementGracefulDegradation(feature, options = {}) {
        const degradationStrategies = {
            clipboard: {
                primary: 'Clipboard API',
                fallback: 'Text selection + manual copy',
                implementation: (text, element) => {
                    // Select text for manual copying
                    if (element && element.select) {
                        element.select();
                        element.setSelectionRange(0, element.value.length);
                    }
                    return {
                        success: true,
                        message: 'テキストを選択しました。Ctrl+C (Cmd+C)でコピーしてください',
                        type: 'info'
                    };
                }
            },
            
            storage: {
                primary: 'localStorage',
                fallback: 'Session-only storage',
                implementation: (key, value) => {
                    // Use in-memory storage as fallback
                    if (!window.tempStorage) {
                        window.tempStorage = {};
                    }
                    window.tempStorage[key] = value;
                    return {
                        success: true,
                        message: '設定は一時的に保存されました（ページを閉じると失われます）',
                        type: 'warning'
                    };
                }
            },
            
            serviceWorker: {
                primary: 'Service Worker',
                fallback: 'Online-only mode',
                implementation: () => {
                    return {
                        success: true,
                        message: 'オンラインモードで動作しています',
                        type: 'info'
                    };
                }
            }
        };

        const strategy = degradationStrategies[feature];
        if (!strategy) {
            return {
                success: false,
                message: `未知の機能: ${feature}`,
                type: 'error'
            };
        }

        try {
            return strategy.implementation(options.data, options.element);
        } catch (error) {
            console.error(`Graceful degradation failed for ${feature}:`, error);
            return {
                success: false,
                message: `${feature}の代替機能も利用できません`,
                type: 'error'
            };
        }
    }

    /**
     * Check browser capabilities and warn about potential issues
     * @param {UIController} uiController - UI controller for user feedback
     * @returns {Object} Capability check results
     */
    checkBrowserCapabilities(uiController) {
        const capabilities = {
            clipboardAPI: navigator.clipboard && typeof navigator.clipboard.writeText === 'function',
            secureContext: window.isSecureContext,
            localStorage: this.isStorageAvailable('localStorage'),
            sessionStorage: this.isStorageAvailable('sessionStorage'),
            serviceWorker: 'serviceWorker' in navigator
        };

        const warnings = [];

        // Check for potential issues
        if (!capabilities.secureContext) {
            warnings.push({
                message: 'HTTPSでアクセスすることで、より多くの機能を利用できます',
                type: 'info'
            });
        }

        if (!capabilities.clipboardAPI) {
            warnings.push({
                message: 'クリップボード機能が制限されています。手動でのコピーが必要になる場合があります',
                type: 'info'
            });
        }

        if (!capabilities.localStorage) {
            warnings.push({
                message: '設定の保存ができません。プライベートモードを終了すると設定が利用できます',
                type: 'warning'
            });
        }

        // Show warnings to user (only the most important ones)
        if (warnings.length > 0 && uiController) {
            const importantWarnings = warnings.filter(w => w.type === 'warning');
            if (importantWarnings.length > 0) {
                this.showUserNotification(importantWarnings[0].message, importantWarnings[0].type, uiController);
            }
        }

        return {
            capabilities,
            warnings,
            overallScore: Object.values(capabilities).filter(Boolean).length / Object.keys(capabilities).length
        };
    }

    /**
     * Check if a storage type is available
     * @private
     * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
     * @returns {boolean} True if storage is available
     */
    isStorageAvailable(type) {
        try {
            const storage = window[type];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get error statistics for debugging and monitoring
     * @returns {Object} Error statistics
     */
    getErrorStatistics() {
        return {
            totalErrors: this.errorCount || 0,
            errorTypes: this.errorTypes || {},
            lastError: this.lastError || null,
            degradationUsage: this.degradationUsage || {}
        };
    }
}

/**
 * Application initialization and integration with performance optimizations
 * Integrates UIController and TextAnalyzer for real-time functionality
 * Includes memory management and performance monitoring
 */
class CharacterCounterApp {
    /**
     * Initialize the application with performance optimizations
     */
    constructor() {
        this.textAnalyzer = new TextAnalyzer();
        this.uiController = new UIController();
        this.clipboardManager = new ClipboardManager();
        this.errorHandler = new ErrorHandler();
        
        // Performance monitoring
        this.performanceMonitor = {
            startTime: performance.now(),
            memoryCheckInterval: null,
            lastMemoryCheck: 0,
            memoryThreshold: 50 * 1024 * 1024, // 50MB threshold
            cleanupInterval: 5 * 60 * 1000 // 5 minutes
        };
        
        this.initialize();
        this.setupPerformanceMonitoring();
    }

    /**
     * Initialize the application components and set up real-time updates
     * Requirements 1.1, 1.2, 1.3: Real-time text analysis and display
     */
    initialize() {
        try {
            // Check browser capabilities and show warnings if needed
            this.errorHandler.checkBrowserCapabilities(this.uiController);

            // Set up real-time event listeners
            this.uiController.setupEventListeners(this.textAnalyzer);

            // Set up clear button functionality
            if (this.uiController.clearButton) {
                this.uiController.clearButton.addEventListener('click', () => {
                    this.handleClear();
                });
            }

            // Add keyboard shortcut support for clear functionality (Ctrl+L or Cmd+L)
            document.addEventListener('keydown', (event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
                    event.preventDefault();
                    this.handleClear();
                }
            });

            // Set up copy button functionality
            if (this.uiController.copyButton) {
                this.uiController.copyButton.addEventListener('click', () => {
                    this.handleCopy();
                });
            }

            // Set up global error handling
            this.setupGlobalErrorHandling();

        } catch (error) {
            this.errorHandler.handleGeneralError(error, 'アプリケーション初期化', this.uiController);
        }
    }

    /**
     * Set up performance monitoring and memory management
     */
    setupPerformanceMonitoring() {
        // Periodic memory cleanup
        this.performanceMonitor.memoryCheckInterval = setInterval(() => {
            this.performMemoryCleanup();
        }, this.performanceMonitor.cleanupInterval);

        // Monitor memory usage if available
        if (performance.memory) {
            setInterval(() => {
                this.checkMemoryUsage();
            }, 30000); // Check every 30 seconds
        }

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Cleanup on visibility change (when tab becomes hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performMemoryCleanup();
            }
        });
    }

    /**
     * Perform memory cleanup operations
     */
    performMemoryCleanup() {
        try {
            // Clear text analyzer cache
            this.textAnalyzer.clearCache();
            
            // Clear error handler notification queue if it's too large
            if (this.errorHandler.notificationQueue && this.errorHandler.notificationQueue.length > 10) {
                this.errorHandler.notificationQueue = this.errorHandler.notificationQueue.slice(-5);
            }
            
            // Force garbage collection if available (development only)
            if (window.gc && typeof window.gc === 'function') {
                window.gc();
            }
            
            console.log('Memory cleanup performed');
        } catch (error) {
            console.warn('Memory cleanup failed:', error);
        }
    }

    /**
     * Check memory usage and trigger cleanup if needed
     */
    checkMemoryUsage() {
        if (!performance.memory) return;

        const memoryInfo = performance.memory;
        const usedMemory = memoryInfo.usedJSHeapSize;
        
        // Log memory usage for monitoring
        if (usedMemory > this.performanceMonitor.lastMemoryCheck * 1.2) {
            console.log(`Memory usage: ${(usedMemory / 1024 / 1024).toFixed(2)}MB`);
            this.performanceMonitor.lastMemoryCheck = usedMemory;
        }

        // Trigger cleanup if memory usage is high
        if (usedMemory > this.performanceMonitor.memoryThreshold) {
            console.warn('High memory usage detected, performing cleanup');
            this.performMemoryCleanup();
            
            // Show user notification if memory is critically high
            if (usedMemory > this.performanceMonitor.memoryThreshold * 1.5) {
                this.errorHandler.showUserNotification(
                    'メモリ使用量が多くなっています。大量のテキストを処理する場合は、小さなセクションに分けることをお勧めします',
                    'warning',
                    this.uiController,
                    5000
                );
            }
        }
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance statistics
     */
    getPerformanceStats() {
        const uptime = performance.now() - this.performanceMonitor.startTime;
        
        return {
            uptime: `${(uptime / 1000).toFixed(2)}s`,
            textAnalyzer: this.textAnalyzer.getPerformanceMetrics(),
            memory: performance.memory ? {
                used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
            } : 'Not available'
        };
    }

    /**
     * Cleanup resources on application shutdown
     */
    cleanup() {
        // Clear intervals
        if (this.performanceMonitor.memoryCheckInterval) {
            clearInterval(this.performanceMonitor.memoryCheckInterval);
        }

        // Clear caches
        this.textAnalyzer.clearCache();
        
        // Clear any pending timeouts in UI controller
        if (this.uiController.feedbackTimeout) {
            clearTimeout(this.uiController.feedbackTimeout);
        }

        console.log('Application cleanup completed');
    }

    /**
     * Handle clear button click with enhanced error handling
     * Requirement 4.1: Clear text input area when clear button is clicked
     * Requirement 4.2: Reset all statistics to 0 when text is cleared
     * Requirement 4.3: Return focus to input area after clear operation
     */
    handleClear() {
        try {
            // Check if there's text to clear
            const currentText = this.uiController.getCurrentText();

            // Requirement 4.1: Clear the text input area
            this.uiController.clearText();

            // Requirement 4.2: Reset all statistics information to 0
            const stats = this.textAnalyzer.analyze('');
            this.uiController.updateStats(stats);

            // Requirement 4.3: Return focus to input area for continued use
            this.uiController.focusTextArea();

            // Provide appropriate user feedback
            if (currentText && currentText.length > 0) {
                this.errorHandler.showUserNotification('✓ テキストをクリアしました', 'success', this.uiController, 2000);
            } else {
                this.errorHandler.showUserNotification('テキストエリアは既に空です', 'info', this.uiController, 1500);
            }
        } catch (error) {
            this.errorHandler.handleGeneralError(error, 'クリア操作', this.uiController);
        }
    }

    /**
     * Set up global error handling for unhandled errors
     */
    setupGlobalErrorHandling() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.errorHandler.handleGeneralError(
                new Error(event.reason), 
                '非同期処理', 
                this.uiController
            );
            event.preventDefault(); // Prevent default browser error handling
        });

        // Handle general JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.errorHandler.handleGeneralError(
                event.error || new Error(event.message), 
                'JavaScript実行', 
                this.uiController
            );
        });
    }

    /**
     * Handle copy button click with enhanced error handling
     * Requirement 5.1: Copy text to clipboard when copy button is clicked
     * Requirement 5.2: Visual feedback for successful copy operations
     */
    async handleCopy() {
        const text = this.uiController.getCurrentText();

        if (!text) {
            this.errorHandler.showUserNotification('コピーするテキストがありません', 'warning', this.uiController);
            this.uiController.showCopyButtonFeedback('error');
            return;
        }

        // Show copying state - requirement 5.2
        this.uiController.showCopyButtonFeedback('copying');

        try {
            const success = await this.clipboardManager.copyToClipboard(text);

            if (success) {
                // Requirement 5.2: Enhanced visual feedback for successful copy
                this.uiController.showCopyButtonFeedback('copied');
                this.errorHandler.showUserNotification('✓ テキストをクリップボードにコピーしました', 'success', this.uiController);
            } else {
                // Use graceful degradation for clipboard failure
                const degradationResult = this.errorHandler.implementGracefulDegradation('clipboard', {
                    data: text,
                    element: this.uiController.textInput
                });

                this.uiController.showCopyButtonFeedback('error');
                this.errorHandler.showUserNotification(degradationResult.message, degradationResult.type, this.uiController, 5000);
            }
        } catch (error) {
            // Handle clipboard error with ErrorHandler
            const errorInfo = this.errorHandler.handleClipboardError(error, this.uiController);
            
            // Execute fallback action
            if (errorInfo.fallbackAction === 'selectText') {
                const degradationResult = this.errorHandler.implementGracefulDegradation('clipboard', {
                    data: text,
                    element: this.uiController.textInput
                });
                
                this.uiController.showCopyButtonFeedback('error');
                // Error message already shown by handleClipboardError
            } else {
                this.uiController.showCopyButtonFeedback('error');
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new CharacterCounterApp();
    
    // Expose app instance and performance utilities for testing purposes
    window.characterCounterApp = app;
    
    // Expose performance utilities for debugging
    window.getPerformanceStats = () => app.getPerformanceStats();
    window.performMemoryCleanup = () => app.performMemoryCleanup();
    window.clearAnalyzerCache = () => app.textAnalyzer.clearCache();
    
    // Performance testing utility
    window.performanceTest = (textSize = 10000) => {
        const testText = 'A'.repeat(textSize);
        const startTime = performance.now();
        
        for (let i = 0; i < 100; i++) {
            app.textAnalyzer.analyze(testText);
        }
        
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / 100;
        
        console.log(`Performance test results for ${textSize} characters:`);
        console.log(`Average analysis time: ${avgTime.toFixed(2)}ms`);
        console.log(`Performance stats:`, app.getPerformanceStats());
        
        return {
            textSize,
            averageTime: avgTime,
            totalTime: endTime - startTime,
            performanceStats: app.getPerformanceStats()
        };
    };
});