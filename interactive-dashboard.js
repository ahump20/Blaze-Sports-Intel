// Interactive Dashboard Enhancement
// Adds dynamic data visualizations and AI status to your existing portfolio

class InteractiveDashboard {
    constructor() {
        this.aiStatus = {
            claude: 'active',
            gpt4: 'active', 
            gemini: 'processing',
            biomech: 'active',
            cardinals: 'active',
            blaze: 'optimizing'
        };
        this.blazeEnergy = 84;
        this.currentMetrics = {
            battingAverage: 0.312,
            projectSuccess: 95,
            aiModels: 6,
            musicLibrary: 1063,
            mcpServers: 6
        };
        this.notifications = [];
        this.isInitialized = false;
    }

    // Initialize dashboard
    init() {
        this.createFloatingMetrics();
        this.enhanceExistingCards();
        this.addInteractiveElements();
        this.startRealTimeUpdates();
        this.isInitialized = true;
        console.log('🎯 Interactive Dashboard initialized');
    }

    // Create floating metrics widget
    createFloatingMetrics() {
        const metricsWidget = document.createElement('div');
        metricsWidget.id = 'floating-metrics';
        metricsWidget.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(191, 87, 0, 0.3);
            border-radius: 16px;
            padding: 20px;
            z-index: 1000;
            min-width: 240px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        metricsWidget.innerHTML = `
            <div style="text-align: center; margin-bottom: 16px;">
                <h3 style="color: #BF5700; font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                    🚀 BLAZE Intelligence
                </h3>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <div id="blaze-energy-bar" style="width: 60px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                        <div id="blaze-energy-fill" style="height: 100%; background: linear-gradient(90deg, #BF5700, #10b981); width: ${this.blazeEnergy}%; transition: width 0.3s ease;"></div>
                    </div>
                    <span id="blaze-energy-text" style="color: #BF5700; font-size: 14px; font-weight: 600;">${this.blazeEnergy}%</span>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; cursor: pointer;" onclick="dashboard.showMetricDetail('batting')">
                    <div style="color: #BF5700; font-size: 18px; font-weight: 700;">${this.currentMetrics.battingAverage}</div>
                    <div style="color: #94a3b8; font-size: 11px;">Batting Avg</div>
                </div>
                <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; cursor: pointer;" onclick="dashboard.showMetricDetail('success')">
                    <div style="color: #BF5700; font-size: 18px; font-weight: 700;">${this.currentMetrics.projectSuccess}%</div>
                    <div style="color: #94a3b8; font-size: 11px;">Success Rate</div>
                </div>
                <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; cursor: pointer;" onclick="dashboard.showMetricDetail('ai')">
                    <div style="color: #BF5700; font-size: 18px; font-weight: 700;">${this.currentMetrics.aiModels}</div>
                    <div style="color: #94a3b8; font-size: 11px;">AI Models</div>
                </div>
                <div style="text-align: center; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; cursor: pointer;" onclick="dashboard.showMetricDetail('music')">
                    <div style="color: #BF5700; font-size: 18px; font-weight: 700;">${this.currentMetrics.musicLibrary}</div>
                    <div style="color: #94a3b8; font-size: 11px;">Music Tracks</div>
                </div>
            </div>

            <div style="margin-bottom: 16px;">
                <h4 style="color: #BF5700; font-size: 12px; font-weight: 600; margin-bottom: 8px;">AI Systems Status</h4>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${Object.entries(this.aiStatus).map(([system, status]) => `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="status-dot status-${status}" style="width: 8px; height: 8px; border-radius: 50%; background: ${this.getStatusColor(status)}; animation: ${status === 'active' ? 'none' : 'pulse 2s infinite'};"></div>
                            <span style="color: #e2e8f0; font-size: 11px; text-transform: uppercase;">${system}</span>
                            <span style="color: #64748b; font-size: 10px; margin-left: auto;">${status}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <button onclick="dashboard.activateBlaze()" style="
                width: 100%;
                background: linear-gradient(45deg, #BF5700, #D2691E);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                🚀 ACTIVATE BLAZE
            </button>
        `;

        document.body.appendChild(metricsWidget);
    }

    // Get status color
    getStatusColor(status) {
        const colors = {
            'active': '#10b981',
            'processing': '#f59e0b',
            'optimizing': '#8b5cf6',
            'idle': '#64748b'
        };
        return colors[status] || '#64748b';
    }

    // Show metric detail
    showMetricDetail(metric) {
        const details = {
            batting: 'Baseball analytics excellence - 0.312 career average translates to business execution',
            success: 'Project completion rate - Systematic approach yields consistent results',
            ai: 'Multi-AI orchestration - 6 models working in harmony for competitive intelligence',
            music: 'Music intelligence - 1,063 tracks analyzed for pattern recognition insights'
        };

        this.showNotification(details[metric] || 'Metric analysis active');
    }

    // Activate BLAZE protocol
    activateBlaze() {
        if (this.blazeEnergy >= 20) {
            this.blazeEnergy = Math.min(100, this.blazeEnergy + 15);
            this.updateBlazeEnergy();
            this.showNotification('🔥 BLAZE Protocol Activated! Energy surge detected.');
            
            // Add visual effect
            const widget = document.getElementById('floating-metrics');
            widget.style.boxShadow = '0 0 30px rgba(191, 87, 0, 0.6)';
            setTimeout(() => {
                widget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }, 2000);
        }
    }

    // Update BLAZE energy display
    updateBlazeEnergy() {
        const energyFill = document.getElementById('blaze-energy-fill');
        const energyText = document.getElementById('blaze-energy-text');
        
        if (energyFill && energyText) {
            energyFill.style.width = `${this.blazeEnergy}%`;
            energyText.textContent = `${this.blazeEnergy}%`;
        }
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #BF5700, #D2691E);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 20px rgba(191, 87, 0, 0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Enhance existing cards
    enhanceExistingCards() {
        const cards = document.querySelectorAll('.glass-card, .portfolio-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(191, 87, 0, 0.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });
    }

    // Add interactive elements
    addInteractiveElements() {
        // Add click effects to stat cards in hero
        const heroStats = document.querySelectorAll('#home .glass-card');
        heroStats.forEach((card, index) => {
            card.addEventListener('click', () => {
                const messages = [
                    'UT Austin excellence - International Relations with systematic thinking',
                    'Athletic achievement - Multi-sport varsity athlete with competitive edge',
                    'AI systems integration - 6 MCP servers processing real-time intelligence',
                    'Texas roots - Boerne Hill Country foundation with Memphis grit'
                ];
                
                this.showNotification(messages[index] || 'System activated');
                
                // Add click animation
                card.style.animation = 'clickPulse 0.3s ease-out';
                setTimeout(() => {
                    card.style.animation = '';
                }, 300);
            });
        });

        // Add real-time data to analytics section
        this.enhanceAnalyticsSection();
    }

    // Enhance analytics section
    enhanceAnalyticsSection() {
        const analyticsSection = document.getElementById('data');
        if (!analyticsSection) return;

        // Add real-time performance widget
        const performanceWidget = document.createElement('div');
        performanceWidget.innerHTML = `
            <div class="glass-card p-8 rounded-2xl" style="border: 1px solid rgba(191, 87, 0, 0.3);">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-white">Real-Time Performance</h3>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span class="text-sm text-slate-400">Live</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-burnt-orange-400" id="live-batting">0.312</div>
                        <div class="text-sm text-slate-400">Career Average</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-burnt-orange-400" id="live-success">95%</div>
                        <div class="text-sm text-slate-400">Project Success</div>
                    </div>
                </div>
                
                <div class="bg-slate-800/50 p-4 rounded-lg">
                    <div class="text-sm text-burnt-orange-400 mb-3">System Performance</div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-300 text-sm">MCP Servers</span>
                            <div class="flex items-center gap-2">
                                <div class="w-20 bg-slate-700 rounded-full h-2">
                                    <div class="bg-burnt-orange-500 h-2 rounded-full" style="width: 100%"></div>
                                </div>
                                <span class="text-xs text-slate-400">6/6</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-300 text-sm">AI Models</span>
                            <div class="flex items-center gap-2">
                                <div class="w-20 bg-slate-700 rounded-full h-2">
                                    <div class="bg-burnt-orange-500 h-2 rounded-full" style="width: 95%"></div>
                                </div>
                                <span class="text-xs text-slate-400">Active</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-300 text-sm">Analytics</span>
                            <div class="flex items-center gap-2">
                                <div class="w-20 bg-slate-700 rounded-full h-2">
                                    <div class="bg-burnt-orange-500 h-2 rounded-full" style="width: 88%"></div>
                                </div>
                                <span class="text-xs text-slate-400">Processing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const analyticsGrid = analyticsSection.querySelector('.grid');
        if (analyticsGrid) {
            analyticsGrid.appendChild(performanceWidget);
        }
    }

    // Start real-time updates
    startRealTimeUpdates() {
        // Update AI status
        setInterval(() => {
            const systems = Object.keys(this.aiStatus);
            const randomSystem = systems[Math.floor(Math.random() * systems.length)];
            const statuses = ['active', 'processing', 'optimizing'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            this.aiStatus[randomSystem] = randomStatus;
            this.updateAIStatus();
        }, 5000);

        // Recharge BLAZE energy
        setInterval(() => {
            if (this.blazeEnergy < 100) {
                this.blazeEnergy = Math.min(100, this.blazeEnergy + 1);
                this.updateBlazeEnergy();
            }
        }, 3000);
    }

    // Update AI status display
    updateAIStatus() {
        const statusElements = document.querySelectorAll('.status-dot');
        statusElements.forEach((dot, index) => {
            const system = Object.keys(this.aiStatus)[index];
            if (system) {
                const status = this.aiStatus[system];
                dot.style.background = this.getStatusColor(status);
                dot.style.animation = status === 'active' ? 'none' : 'pulse 2s infinite';
            }
        });
    }
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes clickPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.1); }
    }
`;
document.head.appendChild(style);

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        dashboard = new InteractiveDashboard();
        dashboard.init();
    }, 3000);
});

// Export for global use
window.InteractiveDashboard = InteractiveDashboard;