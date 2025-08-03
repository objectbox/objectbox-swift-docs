---
description: >-
  ObjectBox uses a Swift code generator to generate boilerplate code that passes
  object information to the library. Therefore, you can simply enjoy plain Swift
  objects.
---

# The setup.rb Script

{% hint style="info" %}
If you are using the provided `setup.rb` script, **you do not need to do any of these steps**. This section is mostly of interest for people who want to know what that script does behind the scenes or who for some reason cannot use the script.
{% endhint %}

ObjectBox brings its own code generator (based on Sourcery :man\_mage:) to generate boilerplate code that passes information about your objects to the library. Code generation avoids inheritance trees and runtime reflection so you can write plain Swift objects that can be persisted extremly fast.

The [`setup.rb`](https://github.com/objectbox/objectbox-swift/blob/main/Source/ios-framework/cocoapod/setup.rb) script does the following things to ensure the code generator is run transparently whenever you build your project:

1. [Adds a build phase that runs the code generator to your project.](https://swift.objectbox.io/advanced/sourcery#adding-the-sourcery-build-phase-to-your-project)
2. [Adds the generated source files to your project](https://swift.objectbox.io/advanced/sourcery#adding-the-generated-files-to-your-project)

## Adding the Sourcery Build Phase to Your Project

In your Xcode project, **add a "New Run Script Phase"** and make sure it comes _above_ the Compile Sources phase of your project. The code generator needs to generate the code you want to compile first.

We call the Build Phase _"_\[OBX] Update Sourcery Generated File&#x73;_"_.&#x20;

Enter the following script into this build phase:

```bash
"${PROJECT_DIR}/ObjectBox/generate_sources.sh"
```

The above example assumes you've extracted the files from the ObjectBox release on Github into a folder named `ObjectBox` next to your project. If you had a folder named `external` for all external dependencies next to a `myproject` folder that contains your project, that line might read:

```bash
"${PROJECT_DIR}/../external/ObjectBox/generate_sources.sh"
```

You get the picture. In general, it is a good idea to use project-relative paths, so anyone checking out your project can run it, no matter where they keep their checkouts, or what their username.

## Adding the Generated Files to Your Project

Build your project once, so it can create the `generated/EntityInfo.generated.swift` file for you. It will not contain much of interest, yet, but now that the `generated/` directory and its contents exist, you can drag them into your Xcode project so they get compiled as well (make sure you add folders as "groups", not as "folder references").

You now have a working ObjectBox setup in your project and should be able to follow the rest of the instructions in our Getting Started section.
