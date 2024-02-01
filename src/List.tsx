import Item from "./Item";

export default class List {
  name: string;
  items: Item[];

  constructor(name: string) {
    this.name = name;
    this.items = [];
  }

  add(text: string) {
    this.items.push(new Item(text));
  }
}
