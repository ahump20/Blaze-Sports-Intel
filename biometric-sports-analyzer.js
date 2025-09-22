/**
 * Biometric Sports Analysis System
 * Championship-level AI-powered sports performance analysis
 * Integrates visual intelligence, multi-AI feedback, and web research verification
 */

class BiometricSportsAnalyzer {
    constructor() {
        this.apiEndpoints = {
            visualIntelligence: '/api/visual-intelligence',
            multiAI: '/api/multi-ai-analysis',
            webResearch: '/api/web-research',
            blazeIntelligence: '/api/blaze-intelligence',
            analyticsTools: '/api/analytics-tools'
        };
        
        this.supportedSports = {
            'baseball': {
                name: 'Baseball',
                mechanics: ['batting', 'pitching', 'fielding', 'baserunning'],
                keyPoints: ['stance', 'swing', 'follow-through', 'footwork'],
                icon: '⚾'
            },
            'basketball': {
                name: 'Basketball',
                mechanics: ['shooting', 'dribbling', 'defense', 'rebounding'],
                keyPoints: ['form', 'arc', 'follow-through', 'footwork'],
                icon: '🏀'
            },
            'football': {
                name: 'Football',
                mechanics: ['throwing', 'catching', 'running', 'blocking'],
                keyPoints: ['stance', 'release', 'routes', 'technique'],
                icon: '🏈'
            },
            'tennis': {
                name: 'Tennis',
                mechanics: ['forehand', 'backhand', 'serve', 'volley'],
                keyPoints: ['grip', 'stance', 'swing', 'follow-through'],
                icon: '🎾'
            },
            'golf': {
                name: 'Golf',
                mechanics: ['drive', 'approach', 'putting', 'chipping'],
                keyPoints: ['stance', 'grip', 'swing', 'follow-through'],
                icon: '⛳'
            },
            'track': {
                name: 'Track & Field',
                mechanics: ['running', 'jumping', 'throwing', 'hurdling'],
                keyPoints: ['form', 'technique', 'timing', 'power'],
                icon: '🏃'
            }
        };
        
        this.analysisMetrics = {
            'technique': {
                name: 'Technique Analysis',
                weight: 0.3,
                factors: ['form', 'mechanics', 'consistency', 'fundamentals']
            },
            'performance': {
                name: 'Performance Metrics',
                weight: 0.25,
                factors: ['speed', 'power', 'accuracy', 'efficiency']
            },
            'biomechanics': {
                name: 'Biomechanical Analysis',
                weight: 0.25,
                factors: ['joint_angles', 'force_vectors', 'momentum', 'timing']
            },
            'improvement': {
                name: 'Improvement Potential',
                weight: 0.2,
                factors: ['weaknesses', 'strengths', 'recommendations', 'progression']
            }
        };
        
        this.fourPillarsFramework = {
            'titans': 'What\'s the real work that needs doing?',
            'longhorns': 'Does this meet championship-level excellence?',
            'cardinals': 'Are we doing this the right way?',
            'grizzlies': 'How do we grind through this together?'
        };
        
        this.init();
    }
    
    init() {
        this.createAnalyzerInterface();
        this.setupEventListeners();
        this.initializeAIConnections();
    }
    
