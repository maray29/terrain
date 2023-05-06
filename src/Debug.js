import { Pane } from "tweakpane";
import { Color, Vector4, GridHelper } from "three";

export class Debug {
  constructor(app) {
    this.app = app;

    // this.#createGridHelper();
    this.#createPanel();
    this.#createSceneConfig();
    this.#createPhysicsConfig();
    // this.#createBoxConfig()
    // this.#createShadedBoxConfig()
    this.#createLightConfig();
    this.#createPosProcessingHelper();
    this.#createProgress();
  }

  refresh() {
    this.pane.refresh();
  }

  #createProgress() {
    const folder = this.pane.addFolder({ title: "Progress" });
    folder.addInput(this.app.params, "progress", {
      label: "Progress",
      min: 0.0,
      max: 1.0,
    });
  }

  #createPosProcessingHelper() {
    const folder = this.pane.addFolder({ title: "Post Processing" });

    folder
      .addInput(this.app.params, "bloomStrength", {
        label: "Bloom strength",
        min: 0.1,
        max: 2.0,
      })
      .on("change", (value) => {
        this.app.params.strength = Number(value);
      });

    folder
      .addInput(this.app.params, "bloomThreshold", {
        label: "Bloom threshold",
        min: 0.1,
        max: 0.5,
      })
      .on("change", (value) => {
        this.app.params.threshold = Number(value);
      });

    folder
      .addInput(this.app.params, "bloomRadius", {
        label: "Bloom radius",
        min: 0.0,
        max: 2.0,
      })
      .on("change", (value) => {
        this.app.params.radius = Number(value);
      });
  }

  #createGridHelper() {
    this.gridHelper = new GridHelper(10, 10);
    this.gridHelper.rotation.x = -Math.PI / 2;
    this.app.scene.add(this.gridHelper);
  }

  #createPanel() {
    this.pane = new Pane({
      container: document.querySelector("#debug"),
    });
  }

  #createSceneConfig() {
    const folder = this.pane.addFolder({ title: "Scene" });

    const params = {
      background: { r: 18, g: 18, b: 18 },
    };

    folder
      .addInput(params, "background", { label: "Background Color" })
      .on("change", (e) => {
        this.app.renderer.setClearColor(
          new Color(e.value.r / 255, e.value.g / 255, e.value.b / 255)
        );
      });
  }

  #createPhysicsConfig() {
    if (!this.app.hasPhysics) return;

    const folder = this.pane.addFolder({ title: "Physics" });

    folder.addButton({ title: "Toggle Debug" }).on("click", () => {
      window.dispatchEvent(new CustomEvent("togglePhysicsDebug"));
    });
  }

  #createBoxConfig() {
    const folder = this.pane.addFolder({ title: "Box" });
    const mesh = this.app.box;

    this.#createColorControl(mesh.material, folder);

    folder.addInput(mesh.material, "metalness", {
      label: "Metallic",
      min: 0,
      max: 1,
    });
    folder.addInput(mesh.material, "roughness", {
      label: "Roughness",
      min: 0,
      max: 1,
    });
  }

  #createShadedBoxConfig() {
    const folder = this.pane.addFolder({ title: "Shaded Box" });
    const mesh = this.app.shadedBox;

    folder.addInput(mesh.scale, "x", { label: "Width", min: 0.1, max: 4 });
    folder.addInput(mesh.scale, "y", { label: "Height", min: 0.1, max: 4 });
    folder.addInput(mesh.scale, "z", { label: "Depth", min: 0.1, max: 4 });
  }

  #createLightConfig() {
    const folder = this.pane.addFolder({ title: "Light" });

    this.#createColorControl(this.app.pointLight, folder);

    folder.addInput(this.app.pointLight, "intensity", {
      label: "Intensity",
      min: 0,
      max: 1000,
    });
  }

  /**
   * Adds a color control for the given object to the given folder.
   *
   * @param {*} obj Any THREE object with a color property
   * @param {*} folder The folder to add the control to
   */
  #createColorControl(obj, folder) {
    const baseColor255 = obj.color.clone().multiplyScalar(255);
    const params = {
      color: { r: baseColor255.r, g: baseColor255.g, b: baseColor255.b },
    };

    folder.addInput(params, "color", { label: "Color" }).on("change", (e) => {
      obj.color.setRGB(e.value.r, e.value.g, e.value.b).multiplyScalar(1 / 255);
    });
  }

  /**
   * Adds a color control for a custom uniform to the given object in the given folder.
   *
   * @param {THREE.Mesh} obj A `THREE.Mesh` object
   * @param {*} folder The folder to add the control to
   * @param {String} uniformName The name of the uniform to control
   * @param {String} label The label to use for the control
   */
  #createColorUniformControl(obj, folder, uniformName, label = "Color") {
    const preMultVector = new Vector4(255, 255, 255, 1);
    const postMultVector = new Vector4(1 / 255, 1 / 255, 1 / 255, 1);

    const baseColor255 = obj.material.uniforms[uniformName].value
      .clone()
      .multiply(preMultVector);
    const params = {
      color: {
        r: baseColor255.x,
        g: baseColor255.y,
        b: baseColor255.z,
        a: baseColor255.w,
      },
    };

    folder
      .addInput(params, "color", {
        label,
        view: "color",
        color: { alpha: true },
      })
      .on("change", (e) => {
        obj.material.uniforms[uniformName].value
          .set(e.value.r, e.value.g, e.value.b, e.value.a)
          .multiply(postMultVector);
      });
  }
}
