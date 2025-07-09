---
description: >-
  If you aren't using CocoaPods, ObjectBox can easily be installed manually.
  Just download, add the framework to your project, and run our setup script.
---

# Manual Installation

### Download

You can get the newest **ObjectBox-xcframework-\<version>.zip** from [our GitHub Releases](https://github.com/objectbox/objectbox-swift/releases) page:

<figure><img src="../.gitbook/assets/image.png" alt=""><figcaption><p>Latest ObjectBox Swift GitHub release with XCFramework download highlighted</p></figcaption></figure>

Unpack the ZIP-archive and put the entire folder somewhere in your project's folder (for example, if your project is in  `/Users/vivien/RecordsDatabase/RecordsDatabase.xcodeproj`, you could put ObjectBox at `/Users/vivien/RecordsDatabase/ObjectBox` ).

### Add the Framework to your Project

Like with any embedded framework, you link to it and copy it into your application:

![](<../.gitbook/assets/Screenshot 2019-09-27 at 13.41.15.png>)

* Find the **ObjectBox.framework** for the platform of your application from the `ObjectBox.xcframework` folder.
* Open your project's target settings by clicking the little blue project icon at the top of the _Project_ Navigator in Xcode.
* Select the _General_ tab for your target and find the _Frameworks, Libraries and Embedded Content_ section.
* Drag the ObjectBox.framework into the list and choose "Embed & Sign" from the popup at its right.
* macOS and Xcode 10 and earlier only:
  * Go to the Build Phases tab and add a _Copy Files_ build phase.
  * Select _Frameworks_ as the _Destination_ from the popup.
  * Drag the ObjectBox.framework into it.

![](<../.gitbook/assets/Screenshot 2019-09-27 at 13.43.55.png>)

You're done, your project is linking to ObjectBox.

### Setup Script

Then open Terminal and run

`gem install xcodeproj`\
`/path/to/ObjectBox/setup.rb /path/to/MyProject.xcodeproj`

where `/path/to/` is again where your project is, like `/Users/vivien/RecordsDatabase/` above.

The `xcodeproj` gem is only needed by the installation script to do its work. It's not required to build your application.

### Done

You can now open your project and [follow the rest of this tutorial](../getting-started.md).
