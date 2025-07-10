---
description: >-
  The swiftiest database for iOS answers the most asked questions. Is ObjectBox
  based on SQLite? Is ObjectBox a CoreData alternative? What about Firebase? How
  is ObjectBox...
---

# ObjectBox Swift FAQ

## Conceptual

### Is ObjectBox based on SQLite?

No, ObjectBox is a standalone NoSQL database designed and optimized for storing objects. ObjectBox clearly is a SQLite alternative as well as a CoreData alternative. There are no rows and columns. **Benefits:** simpler API and better performance. &#x20;

Another big difference is that SQLite is an embedded database **only**. While ObjectBox also is an embedded database, it offers additional modes of operation like **client/server** and [**data synchronization**](https://objectbox.io/sync/) among several machines - from small devices to servers and the cloud. ObjectBox therefore clearly is also an alternative to Firebase (for syncing data that is),

### How is ObjectBox different from other solutions?

**TL;DR** Swift-first, speed, simple APIs

**Swift first:** The API is designed for Swift without an Objective-C legacy. For example there is no need for `@objc`, no enforced base class for entities, and no wrappers needed for optional types.\
To give some background here, we started with a Objective-C(++) middle layer, but had this huge turning point during development. We realized that putting Swift first required us to take rather drastic measures and remove our Objective-C(++) code completely. We [wrote about that and the immediate benefits](https://objectbox.io/speed-increase-with-swift/) like struct support and a huge performance boost.

**Speed:** ObjectBox was built for high performance on mobile devices. Minimalism as a leading principle. We believe, we've built one of the most resource efficient databases that exist. Of course, you should not just rely on what we claim, but see for yourself. Our [performance benchmarking code is open source](https://github.com/objectbox/objectbox-swift-performance).

**Simple APIs:** Browse through our docs using the menu on the left. We tried hard to give developers like you a simple API for powerful features. Another example are entities themselves, which are plain Swift objects without any "magic" that would break threading or cause values from being shown in the debugger, etc. With ObjectBox, you can use objects across threads without restrictions. For example, you can defer loading objects to a background thread and pass them to the UI thread to display them.

**And by the way; we want your feedback:** of course, ObjectBox is not perfect. We set our goals high but we also fail at times. Let us know how we can improve. If you have something specific in mind, please [raise an issue on GitHub](https://github.com/objectbox/objectbox-swift/issues). And we're also happy if you would [send us general feedback](https://docs.google.com/forms/d/e/1FAIpQLSd0neiviD0Yal0Tn7921w-XWI2d0ONpLm7TfVKp7OvwW2Tu2A/viewform?usp=sf_link) on how we are doing (takes 1-2 minutes). Thank you!

## Technical

### Why are you not using Codable in ObjectBox?

ObjectBox uses a code generator, which does more than serializing objects into a binary format. It manages an internal data model and lets you e.g. rename a Swift property without breaking already stored objects. All of this happens at compile time, and gets checked into version control, so each user's and developers' databases are compatible. Codable happens at runtime, on each user's machine. Simply said, ObjectBox could not do what it does with Codable.

## Troubleshooting

### Error message "Missing argument for parameter 'model'..." when creating a new Store

**TL;DR:** build the project first.

ObjectBox's code generator generates a convenience initializer for you that doesn't need the model parameter because it sets up your model for you. It does this after parsing all your entities, which happens at build time. Thus, make sure to build your project at least once after declaring your entities. Otherwise Xcode's CodeSense auto-completion will not propose the right initializer in its list, and will display this erroneous error message.

### Error Message "Could not open env for DB (1)" in Sandboxed macOS App

A sandboxed macOS application must have at least one _App Group_ set up in its target settings under _Signing and Capabilities_. See [The Sandbox on macOS](advanced/macos.md) for detailed instructions. This error occurs if no app group can be found.

### Error message "ObjectBox does not contain bitcode" when linking

ObjectBox currently does not contain Bitcode, as it generally is not needed and only increases file sizes. You can still build for device and app store distribution by turning off Bitcode for your application as well. As the error message goes on to explain, you do this using the target's _Enable Bitcode_ setting under _Build Settings_ in Xcode ( `ENABLE_BITCODE`).

If you have a strong need to obtain a version of ObjectBox with Bitcode, [please let us know](https://objectbox.io/feedback/).

\
