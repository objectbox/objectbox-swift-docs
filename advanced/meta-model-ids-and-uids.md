---
description: >-
  Unlike relational databases like SQLite, ObjectBox swift database does not
  require you to create a database schema. That does not mean ObjectBox is
  schema-less. Learn here how it is done.
---

# Meta Model, IDs and UIDs

While ObjectBox does not require you to create a database schema, the database is not schema-less. For efficiency reasons, ObjectBox manages a **meta model** of the data stored. This meta model is actually ObjectBox’s equivalent of a schema. It includes known object types including all properties, indexes, etc. A key difference to relational schemas is that ObjectBox manages its meta model - mostly - automatically. In some cases it needs your help. That’s why we will look at some details.

## IDs

In the ObjectBox meta model, everything has an ID and an UID. IDs are used internally in ObjectBox to reference entities, properties, and indexes. For example, you have an entity “User” with the properties “id” and “name”. In the meta model the entity (type) could have the ID 42, and the properties the IDs 1 and 2. Property IDs must only be unique within their entity.

{% hint style="info" %}
Note: do not confuse object IDs with meta model IDs: object IDs are the values of th `Id` or`EntityId<MyEntity>` property (see Object IDs in [basics](../install.md)). In contrast, all objects are instances of the entity type associated with a single meta model ID.
{% endhint %}

ObjectBox assigns meta model IDs sequentially  (1, 2, 3, 4, …) and keeps track of the last used ID to prevent ID collisions.

## UIDs

As a rule of thumb, for each meta model ID there’s a corresponding UID. They complement IDs and are often used in combination (e.g. in the JSON file). While IDs are assigned sequentially, UIDs are a random long value. The job of UIDs is detecting and resolving concurrent modifications of the meta model.

A UID is unique across entities, properties, indexes, etc. Thus unlike IDs, a UID already used for an entity may not be used for a property. As a precaution to avoid side effects, ObjectBox keeps track of “retired” UIDs to ensure previously used but now abandoned UIDs are not used for new artifacts.

## JSON for consistent IDs

ObjectBox stores a part of its meta model in a JSON file. This file should be available to every developer and thus checked into a source version control system (e.g. git). The main purpose of this JSON file is to ensure consistent IDs and UIDs in the meta model across devices.

