/**
 * Blaze Intelligence - Advanced GLSL Shaders
 * Custom holographic, glitch, and neon effects for Three.js
 */

// Holographic Material Shader
const HolographicShader = {
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x4B92DB) },
        opacity: { value: 0.8 },
        scanlineSpeed: { value: 2.0 },
        glitchIntensity: { value: 0.0 },
        mousePos: { value: new THREE.Vector2(0, 0) }
    },
    
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        uniform float glitchIntensity;
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            
            vec3 pos = position;
            
            // Holographic wave distortion
            float wave = sin(position.y * 10.0 + time * 2.0) * 0.02;
            pos.x += wave;
            
            // Glitch effect
            if (glitchIntensity > 0.0) {
                float glitch = random(vec2(time, position.y)) * glitchIntensity;
                pos.x += glitch * 0.1;
                pos.z += glitch * 0.05;
            }
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    
    fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        uniform float scanlineSpeed;
        uniform float glitchIntensity;
        uniform vec2 mousePos;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
            vec3 finalColor = color;
            
            // Holographic gradient
            float gradient = abs(sin(vUv.y * 20.0 + time));
            finalColor = mix(finalColor, vec3(1.0), gradient * 0.3);
            
            // Scanlines
            float scanline = sin(vPosition.y * 100.0 + time * scanlineSpeed) * 0.04 + 0.96;
            finalColor *= scanline;
            
            // Edge glow based on viewing angle
            float edgeFactor = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            finalColor += color * edgeFactor * 2.0;
            
            // Glitch color distortion
            if (glitchIntensity > 0.0) {
                float glitchR = random(vUv + time) * glitchIntensity;
                float glitchG = random(vUv + time * 1.1) * glitchIntensity;
                float glitchB = random(vUv + time * 0.9) * glitchIntensity;
                finalColor.r += glitchR;
                finalColor.g -= glitchG;
                finalColor.b += glitchB;
            }
            
            // Mouse interaction - brighten near cursor
            float mouseDist = length(vUv - mousePos);
            float mouseGlow = exp(-mouseDist * 5.0) * 0.5;
            finalColor += vec3(mouseGlow);
            
            // Transparency with fresnel
            float fresnel = pow(1.0 + dot(vNormal, vec3(0.0, 0.0, -1.0)), 3.0);
            float alpha = mix(opacity * 0.3, opacity, fresnel);
            
            gl_FragColor = vec4(finalColor, alpha);
        }
    `,
    
    transparent: true,
    side: THREE.DoubleSide
};

// Neon Glow Shader
const NeonGlowShader = {
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xC41E3A) },
        glowIntensity: { value: 2.0 },
        pulseSpeed: { value: 1.0 }
    },
    
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        uniform float time;
        uniform float pulseSpeed;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            
            // Pulsing animation
            float pulse = sin(time * pulseSpeed) * 0.05 + 1.0;
            vec3 pos = position * pulse;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    
    fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float glowIntensity;
        uniform float pulseSpeed;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
            // Calculate rim lighting
            vec3 viewDir = normalize(vViewPosition);
            float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
            rim = pow(rim, 2.0);
            
            // Pulsing glow
            float pulse = sin(time * pulseSpeed * 2.0) * 0.5 + 0.5;
            
            // Neon color with glow
            vec3 glowColor = color * glowIntensity;
            vec3 finalColor = mix(color * 0.5, glowColor, rim + pulse * 0.3);
            
            // Add electric blue highlights
            finalColor += vec3(0.2, 0.5, 1.0) * rim * 0.5;
            
            // Energy field effect
            float energy = sin(vUv.x * 50.0 + time * 3.0) * sin(vUv.y * 50.0 - time * 2.0);
            finalColor += abs(energy) * color * 0.2;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

// Glitch Effect Shader
const GlitchShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        distortionAmount: { value: 0.0 },
        speed: { value: 1.0 }
    },
    
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float distortionAmount;
        uniform float speed;
        varying vec2 vUv;
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Random glitch blocks
            float glitchBlock = step(0.99, random(vec2(floor(uv.y * 20.0), time * speed)));
            
            // Horizontal displacement
            if (glitchBlock > 0.0) {
                uv.x += (random(vec2(time)) - 0.5) * distortionAmount;
            }
            
            // Color channel separation
            vec4 color;
            color.r = texture2D(tDiffuse, uv + vec2(distortionAmount * 0.01, 0.0)).r;
            color.g = texture2D(tDiffuse, uv).g;
            color.b = texture2D(tDiffuse, uv - vec2(distortionAmount * 0.01, 0.0)).b;
            color.a = 1.0;
            
            // Random noise
            float noise = random(uv + time) * 0.05;
            color.rgb += noise * distortionAmount;
            
            // Scanline effect
            float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.02;
            color.rgb -= scanline * distortionAmount;
            
            gl_FragColor = color;
        }
    `
};

