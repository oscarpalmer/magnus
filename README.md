# Magnus

[![npm version](https://badge.fury.io/js/magnus.svg)](https://badge.fury.io/js/magnus)

A JavaScript framework for developers who like HTML.

It's basically a lightweight version of [Stimulus](https://github.com/hotwired/stimulus), so you may want to use that lovely framework instead.

## Quick start

To quickly get started, Magnus needs some nice HTML:

```html
<div data-controller="talin">
  <input data-target="talin.input" type="text" />

  <button data-action="click->talin@greet">Greet</button>

  <pre data-target="talin.output"></pre>
</div>
```

… and some JavaScript:

```typescript
import {Controller} from 'magnus';

export class Talin extends Controller {
  greet(): void {
    this.targets.get('output').textContent = this.targets.get('input').value;
  }
}
```

… and that's it. Entering any value in the input field and then clicking the button will display the same value below the button. Awesome!

_(Thanks to [Stimulus](https://github.com/hotwired/stimulus) for the example, which looks mostly the same for Magnus!)_

## Installation

Magnus is available on NPM as `magnus` and works well with JavaScript-bundlers, or you may use it completely standalone using the file in the `dist`-folder.

## How Magnus works

Magnus isn't very opinionated, but does have some ideas on how HTML and JavaScript should be written.

### Lifecycles

Magnus is built on top of mutation observers, which are objects that watch for changes in the DOM, allowing Magnus to connect specific element and attribute changes to event handlers within Magnus.

These event handlers are then able to:

- create _(and remove)_ controller instances that can react to interactivity in the DOM
- create _(and remove)_ targets _(element groups)_ from controllers
- create _(and remove)_ actions _(controller-specific event handlers)_ that handle interactivity for the controller
- create _(and remove)_ input- and output-target, which are built-in targets _(with actions)_ for handling reactivity for the controller

#### Controller lifecycle events

As controllers can be created and destroyed, they may also need to react to such events. When a controller is created, it will call the `connect`-method; when it's destroyed, it will call the `disconnect`-method.

### Application

To get things going with Magnus, all we need to do is import the application, like below:

```typescript
import {magnus} from '@oscarpalmer/magnus'; // And it will automatically start and observe the document

// Stops observing the document element
application.stop();

// Begins to observe the document element again
application.start();
```

### Controllers

Magnus controllers should be regular JavaScript classes, while also extending the base controller class available in Magnus.

```typescript
import {Controller} from '@oscarpalmer/magnus';

export class Talin extends Controller {}
```

To allow Magnus to create instances for a controller, it must also be added to Magnus with a name.

```typescript
import {magnus} from '@oscarpalmer/magnus';
import {Talin} from 'talin';

// Add controller to Magnus with a name to watch for in observer
magnus.add('talin', Talin);
```

When a controller has been instantiated, it will call its `connect`-method.

When a controller is removed, either by having its element removed from the DOM or by modifying the element's `data-controller`-attribute, it will stop observing the element, as well as remove all actions and targets from itself, and finally call the `disconnect`-method.

### Targets

Targets are elements in your controller that are useful to have quick and easy access to. Targets are defined by the attribute `data-target`.

The value for the attribute should be a string of space-separated names, allowing for an element to be part of multiple target groups _(and multiple controllers!)_

To map the target to your controller, you may use `talin.output`, where `talin` is the name of your controller and `output` is the name of the target group, and Magnus will attempt to find controller closest to your element.

If you wish to map the target to a specific controller, you may use `talin#id.output`, where `talin` and `output` remain the same as above, but `id` points to an element with the same ID.

#### Target example

Define your targets in HTML:

```html
<span data-target="talin.output"></span>
```

And access them in JavaScript:

```typescript
import {Controller} from 'magnus';

export class Talin extends Controller {
  // Custom method for showcasing built-in target-methods
  getTargets(): void {
    // Returns the first target
    const targets = this.targets.get('output')

    // Returns an array of targets
    const targets = this.targets.getAll('output')

    // Returns true if at least one target exists
    const has = this.targets.has('output')

    // Finds and returns elements within the controller (not just targets),
    // and accepts whatever 'querySelectorAll' will take
    const found = this.targets.find('pre');
  }
}
```

The methods above _(except `has`)_ also accepts an optional type for easier management of whatever is found and returned, e.g., `this.targets.find<HTMLButtonElement>('button')` for retrieving a list of properly typed button-elements.

### Actions

Actions are events for elements within a controller and are defined by the attribute `data-action`.

The value for the attribute should be a space-separated string of actions, where each action should match any of the following:

- `controller@method`
- `controller@method:options`
- `controller#id@method`
- `controller#id@method:options`
- `event->controller@method`
- `event->controller@method:options`
- `event->controller#id@method`
- `event->controller#id@method:options`
- `external@event->controller@method`
- `external@event->controller@method:options`
- `external@event->controller#id@method`
- `external@event->controller#id@method:options`
- `external#identifier@event->controller@method`
- `external#identifier@event->controller@method:options`
- `external#identifier@event->controller#id@method`
- `external#identifier@event->controller#id@method:options`

|         Part | Description                                                                                                                                                                                                                      |
| -----------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | Name of controller                                                                                                                                                                                                               |
|     `method` | Name of controller method                                                                                                                                                                                                        |
|    `options` | Event options; a colon-separated string that may contain:<br>&bull;&nbsp;`a` or `active` for allowing `preventDefault`<br>&bull;&nbsp;`c` or `capture` for capturing events<br>&bull;&nbsp;`o` or `once` for handling event once |
|         `id` | ID for element that has the controller                                                                                                                                                                                           |
|      `event` | Event name<br>_(Whenever event is omitted, Magnus will try to interpret a default event type based on the element)_                                                                                                              |
|   `external` | External target, either `window`, `document`, a controller, or an element ID                                                                                                                                                     |
| `identifier` | If external is a controller, `identifier` is used to identify a specific controller                                                                                                                                              |

#### Action example

Define your actions in HTML:

```html
<button data-action="click@greet:once">Greet</button>
```

And define their methods in JavaScript:

```typescript
import {Controller} from 'magnus';

export class Talin extends Controller {
  greet(event): void {
    // Called on a click event once
  }
}
```

### Input & output

Inputs and outputs are built-in targets that allow for reactivity in a controller, by listening to change events on input-targets - using the attribute `data-input` - and outputting values into output-targets - using the attribute `data-output`.

To map such a target to your controller, you may use `talin.message`, where `talin` is the name of your controller and `message` is the key in the controller's data, and Magnus will attempt to find controller closest to your element.

If you wish to map the target to a specific controller, you may use `talin#id.message`, where `talin` and `message` remain the same as above, but `id` points to an element with the same ID.

Whenever the value for an input-target changes, the new value will be stored in the controller's data, update the contents of output-targets _(using the same key)_, as well as update the values of input-targets _(using the same key)_.

#### Outputting JSON

If you have any kind of object you wish to display, either the complete data for a controller or a key-based value in the controller's data, you may do so with the `:json`-suffix in the attribute value, e.g., `talin.object:json`.

#### Input & output example

```html
<div>
  <label for="message">Message</label>
  <textarea id="message" data-input="talin.message"></textarea>
  <!-- Our textarea now automatically responds to input events... -->
</div>
<pre data-output="talin.message"></pre>
<!-- ... and updates the formatted block! -->
```

### Data

Magnus is also able to handle simple, mostly-flat data structures, as well as respond to changes when needed.

Data can be initialized for a controller using attributes on your controller element, e.g. `data-talin-name`, where `name` is the key for the value to store, and its value is the actual data value _(of any type!)_. If the name contains dashes or underscores, it will be converted to its camel-cased variant in the controller, i.e., `data-talin-my-property` &rarr; `myProperty`.

To access the data structure for retrieving and storing information, the controller has the property `data` which returns [a Proxy-object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so be mindful of how you retrieve and store nested objects.

When storing values, Magnus will first: update the attribute as set in the HTML; and second: emit a parameters object containg the property name, together with its new and previous values. To listen for emitted changes, a callback needs to be attached to `events.data` on your controller using its `listen`-method, as seen below.

#### Data example

```html
<div data-controller="talin" data-talin-data-my-cool-property="and a value"></div>
```

```typescript
import {Controller} from 'magnus';

export class Talin extends Controller {
  connect(): void {
    // Add a callback to listen for data changes
    this.events.data.listen(this.dataChanged);
  }

  dataChanged(change): void {
    // Called when any property's data has changed, where 'change' is a simple object of:
    // - change.property
    // - change.values:
    //     - change.values.new
    //     - change.values.old
  }

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

[MIT licensed](LICENSE); you're free to do whatever you'd like with all this.