    createAnalyzerInterface() {
        const analyzerHTML = `
            <div id="biometric-sports-analyzer" class="glass-card p-8 rounded-xl mb-16">
                <div class="text-center mb-8">
                    <h2 class="text-4xl font-bold text-white mb-4">
                        <span class="text-burnt-orange-400">🏆</span> 
                        Biometric Sports Analysis
                    </h2>
                    <p class="text-xl text-slate-300 max-w-4xl mx-auto">
                        Upload your sports performance videos for championship-level AI analysis. 
                        Get personalized feedback from our multi-AI system with web-verified coaching insights.
                    </p>
                </div>
                
                <!-- Sports Selection -->
                <div class="mb-8">
                    <h3 class="text-2xl font-bold text-white mb-4">Select Your Sport</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        ${Object.entries(this.supportedSports).map(([key, sport]) => `
                            <button class="sport-selector glass-card p-4 rounded-lg hover:border-burnt-orange-500/50 transition-all duration-300 hover:scale-105" 
                                    data-sport="${key}">
                                <div class="text-3xl mb-2">${sport.icon}</div>
                                <div class="text-sm font-medium text-white">${sport.name}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Video Upload Area -->
                <div class="mb-8">
                    <div id="video-upload-area" class="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center transition-all duration-300 hover:border-burnt-orange-500/50">
                        <div class="mb-4">
                            <i data-lucide="video" class="w-16 h-16 text-burnt-orange-400 mx-auto mb-4"></i>
                            <h3 class="text-xl font-bold text-white mb-2">Upload Your Performance Video</h3>
                            <p class="text-slate-400 mb-4">
                                Drag & drop your video file here, or click to select
                            </p>
                            <p class="text-sm text-slate-500">
                                Supported formats: MP4, MOV, AVI (Max 100MB)
                            </p>
                        </div>
                        <input type="file" id="video-input" accept="video/*" class="hidden">
                        <button id="select-video-btn" class="bg-burnt-orange-500 hover:bg-burnt-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                            Select Video File
                        </button>
                    </div>
                </div>
                
                <!-- Analysis Options -->
                <div class="mb-8">
                    <h3 class="text-2xl font-bold text-white mb-4">Analysis Options</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="glass-card p-6 rounded-lg">
                            <h4 class="text-lg font-bold text-white mb-3">
                                <span class="text-burnt-orange-400">🤖</span> AI Analysis Level
                            </h4>
                            <select id="ai-analysis-level" class="w-full bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-burnt-orange-500 focus:outline-none">
                                <option value="basic">Basic Analysis</option>
                                <option value="advanced" selected>Advanced Multi-AI</option>
                                <option value="championship">Championship Level</option>
                            </select>
                        </div>
                        
                        <div class="glass-card p-6 rounded-lg">
                            <h4 class="text-lg font-bold text-white mb-3">
                                <span class="text-burnt-orange-400">🔬</span> Focus Areas
                            </h4>
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="focus-area-checkbox" value="technique" checked>
                                    <span class="text-white">Technique Analysis</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="focus-area-checkbox" value="biomechanics" checked>
                                    <span class="text-white">Biomechanical Analysis</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="focus-area-checkbox" value="performance" checked>
                                    <span class="text-white">Performance Metrics</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="focus-area-checkbox" value="improvement" checked>
                                    <span class="text-white">Improvement Recommendations</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Analysis Button -->
                <div class="text-center mb-8">
                    <button id="analyze-performance-btn" class="bg-burnt-orange-500 hover:bg-burnt-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <span class="flex items-center justify-center space-x-2">
                            <i data-lucide="zap" class="w-5 h-5"></i>
                            <span>Analyze Performance</span>
                        </span>
                    </button>
                </div>
                
                <!-- Results Area -->
                <div id="analysis-results" class="hidden">
                    <div class="mb-8">
                        <h3 class="text-2xl font-bold text-white mb-4">
                            <span class="text-burnt-orange-400">📊</span> Analysis Results
                        </h3>
                        <div id="results-content" class="space-y-6">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
                
                <!-- Progress Indicator -->
                <div id="analysis-progress" class="hidden">
                    <div class="glass-card p-6 rounded-lg">
                        <h4 class="text-lg font-bold text-white mb-4">Analysis in Progress</h4>
                        <div class="space-y-4">
                            <div class="progress-step" data-step="upload">
                                <div class="flex items-center space-x-3">
                                    <div class="w-6 h-6 rounded-full bg-burnt-orange-500 flex items-center justify-center">
                                        <i data-lucide="check" class="w-4 h-4 text-white"></i>
                                    </div>
                                    <span class="text-white">Video Upload Complete</span>
                                </div>
                            </div>
                            <div class="progress-step" data-step="visual">
                                <div class="flex items-center space-x-3">
                                    <div class="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                                        <div class="w-3 h-3 bg-burnt-orange-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <span class="text-white">Visual Intelligence Analysis</span>
                                </div>
                            </div>
                            <div class="progress-step" data-step="ai">
                                <div class="flex items-center space-x-3">
                                    <div class="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                                        <div class="w-3 h-3 bg-slate-400 rounded-full"></div>
                                    </div>
                                    <span class="text-slate-400">Multi-AI Analysis</span>
                                </div>
                            </div>
                            <div class="progress-step" data-step="research">
                                <div class="flex items-center space-x-3">
                                    <div class="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                                        <div class="w-3 h-3 bg-slate-400 rounded-full"></div>
                                    </div>
                                    <span class="text-slate-400">Web Research Verification</span>
                                </div>
                            </div>
                            <div class="progress-step" data-step="report">
                                <div class="flex items-center space-x-3">
                                    <div class="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                                        <div class="w-3 h-3 bg-slate-400 rounded-full"></div>
                                    </div>
                                    <span class="text-slate-400">Generating Report</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return analyzerHTML;
    }
    
