---
description: 'ObjectBox Swift supports enums and custom types: here''s how.'
---

# Enums and Custom Types

Custom types allow entities to have properties of any type. This is based on mapping custom classes to built-in types. ObjectBox recognizes the following built-in (Swift) types:

```swift
Int8, UInt8
Int16, UInt16
Int32, UInt32
Int64, Int, UInt64, UInt
Float, Double
Data, [UInt8]
String
Date
```

## Enums

ObjectBox has built-in support for `RawRepresentable` enums. All that is needed is an annotation to tell ObjectBox to convert an enum:

```swift
enum TestEnum: Int {
    case unknown = 0
    case first = 100
    case second = 200
    case third = 300
}

class EnumEntity: Entity {
    var id: Id = 0
    // objectbox: convert = { "default": ".unknown" }
    var custom: TestEnum
}
```

Specify a default value to use when the value in the database is missing or invalid as the `default` argument to the `// objectbox: convert` annotation.

A database can have a missing value even for non-optional fields if you add a property to your entity and then open a database that was written by an older version of your app that did not have that field yet. A database may contain an invalid value if an older version of your app opens a file created by a newer version of your app that has added a new case to this enum.

When persisting enums, there are a couple of best practices:

* **Always assign explicit rawValues to each enum case:** Implicitly-assigned `rawValue`s are unstable, and can easily change the next time you edit your enum definitions.
* **Prepare for the unknown:** Define an _unknown_ enum value and specify it as the default. It can serve to handle missing or unknown values. This will allow you to gracefully handle cases like an old enum value getting removed without having to constantly unwrap optionals.

You can leave away the `"default"` annotation if your property is an optional. In that case `nil` will be the automatic default.&#x20;

## Enums in queries

`QueryBuilder` is unaware of enums. You have to **use the enum's rawValue for queries**.

So for the `EnumEntity` example above you would get users with the `custom` property of `second` with the query condition `box.query { User.role == TestEnum.second.rawValue }`.

## Custom Property Converters

To add support for a custom type, you can map properties to one of the built-in types using an `// objectbox: convert` annotation. You also need to provide a class to serve as a property converter.

For example, you could define a color in your entity using a custom `Color` class and map it to a `String`.&#x20;

Here is an example mapping an `enum` to an `Int` manually:

```swift
class RoleConverter {
    static func convert(_ enumerated: Role) -> Int {
        return enumerated.rawValue
    }
    static func convert(_ num: Int?) -> Role {
        guard let num = num else { return Role.default }
        return TestEnum(rawValue: num) ?? Role.default
    }
}

enum Role: Int {
    case default = 0
    case author = 1
    case admin = 2
}

class User: Entity, CustomDebugStringConvertible {
    var id: Id = 0
    // objectbox: convert = { "dbType": "Int", "converter": "RoleConverter" }
    var role = Role.default
}

```

### Things to look out for

Be sure to **correctly handle nil** and **invalid values**: If you add a field to your entity later on, old records in a database will not have a value for this field. Your converter will be handed a `nil` value for those instead. Or if a user opens a database created with a newer version of your app that supports additional values for an enum with an older version that doesn't know about these, you will have to supply a fallback value from your converter (In the above example, those are the two `Role.default` returns in `convert(_: Int?)`).

You must **not interact with the database** (such as using `Box` or `Store`) inside the converter. The converter methods are called within a transaction, so for example getting or putting entities into a box will fail.

If you implement your database-to-class converter method to not take an optional, ObjectBox will supply an appropriate 0 value for missing values, Same as it would for the underlying type without a converter.

{% hint style="info" %}
Note: Make sure the converter is thread safe, because it might be called concurrently on multiple entities.
{% endhint %}

## List/Array types

At the moment it is not possible to use arrays with converters, apart from `[UInt8]`, which is treated like `Data`. However, you could convert a List of `String`s to a JSON array resulting in a single string for the database.

Alternately, you can replace arrays with relations and create a new entity for the array elements. So, for example instead of

```swift
class Document {
    var id: Id = 0
    var userNames: [String] // ObjectBox doesn't know how to store this
}
```

You would have two entities:

```swift
class Document {
    var id: Id = 0
    var users: ToMany<User>
}

class User {
    var id: Id = 0
    var document: ToOne<Document> = nil
    var name: String
}
```

## Custom types in queries

`QueryBuilder` is unaware of custom types. You have to **use the raw database value for queries**.

So for the `User` example above you would get users with the role of `admin` with the query condition `box.query { User.role == Role.admin.rawValue }` or `box.query { User.role == 2 }`.
