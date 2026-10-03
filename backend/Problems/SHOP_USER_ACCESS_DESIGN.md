# Shop--User Access Design

## 1. Problem

The system has two entities:

-   `Users`
-   `Shops`

The initial idea was to store `UserID` directly inside the `Shops`
table:

``` text
Users
  |
  | UserID
  v
Shops
```

For example:

### Users

    UserID FullName
  -------- ----------
         1 Rahul
         2 Amit
         3 Priya

### Shops

    ShopID   UserID ShopName
  -------- -------- -------------------
       101        1 Electronics Store
       102        1 Mobile Store
       103        2 Grocery Store

This works if **each shop can be associated with only one user**.

However, suppose the requirement changes:

> One user can access multiple shops, and one shop can be accessed by
> multiple users.

For example:

``` text
Shop 101
 ├── Rahul
 ├── Amit
 └── Priya
```

Now a single `UserID` column in `Shops` is not enough.

------------------------------------------------------------------------

# 2. The Problem With `UserID` Directly Inside `Shops`

If we have:

``` text
Shops

ShopID | UserID | ShopName
-------|--------|----------------
101    | 1      | Electronics
```

This can represent:

``` text
Rahul → Electronics
```

But how do we represent:

``` text
Rahul  → Electronics
Amit   → Electronics
Priya  → Electronics
```

We cannot store three `UserID` values in one row.

We might be tempted to do something bad like:

``` text
UserID = "1,2,3"
```

This is incorrect database design because:

-   `UserID` is no longer a single value.
-   Foreign-key relationships cannot be properly enforced.
-   Queries become difficult.
-   User permissions become difficult to manage.
-   Searching and joining become inefficient.
-   Data integrity becomes harder to maintain.

Therefore, we need a separate table.

------------------------------------------------------------------------

# 3. Solution: Junction Table

Create a junction table called `ShopUsers`.

The relationship becomes:

``` text
Users ───────< ShopUsers >─────── Shops
```

This creates a **many-to-many relationship**.

### Meaning

One User:

``` text
User 1
 ├── Shop 101
 ├── Shop 102
 └── Shop 103
```

One Shop:

``` text
Shop 101
 ├── User 1
 ├── User 2
 └── User 3
```

Both requirements are now possible.

------------------------------------------------------------------------

# 4. Table Structure

## Users

``` text
Users
-----
UserID (PK)
FullName
Email
Phone
...
```

## Shops

``` text
Shops
-----
ShopID (PK)
OwnerID (FK → Owners.OwnerID)
ShopName
Description
Address
City
State
Pincode
Phone
Email
...
```

## ShopUsers

``` text
ShopUsers
---------
ShopUserID (PK)
ShopID (FK → Shops.ShopID)
UserID (FK → Users.UserID)
```

The `ShopUsers` table is responsible only for mapping users to shops.

------------------------------------------------------------------------

# 5. PostgreSQL Implementation

``` sql
CREATE TABLE IF NOT EXISTS ShopUsers
(
    ShopUserID SERIAL PRIMARY KEY,

    ShopID INTEGER NOT NULL,

    UserID INTEGER NOT NULL,

    CONSTRAINT FK_ShopUsers_Shops
        FOREIGN KEY (ShopID)
        REFERENCES Shops(ShopID),

    CONSTRAINT FK_ShopUsers_Users
        FOREIGN KEY (UserID)
        REFERENCES Users(UserID),

    CONSTRAINT UQ_ShopUsers
        UNIQUE (ShopID, UserID)
);
```

------------------------------------------------------------------------

# 6. Why `UNIQUE (ShopID, UserID)`?

This constraint prevents the same user from being assigned to the same
shop multiple times.

Without the constraint, this would be possible:

``` text
ShopID | UserID
-------|-------
101    | 1
101    | 1
101    | 1
```

This is invalid logically because Rahul is being assigned to the same
shop three times.

With:

``` sql
UNIQUE (ShopID, UserID)
```

this combination can exist only once.

But these are all valid:

``` text
ShopID | UserID
-------|-------
101    | 1
101    | 2
101    | 3
102    | 1
102    | 2
```

Because every `(ShopID, UserID)` combination is different.

------------------------------------------------------------------------

# 7. Example Data

## Users

``` sql
INSERT INTO Users (FullName, Email)
VALUES
    ('Rahul', 'rahul@example.com'),
    ('Amit', 'amit@example.com'),
    ('Priya', 'priya@example.com');
```

Assume the generated IDs are:

    UserID FullName
  -------- ----------
         1 Rahul
         2 Amit
         3 Priya

------------------------------------------------------------------------

## Shops

Assume the shops already exist:

    ShopID   OwnerID ShopName
  -------- --------- -------------------
       101         1 Electronics Store
       102         1 Mobile Store
       103         2 Grocery Store

