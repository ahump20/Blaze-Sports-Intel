// Enhanced Hero Section with Three.js Integration
// This script adds interactive 3D elements to your existing hero section

class EnhancedHeroSection {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.biomechData = null;
        this.animationId = null;
        this.isInitialized = false;
    }

    // Initialize Three.js scene
    initThreeJS() {
        try {
            if (typeof THREE === 'undefined') {
                console.warn('Three.js not loaded, using fallback');
                return false;
            }

            // Create container if it doesn't exist
            let container = document.getElementById('hero-three-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'hero-three-container';
                container.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    pointer-events: none;
                `;
                
                // Add to existing hero section
                const heroSection = document.getElementById('home') || document.querySelector('.hero');
                if (heroSection) {
                    heroSection.style.position = 'relative';
                    heroSection.appendChild(container);
                }
            }

            // Initialize Three.js
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(this.renderer.domElement);

            // Create enhanced particle system
            this.createEnhancedParticles();
            
            // Create biomechanical visualization
            this.createBiomechVisualization();

            this.camera.position.z = 100;
            this.startAnimation();
            this.isInitialized = true;

            console.log('✅ Enhanced Hero Section initialized');
            return true;
        } catch (error) {
            console.error('Hero enhancement failed:', error);
            return false;
        }
    }

    // Create enhanced particle system
    createEnhancedParticles() {
        const particleCount = window.innerWidth < 768 ? 300 : 600;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        // Your brand colors
        const colorPalette = [
            new THREE.Color(0xBF5700), // Burnt orange
            new THREE.Color(0xD2691E), // Accent orange
            new THREE.Color(0xA0522D), // Darker orange
            new THREE.Color(0xDEB887), // Light orange
        ];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;

            // Color
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Size
            sizes[i] = Math.random() * 3 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 2,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    // Create biomechanical data visualization
    createBiomechVisualization() {
        // Create swing path visualization
        const swingPath = new THREE.Group();
        
        // Create swing arc
        const curve = new THREE.EllipseCurve(
            0, 0,
            30, 20,
            0, Math.PI * 0.8,
            false,
            0
        );
        
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0xBF5700,
            transparent: true,
            opacity: 0.6
        });
        
        const line = new THREE.Line(geometry, material);
        line.rotation.z = -Math.PI / 4;
        swingPath.add(line);

        // Add critical frame markers
        const criticalFrames = [
            { position: [-20, 10, 0], score: 9, label: 'Setup' },
            { position: [0, 0, 0], score: 9, label: 'Stance' },
            { position: [15, -5, 0], score: 8, label: 'Swing' },
            { position: [25, -15, 0], score: 8, label: 'Follow' }
        ];

        criticalFrames.forEach((frame, index) => {
            const sphereGeometry = new THREE.SphereGeometry(1.5, 8, 6);
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: frame.score >= 9 ? 0x10b981 : 0xBF5700,
                transparent: true,
                opacity: 0.8
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(...frame.position);
            swingPath.add(sphere);
        });

        swingPath.position.set(0, 0, -50);
        swingPath.scale.set(0.5, 0.5, 0.5);
        this.scene.add(swingPath);
        this.swingPath = swingPath;
    }

    // Animation loop
    animate() {
        if (!this.isInitialized) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        // Rotate particles
        if (this.particles) {
            this.particles.rotation.x += 0.001;
            this.particles.rotation.y += 0.002;
        }

        // Animate swing path
        if (this.swingPath) {
            this.swingPath.rotation.y += 0.005;
        }

        // Update particle positions
        if (this.particles && this.particles.geometry) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    }

    // Start animation
    startAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }

    // Stop animation
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Handle window resize
    handleResize() {
        if (!this.isInitialized) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Add interactive elements to existing sections
    enhanceExistingElements() {
        // Add hover effects to stat cards
        const statCards = document.querySelectorAll('.stat-card, .glass-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 10px 30px rgba(191, 87, 0, 0.3)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });

        // Add AI status indicators
        this.addAIStatusIndicators();
        
        // Add biomechanical data displays
        this.addBiomechDataDisplays();
    }

    // Add AI status indicators
    addAIStatusIndicators() {
        const aiStatusHTML = `
            <div class="ai-status-widget" style="
                position: fixed;
                top: 100px;
                right: 20px;
                background: rgba(30, 41, 59, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(191, 87, 0, 0.3);
                border-radius: 12px;
                padding: 16px;
                z-index: 1000;
                min-width: 200px;
                transition: all 0.3s ease;
            ">
                <h4 style="color: #BF5700; margin-bottom: 12px; font-size: 14px; font-weight: 600;">
                    🤖 AI Systems Status
                </h4>
                <div class="ai-status-list" style="display: flex; flex-direction: column; gap: 8px;">
                    <div class="ai-status-item" style="display: flex; align-items: center; gap: 8px;">
                        <div class="status-dot" style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        <span style="color: #e2e8f0; font-size: 12px;">Claude MCP</span>
                    </div>
                    <div class="ai-status-item" style="display: flex; align-items: center; gap: 8px;">
                        <div class="status-dot" style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        <span style="color: #e2e8f0; font-size: 12px;">GPT-4</span>
                    </div>
                    <div class="ai-status-item" style="display: flex; align-items: center; gap: 8px;">
                        <div class="status-dot" style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        <span style="color: #e2e8f0; font-size: 12px;">Gemini</span>
                    </div>
                    <div class="ai-status-item" style="display: flex; align-items: center; gap: 8px;">
                        <div class="status-dot" style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        <span style="color: #e2e8f0; font-size: 12px;">Biomech AI</span>
                    </div>
                </div>
            </div>
        `;

        // Add to page
        document.body.insertAdjacentHTML('beforeend', aiStatusHTML);

        // Add pulse animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }

    // Add biomechanical data displays
    addBiomechDataDisplays() {
        // Find analytics section
        const analyticsSection = document.getElementById('data') || document.querySelector('[data-section="analytics"]');
        if (!analyticsSection) return;

        const biomechWidget = document.createElement('div');
        biomechWidget.className = 'biomech-widget';
        biomechWidget.innerHTML = `
            <div class="glass-card p-8 rounded-2xl">
                <div class="flex items-center gap-4 mb-6">
                    <div class="bg-burnt-orange-500/20 text-burnt-orange-400 p-3 rounded-full">
                        <span style="font-size: 24px;">⚾</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">Live Biomechanical Analysis</h3>
                        <p class="text-slate-400">954 frames analyzed | 4 critical phases</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-burnt-orange-400">9/10</div>
                        <div class="text-sm text-slate-400">Balance Score</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-burnt-orange-400">8.5/10</div>
                        <div class="text-sm text-slate-400">Overall Tech</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-burnt-orange-400">44%</div>
                        <div class="text-sm text-slate-400">Stance Phase</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-burnt-orange-400">13.6%</div>
                        <div class="text-sm text-slate-400">Swing Phase</div>
                    </div>
                </div>
                
                <div class="bg-slate-800/50 p-4 rounded-lg">
                    <div class="text-sm text-burnt-orange-400 mb-2">Phase Analysis</div>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-300 text-sm">Setup</span>
                            <div class="flex items-center gap-2">
                                <div class="w-16 bg-slate-700 rounded-full h-2">
                                    <div class="bg-burnt-orange-500 h-2 rounded-full" style="width: 90%"></div>
                                </div>
                                <span class="text-xs text-slate-400">9/10</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-300 text-sm">Swing</span>
                            <div class="flex items-center gap-2">
                                <div class="w-16 bg-slate-700 rounded-full h-2">
                                    <div class="bg-burnt-orange-500 h-2 rounded-full" style="width: 80%"></div>
                                </div>
                                <span class="text-xs text-slate-400">8/10</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-300 text-sm">Follow</span>
                            <div class="flex items-center gap-2">
                                <div class="w-16 bg-slate-700 rounded-full h-2">
                                    <div class="bg-burnt-orange-500 h-2 rounded-full" style="width: 80%"></div>
                                </div>
                                <span class="text-xs text-slate-400">8/10</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to analytics section
        const analyticsGrid = analyticsSection.querySelector('.analytics-grid, .grid');
        if (analyticsGrid) {
            analyticsGrid.appendChild(biomechWidget);
        }
    }

    // Initialize everything
    init() {
        // Load Three.js if not already loaded
        if (typeof THREE === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                this.initThreeJS();
                this.enhanceExistingElements();
            };
            document.head.appendChild(script);
        } else {
            this.initThreeJS();
            this.enhanceExistingElements();
        }

        // Add resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    // Cleanup
    destroy() {
        this.stopAnimation();
        if (this.renderer) {
            this.renderer.dispose();
        }
        window.removeEventListener('resize', () => this.handleResize());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for existing animations to complete
    setTimeout(() => {
        const enhancedHero = new EnhancedHeroSection();
        enhancedHero.init();
        console.log('🚀 Enhanced Hero Section loaded');
    }, 2000);
});

// Export for global use
window.EnhancedHeroSection = EnhancedHeroSection;