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
      hx-target=".sortable-list"
      id={name}
      {...attrs}
    >
      {name}
    </button>
  );
}

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
        list.items.map((item: Item) => (
          <li class="item" draggable>
            ☰ {item.text}
          </li>
        ))}
      {previousButton}
      {thisButton}
    </>
  );

  c.header('HX-Trigger', 'list-change');
  return c.html(jsx);
});

export default app;
