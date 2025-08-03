---
description: >-
  Learn how to use ObjectBox NoSQL DB to persist data with swift for an
  Offline-first iOS app experience. ObjectBox performs well on all CRUD
  operations and is fully ACID compliant.
---

# Get Started with ObjectBox Swift

## Add ObjectBox to your project

See [**Install ObjectBox**](install.md) if you haven't already. This guide assumes ObjectBox was added using CocoaPods.

## Define Entity Classes

ObjectBox uses code generation to read and write your objects instead of forcing you to inherit from a base object. To mark an object as an entity, you have two options:

* Conform to the [`Entity`](https://objectbox.io/docfiles/swift/current/Core.html#/s:9ObjectBox6EntityP) protocol\
  **or**
* add `// objectbox: entity` before the type as an annotation for the code generator.

Then supply an ID property and parameter-less initializer `init()`, and you're good to go:

```swift
import ObjectBox

// objectbox: entity
class Person {
    var id: Id = 0
    var firstName: String = ""
    var lastName: String = ""
    
    init() {} // Used by ObjectBox
    
    init(id: Id = 0, firstName: String, lastName: String) {
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
    }
}
```

That is all you need to get going.

{% hint style="info" %}
You initialize an `Id` with 0 for all entities. This tells ObjectBox your object isn't persisted, yet. When you persist objects, the ID will be changed to the actual value. And once an entity has a non-zero ID, persisting changes will update the existing record instead of creating a new one.

So the ID is managed by ObjectBox. Conversely, you do not want to modify it yourself.
{% endhint %}

## Generate ObjectBox code

Next, some binding code needs to be generated based on the model defined in the previous step. This step is different, depending on if a CocoaPods or Swift Package setup is used.

### CocoaPods

**Build your project** to generate the classes and `Store` initializer required to use ObjectBox, for example using **Product > Build** in Xcode.

Next, [review and keep the generated files](getting-started.md#review-and-keep-generated-files).

### Swift Package

The Swift Package integrates ObjectBox generator as a command plugin.

{% hint style="info" %}
The generator requires write permissions in your project directory to generate the model file and Swift binding code for your entities.
{% endhint %}

#### To run the generator from Xcode

1. right-click your project in the Project navigator and click **ObjectBoxGeneratorCommand**,
2. select the target that contains your ObjectBox entity classes,
3. when asked, allow the command to change files.
4. Once the command has finished, add the generated source file (`generated/EntityInfo-<target-name>.generated.swift`) to your project.

#### To run the generator from the command line

Use this command:

```shell
swift package plugin --allow-writing-to-package-directory objectbox-generator
```

### Review and keep generated files

Among other files ObjectBox generates a JSON **model file**, by default to `model-<target-name>.json` where  `<target-name>` is the name of an Xcode target, e.g. `NotesExample-iOS`.

{% hint style="info" %}
The JSON file is not visible by default in the Xcode Project navigator, you have to add it to the project or view it in Finder.
{% endhint %}

This JSON file changes when you change your entity classes (or sometimes with a new version of ObjectBox).

**Keep this JSON file**, commit the changes to version control!

This file keeps track of unique IDs assigned to your entities and properties. This ensures that an older version of **your database can be smoothly upgraded if your entities or properties change**.

{% hint style="success" %}
The model file also enables you to keep data [when renaming entities or properties](advanced/data-model-updates.md#renaming-entities-and-properties) or to [resolve conflicts](https://docs.objectbox.io/advanced/meta-model-ids-and-uids) when two of your developers make changes at the same time.
{% endhint %}

## Create a Store

To create or access a database on disk, use the `ObjectBox.Store` class. The `Store` behaves much like a database connection: you keep the instance around to maintain an open connection to the data in a folder on disk. Usually for the lifetime of your app.

```swift
let store = try Store(directoryPath: "/Users/jenna/Documents/mydatabase/")
```

{% hint style="warning" %}
Getting "**Missing argument for parameter 'model'**..." here? Make sure to [generate ObjectBox code](getting-started.md#generate-objectbox-code) first.\
\
Background: The ObjectBox code generator creates a second, convenience Store() initializer without the model parameter.
{% endhint %}

Of course, you would usually save your database in one of the standard system directories, like `.applicationSupportDirectory`, `.documentsDirectory` or `.cachesDirectory`:

```swift
let databaseName = "notes"
let appSupport = try FileManager.default.url(for: .applicationSupportDirectory,
                                             in: .userDomainMask,
                                             appropriateFor: nil,
                                             create: true)
                                             .appendingPathComponent(Bundle.main.bundleIdentifier!)
let directory = appSupport.appendingPathComponent(databaseName)
try? FileManager.default.createDirectory(at: directory,
                                         withIntermediateDirectories: true,
                                         attributes: nil)

let store = try Store(directoryPath: directory.path)
```

## Basic Box operations

Since ObjectBox is all about sticking objects in boxes, you interact with objects using a`Box`interface. For each object class, there is a matching `Box` instance.

To manage your entities, you retrieve the `ObjectBox.Box<T>` instance for its class from your`Store`. Boxes are lightweight and can be discarded, but then you have to pass the `Store` around. You will almost always prefer to pass long-lived `Box` instances around instead, for example in segues between `UIViewControllers`.

```swift
let exampleEntityBox = store.box(for: ExampleEntity.self)
// Similarly:
let personBox = store.box(for: Person.self)
let noteBox: Box<Note> = store.box()
```

Wherever you have access to a Box, you can use it to persist objects and fetch objects from disk. **Boxes are thread safe.** Here are some of the basic operations:

* **put:** Persist an object, which may overwrite an existing object with the same ID. In other words, use `put`to insert or update objects. When put succeeds, an ID will be assigned to the entity. There are `put` variants that support writing multiple objects at once, which is more efficient than writing each with its own call to `put`.
* **get:** When you have an object's ID, you can get to the object very efficiently using `get`. To get all objects of a type, use `all`.
* **remove:** Deletes a previously persisted object from its box. There are method overloads to remove multiple entities, and `removeAll` to delete all objects and empty the box.
* **count:** The number of objects stored in this box.
* **query:** Lets you provide a query expression to retrieve objects by certain criteria. See [the page on queries](queries.md) for details.

Check [the API docs for Box](https://objectbox.io/docfiles/swift/current/Classes/Box.html) for a list of operations.

### Put and Get Example

Once you have a box, it is simple to persist an entity. To illustrate the change of IDs, we added assertions to the code; you don't need these, of course.

```swift
// let's start with an empty box
assert(try exampleEntityBox.isEmpty())

let exampleEntity = ExampleEntity()
assert(exampleEntity.id.value == 0)

let newID = try exampleEntityBox.put(exampleEntity)
// Change of ID with the `put`:
assert(exampleEntity.id.value != 0)
assert(exampleEntity.id == newID)

// Check the Box contents did indeed change:
assert(try exampleEntityBox.count() == 1)
assert(try exampleEntityBox.all().first?.id == newID)

// Getting to a specific object
guard let foundEntity = try exampleEntityBox.get(newID) 
    else { fatalError("Object should be in the box") }
assert(exampleEntity.id == foundEntity.id)

// Cleaning up
try exampleEntityBox.removeAll()
assert(try exampleEntityBox.count() == 0)
```

### Put with structs

Structs basically work the same way as classes. However, since structs are value types, ObjectBox can only adjust their ID if you pass them by reference. So if you have a mutable struct, remember to pass it by reference:

```swift
// objectbox: entity
struct Author {
    var id: Id // Do not initialize the ID to 0 for structs.
    var name: String
    var age: Int
}

let exampleEntityBox = store.box(for: Author.self)
var exampleEntity = Author(id: 0, name: "Nnedi Okorafor", age: 45)

// Put the struct and update the ID:
try exampleEntityBox.put(&exampleEntity)
assert(exampleEntity.id != 0)
```

Alternately, you can manually update the struct's ID field by using `putAndReturnID()` or `putAndReturnIDs()` to get the ID a struct was written as:

```swift
exampleEntity.id = exampleEntityBox.putAndReturnID(exampleEntity)
```

Given immutable structs are such a common occurrence, ObjectBox generates a convenience method for you to help with updating the ID on an immutable struct, `put(struct:)`, which will automatically create a new copy of your struct with the ID filled out:

```swift
// objectbox: entity
struct Author {
    let id: Id // Do not initialize the ID to 0 for structs.
    let name: String
    let age: Int
}

// Let's start with an empty box:
let exampleEntityBox = store.box(for: Author.self)
let exampleEntity = Author(id: 0, name: "Nnedi Okorafor", age: 45)

// Put the immutable struct:
let newEntity = try exampleEntityBox.put(struct: exampleEntity)
assert(newEntity.id != 0)
```

Note that, after writing `exampleEntity`, you _must_ use `newEntity` from then on. If you called `put(struct:)` or `put()` on exampleEntity again, ObjectBox would not know that this object has already been saved, and would write a second copy of it to the database.

But what if you know you already saved an immutable entity, and you already made a copy because you changed one of its fields, and don't need another copy? Then you can call `put()`, just like above:

```swift
// Modify object:
let futureExampleEntity = Author(id: newEntity.id, name: newEntity:name,
                                        age: newEntity.age + 1)

// Write out changes:
try exampleEntityBox.put(futureExampleEntity)
```

So beyond having to use a special call the first time you write out an entity, everything is the same as with classes.

{% hint style="info" %}
For ObjectBox to work with structs, there needs to be an `init()` method on your struct that accepts all its persisted properties. In the above example, the default initializer provided for the struct by Swift does just fine, but if you have properties that are not persisted, or you are defining your own initializer, you may also have to provide that initializer.

Note that for structs you will usually not want to specify a default value of 0 for the ID like you do for classes. If you do, the default initializer will omit the "id:" parameter and there would be no way to initialize the ID without writing your own initializer.
{% endhint %}

## Transactions

Transactions in ObjectBox let you group together several operations and ensure that either all of them complete, or none does, always leaving your data relations in a consistent state. If you do not run your own transaction, ObjectBox will implicitly create one for every call:

* A `put`  runs an implicit transaction.
* Prefer the `put`  variant that takes an array of entities (like `put([person1, person2])`) whenever possible to increase performance.

For a high number of interactions inside loops, consider wrapping the loop in explicit transactions. `Store` exposes methods like  `runInTransaction` for this purpose.

```swift
// Bad/slow, each Put runs inside a new transaction
for i in (1...1000) {
    try box.put(AnEntity(number: i))
}

// Possible, but still inefficient
try store.runInTransaction {
    for i in (1...1000) {
        try box.put(AnEntity(number: i))
    }
}

// Much better
let allEntities: [AnEntity] = (1...1000).map(AnEntity.init(number:))
try box.put(allEntities)
```

For details, check the [Transaction guide](transactions.md) and [the API docs for Store](https://objectbox.io/docfiles/swift/current/Classes/Store.html) for details.
