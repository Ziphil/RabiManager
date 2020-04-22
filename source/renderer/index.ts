//

import "bootstrap";
import "../style.scss";


class Executor {

  public prepare(): void {
    let selectElement = document.getElementById("select")!;
    let optionElement = document.createElement("option");
    optionElement.value = "test";
    optionElement.text = "テスト項目";
    selectElement.appendChild(optionElement);
  }

}


let executor = new Executor();
window.addEventListener("load", () => {
  executor.prepare();
});