# Magnus

[![npm version](https://badge.fury.io/js/magnus.svg)](https://badge.fury.io/js/magnus)

A JavaScript framework for developers who like HTML.

It's basically a lightweight version of [Stimulus](https://github.com/hotwired/stimulus), so you may want to use that lovely framework instead.

## Quick start

To quickly get started, Magnus needs some nice HTML:

```html
<div data-controller="talin">
  <input data-talin-target="input" type="text" />

  <button data-talin-action="click@greet">Greet</button>

  <pre data-talin-target="output"></pre>
</div>
```

… and some JavaScript:

```typescript
import {Controller} from 'magnus';

export class Talin extends Controller {
  greet(): void {
    this.targets.get('output')[0].innerHTML = this.targets.get('input')[0].value;
  }
}
```

… and that's it. Entering any value in the input and then clicking the button should display the same value below the button. Awesome!

_(Thanks to [Stimulus](https://github.com/hotwired/stimulus) for the example, which looks mostly the same for Magnus!)_

## Installation

Magnus is available on NPM as `magnus` and works well with JavaScript-bundlers, like [Rollup](https://github.com/rollup/rollup) and [Webpack](https://github.com/webpack/webpack), as well as completely standalone using one of the files in the `dist`-folder.

## How Magnus works

Magnus isn't very opinionated, but does have some ideas on how HTML and JavaScript should be written.

### Lifecycles

Magnus is built on top of mutation observers, which are objects that watch for changes in the DOM, allowing Magnus to connect specific element and attribute changes to event handlers within Magnus.

These event handlers are then able to:

- create (and remove) controller instances that can react to interactivity in the DOM
- create (and remove) targets – element groups – from controllers
- create (and remove) actions – controller-specific event handlers – that handle interactivity for the controller

#### Controller lifecycle events

As controllers can be created and destroyed, they may also need to react to such events. When a controller is created, it will call the `connect`-method; when it's destroyed, it will call the `disconnect`-method.

### Application

To get things going with Magnus, we first need do create and start its application, like below:

```typescript
import {Application} from 'magnus';

// Creates a Magnus application
const application = new Application();

// Begins to observe the document element
application.start();

// Stops observing the document element
application.stop();
```

### Controllers

Magnus controllers should be regular JavaScript classes, while also extending the base controller class available in Magnus.

```typescript
import {Controller} from 'magnus';

export class Talin extends Controller {
  greet(): void {
    this.targets.get('output')[0].innerHTML = this.targets.get('name')[0].value;
  }
}
```

To allow Magnus to create instances for a controller, it must also be added to the application with a name.

```typescript
import {Talin} from 'talin';

// Add controller to application with a name to watch for in observer
application.add('talin', Talin);
```

When a controller has been instantiated, it will also create a mutation observer for itself and begin to observe actions and targets within the controller instance's element, as well as call its `connect`-method.

When a controller is removed, either by having its element removed from the DOM or by modifying the element's `data-controller`-attribute, it will stop observing the element, as well as remove all actions and targets from itself and finally call the `disconnect`-method.

### Targets

Targets are elements in your controller that are useful to have quick and easy access to. Targers are defined by the attribute `data-talin-target`, where `talin` is the name of your controller.

The value for the attribute should be a string of space-separated names, allowing for an element to be part of multiple target groups.

#### Target example

Define your targets in HTML:

```html
<span data-talin-target="output"></span>
```

And access them in JavaScript:

```typescript
import {Controller} from 'magnus';

export class Talin extends Controller {
  // Custom method for showcasing built-in target-methods
  getTargets(): void {
    // Returns an array of targets, i.e. elements connected to the controller
    const targets = this.targets.get('output')

    // Returns true if target(s) exists
    const exists = this.targets.exists('output')

    // Finds and returns elements within the controller (not just targets),
    // and accepts whatever 'querySelectorAll' will take
    const found = this.targets.find('pre');
  }
}
```

Two of the methods above — `get` and `find` — also accepts an optional type for easier control of whatever is found and returned, e.g. `this.targets.find<HTMLButtonElement>('button')`, for retrieving a list of properly typed button-elements.

#### Target changes

It's also possible to listen for target changes which are emitted using a parameters object containg the target name, together with the target element and a value to tell if the target was added or removed. To listen for emitted changes, a callback needs to be attached to `events.target` on your controller using its `listen`-method, as seen below.

##### Target change example

```typescript
import {DataChange, Magnus} from 'magnus';

class Talin extends Controller {
  connect(): void {
    this.events.target.listen(this.targetChanged);
  }

  targetChanged(change: DataChange): void {
    // Called when any target has changed, where 'change' is a simple object of:
    // - change.name: its previously defined target name
    // - change.element: the HTML element
    // - change.added: true if added, false if removed
  }
}
```

### Actions

Actions are events for elements within a controller and are defined by the attribute `data-talin-action`, where `talin` is the name of your controller.

The value for the attribute should be a space-separated string of actions, where each action should resembles `type@callback` or `callback`, where `type` is an optional value matching an event type, and `callback` should match a method in your controller. Omitting the type tells Magnus to find an appropriate one based on the element's tag, if possible.

Event options can also be set for an action, which are suffixed to the previous attribute value with a colon, e.g. `type@callback:option-1:option-2`, where `option-1` and `option-2` are the two options. [Valid event options](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#parameters) for an action are `capture`, `once`, and `passive`, and when included, will be set to true. All options are by default set to `false`.

#### Action example

Define your actions in HTML:

```html
<button data-talin-action="click@greet:once">Greet</button>
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

#### Global actions

Actions can also be created for two global targets — `document` and `window` — on your controller's targets, which can be useful to listen for events like `popstate` or even connecting controllers with each other. The syntax is similar to regular actions, but must be prefixed with either `document->` or `window->`, while also specifying a event name, e.g. `window->type@callback`.

#### Triggering actions

To trigger an action, either for a global target – `document` or `window` – or an element, the `xxx.events.dispath`-method can be called with two parameters: the name of the action (event) to be triggered, and an optional object containing information regarding the event. For more details on this object, please see the snippet below:

```typescript
const information = {
  // Any kind of data, to be accessed using the 'details'-property
  // on the event object in the listener method
  data: null,
  options: {
    // Should the event bubble? Defaults to false
    bubbles: false,
    // Is the event cancelable? Defaults to false
    cancelable: false,
    // Is the event composed and will travel across DOMs? Defaults to false
    composed: false,
  },
  // Can be 'document', 'window', or an element;
  // defaults to the controller's element
  target: null,
};
```

### Data

Magnus is also able to handle simple, mostly-flat data structures, as well as respond to changes when needed.

Data can be initialized for a controller using attributes on your controller element, e.g. `data-talin-data-name`, where `name` is the name for the value to store, and its value is the actual data value (of any type!). If the name contains dashes or underscores, it will be converted to its camel-cased variant in the controller, i.e. `data-talin-data-my-property` &rarr; `myProperty`.

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
