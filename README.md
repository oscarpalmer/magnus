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

Magnus is built on top of mutation observers, which are objects that watch for changes in the DOM, allowing Magnus to connect specific element and attribute changes to event handlers within Magnus.

These event handlers are then able to:

- create _(and remove)_ controller instances that can react to interactivity in the DOM
- create _(and remove)_ targets _(element groups)_ from controllers
- create _(and remove)_ actions _(controller-specific event handlers)_ that handle interactivity for the controller
- create _(and remove)_ input- and output-targets, which are built-in targets _(with actions)_ for handling reactivity for the controller

#### Controller lifecycle events

As controllers can be created and destroyed, they may also need to react to such events. When a controller is created, it will call the `connect`-method; when it's destroyed, it will call the `disconnect`-method.

Controllers may also implement `valueChanged`, which is called whenever a value in the controller's `data` changes, with the name and new value of the changed property.

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

Magnus controllers should be regular JavaScript classes, while also extending the base class available in Magnus.

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {}
```

To allow Magnus to create instances of a controller, it must also be added to Magnus with a name, which is used when evaluating the `:controller`-attribute for elements, e.g. `:talin`.

```typescript
import {magnus} from '@oscarpalmer/magnus';
import {Talin} from 'talin';

// Add controller to Magnus with a name to watch for in observer
magnus.add('talin', Talin);

// Removes the controller (and all its instances) from Magnus
magnus.remove('talin');
```

When a controller has been instantiated, it will call its `connect`-method.

When a controller is removed, either by having its element removed from the DOM or by modifying the element's `:controller`-attribute, it will stop observing the element, as well as remove all actions and targets from itself, and finally call the `disconnect`-method.

The same goes for other attributed elements, as well: e.g., modifying an element's `on:`-attribute _(or removing the element completely)_ will then remove the element and its relevant information from the controllers it has been connected to.

#### Attaching elements to controllers programmatically

Elements may also become controllers programmatically, using the helpers `setController` and `removeController`:

```typescript
import {removeController, setController} from '@oscarpalmer/magnus';

setController(element, 'talin');    // Same as setting the `:talin`-attribute
removeController(element, 'talin'); // Same as removing the `:talin`-attribute
```

### Targets

Targets are elements in your controller that are useful to have quick and easy access to. Targets are defined by the attribute `target:controller.name`, where `controller` is a controller name, `name` is the target's name, and `identifier` _(see below)_ is an optional, unique identifier.

To map the target to your controller, you may use `target:talin.output`, where `talin` is the name of your controller and `output` is the name of the target group, and Magnus will attempt to find the controller closest to your element.

If you wish to map the target to a specific controller instance, you may use `target:talin.id.output`, where `talin` and `output` remain the same as above, but `id` should match the `id`-attribute of the element with the controller.

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

The methods above _(except `has`)_ also accept an optional type for easier management of whatever is found and returned, e.g., `this.targets.find<HTMLButtonElement>('button')` for retrieving a properly typed button-element.

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

Either form may include options, and the attribute's value may contain multiple space-separated `controller.method`-pairs, allowing several controllers _(or methods)_ to react to the very same event.

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

Sometimes, you'll want to react to events that don't happen on the controller's own element. By prefixing the event with an external target, you may listen to events on `window`, `document`, another controller, or an element with a specific `id`:

```html
<div :talin on:window.resize="talin.onResize"></div>
```

An external controller may also be given an identifier, the same way as for targets, e.g. `on:other.id.event="talin.method"`, to listen to a specific controller instance rather than the closest match.

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

Inputs and outputs are built-in targets that allow for reactivity in a controller, by listening to change events on input-targets &ndash; using the attribute `input:` &ndash; and outputting values into output-targets, using the attribute `output:`.

To map such a target to your controller, you may use `input:talin.message` _(or `output:talin.message`)_, where `talin` is the name of your controller and `message` is the key in the controller's data, and Magnus will attempt to find the controller closest to your element. Just like targets, you may map to a specific controller instance using `input:talin.id.message`.

Whenever the value for an input-target changes, the new value will be stored in the controller's data, update the contents of output-targets _(using the same key)_, as well as update the values of other input-targets _(using the same key)_.

Outputs are, as the name implies, output only: editing an output-target's value will never update the controller's data. Inputs stay fully reactive &ndash; typing into one always updates the data _(and every other input- and output-target sharing that key)_ &ndash; but Magnus skips writing a new value into whichever input is currently focused, so it doesn't fight you while you're actively editing it.

#### Inputting & outputting JSON

If you have any kind of object you wish to edit or display, either the complete data for a controller or a key-based value in the controller's data, you may do so with the `:raw`- or `:pretty`-suffix in the attribute value, e.g., `input:talin.object:raw` or `output:talin.:pretty`, and Magnus will do its best to handle whatever JSON-y data you're working with.

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

Elements may also become inputs and outputs programmatically, using the helpers `setInput`, `setOutput`, `removeInput`, and `removeInput`:

```typescript
import {removeInput, removeOutput, setInput, setOutput} from '@oscarpalmer/magnus';

setInput(element, 'talin', 'message');  // Same as setting the `input:talin.message`-attribute
setOutput(element, 'talin', 'message'); // Same as setting the `output:talin.message`-attribute

removeInput(element, 'talin', 'message');  // Same as removing the `input:talin.message`-attribute
removeOutput(element, 'talin', 'message'); // Same as removing the `output:talin.message`-attribute
```

When setting and removing inputs and outputs in this way, you can also set their formatting using the fourth and optional parameter for the above helpers. Note however that when removing an input like this, it must match all parameters: e.g., if an input was added with `pretty` formatting, it must be removed with the same formatting.

### Data

Magnus is also able to handle simple, mostly-flat data structures, as well as respond to changes when needed.

Data can be initialized for a controller using attributes on your controller element, e.g. `talin-name`, where `name` is the key for the value to store, and its value is the actual data value. If the name contains dashes or underscores, it will be converted to its camel-cased variant in the controller, i.e., `talin-my-property` &rarr; `myProperty`.

To access the data structure for retrieving and storing information, the controller has the property `data` which returns [a Proxy-object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so be mindful of how you retrieve and store nested objects.

When storing values, Magnus will first: update the attribute as set in the HTML; and second: update input- and output-targets and set their contents and values respectively.

#### Typed data

By default, all data values are stored as-is, but a controller may declare a static `types`-property to have Magnus parse values into a specific shape, e.g. `array`, `boolean`, `color`, `date`, `datetime`, `number`, `object`, `string`, or `time`:

```typescript
import {Controller} from '@oscarpalmer/magnus';
import type {DataTypes} from '@oscarpalmer/magnus';

export class Talin extends Controller {
  static readonly types: DataTypes = {
    myCoolProperty: 'string',
  };
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

Magnus also lets you set a custom type for your data model to allow for nicer management of your controller's data. This can be done by extending the base controller with your type, e.g. `class Talin extends Controller<MyCustomDataModel>` where `MyCustomDataModel` is your nicely structured interface.

## The name

> … it was Magnus who created the schematics and diagrams needed to construct the mortal plane.

— Brother Mikhael Karkuxor, [Varieties of Faith in Tamriel](https://en.uesp.net/wiki/Lore:Varieties_of_Faith_in_Tamriel) :books:

## License

[MIT licensed](LICENSE), natch :wink:
