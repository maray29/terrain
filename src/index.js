import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  PointLight,
  Clock,
  Vector2,
  PlaneGeometry,
  MeshBasicMaterial,
} from "three";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { SampleShaderMaterial } from "./materials/SampleShaderMaterial";
import { ParticleShaderMaterial } from "./materials/ParticleShaderMaterial";
import { gltfLoader, rhinoLoader } from "./loaders";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { AberrationShader } from "./AberrationShader.js";

import { gsap } from "gsap";

class App {
  #resizeCallback = () => this.#onResize();

  constructor(container, opts = { physics: false, debug: false }) {
    this.container = document.querySelector(container);
    this.screen = new Vector2(
      this.container.clientWidth,
      this.container.clientHeight
    );

    this.params = {
      bloomStrength: 0.3,
      bloomThreshold: 0.15,
      bloomRadius: 0.1,
      progress: 0.2,
    };

    this.hasPhysics = opts.physics;
    this.hasDebug = opts.debug;
  }

  async init() {
    this.#createScene();
    this.#createRenderer();
    this.#createCamera();
    this.#createControls();

    if (this.hasPhysics) {
      const { Simulation } = await import("./physics/Simulation");
      this.simulation = new Simulation(this);

      const { PhysicsBox } = await import("./physics/Box");
      const { PhysicsFloor } = await import("./physics/Floor");

      Object.assign(this, { PhysicsBox, PhysicsFloor });
    }

    // this.#createBox();
    // this.#createShadedBox();
    this.#createLight();
    // this.#createFloor();
    this.#createClock();
    this.#addListeners();

    await this.#loadModel();
    this.#createParticles();

    this.#initPostProcessing();

    if (this.hasDebug) {
      const { Debug } = await import("./Debug.js");
      new Debug(this);

      const { default: Stats } = await import("stats.js");
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    }

    this.renderer.setAnimationLoop(() => {
      this.stats?.begin();

      this.#update();

      this.#render();

      this.stats?.end();
    });

    console.log(this);
  }

  destroy() {
    this.renderer.dispose();
    this.#removeListeners();
  }

  #update() {
    const elapsed = this.clock.getElapsedTime();

    // this.shadedBox.rotation.y = elapsed;
    // this.shadedBox.rotation.z = elapsed * 0.6;

    this.plane.rotation.z = elapsed * 0.025;
    this.particles.rotation.z = elapsed * 0.025;
    // this.curves.rotation.z = elapsed * 0.05;

    if (this.bloomPass) {
      this.bloomPass.threshold = this.params.bloomThreshold;
      this.bloomPass.strength = this.params.bloomStrength;
      this.bloomPass.radius = this.params.bloomRadius;
    }

    // this.material.uniforms.progress.value = this.params.progress;
    this.material.uniforms.time.value = elapsed * 0.45;

    // console.log(
    //   "Camera position:",
    //   this.camera.position.x,
    //   this.camera.position.y,
    //   this.camera.position.z
    // );
    // console.log(
    //   "LookAt position:",
    //   this.controls.target.x,
    //   this.controls.target.y,
    //   this.controls.target.z
    // );

