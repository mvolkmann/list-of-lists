import { Hono } from "hono";

const app = new Hono();

class Item {
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}

class List {
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

const groceries = new List("Groceries");
groceries.add("milk");
groceries.add("eggs");

const trips = new List("Trips");
trips.add("Bentonville, AR");
trips.add("Glacier National Park");

const lists: Map<string, List> = new Map();
lists.set(groceries.name, groceries);
lists.set(trips.name, trips);

app.get("/list", (c) => {
  const keys = Array.from(lists.keys()).sort();
  const jsx = (
    <ul>
      {keys.map((name: string) => (
        <li>{name}</li>
      ))}
    </ul>
  );

  return c.html(jsx);
});

app.get("/list/:name", (c) => {
  const name = c.req.param("name");
  const list = lists.get(name);
  if (!list) return c.html("");

  const jsx = (
    <ul>
      {list.items.map((item: Item) => (
        <li>{item.text}</li>
      ))}
    </ul>
  );

  return c.html(jsx);
});

export default app;
