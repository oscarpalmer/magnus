# Magnus

[![npm version](https://badge.fury.io/js/magnus.svg)](https://badge.fury.io/js/magnus)

A JavaScript framework for developers who like HTML.

It's basically a barebones version of [Stimulus](https://github.com/hotwired/stimulus), so please use that amazing framework instead.

## Quick start

To quickly get started, Magnus needs some nice HTML:

```html
<div data-controller="xyz">
  <input data-xyz-target="input" type="text" />

  <button data-xyz-action="click:greet">Greet</button>

  <span data-xyz-target="output"></span>
</div>
```

… and some JavaScript:

```typescript
import { Controller } from 'magnus';

export default class extends Controller {
  greet() {
    this.target('output').textContent = this.target('input').value
  }
}
```

… and that's it. Entering any value in the input and then clicking the button should display the same value below the button. Awesome!

_(Thanks to [Stimulus](https://github.com/hotwired/stimulus) for the example, which looks mostly the same for Magnus!)_

## Installation

Magnus is available on NPM as `magnus` and works well with JavaScript-bundlers, like [Rollup](https://github.com/rollup/rollup) and [Webpack](https://github.com/webpack/webpack), as well as completely standalone using one of the files in the `dist`-folder.

## How Magnus works

Magnus isn't very opinionated, but does have some ideas on how HTML and JavaScript should be written.

It very loosely follows the MVC-pattern, where the M(odel) and C(ontroller) is represented by [Controllers](#controllers), and the V(iew) is represented by HTML.

### Lifecycles

Magnus is built on top of mutation observers in JavaScript, which are objects that watch for changes in the DOM, allowing Magnus to connect specific element and attribute changes to event handlers within Magnus.

These event handlers are then able to:

- create (and remove) controller instances that can react to interactivity in the DOM
- create (and remove) targets – element groups – from controllers
- create (and remove) actions – controller-specific event handlers – that handle interactivity for the controller

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
    this.target('output').textContent = this.target('name').value
  }
}
```

To allow Magnus to create instances for a controller, it must also be added to the application with a name.

```typescript
import XYZ from 'xyz';

// Add controller to application with a name to watch for in observer
application.add('xyz', XYZ);
```

When a controller has been instantiated, it will also create a mutation observer for itself and begin to observe actions and targets within the controller instance's element.

When a controller is removed, either by having its element removed from the DOM or by modifying the element's `data-controller`-attribute, it will stop observing the element, as well as remove all actions and targets from itself.

### Targets

Targets are elements in your controller that are useful to have quick and easy access to. Targers are defined by the attribute `data-xyz-target`, where `xyz` is the name of your controller.

The value for the attribute should be a string of space-separated names, allowing for an element to be part of multiple target groups.

#### Target example

Define your targets in HTML:

```html
<span data-hello-target="output"></span>
```

And access them in JavaScript:

```typescript
// Inside the controller 'XYZ'

// Returns an array of elements
const elements = this.targets('output')

// Returns first element if it exists
const element = this.target('output')

// Returns true if target(s) exists
const exists = this.hasTarget('output')
```

### Actions

Actions are events for elements within a controller and are defined by the attribute `data-xyz-action`, where `xyz` is the name of your controller.

The value for the attribute should be a space-separated string of actions, where each action resembles `type:callback`, for which `type` should match an event name (e.g. 'click') and `callback` should match the name of a function in your controller.

#### Action example

```html
<button data-xyz-action="click:greet">Greet</button>
```

```typescript
// Inside the controller 'XYZ'

greet() {
  // Called on a click event
}
```

## In the future?

- Data store for controllers?

## The name

> … it was Magnus who created the schematics and diagrams needed to construct the mortal plane.

— Brother Mikhael Karkuxor, [Varieties of Faith in Tamriel](https://en.uesp.net/wiki/Lore:Varieties_of_Faith_in_Tamriel) :books:

## License

[MIT licensed](LICENSE); you're free to do whatever you'd like with all this.
