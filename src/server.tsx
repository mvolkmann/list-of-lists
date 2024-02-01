import {Hono} from 'hono';
import type {Context} from 'hono';
import {serveStatic} from 'hono/bun';
import WebSocket from 'ws';

import Item from './Item';
import List from './List';

console.log('Server starting...');

//----------------------------------------------------------------------------
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

  const trips = new List('Trips');
  trips.add('Bentonville, AR');
  trips.add('Glacier National Park');

  const lists: Map<string, List> = new Map();
  lists.set(groceries.name, groceries);
  lists.set(trips.name, trips);
  return lists;
}

const lists = makeLists();

app.get('/list', (c: Context) => {
  const keys = Array.from(lists.keys()).sort();
  const jsx = (
    <ul>
      {keys.map((name: string) => (
        <button>{name}</button>
      ))}
    </ul>
  );

  return c.html(jsx);
});

app.get('/list/:name', (c: Context) => {
  const name = c.req.param('name');
  const list = lists.get(name);
  if (!list) return c.html('');

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