This JSON file is stored in the file `model-TargetName.json`. For example, look at the file from the [ObjectBox example project](https://github.com/objectbox/objectbox-swift/tree/main/Example):

```javascript
{
  "_note1": "KEEP THIS FILE! Check it into a version control system (VCS) like git.",
  "_note2": "ObjectBox manages crucial IDs for your object model. See docs for details.",
  "_note3": "If you have VCS merge conflicts, you must resolve them according to ObjectBox docs.",
  "entities": [
    {
      "id": "1:712683617673955584",
      "lastPropertyId": "2:5025387500910526208",
      "name": "Author",
      "properties": [
        {
          "flags": 1,
          "id": "1:6336800942024279296",
          "name": "id",
          "type": 6
        },
        {
          "id": "2:5025387500910526208",
          "name": "name",
          "type": 9
        }
      ],
      "relations": []
    },
    {
      "id": "2:5608901830082711040",
      "lastPropertyId": "6:6001769173142034944",
      "name": "Note",
      "properties": [
        {
          "flags": 1,
          "id": "1:7180411752564202752",
          "name": "id",
          "type": 6
        },
        {
          "id": "2:249105953415333376",
          "name": "title",
          "type": 9
        },
        {
          "id": "3:5661281725891017216",
          "name": "text",
          "type": 9
        },
        {
          "id": "4:8342334437465755392",
          "name": "creationDate",
          "type": 10
        },
        {
          "id": "5:8881960381068888832",
          "name": "modificationDate",
          "type": 10
        },
        {
          "flags": 520,
          "id": "6:6001769173142034944",
          "indexId": "1:6069708401898380544",
          "name": "author",
          "relationTarget": "Author",
          "type": 11
        }
      ],
      "relations": []
    }
  ],
  "lastEntityId": "2:5608901830082711040",
  "lastIndexId": "1:6069708401898380544",
  "lastRelationId": "0:0",
  "lastSequenceId": "0:0",
  "modelVersion": 5,
  "modelVersionParserMinimum": 4,
  "retiredEntityUids": [],
  "retiredIndexUids": [],
  "retiredPropertyUids": [],
  "retiredRelationUids": [],
  "version": 1
}
```

As you can see, the `id` attributes combine the ID and UID using a colon. This protects against faulty merges. When applying the meta model to the database, ObjectBox will check for consistent IDs and UIDs.

## Meta Model Synchronization

At build time, ObjectBox gathers meta model information from the entities (classes that conform to the `Entity` protocol or are annotated `objectbox: entity`) and the JSON file. The complete meta model information is written into the `generated/EntityInfo-TargetName.generated.swift` file.

Then, at runtime, the meta model assembled in `EntityInfo-TargetName.generated.swift` is synchronized with the meta model inside the ObjectBox database (file). UIDs are the primary keys to synchronize the meta model with the database. The synchronization involves a couple of consistency checks that may fail when you try to apply illegal meta data.

## Stable Renames using UIDs

At some point you may want to rename an entity class or just a property. Without further information, ObjectBox will remove the old entity/property and add a new one with the new name. This is actually a valid scenario by itself: removing one property and adding another. To tell ObjectBox it should do a rename instead, you need to supply the property's previous UID.

Add an `// objectbox: uid` annotation without any value to the entity or property you want to rename and trigger a project build. The build will fail with a message containing the UID you need to apply to the `// objectbox: uid` annotation.

Also check out this [how-to guide](data-model-updates.md) for hands-on information on renaming and resetting.

## Resolving Meta Model Conflicts

In the section on UIDs, we already hinted at the possibility of meta model conflicts. This is caused by developers changing the meta model concurrently, typically by adding entities or properties. The knowledge acquired in the previous paragraphs helps us to resolve the conflicts.

### The Nuke Option

During initial development, it may be an option to just delete the meta model and all databases. This will cause a fresh start for the meta model, e.g. all UIDs will be regenerated. Follow these steps:

* Delete the JSON file for the given target(s) (`model-TargetName.json`)
* Build the project to generate a new JSON file from scratch
* Commit the recreated JSON file to your VCS (e.g. git)
* Delete all previously created ObjectBox databases (e.g. for iOS, delete the app from your home screen, or delete the file from your application's container in the simulator or on macOS)

While this is a simple approach, it has its obvious disadvantages and is not an option once an app has been published.

### Manual conflict resolution

Usually, it is preferred to edit the JSON file to resolve conflicts and fix the meta model. This involves the following steps:

* **Ensure IDs are unique:** in the JSON file the id attribute has values in the format “ID:UID”. If you have duplicate IDs after a VCS merge, you should assign a new ID (keep the UID part!) to one of the two. Typically, the new ID would be “last used ID + 1”.
* **Update last ID values:** for entities, update the attribute “lastEntityId”; for properties, update the attribute “lastPropertyId” of the enclosing entity
* **Check for other ID references:** do a text search for the UID and check if the ID part is correct for all UID occurrences

To illustrate this with an example, let's assume the last assigned entity ID was 41. Thus the next entity ID will be 42. Now, the developers Alice and Bob add a new entity without knowing of each other.

Alice adds a new entity “Ant” which is assigned the entity ID 42.

At the same time, Bob adds the entity “Bear” which is also assigned the ID 42.

After both developers committed their code, the ID 42 does not uniquely identify an entity type (“Ant” or “Bear”?). Furthermore, in Alice’s ObjectBox the entity ID 42 is already wired to “Ant” while Bob’s ObjectBox maps 42 to “Bear”.

UIDs make this situation resolvable. Let’s say the UID is 12345 for “Ant” and 9876 for “Bear”. Now, when Bob pulls Alice’s changes, he is able to resolve the conflict: He manually assigns the entity ID 43 to “Bear” and updates the lastEntityId attribute accordingly to “43:9876” (ID:UID). After Bob commits his changes, both developers are able to continue with their ObjectBox files.