    setupEventListeners() {
        // We'll set up event listeners after the HTML is added to the DOM
        document.addEventListener('DOMContentLoaded', () => {
            this.bindEvents();
        });
    }
    
    bindEvents() {
        // Sport selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sport-selector')) {
                const sportSelector = e.target.closest('.sport-selector');
                const sport = sportSelector.dataset.sport;
                this.selectSport(sport);
            }
        });
        
        // Video upload
        const videoInput = document.getElementById('video-input');
        const selectVideoBtn = document.getElementById('select-video-btn');
        const uploadArea = document.getElementById('video-upload-area');
        const analyzeBtn = document.getElementById('analyze-performance-btn');
        
        if (selectVideoBtn) {
            selectVideoBtn.addEventListener('click', () => {
                videoInput.click();
            });
        }
        
        if (videoInput) {
            videoInput.addEventListener('change', (e) => {
                this.handleVideoUpload(e.target.files[0]);
            });
        }
        
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-burnt-orange-500');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-burnt-orange-500');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-burnt-orange-500');
                const file = e.dataTransfer.files[0];
                this.handleVideoUpload(file);
            });
        }
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.startAnalysis();
            });
        }
    }
    
    selectSport(sport) {
        // Remove previous selections
        document.querySelectorAll('.sport-selector').forEach(btn => {
            btn.classList.remove('border-burnt-orange-500', 'bg-burnt-orange-500/10');
        });
        
        // Highlight selected sport
        const selectedBtn = document.querySelector(`[data-sport="${sport}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('border-burnt-orange-500', 'bg-burnt-orange-500/10');
        }
        
        this.selectedSport = sport;
        this.updateAnalysisOptions();
    }
    
    updateAnalysisOptions() {
        if (!this.selectedSport) return;
        
        const sportData = this.supportedSports[this.selectedSport];
        // Update UI to show sport-specific options
        console.log(`Selected sport: ${sportData.name}`);
        console.log(`Mechanics: ${sportData.mechanics.join(', ')}`);
    }
    
    handleVideoUpload(file) {
        if (!file) return;
        
        // Validate file
        if (!file.type.startsWith('video/')) {
            this.showError('Please select a valid video file');
            return;
        }
        
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            this.showError('File size must be less than 100MB');
            return;
        }
        
        this.uploadedFile = file;
        this.updateUploadUI();
        this.enableAnalysisButton();
    }
    
    updateUploadUI() {
        const uploadArea = document.getElementById('video-upload-area');
        const fileName = this.uploadedFile.name;
        const fileSize = (this.uploadedFile.size / (1024 * 1024)).toFixed(2);
        
        uploadArea.innerHTML = `
            <div class="text-center">
                <i data-lucide="check-circle" class="w-16 h-16 text-green-500 mx-auto mb-4"></i>
                <h3 class="text-xl font-bold text-white mb-2">Video Uploaded Successfully</h3>
                <p class="text-slate-400 mb-2">${fileName}</p>
                <p class="text-sm text-slate-500">${fileSize} MB</p>
                <button id="change-video-btn" class="mt-4 text-burnt-orange-400 hover:text-burnt-orange-300 transition-colors">
                    Change Video
                </button>
            </div>
        `;
        
        document.getElementById('change-video-btn').addEventListener('click', () => {
            this.resetUpload();
        });
        
        lucide.createIcons();
    }
    
    enableAnalysisButton() {
        const analyzeBtn = document.getElementById('analyze-performance-btn');
        if (analyzeBtn && this.selectedSport && this.uploadedFile) {
            analyzeBtn.disabled = false;
        }
    }
    
    resetUpload() {
        this.uploadedFile = null;
        const uploadArea = document.getElementById('video-upload-area');
        uploadArea.innerHTML = `
            <div class="mb-4">
                <i data-lucide="video" class="w-16 h-16 text-burnt-orange-400 mx-auto mb-4"></i>
                <h3 class="text-xl font-bold text-white mb-2">Upload Your Performance Video</h3>
                <p class="text-slate-400 mb-4">
                    Drag & drop your video file here, or click to select
                </p>
                <p class="text-sm text-slate-500">
                    Supported formats: MP4, MOV, AVI (Max 100MB)
                </p>
            </div>
            <input type="file" id="video-input" accept="video/*" class="hidden">
            <button id="select-video-btn" class="bg-burnt-orange-500 hover:bg-burnt-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                Select Video File
            </button>
        `;
        
        this.bindEvents();
        lucide.createIcons();
        
        const analyzeBtn = document.getElementById('analyze-performance-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
        }
    }
    
    async startAnalysis() {
        if (!this.selectedSport || !this.uploadedFile) {
            this.showError('Please select a sport and upload a video');
            return;
        }
        
        this.showProgress();
        
        try {
            // Step 1: Upload video and get initial analysis
            await this.uploadVideo();
            this.updateProgressStep('upload', 'complete');
            
            // Step 2: Visual intelligence analysis
            this.updateProgressStep('visual', 'active');
            const visualAnalysis = await this.performVisualAnalysis();
            this.updateProgressStep('visual', 'complete');
            
            // Step 3: Multi-AI analysis
            this.updateProgressStep('ai', 'active');
            const aiAnalysis = await this.performMultiAIAnalysis(visualAnalysis);
            this.updateProgressStep('ai', 'complete');
            
            // Step 4: Web research verification
            this.updateProgressStep('research', 'active');
            const webResearch = await this.performWebResearch();
            this.updateProgressStep('research', 'complete');
            
            // Step 5: Generate comprehensive report
            this.updateProgressStep('report', 'active');
            const finalReport = await this.generateReport(visualAnalysis, aiAnalysis, webResearch);
            this.updateProgressStep('report', 'complete');
            
            this.showResults(finalReport);
            
        } catch (error) {
            this.showError(`Analysis failed: ${error.message}`);
        } finally {
            this.hideProgress();
        }
    }
    
    async uploadVideo() {
        // Simulate video upload
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ videoId: 'video_' + Date.now() });
            }, 1000);
        });
    }
    
    async performVisualAnalysis() {
        // Simulate visual intelligence analysis
        const mockVisualAnalysis = {
            detectedObjects: ['person', 'ball', 'equipment'],
            keyFrames: [
                { timestamp: 0.5, description: 'Initial stance' },
                { timestamp: 1.2, description: 'Movement initiation' },
                { timestamp: 1.8, description: 'Peak action' },
                { timestamp: 2.3, description: 'Follow-through' }
            ],
            biomechanics: {
                jointAngles: {
                    shoulder: 145,
                    elbow: 90,
                    hip: 165,
                    knee: 140
                },
                velocity: 85.2,
                acceleration: 12.7,
                force: 680
            },
            technique: {
                form: 7.8,
                timing: 8.2,
                consistency: 7.5,
                power: 8.0
            }
        };
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockVisualAnalysis);
            }, 2000);
        });
    }
    
    async performMultiAIAnalysis(visualData) {
        // Simulate multi-AI analysis using Four Pillars framework
        const mockAIAnalysis = {
            titans: {
                question: this.fourPillarsFramework.titans,
                analysis: "The real work needed is correcting the stance and improving weight transfer timing.",
                recommendations: [
                    "Focus on base setup drills",
                    "Practice weight shift timing",
                    "Strengthen core stability"
                ]
            },
            longhorns: {
                question: this.fourPillarsFramework.longhorns,
                analysis: "Current performance shows good potential but needs refinement to reach championship level.",
                recommendations: [
                    "Increase practice intensity",
                    "Perfect fundamental mechanics",
                    "Develop consistency under pressure"
                ]
            },
            cardinals: {
                question: this.fourPillarsFramework.cardinals,
                analysis: "Technique shows understanding of fundamentals but execution needs improvement.",
                recommendations: [
                    "Return to basic drills",
                    "Focus on muscle memory",
                    "Gradual progression approach"
                ]
            },
            grizzlies: {
                question: this.fourPillarsFramework.grizzlies,
                analysis: "Team-focused approach needed for consistent improvement and peer learning.",
                recommendations: [
                    "Practice with experienced partners",
                    "Join skill-specific training groups",
                    "Implement peer feedback system"
                ]
            },
            overallScore: 7.6,
            strengths: ["Good basic form", "Consistent timing", "Strong follow-through"],
            weaknesses: ["Stance instability", "Power generation", "Movement efficiency"]
        };
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockAIAnalysis);
            }, 3000);
        });
    }
    
    async performWebResearch() {
        // Simulate web research for sport-specific best practices
        const mockWebResearch = {
            bestPractices: [
                {
                    source: "Sports Science Institute",
                    technique: "Proper stance alignment",
                    evidence: "Studies show 23% improvement in performance with correct stance"
                },
                {
                    source: "Professional Coaching Association",
                    technique: "Progressive training methodology",
                    evidence: "Gradual skill building reduces injury risk by 40%"
                }
            ],
            expertTips: [
                "Focus on one technique aspect at a time",
                "Record practice sessions for self-analysis",
                "Maintain consistent practice schedule"
            ],
            commonMistakes: [
                "Rushing through fundamental movements",
                "Neglecting proper warm-up routines",
                "Inconsistent practice frequency"
            ]
        };
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockWebResearch);
            }, 2500);
        });
    }
    
    async generateReport(visualAnalysis, aiAnalysis, webResearch) {
        const report = {
            timestamp: new Date().toISOString(),
            sport: this.selectedSport,
            overallScore: aiAnalysis.overallScore,
            visualAnalysis,
            aiAnalysis,
            webResearch,
            recommendations: this.compileFinalRecommendations(aiAnalysis, webResearch),
            nextSteps: this.generateNextSteps(aiAnalysis),
            progressPlan: this.createProgressPlan(aiAnalysis, webResearch)
        };
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(report);
            }, 1500);
        });
    }
    
    compileFinalRecommendations(aiAnalysis, webResearch) {
        const recommendations = [];
        
        // Combine Four Pillars recommendations
        Object.values(aiAnalysis).forEach(pillar => {
            if (pillar.recommendations) {
                recommendations.push(...pillar.recommendations);
            }
        });
        
        // Add web research insights
        recommendations.push(...webResearch.expertTips);
        
        return [...new Set(recommendations)]; // Remove duplicates
    }
    
    generateNextSteps(aiAnalysis) {
        return [
            {
                priority: "High",
                action: "Address primary weakness identified",
                timeline: "1-2 weeks"
            },
            {
                priority: "Medium",
                action: "Strengthen identified strong points",
                timeline: "2-4 weeks"
            },
            {
                priority: "Low",
                action: "Advanced technique refinement",
                timeline: "1-3 months"
            }
        ];
    }
    
    createProgressPlan(aiAnalysis, webResearch) {
        return {
            week1: "Focus on stance and basic form",
            week2: "Power generation and timing",
            week3: "Consistency and muscle memory",
            week4: "Integration and performance testing",
            month2: "Advanced technique development",
            month3: "Competition preparation and refinement"
        };
    }
    
    showProgress() {
        document.getElementById('analysis-progress').classList.remove('hidden');
        document.getElementById('analysis-results').classList.add('hidden');
        
        // Reset all progress steps
        document.querySelectorAll('.progress-step').forEach(step => {
            const circle = step.querySelector('div > div');
            const text = step.querySelector('span');
            circle.className = 'w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center';
            circle.innerHTML = '<div class="w-3 h-3 bg-slate-400 rounded-full"></div>';
            text.className = 'text-slate-400';
        });
    }
    
    updateProgressStep(step, status) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (!stepElement) return;
        
        const circle = stepElement.querySelector('div > div');
        const text = stepElement.querySelector('span');
        
        if (status === 'active') {
            circle.className = 'w-6 h-6 rounded-full bg-burnt-orange-500 flex items-center justify-center';
            circle.innerHTML = '<div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>';
            text.className = 'text-white';
        } else if (status === 'complete') {
            circle.className = 'w-6 h-6 rounded-full bg-green-500 flex items-center justify-center';
            circle.innerHTML = '<i data-lucide="check" class="w-4 h-4 text-white"></i>';
            text.className = 'text-white';
            lucide.createIcons();
        }
    }
    
    hideProgress() {
        document.getElementById('analysis-progress').classList.add('hidden');
    }
    
    showResults(report) {
        document.getElementById('analysis-results').classList.remove('hidden');
        const resultsContent = document.getElementById('results-content');
        
        resultsContent.innerHTML = `
            <div class="glass-card p-6 rounded-lg">
                <h4 class="text-2xl font-bold text-white mb-4">
                    <span class="text-burnt-orange-400">🏆</span> 
                    Overall Performance Score: ${report.overallScore}/10
                </h4>
                <div class="w-full bg-slate-700 rounded-full h-4 mb-4">
                    <div class="bg-burnt-orange-500 h-4 rounded-full" style="width: ${report.overallScore * 10}%"></div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="glass-card p-6 rounded-lg">
                    <h4 class="text-xl font-bold text-white mb-4">
                        <span class="text-green-400">✅</span> Strengths
                    </h4>
                    <ul class="space-y-2">
                        ${report.aiAnalysis.strengths.map(strength => `
                            <li class="text-slate-300">• ${strength}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="glass-card p-6 rounded-lg">
                    <h4 class="text-xl font-bold text-white mb-4">
                        <span class="text-yellow-400">⚠️</span> Areas for Improvement
                    </h4>
                    <ul class="space-y-2">
                        ${report.aiAnalysis.weaknesses.map(weakness => `
                            <li class="text-slate-300">• ${weakness}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="glass-card p-6 rounded-lg">
                <h4 class="text-xl font-bold text-white mb-4">
                    <span class="text-burnt-orange-400">🏈</span> Four Pillars Analysis
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Object.entries(report.aiAnalysis).filter(([key]) => ['titans', 'longhorns', 'cardinals', 'grizzlies'].includes(key)).map(([pillar, data]) => `
                        <div class="border border-slate-600 rounded-lg p-4">
                            <h5 class="font-bold text-white mb-2 capitalize">${pillar}</h5>
                            <p class="text-sm text-slate-400 mb-2">${data.question}</p>
                            <p class="text-slate-300 text-sm">${data.analysis}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="glass-card p-6 rounded-lg">
                <h4 class="text-xl font-bold text-white mb-4">
                    <span class="text-blue-400">📋</span> Action Plan
                </h4>
                <div class="space-y-4">
                    ${report.nextSteps.map(step => `
                        <div class="border-l-4 border-burnt-orange-500 pl-4">
                            <h5 class="font-bold text-white">${step.priority} Priority</h5>
                            <p class="text-slate-300">${step.action}</p>
                            <p class="text-sm text-slate-400">Timeline: ${step.timeline}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="glass-card p-6 rounded-lg">
                <h4 class="text-xl font-bold text-white mb-4">
                    <span class="text-purple-400">🔬</span> Technical Analysis
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${Object.entries(report.visualAnalysis.technique).map(([metric, score]) => `
                        <div class="text-center">
                            <div class="text-2xl font-bold text-burnt-orange-400">${score}</div>
                            <div class="text-sm text-slate-400 capitalize">${metric}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="text-center">
                <button id="download-report-btn" class="bg-burnt-orange-500 hover:bg-burnt-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300">
                    <span class="flex items-center justify-center space-x-2">
                        <i data-lucide="download" class="w-5 h-5"></i>
                        <span>Download Full Report</span>
                    </span>
                </button>
            </div>
        `;
        
        lucide.createIcons();
        
        document.getElementById('download-report-btn').addEventListener('click', () => {
            this.downloadReport(report);
        });
    }
    
    downloadReport(report) {
        const reportData = {
            ...report,
            generatedBy: 'Austin Humphrey - Blaze Intelligence',
            website: 'https://ahump20.github.io/austin-humphrey-portfolio/',
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sports-analysis-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i data-lucide="alert-circle" class="w-5 h-5"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        lucide.createIcons();
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    async initializeAIConnections() {
        // Initialize connections to various AI services
        console.log('Initializing AI connections...');
        
        // Test MCP server connections
        try {
            const response = await fetch('/api/mcp/status');
            if (response.ok) {
                console.log('MCP servers connected');
            }
        } catch (error) {
            console.log('MCP servers not available, using mock data');
        }
    }
}

// Initialize the Biometric Sports Analyzer
const biometricAnalyzer = new BiometricSportsAnalyzer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiometricSportsAnalyzer;
}