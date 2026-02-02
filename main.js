import * as THREE from 'three';
import gsap from 'gsap';

// --- CONFIG & STATE ---
const config = {
    particleCount: 400,
    colors: [0xff4d6d, 0xff758f, 0xff85a1, 0xfbb1bd, 0xc9184a],
};

// Elements
const bgCanvas = document.querySelector('#birthday-canvas');
const cakeCanvas = document.querySelector('#cake-canvas');
const loveCanvas = document.querySelector('#love-canvas');
const surpriseBtn = document.querySelector('#surprise-btn');
const overlay = document.querySelector('#overlay');
const closeBtn = document.querySelector('#close-btn');
const phaseCake = document.querySelector('#phase-cake');
const phaseLove = document.querySelector('#phase-love');

// Three.js Globals
let bgScene, bgCamera, bgRenderer;
let cakeScene, cakeCamera, cakeRenderer;
let loveScene, loveCamera, loveRenderer;

let particles, cakeGroup, heartMesh;
let clock = new THREE.Clock();

// --- INITIALIZATION ---
function init() {
    // 1. Background Scene
    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    bgCamera.position.z = 5;
    bgRenderer = new THREE.WebGLRenderer({ canvas: bgCanvas, antialias: true, alpha: true });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Cake Scene
    cakeScene = new THREE.Scene();
    cakeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    cakeCamera.position.z = 5;
    cakeRenderer = new THREE.WebGLRenderer({ canvas: cakeCanvas, antialias: true, alpha: true });

    // 3. Love Scene
    loveScene = new THREE.Scene();
    loveCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    loveCamera.position.z = 5;
    loveRenderer = new THREE.WebGLRenderer({ canvas: loveCanvas, antialias: true, alpha: true });

    setupLights();
    createParticles();
    createCake();
    createHeart();

    handleResize();
    animate();
    entranceAnimations();
}

function setupLights() {
    const addLights = (scene) => {
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);
        const point = new THREE.PointLight(0xffffff, 50);
        point.position.set(5, 5, 5);
        scene.add(point);
    };
    addLights(bgScene);
    addLights(cakeScene);
    addLights(loveScene);
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const pos = new Float32Array(config.particleCount * 3);
    for (let i = 0; i < config.particleCount * 3; i++) pos[i] = (Math.random() - 0.5) * 20;
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const material = new THREE.PointsMaterial({ size: 0.05, color: 0xff4d6d, transparent: true, opacity: 0.4 });
    particles = new THREE.Points(geometry, material);
    bgScene.add(particles);
}

function createCake() {
    cakeGroup = new THREE.Group();
    const tiers = [
        { r: 1.5, h: 0.8, y: -0.4, color: 0xfff0f3 },
        { r: 1.1, h: 0.7, y: 0.35, color: 0xffb3c1 },
        { r: 0.7, h: 0.6, y: 1.0, color: 0xff4d6d }
    ];
    tiers.forEach(t => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(t.r, t.r, t.h, 32), new THREE.MeshPhongMaterial({ color: t.color }));
        m.position.y = t.y;
        cakeGroup.add(m);
    });
    // Candle
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16), new THREE.MeshPhongMaterial({ color: 0xffffff }));
    candle.position.y = 1.5;
    cakeGroup.add(candle);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffcc00 }));
    flame.position.y = 1.75;
    cakeGroup.add(flame);

    cakeGroup.position.set(0, -0.5, 0);
    cakeScene.add(cakeGroup);
}