------------------------------------------------------------------------

## ShopUsers

Now define who can access which shop:

``` sql
INSERT INTO ShopUsers (ShopID, UserID)
VALUES
    (101, 1),
    (101, 2),
    (101, 3),
    (102, 1),
    (102, 2),
    (103, 3);
```

The resulting table:

    ShopUserID   ShopID   UserID
  ------------ -------- --------
             1      101        1
             2      101        2
             3      101        3
             4      102        1
             5      102        2
             6      103        3

------------------------------------------------------------------------

# 8. Understanding the Example

### Shop 101

``` text
Shop 101
   |
   +--- Rahul  (User 1)
   |
   +--- Amit   (User 2)
   |
   +--- Priya  (User 3)
```

So three users can access the same shop.

### User 1

``` text
Rahul
  |
  +--- Shop 101
  |
  +--- Shop 102
```

So one user can access multiple shops.

This is exactly what a many-to-many relationship means.

------------------------------------------------------------------------

# 9. Query: Get All Shops Accessible by a User

For example, get all shops accessible by Rahul (`UserID = 1`):

``` sql
SELECT
    s.ShopID,
    s.ShopName
FROM Shops s
JOIN ShopUsers su
    ON s.ShopID = su.ShopID
WHERE su.UserID = 1;
```

Result:

    ShopID ShopName
  -------- -------------------
       101 Electronics Store
       102 Mobile Store

------------------------------------------------------------------------

# 10. Query: Get All Users Who Can Access a Shop

For Shop `101`:

``` sql
SELECT
    u.UserID,
    u.FullName,
    u.Email
FROM Users u
JOIN ShopUsers su
    ON u.UserID = su.UserID
WHERE su.ShopID = 101;
```

Result:

    UserID FullName   Email
  -------- ---------- -------------------
         1 Rahul      rahul@example.com
         2 Amit       amit@example.com
         3 Priya      priya@example.com

------------------------------------------------------------------------

# 11. Owner vs User Access

The `OwnerID` and `UserID` relationships have different meanings.

### `Shops.OwnerID`

Answers:

> **Who owns this shop?**

``` text
Shop 101
   |
   └── OwnerID = 1
           |
           └── Owner 1
```

### `ShopUsers.UserID`

Answers:

> **Who can access this shop?**

``` text
Shop 101
   |
   +── User 1
   +── User 2
   +── User 3
```

Therefore, ownership and access should remain separate.

------------------------------------------------------------------------

# 12. Complete Relationship

``` text
                 Owners
                   |
                   | OwnerID
                   |
                   v
                 Shops
                   |
                   | ShopID
                   v
               ShopUsers
                /      \
               /        \
          UserID        ShopID
             |
             v
           Users
```

More precisely:

``` text
Owners (1)
    |
    | owns
    |
    v
Shops (1)
    |
    | many
    |
    v
ShopUsers
    ^
    |
    | many
    |
Users (1)
```

The important relationships are:

``` text
Owners.OwnerID
      ↓
Shops.OwnerID

Shops.ShopID
      ↓
ShopUsers.ShopID

Users.UserID
      ↓
ShopUsers.UserID
```

------------------------------------------------------------------------

# 13. Why This Design Is Better

Using a junction table gives:

1.  **Multiple shops per user**
2.  **Multiple users per shop**
3.  Proper foreign-key validation
4.  No comma-separated IDs
5.  Clean SQL JOIN operations
6.  Easy permission management later
7.  Better scalability

------------------------------------------------------------------------

# 14. Future Extension: User Roles

The junction table can later store permissions for each user within each
shop.

For example:

``` text
ShopUsers
---------
ShopUserID
ShopID
UserID
Role
CanView
CanEdit
CanDelete
JoinedAt
```

Example:

    ShopID   UserID Role      CanView   CanEdit   CanDelete
  -------- -------- --------- --------- --------- -----------
       101        1 Admin     TRUE      TRUE      TRUE
       101        2 Manager   TRUE      TRUE      FALSE
       101        3 Staff     TRUE      FALSE     FALSE

Now the system can distinguish between:

``` text
Rahul → Admin
Amit  → Manager
Priya → Staff
```

for the **same shop**.

------------------------------------------------------------------------

# 15. Final Design Rule

If the requirement is:

> **One user can access multiple shops AND one shop can be accessed by
> multiple users**

use:

``` text
Users
   ↕
ShopUsers
   ↕
Shops
```

Do **not** put `UserID` directly inside `Shops`.

Keep:

``` text
OwnerID → Ownership
ShopUsers → Access
Users → User information
Shops → Shop information
```

This keeps the database normalized and makes the access-control system
extensible.
