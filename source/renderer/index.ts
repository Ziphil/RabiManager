//

import "bootstrap";
import "../style.scss";
import {
  SaveManager
} from "./save-manager";


class Executor {

  private manager: SaveManager;

  public constructor() {
    this.manager = new SaveManager();
  }

  public prepare(): void {
    this.prepareChangeButtons();
    this.prepareCreateButtons();
    this.updateKeys();
    this.updateCurrentKey();
  }

  private updateKeys(): void {
    let keyElement = document.getElementById("change-key")!;
    while (keyElement.firstChild) {
      keyElement.removeChild(keyElement.firstChild);
    }
    for (let [key, save] of this.manager.saves) {
      let optionElement = document.createElement("option");
      optionElement.value = key;
      optionElement.text = key;
      keyElement.appendChild(optionElement);
    }
    let badgeElement = document.getElementById("change-badge")!;
    badgeElement.innerText = this.manager.saves.size.toString();
  }

  private prepareChangeButtons(): void {
    let button = document.getElementById("change")!;
    button.addEventListener("click", () => {
      let keyElement = document.getElementById("change-key")! as HTMLSelectElement;
      let key = keyElement.value;
      this.manager.change(key);
      this.updateCurrentKey();
    });
  }

  private prepareCreateButtons(): void {
    let button = document.getElementById("create")!;
    button.addEventListener("click", () => {
      let keyElement = document.getElementById("create-key")! as HTMLInputElement;
      let key = keyElement.value;
      this.manager.backup(key);
      this.updateKeys();
    });
  }

  private updateCurrentKey(): void {
    let currentKey = this.manager.currentKey;
    let currentKeyElement = document.getElementById("current")! as HTMLInputElement;
    currentKeyElement.value = currentKey ?? "なし";
  }

}


let executor = new Executor();
window.addEventListener("load", () => {
  executor.prepare();
});