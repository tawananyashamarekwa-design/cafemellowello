/**
 * Mello Wello Premium 3D & Animation Module
 * Integrates Three.js, GSAP, and interactive effects.
 */

class MelloAnimations {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cakeGroup = null;
        this.drips = [];
        this.sprinkles = [];
        this.floatingElements = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;

        this.init();
    }

    init() {
        this.init3DScene();
        this.initGSAP();
        // Wait for elements to be ready
        setTimeout(() => {
            this.init3DScrollEffects();
            this.initHeroImageScrollEffects();
        }, 100);
        this.initListeners();
        this.createBackgroundParticles();
    }

    createBackgroundParticles() {
        const container = document.getElementById('bakery-particles-container');
        if (!container) return;

        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 10 : 20;

        const particleTypes = ['🧁', '✨', '❄️', '🥯', '🍰'];
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = Math.random() * 100 + 'vh';
            p.style.fontSize = (Math.random() * 20 + 10) + 'px';
            p.style.animationDelay = (Math.random() * 10) + 's';
            p.style.animationDuration = (Math.random() * 10 + 10) + 's';
            container.appendChild(p);
        }
    }

    init3DScene() {
        const container = document.getElementById('cake-3d-container');
        if (!container) return;

        // Scene Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(5, 10, 5);
        spotLight.castShadow = true;
        this.scene.add(spotLight);

        const pointLight = new THREE.PointLight(0xE66767, 1, 10);
        pointLight.position.set(0, 2, 0);
        this.scene.add(pointLight);

        // Cake Group
        this.cakeGroup = new THREE.Group();
        this.scene.add(this.cakeGroup);

        this.createPremiumCake();
        this.createFallingSprinkles();
        this.createFloatingAssets();

        this.camera.position.z = 6;
        this.camera.position.y = 1;

        this.animate();
    }

    createPremiumCake() {
        const cakeColor = 0xE66767;
        const frostingColor = 0xffffff;
        const chocolateColor = 0x4B2C20;

        // Base Layer
        this.cakeBase = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 1.2, 32),
            new THREE.MeshStandardMaterial({ color: cakeColor, roughness: 0.4 })
        );
        this.cakeBase.position.y = -0.6;
        this.cakeBase.receiveShadow = true;
        this.cakeGroup.add(this.cakeBase);

        // Mid Frosting
        this.cakeFrosting = new THREE.Mesh(
            new THREE.CylinderGeometry(2.05, 2.05, 0.2, 32),
            new THREE.MeshStandardMaterial({ color: frostingColor, roughness: 0.1 })
        );
        this.cakeFrosting.position.y = 0;
        this.cakeGroup.add(this.cakeFrosting);

        // Top Layer
        this.cakeTop = new THREE.Mesh(
            new THREE.CylinderGeometry(1.6, 1.6, 1, 32),
            new THREE.MeshStandardMaterial({ color: cakeColor, roughness: 0.4 })
        );
        this.cakeTop.position.y = 0.6;
        this.cakeGroup.add(this.cakeTop);

        // Dripping Chocolate effect
        for (let i = 0; i < 12; i++) {
            const dripLen = 0.3 + Math.random() * 0.5;
            const drip = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.08, dripLen, 4, 8),
                new THREE.MeshStandardMaterial({ color: chocolateColor, roughness: 0.1 })
            );
            const angle = (i / 12) * Math.PI * 2;
            drip.position.x = Math.cos(angle) * 1.65;
            drip.position.z = Math.sin(angle) * 1.65;
            drip.position.y = 1.1 - (dripLen / 2);
            this.cakeGroup.add(drip);
            this.drips.push({ mesh: drip, offset: Math.random() * Math.PI });
        }
    }

    createFallingSprinkles() {
        const sprinkleColors = [0xE66767, 0xffffff, 0xF5EEE6, 0x4B2C20];
        for (let i = 0; i < 50; i++) {
            const geom = new THREE.BoxGeometry(0.05, 0.15, 0.05);
            const mat = new THREE.MeshStandardMaterial({ color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)] });
            const sprinkle = new THREE.Mesh(geom, mat);

            sprinkle.position.set(
                (Math.random() - 0.5) * 10,
                5 + Math.random() * 10,
                (Math.random() - 0.5) * 5
            );
            sprinkle.rotation.set(Math.random(), Math.random(), Math.random());

            this.scene.add(sprinkle);
            this.sprinkles.push(sprinkle);
        }
    }

    createFloatingAssets() {
        for (let i = 0; i < 5; i++) {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xff0000 })
            );
            group.add(body);
            const angle = (i / 5) * Math.PI * 2;
            group.position.set(
                Math.cos(angle) * 4,
                Math.random() * 2,
                Math.sin(angle) * 4
            );
            this.scene.add(group);
            this.floatingElements.push({ group, angle, speed: 0.005 + Math.random() * 0.01 });
        }
    }

    initGSAP() {
        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray('section').forEach(section => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 50,
                duration: 1.2,
                ease: "power2.out"
            });
        });
        gsap.utils.toArray('.showcase-img').forEach(img => {
            gsap.from(img, {
                scrollTrigger: {
                    trigger: img,
                    start: "top 90%",
                    scrub: 1
                },
                scale: 0.8,
                opacity: 0.5
            });
        });
    }

    init3DScrollEffects() {
        // 3D Scroll Effects - Object Disassembles & Camera Parallax Depth
        if (this.cakeGroup && this.camera) {
            const tl3D = gsap.timeline({
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.5,
                    pin: false // prevent layout breaking
                }
            });

            // "Assemble / Disassemble" effect for the Cake layers
            if (this.cakeTop) {
                tl3D.to(this.cakeTop.position, { y: 2.5, ease: "power1.inOut" }, 0);
            }
            if (this.cakeFrosting) {
                tl3D.to(this.cakeFrosting.position, { y: 0.8, ease: "power1.inOut" }, 0);
            }
            if (this.cakeBase) {
                tl3D.to(this.cakeBase.position, { y: -1.5, ease: "power1.inOut" }, 0);
            }

            // Camera moves to give depth and perspective shift
            tl3D.to(this.camera.position, {
                z: 12,
                y: 4,
                ease: "power1.inOut"
            }, 0);

            // Dramatic rotation as you scroll
            tl3D.to(this.cakeGroup.rotation, {
                y: Math.PI * 2,
                x: 0.5,
                ease: "none"
            }, 0);

            // Re-render explicitly on GSAP updates
            tl3D.eventCallback("onUpdate", () => {
                this.renderer.render(this.scene, this.camera);
            });
        }
    }

    initHeroImageScrollEffects() {
        const heroImg = document.querySelector('.hero-interactive-img');
        const imgInner = document.querySelector('.interactive-image-inner');

        if (heroImg && imgInner) {
            // Mouse Parallax (Interactive on mouse move)
            window.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const moveX = (clientX - centerX) / 25;
                const moveY = (clientY - centerY) / 25;

                gsap.to(heroImg, {
                    x: moveX,
                    y: moveY,
                    duration: 1,
                    ease: "power2.out"
                });

                gsap.to(imgInner, {
                    rotationY: moveX / 2,
                    rotationX: -moveY / 2,
                    duration: 1,
                    ease: "power2.out"
                });
            });

            // Scroll Animation (Interactive on scroll)
            gsap.to(heroImg, {
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                },
                scale: 1.3,
                y: 50,
                ease: "none"
            });

            gsap.to(imgInner, {
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.5
                },
                y: -100,
                rotationX: 10,
                ease: "none"
            });
        }
    }

    initListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) - 0.5;
            this.mouseY = (e.clientY / window.innerHeight) - 0.5;
        });
        window.addEventListener('resize', () => {
            const container = document.getElementById('cake-3d-container');
            if (!container) return;
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.cakeGroup) {
            this.cakeGroup.rotation.y += 0.005;
            this.cakeGroup.position.y = Math.sin(Date.now() * 0.0015) * 0.2;
            this.targetRotationX = this.mouseY * 0.3;
            this.targetRotationY = this.mouseX * 0.3;
            this.cakeGroup.rotation.x += (this.targetRotationX - this.cakeGroup.rotation.x) * 0.05;
            this.cakeGroup.rotation.z += (-this.targetRotationY - this.cakeGroup.rotation.z) * 0.05;
        }
        this.drips.forEach(d => {
            d.mesh.scale.y = 1 + Math.sin(Date.now() * 0.002 + d.offset) * 0.1;
        });
        this.sprinkles.forEach(s => {
            s.position.y -= 0.02;
            s.rotation.x += 0.01;
            if (s.position.y < -5) s.position.y = 10;
        });
        this.floatingElements.forEach(fe => {
            fe.angle += fe.speed;
            fe.group.position.x = Math.cos(fe.angle) * 4;
            fe.group.position.z = Math.sin(fe.angle) * 4;
            fe.group.position.y += Math.sin(Date.now() * 0.002 + fe.angle) * 0.005;
        });
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('load', () => {
    new MelloAnimations();
});
