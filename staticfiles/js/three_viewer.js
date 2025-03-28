/**
 * Three.js Product Viewer for E-Commerce Store
 * This script provides 3D model visualization for product pages
 */

class ProductViewer {
    constructor(containerId, modelPath, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        this.modelPath = modelPath;
        this.options = Object.assign({
            backgroundColor: 0xf5f5f5,
            ambientLightColor: 0xffffff,
            ambientLightIntensity: 0.5,
            directionalLightColor: 0xffffff,
            directionalLightIntensity: 0.8,
            autoRotate: true,
            autoRotateSpeed: 1.0,
            enableZoom: true,
            enablePan: false,
            minDistance: 2,
            maxDistance: 10,
            initialDistance: 5,
            showControlPanel: true
        }, options);
        
        this.isInitialized = false;
        this.isLoading = false;
        this.loadingProgress = 0;
        this.model = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    /**
     * Initialize the 3D viewer
     */
    init() {
        this.createLoadingSpinner();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        
        if (this.options.showControlPanel) {
            this.createControlPanel();
        }
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Start loading the model
        this.loadModel();
        
        // Start animation loop
        this.animate();
        
        this.isInitialized = true;
    }
    
    /**
     * Create a loading spinner
     */
    createLoadingSpinner() {
        this.loadingSpinner = document.createElement('div');
        this.loadingSpinner.className = 'viewer-loading';
        this.loadingSpinner.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-progress">Loading 3D Model: 0%</div>
        `;
        this.container.appendChild(this.loadingSpinner);
    }
    
    /**
     * Setup the Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.options.backgroundColor);
        
        // Add subtle fog for depth perception
        this.scene.fog = new THREE.FogExp2(this.options.backgroundColor, 0.02);
    }
    
    /**
     * Setup the camera
     */
    setupCamera() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const aspectRatio = width / height;
        
        this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
        this.camera.position.z = this.options.initialDistance;
        this.camera.position.y = 1;
    }
    
    /**
     * Setup the renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.options.autoRotate;
        this.controls.autoRotateSpeed = this.options.autoRotateSpeed;
        this.controls.enableZoom = this.options.enableZoom;
        this.controls.enablePan = this.options.enablePan;
        this.controls.minDistance = this.options.minDistance;
        this.controls.maxDistance = this.options.maxDistance;
    }
    
    /**
     * Setup lights for the scene
     */
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            this.options.ambientLightColor, 
            this.options.ambientLightIntensity
        );
        this.scene.add(ambientLight);
        
        // Directional light (like sunlight)
        const directionalLight = new THREE.DirectionalLight(
            this.options.directionalLightColor,
            this.options.directionalLightIntensity
        );
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        
        // Set up shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.bias = -0.0001;
        
        this.scene.add(directionalLight);
        
        // Add a rim light from the back for better definition
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
        rimLight.position.set(-1, 1, -1);
        this.scene.add(rimLight);
        
        // Add a ground plane to receive shadows
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        groundPlane.rotation.x = -Math.PI / 2;
        groundPlane.position.y = -2;
        groundPlane.receiveShadow = true;
        this.scene.add(groundPlane);
    }
    
    /**
     * Load the 3D model
     */
    loadModel() {
        this.isLoading = true;
        this.loadingProgress = 0;
        
        // Use GLTFLoader to load the model
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            this.modelPath,
            this.onModelLoaded.bind(this),
            this.onLoadProgress.bind(this),
            this.onLoadError.bind(this)
        );
    }
    
    /**
     * Callback when model is loaded successfully
     * @param {Object} gltf - The loaded GLTF model
     */
    onModelLoaded(gltf) {
        this.model = gltf.scene;
        
        // Make the model cast and receive shadows
        this.model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Improve material quality
                if (child.material) {
                    child.material.side = THREE.DoubleSide;
                    child.material.needsUpdate = true;
                }
            }
        });
        
        // Center the model
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        
        this.model.position.x = -center.x;
        this.model.position.y = -center.y;
        this.model.position.z = -center.z;
        this.model.scale.set(scale, scale, scale);
        
        this.scene.add(this.model);
        
        // Hide loading spinner
        this.hideLoadingSpinner();
        this.isLoading = false;
        
        // Add a subtle fade-in animation for the model
        this.model.traverse(child => {
            if (child.isMesh) {
                if (child.material.opacity !== undefined) {
                    child.material.transparent = true;
                    child.material.opacity = 0;
                    
                    // Animate opacity
                    let opacity = 0;
                    const fadeIn = setInterval(() => {
                        opacity += 0.05;
                        child.material.opacity = opacity;
                        if (opacity >= 1) {
                            clearInterval(fadeIn);
                            child.material.transparent = false;
                        }
                    }, 30);
                }
            }
        });
    }
    
    /**
     * Callback for loading progress
     * @param {Object} event - Progress event
     */
    onLoadProgress(event) {
        if (event.lengthComputable) {
            this.loadingProgress = Math.floor((event.loaded / event.total) * 100);
            
            const progressElement = this.loadingSpinner.querySelector('.loading-progress');
            if (progressElement) {
                progressElement.textContent = `Loading 3D Model: ${this.loadingProgress}%`;
            }
        }
    }
    
    /**
     * Callback for loading error
     * @param {Object} error - Error object
     */
    onLoadError(error) {
        console.error('Error loading 3D model:', error);
        this.showErrorMessage('Failed to load 3D model. Please try again later.');
        this.isLoading = false;
        this.hideLoadingSpinner();
        
        // Show placeholder
        showModelPlaceholder(this.container);
    }
    
    /**
     * Hide the loading spinner
     */
    hideLoadingSpinner() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
        }
    }
    
    /**
     * Show error message in the container
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'viewer-error';
        errorElement.innerHTML = `
            <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="error-message">${message}</div>
        `;
        this.container.appendChild(errorElement);
    }
    
    /**
     * Create control panel for the viewer
     */
    createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'viewer-controls';
        controlPanel.innerHTML = `
            <button class="control-btn zoom-in-btn" title="Zoom In">
                <i class="fas fa-search-plus"></i>
            </button>
            <button class="control-btn zoom-out-btn" title="Zoom Out">
                <i class="fas fa-search-minus"></i>
            </button>
            <button class="control-btn reset-btn" title="Reset View">
                <i class="fas fa-sync-alt"></i>
            </button>
            <button class="control-btn fullscreen-btn" title="Toggle Fullscreen">
                <i class="fas fa-expand"></i>
            </button>
        `;
        this.container.appendChild(controlPanel);
        
        // Add event listeners to control buttons
        const zoomInBtn = controlPanel.querySelector('.zoom-in-btn');
        const zoomOutBtn = controlPanel.querySelector('.zoom-out-btn');
        const resetBtn = controlPanel.querySelector('.reset-btn');
        const fullscreenBtn = controlPanel.querySelector('.fullscreen-btn');
        
        zoomInBtn.addEventListener('click', this.zoomIn.bind(this));
        zoomOutBtn.addEventListener('click', this.zoomOut.bind(this));
        resetBtn.addEventListener('click', this.resetView.bind(this));
        fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
    }
    
    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        
        if (this.controls) {
            this.controls.update(delta);
        }
        
        if (this.model && this.options.autoRotate && !this.controls.autoRotate) {
            this.model.rotation.y += 0.005;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    /**
     * Reset camera view to initial position
     */
    resetView() {
        this.camera.position.set(0, 1, this.options.initialDistance);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
        
        // Add a subtle animation when resetting
        gsap.to(this.camera.position, {
            x: 0,
            y: 1,
            z: this.options.initialDistance,
            duration: 1,
            ease: 'power2.out'
        });
    }
    
    /**
     * Zoom in
     */
    zoomIn() {
        gsap.to(this.camera.position, {
            z: this.camera.position.z * 0.8,
            duration: 0.5,
            ease: 'power2.out'
        });
    }
    
    /**
     * Zoom out
     */
    zoomOut() {
        gsap.to(this.camera.position, {
            z: this.camera.position.z * 1.2,
            duration: 0.5,
            ease: 'power2.out'
        });
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
        
        // Update camera aspect ratio and renderer size after a short delay
        setTimeout(() => {
            this.onWindowResize();
        }, 100);
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        
        // Dispose of Three.js resources
        this.controls.dispose();
        this.renderer.dispose();
        
        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
    }
}

/**
 * Initialize product viewer when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Find all product viewer containers
    const viewerContainers = document.querySelectorAll('.product-3d-viewer');
    
    viewerContainers.forEach(container => {
        const modelPath = container.getAttribute('data-model-path');
        const containerId = container.id;
        
        if (modelPath && containerId) {
            try {
                // Create viewer with options
                new ProductViewer(containerId, modelPath, {
                    autoRotate: container.getAttribute('data-auto-rotate') !== 'false',
                    backgroundColor: parseInt(container.getAttribute('data-bg-color') || '0xf5f5f5', 16)
                });
            } catch (error) {
                console.error('Error initializing product viewer:', error);
                showModelPlaceholder(container);
            }
        } else {
            console.warn('Missing model path or container ID for 3D viewer');
            showModelPlaceholder(container);
        }
    });
});

/**
 * Show placeholder when model loading fails
 */
function showModelPlaceholder(container) {
    const placeholder = document.createElement('div');
    placeholder.className = 'model-placeholder';
    placeholder.innerHTML = `
        <div class="placeholder-icon">
            <i class="fas fa-cube"></i>
        </div>
        <div class="placeholder-text">
            <p>3D model unavailable</p>
            <p class="placeholder-subtext">Please check product images for details</p>
        </div>
    `;
    
    // Clear container content
    container.innerHTML = '';
    container.appendChild(placeholder);
}