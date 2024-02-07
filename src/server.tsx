import {Hono} from 'hono';
import type {Context} from 'hono';
import {serveStatic} from 'hono/bun';
import WebSocket from 'ws';

import Item from './Item';
import List from './List';

console.log('Server starting...');

//-----------------------------------------------------------------------------
// Browser reload support
//-----------------------------------------------------------------------------

// Browser code connects to this so it can detect when the server is restarted.
// On restart, the browser reloads the page.
new WebSocket.Server({port: 3001});

//-----------------------------------------------------------------------------

const app = new Hono();

// Serve static files from the public directory.
app.use('/*', serveStatic({root: './public'}));

function makeLists() {
  const groceries = new List('Groceries');
  groceries.add('milk');
  groceries.add('eggs');
  groceries.add('cheese');

  const trips = new List('Trips');
  trips.add('Bentonville, AR');
  trips.add('Glacier National Park');
  trips.add('Yosemite National Park');

  const lists: Map<string, List> = new Map();
  lists.set(groceries.name, groceries);
  lists.set(trips.name, trips);
  return lists;
}

const lists = makeLists();
let selectedList = '';

type ListButtonProps = {name: string; oob?: boolean};
function ListButton({name, oob = false}: ListButtonProps) {
  const classes = 'list-btn' + (name === selectedList ? ' selected' : '');
  const attrs: {[key: string]: any} = {};
  if (oob) attrs['hx-swap-oob'] = true;
  return (
    <button
      class={classes}
      hx-get={`/list/${name}`}
      hx-indicator=".htmx-indicator"
      hx-target=".sortable-list"
      id={name}
      {...attrs}
    >
      {name}
    </button>
  );
}

app.delete('/list/:name/:index', (c: Context) => {
  const name = c.req.param('name');
  const index = c.req.param('index');
  console.log('server.tsx: deleting index', index, 'in list', name);
  return c.text('');
});

app.get('/list', (c: Context) => {
  const names = Array.from(lists.keys()).sort();
  const jsx = (
    <>
      {names.map((name: string) => (
        <ListButton name={name} />
      ))}
    </>
  );

  return c.html(jsx);
});

app.get('/list/:name', (c: Context) => {
  // Bun.sleepSync(500); // simulate long-running query

  const name = c.req.param('name');
  const previousButton = selectedList ? (
    <ListButton name={selectedList} oob />
  ) : null;
  const thisButton = <ListButton name={name} oob />;
  selectedList = name;

  const list = lists.get(name);

  const jsx = (
    <>
      {list &&
        list.items.map((item: Item, index: number) => (
          <li class="item" draggable>
            <div>☰</div>
            <div>{item.text}</div>
            <button
              class="delete-btn"
              hx-delete={`/list/${name}/${index}`}
              hx-swap="none"
            >
              ✖
            </button>
          </li>
        ))}
      {previousButton}
      {thisButton}
    </>
  );

  // This triggers an event in the client.
  c.header('HX-Trigger', 'list-change');
  return c.html(jsx);
});

export default app;
