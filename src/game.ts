import { isConstructorDeclaration } from "typescript";
import { stringify } from "querystring"

export class Game {
  type: string;

  constructor() {
    this.type = "Game";
  }
}