    this.simulation?.update();
  }

  #initPostProcessing() {
    this.renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight, 0.1, 0.1, 0.1)
    );

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(this.renderScene);
    this.composer.addPass(this.bloomPass);

    this.effect1 = new ShaderPass(AberrationShader);
    this.composer.addPass(this.effect1);
  }

  #render() {
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }

  #createScene() {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
    this.scene = new Scene();
  }

  #createCamera() {
    this.camera = new PerspectiveCamera(
      75,
      this.screen.x / this.screen.y,
      0.1,
      100
    );
    this.camera.position.set(7.5, 4.5, 30);
    // this.camera.lookAt(-6, -6, 4);
  }

  #createRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio === 1,
    });

    this.container.appendChild(this.renderer.domElement);

    this.renderer.setSize(this.screen.x, this.screen.y);
    this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    this.renderer.setClearColor(0x1f1f26);
    this.renderer.physicallyCorrectLights = true;
  }

  #createLight() {
    this.pointLight = new PointLight(0xff0055, 500, 100, 2);
    this.pointLight.position.set(0, 10, 13);
    this.scene.add(this.pointLight);
  }

  /**
   * Create a box with a PBR material
   */
  #createBox() {
    const geometry = new BoxGeometry(1, 1, 1, 1, 1, 1);

    const material = new MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.7,
      roughness: 0.35,
    });

    this.box = new Mesh(geometry, material);
    this.box.position.x = -1.5;
    this.box.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    this.scene.add(this.box);

    if (!this.hasPhysics) return;

    const body = new this.PhysicsBox(this.box, this.scene);
    this.simulation.addItem(body);
  }

  /**
   * Create a box with a custom ShaderMaterial
   */
  #createShadedBox() {
    const geometry = new BoxGeometry(1, 1, 1, 1, 1, 1);

    this.shadedBox = new Mesh(geometry, SampleShaderMaterial);
    this.shadedBox.position.x = 1.5;

    this.scene.add(this.shadedBox);
  }

  #createFloor() {
    if (!this.hasPhysics) return;

    const geometry = new PlaneGeometry(20, 20, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x424242 });

    this.floor = new Mesh(geometry, material);
    this.floor.rotateX(-Math.PI * 0.5);
    this.floor.position.set(0, -2, 0);

    this.scene.add(this.floor);

    const body = new this.PhysicsFloor(this.floor, this.scene);
    this.simulation.addItem(body);
  }

  /**
   * Load a 3D model and append it to the scene
   */
  async #loadModel() {
    // const r3dm2 = await rhinoLoader.load("/terrain-02-lines.3dm");

    // this.#processObject(r3dm2);

    const r3dm = await rhinoLoader.load("/terrain-02.3dm");

    this.mesh = r3dm.children[0];
    // this.mesh.rotation.z = -Math.PI / 2;
    // this.mesh.updateMatrixWorld();

    // this.mesh.material = SampleShaderMaterial.clone();
    // this.mesh.material.wireframe = true;

    this.geometry = this.mesh.geometry;
    // this.geometry.center();
    // this.material = SampleShaderMaterial.clone();
    this.material = ParticleShaderMaterial.clone();
    // this.material.wireframe = true;
    console.log("Material", this.material.uniforms);

    this.plane = new THREE.Points(this.geometry, this.material);

    this.number = this.geometry.attributes.position.array.length;
    let randoms = new Float32Array(this.number / 3);
    let colorRandoms = new Float32Array(this.number / 3);

    for (let i = 0; i < this.number / 3; i++) {
      randoms.set([Math.random()], i);
      colorRandoms.set([Math.random()], i);
    }

    let originalZ = new Float32Array(this.number);

    for (let i = 0; i < this.number; i += 3) {
      originalZ.set([this.geometry.attributes.position.array[i + 2]], i / 3);
    }

    this.geometry.setAttribute(
      "originalZ",
      new THREE.BufferAttribute(originalZ, 1)
    );

    this.geometry.setAttribute(
      "randoms",
      new THREE.BufferAttribute(randoms, 1)
    );

    this.geometry.setAttribute(
      "colorRandoms",
      new THREE.BufferAttribute(colorRandoms, 1)
    );

    console.log(this.plane);
    console.log(this.geometry.attributes.position.array.length);
    this.scene.add(this.plane);

    this.#animateTerrain();
  }

  #animateTerrain() {
    gsap.to(this.material.uniforms.progress, {
      value: 1,
      ease: "power4.out",
      duration: 4,
      // repeat: -1,
      // yoyo: true,
    });
  }

  #createParticles() {
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = Math.random() * 50;
    }

    const particleGeometry = new THREE.BufferGeometry();

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffeded,
      sizeAttenuation: true,
      size: 0.05,
    });

    this.particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particles);
    console.log("hello");
  }

  #processObject(object) {
    const lines = object.children.filter(
      (child) => child instanceof THREE.Line
    );

    const curves = lines.map((line) =>
      this.#extractCurve(line, object.matrixWorld)
    );

    this.curves = new THREE.Group();

    curves.forEach((curve) => {
      const curvePoints = curve.getPoints(300);
      const curveGeometry = new THREE.BufferGeometry().setFromPoints(
        curvePoints
      );
      const curveMaterial = new THREE.LineBasicMaterial({ color: 0xa35330 });

      const curveLine = new THREE.Line(curveGeometry, curveMaterial);
      this.curves.add(curveLine);
      // this.scene.add(curveLine);
    });
    // this.scene.add(this.curves);
  }

  #extractCurve(line, matrixWorld) {
    const pointsArray = line.geometry.getAttribute("position").array;
    const points = [];

    for (let i = 0; i < pointsArray.length; i += 3) {
      const point = new THREE.Vector3(
        pointsArray[i],
        pointsArray[i + 1],
        pointsArray[i + 2]
      );
      // point.applyMatrix4(matrixWorld);
      points.push(point);
    }

    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");

    return curve;
  }

  #createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(-6, -6, 4);
    this.controls.update();
  }

  #createClock() {
    this.clock = new Clock();
  }

  #addListeners() {
    window.addEventListener("resize", this.#resizeCallback, { passive: true });
  }

  #removeListeners() {
    window.removeEventListener("resize", this.#resizeCallback, {
      passive: true,
    });
  }

  #onResize() {
    this.screen.set(this.container.clientWidth, this.container.clientHeight);

    this.camera.aspect = this.screen.x / this.screen.y;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.screen.x, this.screen.y);
  }
}

window._APP_ = new App("#app", {
  physics: window.location.hash.includes("physics"),
  debug: window.location.hash.includes("debug"),
});

window._APP_.init();
