# Magnus

[![npm version](https://badge.fury.io/js/magnus.svg)](https://badge.fury.io/js/magnus)

A JavaScript framework for developers who like HTML.

It's basically a lightweight version of [Stimulus](https://github.com/hotwired/stimulus), so you may want to use that lovely framework instead.

## Quick start

To quickly get started, Magnus needs some nice HTML:

```html
<div data-controller="talin">
  <input data-talin-target="input" type="text" />

  <button data-talin-action="click:greet">Greet</button>

  <span data-talin-target="output"></span>
</div>
```

… and some JavaScript:

```typescript
import { Controller } from 'magnus';

export default class extends Controller {
  greet() {
    this.target('output').textContent = this.target('input').value;
  }
}
```

… and that's it. Entering any value in the input and then clicking the button should display the same value below the button. Awesome!

_(Thanks to [Stimulus](https://github.com/hotwired/stimulus) for the example, which looks mostly the same for Magnus!)_

## Installation

Magnus is available on NPM as `magnus` and works well with JavaScript-bundlers, like [Rollup](https://github.com/rollup/rollup) and [Webpack](https://github.com/webpack/webpack), as well as completely standalone using one of the files in the `dist`-folder.

## How Magnus works

Magnus isn't very opinionated, but does have some ideas on how HTML and JavaScript should be written.

It _very loosely_ follows the MVC-pattern, where the M(odel) and C(ontroller) is represented by [Controllers](#controllers), and the V(iew) is represented by HTML.

### Lifecycles

Magnus is built on top of mutation observers, which are objects that watch for changes in the DOM, allowing Magnus to connect specific element and attribute changes to event handlers within Magnus.

These event handlers are then able to:

- create (and remove) controller instances that can react to interactivity in the DOM
- create (and remove) targets – element groups – from controllers
- create (and remove) actions – controller-specific event handlers – that handle interactivity for the controller

#### Controller lifecycle events

As controllers can be created and destroyed, they may also need to react to such events. When a controller is created, it will call the method `connect`; when it's destroyed, it will call the method `disconnect`.

### Application

To get things going with Magnus, we first need do create and start its application, like below:

```typescript
import { Application } from 'magnus';

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
import { Controller } from 'magnus';

export default class extends Controller {
  greet() {
    this.target('output').textContent = this.target('name').value;
  }
}
```

To allow Magnus to create instances for a controller, it must also be added to the application with a name.

```typescript
import Talin from 'talin';

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
class TalinController extends Magnus.Controller {
  getTargets() {
    // Returns an array of elements
    const elements = this.targets('output')

    // Returns first element if it exists
    const element = this.target('output')

    // Returns true if target(s) exists
    const exists = this.hasTarget('output')
  }
}
```

#### Target changes

It's also possible to listen for target changes, for which there are two events: when they have been _added_ and _removed_.

##### Target change example

```typescript
class TalinController extends Magnus.Controller {
  targetChanged(target) {
    // Called when any target has changed and is a simple object of:
    // - target.name: it's previously defined target name
    // - target.element: the HTML element
    // - target.added: true if added, false if removed
  }
}
```

### Actions

Actions are events for elements within a controller and are defined by the attribute `data-talin-action`, where `talin` is the name of your controller.

The value for the attribute should be a space-separated string of actions, where each action resembles `type:callback`, for which `type` should match an event name (e.g. 'click') and `callback` should match the name of a function in your controller.

#### Action example

Define your actions in HTML:

```html
<button data-talin-action="click:greet">Greet</button>
```

And define their methods in JavaScript:

```typescript
class TalinController extends Magnus.Controller {
  greet(event) {
    // Called on a click event
  }
}
```

### Data

Magnus is also able to handle simple data structures, as well as respond to changes when needed.

To access the data structure for retrieving and storing information, the controller has the property `data` which returns [a Proxy-object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

When storing values, Magnus will attempt to use the method named `dataChanged`, and if it exists, it will be called with a parameters object consisting of: a property name, and its new and previous values.

#### Data example

```typescript
class TalinController extends Magnus.Controller {
  connect() {
    this.data.message = 'Talin, world'
  }

  dataChanged(data) {
    // Called when any property's data has changed and is a simple object of:
    // - data.property
    // - data.values:
    //     - data.values.new
    //     - data.values.old
  }
}
```

## The name

> … it was Magnus who created the schematics and diagrams needed to construct the mortal plane.

— Brother Mikhael Karkuxor, [Varieties of Faith in Tamriel](https://en.uesp.net/wiki/Lore:Varieties_of_Faith_in_Tamriel) :books:

## License

[MIT licensed](LICENSE); you're free to do whatever you'd like with all this.
