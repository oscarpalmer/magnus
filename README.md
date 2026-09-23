# Magnus

[![npm](https://badge.fury.io/js/@oscarpalmer%2Fmagnus.svg)](https://www.npmjs.com/package/@oscarpalmer/magnus)

A JavaScript framework for developers who like HTML.

It's basically a lightweight version of [Stimulus](https://github.com/hotwired/stimulus), so you may want to use that lovely framework instead.

## Quick start

To quickly get started, Magnus needs some nice HTML:

```html
<div :talin>
  <input target:talin.input type="text" />

  <button on:click="talin.greet">Greet</button>

  <pre target:talin.output></pre>
</div>
```

… and some JavaScript:

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {
  greet(): void {
    this.targets.get('output')!.textContent = (this.targets.get('input') as HTMLInputElement).value;
  }
}
```

… and that's it. Entering any value in the input field and then clicking the button will display the same value below the button. Awesome!

_(Thanks to [Stimulus](https://github.com/hotwired/stimulus) for the example, which looks mostly the same for Magnus!)_

## Installation

Magnus is available on NPM as `@oscarpalmer/magnus` and works well with JavaScript-bundlers, or you may use it completely standalone using the file in the `dist`-folder.

## How Magnus works

Magnus isn't very opinionated, but does have some ideas on how HTML and JavaScript should be written.

### Lifecycles

Magnus is built on top of mutation observers &ndash; objects that watch for changes in the DOM &ndash; letting it connect specific element and attribute changes to its own event handlers.

These event handlers are then able to:

- create _(and remove)_ controller instances that can react to interactivity in the DOM
- create _(and remove)_ targets _(element groups)_ from controllers
- create _(and remove)_ actions _(controller-specific event handlers)_ that handle interactivity for the controller
- create _(and remove)_ input- and output-targets, which are built-in targets _(with actions)_ for handling reactivity for the controller

#### Controller lifecycle events

Controllers can react to being created and destroyed: `connect` is called on creation; `disconnect` on removal.

Controllers may also implement `valueChanged`, called whenever a value in `data` changes, with the property's name and new value.

### Startup

To get things going with Magnus, all we need to do is import the application, like below:

```typescript
import {magnus} from '@oscarpalmer/magnus'; // And it will automatically start and observe the document

// Is Magnus currently observing the document?
magnus.active;

// Stops observing the document element
magnus.stop();

// Begins to observe the document element again
magnus.start();
```

### Controllers

Magnus controllers are regular JavaScript classes that extend the base class.

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {}
```

To let Magnus create instances of a controller, add it with a name matching the `:controller`-attribute you'll use in HTML, e.g., `:talin`.

```typescript
import {magnus} from '@oscarpalmer/magnus';
import {Talin} from 'talin';

// Add controller to Magnus with a name to watch for in observer
magnus.add('talin', Talin);

// Removes the controller (and all its instances) from Magnus
magnus.remove('talin');
```

When a controller has been instantiated, it will call its `connect`-method.

When a controller is removed &ndash; its element removed from the DOM, or its `:controller`-attribute changed &ndash; it stops observing the element, removes all its actions and targets, and calls `disconnect`.

The same goes for other attributed elements: modifying an `on:`-attribute _(or removing the element)_ removes it from whichever controllers it was connected to.

#### Attaching elements to controllers programmatically

Elements can also become controllers programmatically, with the helpers `setController` and `removeController`:

```typescript
import {removeController, setController} from '@oscarpalmer/magnus';

setController(element, 'talin');    // Same as setting the `:talin`-attribute
removeController(element, 'talin'); // Same as removing the `:talin`-attribute
```

### Targets

Targets are elements you want quick, easy access to in your controller, defined with the attribute `target:controller.name`.

`target:talin.output` maps to the nearest `talin` controller's `output` target group.

To target a specific controller instance instead, add its `id`: `target:talin.id.output`.

#### Target example

Define your targets in HTML:

```html
<span target:talin.output></span>
```

And access them in JavaScript:

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {
  // Custom method for showcasing built-in target-methods
  getTargets(): void {
    // Returns the first target (or undefined, if none exists)
    const target = this.targets.get('output');

    // Returns an array of targets
    const targets = this.targets.getAll('output');

    // Returns true if at least one target exists
    const has = this.targets.has('output');

    // Finds and returns an array of elements within the controller (not just targets!),
    // and accepts whatever 'querySelectorAll' will take
    const found = this.targets.find('pre');
  }
}
```

All of these _(except `has`)_ also accept an optional type, e.g., `this.targets.find<HTMLButtonElement>('button')`, for a properly typed result.

#### Attaching targets to controllers programmatically

Elements may also become targets programmatically, using the helpers `setTarget` and `removeTarget`:

```typescript
import {removeTarget, setTarget} from '@oscarpalmer/magnus';

setTarget(element, 'talin', 'output');    // Same as setting the `target:talin.output`-attribute
removeTarget(element, 'talin', 'output'); // Same as removing the `target:talin.output`-attribute
```

### Actions

Actions are events for elements within a controller and are defined by the attribute `on:`.

Actions come in two shapes:

- `on:controller.method` _(or `on:controller.id.method`)_, an attribute _without_ a value, where Magnus will use a default event based on the element _(e.g., `click` for buttons, `input` for text fields, `change` for selects, and so on)_
- `on:event="controller.method"` _(or `on:controller.id.method`)_, an attribute _with_ a value, where `event` is whichever event you'd like to listen to

Either form can include options, and the value may hold several space-separated `controller.method`-pairs, so multiple controllers _(or methods)_ can react to the same event.

#### Action parameters

|         Part | Required | Description                                                                                                                                                                                                         |
|-------------:|:--------:|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `controller` | &check;  | Name of controller                                                                                                                                                                                                  |
|     `method` | &check;  | Name of controller method                                                                                                                                                                                           |
|    `options` | &ndash;  | Event options; a colon-separated string that may contain:<br><ul><li>`a` or `active` for allowing `preventDefault`</li><li>`c` or `capture` for capturing events</li><li>`o` or `once` for handling event once</li> |
|         `id` | &ndash;  | ID for element that has the controller                                                                                                                                                                              |
|      `event` | &ndash;  | Event name<br>_(Whenever event is omitted, Magnus will try to interpret a default event type based on the element)_                                                                                                 |

#### Action example

Define your actions in HTML:

```html
<button on:click="talin.greet:once">Greet</button>
```

And their methods in JavaScript:

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {
  greet(): void {
    // Called on a click event once
  }
}
```

#### External targets

Sometimes you need to react to events elsewhere. Prefix the event with an external target to listen on `window`, `document`, another controller, or an element with a specific `id`:

```html
<div :talin on:window.resize="talin.onResize"></div>
```

An external controller can also take an identifier, just like targets, e.g., `on:other.id.event="talin.method"`, to target a specific instance instead of the closest match.

#### Dispatching events

Controllers may listen to, remove, and dispatch their own events using the `events`-helper:

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {
  trigger(): void {
    this.events.dispatch('event'); // Dispatches an event on the controller's element

    this.events.dispatch('event', target);
    // Dispatches an event for the `target`:
    // - a string, to find the first existing target in the controller
    // - an `EventTarget`, i.e., the document, window, or an element

    this.events.dispatch('event', options, target?)
    // Dispatches an event on the controller's element (or target)
    // `options` allow for bubbling, cancellation, composition,
    // and may hold details to pass along with the event

    const off = this.events.on('event', callback); // Adds an event listener and returns a function to remove it

    this.events.off('event', callback); // Removes an event listener
  }
}
```

### Input & output

Inputs and outputs are built-in targets for reactivity: `input:` listens for changes; `output:` displays them.

`input:talin.message` _(or `output:talin.message`)_ maps to the `message` key in the nearest `talin` controller's data &ndash; or a specific instance with `input:talin.id.message`, just like targets.

Whenever an input's value changes, it's stored in the controller's data and pushed out to every output _(and input)_ sharing that key.

Outputs are, as the name implies, output only: editing an output-target's value will never update the controller's data. Inputs stay fully reactive &ndash; typing into one always updates the data _(and every other input- and output-target sharing that key)_ &ndash; but Magnus skips writing a new value into whichever input is currently focused, so it doesn't fight you while you're actively editing it.

#### Inputting & outputting JSON

To edit or display a whole object &ndash; the controller's complete data, or just one key &ndash; add a `:raw` or `:pretty` suffix, e.g., `input:talin.object:raw` or `output:talin.:pretty`, and Magnus handles the JSON for you.

- `:raw` outputs _(and expects)_ compact JSON
- `:pretty` outputs indented JSON, matching the element's computed `tab-size`

#### Input & output example

```html
<div>
  <label for="message">Message</label>
  <textarea id="message" input:talin.message></textarea>
  <!-- The textarea now automatically responds to input events... -->
</div>
<pre output:talin.message></pre>
<!-- ... and updates the formatted block! -->
```

#### Attaching inputs & outputs to controllers programmatically

Elements can also become inputs and outputs programmatically, with the helpers `setInput`, `setOutput`, `removeInput`, and `removeOutput`:

```typescript
import {removeInput, removeOutput, setInput, setOutput} from '@oscarpalmer/magnus';

setInput(element, 'talin', 'message');  // Same as setting the `input:talin.message`-attribute
setOutput(element, 'talin', 'message'); // Same as setting the `output:talin.message`-attribute

removeInput(element, 'talin', 'message');  // Same as removing the `input:talin.message`-attribute
removeOutput(element, 'talin', 'message'); // Same as removing the `output:talin.message`-attribute
```

All four helpers take an optional fourth parameter for formatting. When removing, though, the parameters must match what was set: e.g., an input added with `pretty` formatting needs `pretty` to remove it.

### Data

Magnus also handles simple, mostly-flat data structures, and can react to changes.

Data is initialized with attributes on the controller element, e.g., `talin-name`, where `name` is the key and the attribute's value is the data. Dashes and underscores get camel-cased, i.e., `talin-my-property` &rarr; `myProperty`.

The controller's `data`-property returns [a Proxy-object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so be mindful of how you retrieve and store nested objects.

When storing a value, Magnus updates the HTML attribute first, then any input- and output-targets.

#### Typed data

By default, data values are stored as-is. Declare a static `types`-property to have Magnus parse them into a specific shape instead: `array`, `boolean`, `color`, `date`, `datetime`, `number`, `object`, `string`, or `time`.

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {
  static readonly types = {
    myCoolProperty: 'string',
  } as const;
}
```

#### Data example

```html
<div :talin talin-my-cool-property="and a value"></div>
```

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {
  // Custom method accessing your custom data property
  onAlert(): void {
    alert(this.data.myCoolProperty);
  }
}
```

#### Custom data models

You can also give your data model a custom type for nicer management, by extending the base controller with it, e.g., `class Talin extends Controller<MyCustomDataModel>` where `MyCustomDataModel` is your nicely structured interface.

## The name

> … it was Magnus who created the schematics and diagrams needed to construct the mortal plane.

— Brother Mikhael Karkuxor, [Varieties of Faith in Tamriel](https://en.uesp.net/wiki/Lore:Varieties_of_Faith_in_Tamriel) :books:

## License

[MIT licensed](LICENSE), natch :wink:
