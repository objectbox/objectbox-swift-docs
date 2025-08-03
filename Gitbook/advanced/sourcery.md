---
description: >-
  ObjectBox Swift generates code to make it as easy to use and fun for you as
  possible to swiftly persist objects. In rare cases you may want adjust the
  code generator's work.
---

# Customizing Code Generation

Although you should generally not need to, you can adjust the behavior of ObjectBox's code generator by passing it additional arguments.

The general procedure is the same: Open the _\[OBX] Update Sourcery Generated Files_ build phase for your target in Xcode and edit the shell script there. Usually it looks something like:

```bash
"$PODS_ROOT/ObjectBox/generate_sources.sh" -- --output "$PROJECT_DIR/generated/EntityInfo-TARGETNAME-iOS.generated.swift"
                                           --model-json "$PROJECT_DIR/model-TARGETNAME-iOS.json"
```

where `TARGETNAME` is the name of your target.

Note the extra two dashes, which help the script distinguish arguments to be forwarded to the code generator from arguments directly to the script. You only need one double-dash at the start, even when passing multiple options to the script.

## Controlling Output File Names

If you have several different targets in your project and want them to share the same model, you can customize the names and paths for the `model.json` and `EntityInfo.generated.swift` files by changing the script to use the same name for these files:

```bash
"${PODS_ROOT}/ObjectBox/generate_sources.sh" -- --output "${PROJECT_DIR}/generated/EntityInfo.generated.swift"
                                                --model-json "${PROJECT_DIR}/model.json"
```

In this example, `EntityInfo.generated.swift` and `model.json` without the target name in them.

## Modifying the Module Name

Or if you wanted to control the Swift **module name** under which the generated source code should end up, you would do this by telling the script to forward the `--xcode-module` option to the code generator:

```bash
"${PODS_ROOT}/ObjectBox/generate_sources.sh" -- --xcode-module JennasModule
```

Where `JennasModule` would be the module name to use.

## Specifying Access Control for Generated Code

If you are **writing a framework** and want to export your entity classes from it, you will need to make the generated code public. You do this similarly, by adding the `--visibility` option:

```bash
"${PODS_ROOT}/ObjectBox/generate_sources.sh" -- --visibility public
```

## Anonymous Build Statistics

The code generator sends some anonymous usage statistics during build (on the machine you are building on, never inside your app!). If you do not wish this information to be collected, you can pass the following option to Sourcery:

```bash
"${PODS_ROOT}/ObjectBox/generate_sources.sh" -- --no-statistics
```

The following information is collected:

* An anonymous random GUID identifying the installation of ObjectBox
* The number of builds
* A hash of the target's namespace name
* OS version, ObjectBox version, Deployment OS, architecture and versions
* System country and language setting
* CI system the build is run under

The code generator will try to batch this information together so there is at most one request sent per day.

## Other Options

It is not recommended to customize any other options, as they are subject to change, but should you need to do so, you can obtain a list by asking the code generator directly by typing the following into Terminal:

```bash
/path/to/ObjectBox/Sourcery.app/Contents/MacOS/Sourcery --help
```

Which will print a syntax description for the code generator.

{% content-ref url="../getting-started.md" %}
[getting-started.md](../getting-started.md)
{% endcontent-ref %}
