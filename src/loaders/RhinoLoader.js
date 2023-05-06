import { Rhino3dmLoader } from "three/addons/loaders/3DMLoader.js";

export class RhinoLoader {
  constructor(manager) {
    this.loader = new Rhino3dmLoader(manager);
    this.loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@7.15.0/");
  }

  /**
   * Load a single model or an array of models.
   *
   * @param {String|String[]} resources Single URL or array of URLs of the model(s) to load.
   * @returns Object|Object[]
   */
  async load(resources) {
    if (Array.isArray(resources)) {
      const promises = resources.map((url) => this.#loadModel(url));
      return await Promise.all(promises);
    } else {
      return await this.#loadModel(resources);
    }
  }

  /**
   * Load a single model.
   *
   * @param {String} url The URL of the model to load
   * @returns Promise
   */
  #loadModel(url) {
    return new Promise((resolve) => {
      this.loader.load(url, (model) => {
        resolve(model);
      });
    });
  }
}