function createHeart() {
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0.5, 0.5);
    heartShape.bezierCurveTo(0.5, 0.5, 0.4, 0, 0, 0);
    heartShape.bezierCurveTo(-0.6, 0, -0.6, 0.7, -0.6, 0.7);
    heartShape.bezierCurveTo(-0.6, 1.1, -0.3, 1.54, 0.5, 1.9);
    heartShape.bezierCurveTo(1.2, 1.54, 1.6, 1.1, 1.6, 0.7);
    heartShape.bezierCurveTo(1.6, 0.7, 1.6, 0, 1, 0);
    heartShape.bezierCurveTo(0.7, 0, 0.5, 0.5, 0.5, 0.5);

    const geometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.4, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 });
    heartMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xff4d6d, shininess: 100 }));
    heartMesh.rotation.z = Math.PI;
    heartMesh.scale.set(0.8, 0.8, 0.8);
    heartMesh.position.set(-0.5, 0, 0); // Better centering
    loveScene.add(heartMesh);
}

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    particles.rotation.y = time * 0.05;
    cakeGroup.rotation.y = time * 0.5;
    heartMesh.rotation.y = time * 1.5;
    heartMesh.position.y = Math.sin(time * 2) * 0.2;

    bgRenderer.render(bgScene, bgCamera);
    if (!overlay.classList.contains('hidden')) {
        if (!phaseCake.classList.contains('hidden')) cakeRenderer.render(cakeScene, cakeCamera);
        if (!phaseLove.classList.contains('hidden')) loveRenderer.render(loveScene, loveCamera);
    }
}

function entranceAnimations() {
    const tl = gsap.timeline();
    tl.to('.premium-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' })
        .to('.subtitle', { opacity: 0.8, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8')
        .to('.card', { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)' }, '-=0.5');
}

// --- INTERACTION ---
surpriseBtn.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    phaseCake.classList.remove('hidden');
    phaseLove.classList.remove('hidden'); // Show both briefly to measure

    // Force resize since they were hidden
    const cakeRect = cakeCanvas.parentElement.getBoundingClientRect();
    cakeRenderer.setSize(cakeRect.width, cakeRect.height);
    cakeCamera.aspect = cakeRect.width / cakeRect.height;
    cakeCamera.updateProjectionMatrix();

    const loveRect = loveCanvas.parentElement.getBoundingClientRect();
    loveRenderer.setSize(loveRect.width, loveRect.height);
    loveCamera.aspect = loveRect.width / loveRect.height;
    loveCamera.updateProjectionMatrix();

    phaseLove.classList.add('hidden'); // Hide the second one again

    // Animate Cake Sequence
    const tiers = cakeGroup.children;
    gsap.from(tiers[0].position, { y: 10, duration: 0.8, ease: 'bounce.out' });
    gsap.from(tiers[1].position, { y: 10, duration: 0.8, delay: 0.1, ease: 'bounce.out' });
    gsap.from(tiers[2].position, { y: 10, duration: 0.8, delay: 0.2, ease: 'bounce.out' });
    gsap.from([tiers[3].position, tiers[4].position], { y: 10, duration: 0.8, delay: 0.3, ease: 'bounce.out' });

    setTimeout(() => {
        gsap.to(phaseCake, {
            opacity: 0, duration: 0.5, onComplete: () => {
                phaseCake.classList.add('hidden');
                phaseCake.style.opacity = 1;
                phaseLove.classList.remove('hidden');
                gsap.from(heartMesh.scale, { x: 0, y: 0, z: 0, duration: 1, ease: 'elastic.out(1, 0.5)' });
                triggerConfetti();
            }
        });
    }, 4000);
});

closeBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
});

function triggerConfetti() {
    const count = 100;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = 0;
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const points = new THREE.Points(geom, new THREE.PointsMaterial({ size: 0.1, color: 0xffffff }));
    loveScene.add(points);
    for (let i = 0; i < count; i++) {
        gsap.to(pos, {
            [i * 3]: (Math.random() - 0.5) * 10,
            [i * 3 + 1]: (Math.random() - 0.5) * 10,
            [i * 3 + 2]: (Math.random() - 0.5) * 10,
            duration: 2, ease: 'power2.out'
        });
    }
    setTimeout(() => loveScene.remove(points), 3000);
}

function handleResize() {
    const resize = () => {
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);

        const rect = cakeCanvas.parentElement.getBoundingClientRect();
        cakeRenderer.setSize(rect.width, rect.height);
        loveRenderer.setSize(rect.width, rect.height);
    };
    window.addEventListener('resize', resize);
    resize();
}

init();