// Data Visualization Shader - for sports analytics
const DataFlowShader = {
    uniforms: {
        time: { value: 0 },
        dataPoints: { value: [] },
        flowSpeed: { value: 1.0 },
        teamColor: { value: new THREE.Color(0xBF5700) }
    },
    
    vertexShader: `
        attribute float dataValue;
        varying float vDataValue;
        varying vec3 vPosition;
        uniform float time;
        uniform float flowSpeed;
        
        void main() {
            vDataValue = dataValue;
            vPosition = position;
            
            // Animate data flow
            vec3 pos = position;
            pos.y += sin(time * flowSpeed + position.x * 0.5) * dataValue * 0.1;
            pos.z += cos(time * flowSpeed + position.x * 0.3) * dataValue * 0.05;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            
            // Scale points based on data value
            gl_PointSize = dataValue * 10.0 * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    
    fragmentShader: `
        uniform vec3 teamColor;
        uniform float time;
        varying float vDataValue;
        varying vec3 vPosition;
        
        void main() {
            // Create circular points
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            // Color based on data value
            vec3 color = mix(teamColor, vec3(1.0), vDataValue);
            
            // Pulsing effect for high values
            if (vDataValue > 0.7) {
                float pulse = sin(time * 5.0) * 0.5 + 0.5;
                color += vec3(pulse * 0.3);
            }
            
            // Fade edges
            float alpha = 1.0 - (dist * 2.0);
            alpha *= vDataValue; // Transparency based on data
            
            gl_FragColor = vec4(color, alpha);
        }
    `,
    
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
};

// Matrix Rain Effect Shader
const MatrixRainShader = {
    uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(1024, 1024) },
        fallSpeed: { value: 0.5 },
        color: { value: new THREE.Color(0x00ff00) }
    },
    
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    
    fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform float fallSpeed;
        uniform vec3 color;
        varying vec2 vUv;
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        float character(vec2 uv, float seed) {
            // Simulate matrix characters
            float r = random(vec2(seed, floor(uv.y * 20.0)));
            return step(0.8, r) * step(mod(uv.y * 20.0, 1.0), 0.8);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Create columns
            float columnWidth = 1.0 / 40.0;
            float column = floor(uv.x / columnWidth);
            
            // Rain effect
            float offset = random(vec2(column, 0.0)) * 10.0;
            float speed = random(vec2(column, 1.0)) * 0.5 + 0.5;
            float y = mod(uv.y - time * fallSpeed * speed + offset, 1.0);
            
            // Character display
            float char = character(vec2(uv.x, y), column);
            
            // Fade trail
            float fade = 1.0 - y;
            fade = pow(fade, 3.0);
            
            // Final color
            vec3 finalColor = color * char * fade;
            
            // Add glow at the head
            if (y > 0.95) {
                finalColor += color * 0.5;
            }
            
            gl_FragColor = vec4(finalColor, char * fade);
        }
    `,
    
    transparent: true,
    side: THREE.DoubleSide
};

// Energy Field Shader
const EnergyFieldShader = {
    uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x5D76A9) },
        color2: { value: new THREE.Color(0xC41E3A) },
        noiseScale: { value: 4.0 },
        intensity: { value: 1.0 }
    },
    
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
            vUv = uv;
            vPosition = position;
            
            // Vertex displacement for energy waves
            vec3 pos = position;
            float wave = sin(position.x * 2.0 + time) * cos(position.z * 2.0 + time) * 0.1;
            pos.y += wave;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    
    fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float noiseScale;
        uniform float intensity;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            
            i = mod289(i);
            vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            
            vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
            // Animated noise
            vec3 noisePos = vec3(vPosition.x * noiseScale, vPosition.y * noiseScale, time * 0.5);
            float noise = snoise(noisePos) * 0.5 + 0.5;
            
            // Energy field pattern
            float pattern = sin(vUv.x * 20.0 + noise * 5.0 + time) * 
                           cos(vUv.y * 20.0 - noise * 3.0 - time);
            pattern = abs(pattern);
            
            // Color mixing based on pattern
            vec3 color = mix(color1, color2, pattern);
            
            // Add energy pulses
            float pulse = sin(time * 2.0 + noise * 3.0) * 0.5 + 0.5;
            color += vec3(pulse * 0.2) * intensity;
            
            // Edge glow
            float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
            edge *= 1.0 - abs(vUv.y - 0.5) * 2.0;
            color += color * edge * 0.5;
            
            gl_FragColor = vec4(color, 0.9);
        }
    `,
    
    transparent: true
};

// Export shader collection
window.BlazeShaders = {
    HolographicShader,
    NeonGlowShader,
    GlitchShader,
    DataFlowShader,
    MatrixRainShader,
    EnergyFieldShader
};