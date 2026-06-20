🧾 Product Master Creation Flow — POS (pos.kovaipazhamudir.com)

This document explains the workflow for creating and managing products in the POS system for both Outlet and Warehouse products.
When an Outlet is selected, posting also occurs in the outlet_product table.

🏬 Outlet Product Flow
1. New Product — mode = 0

    Action: Direct posting in the Product Master, Item Edit, and Outlet Product tables.

    Description:
    When a new product is created for an outlet, the product details are inserted directly into:

    product_master
    item_edit
    outlet_product

    Tables Used:

    product_master
    item_edit
    outlet_product

    LocId:
    The location ID (LocId) corresponds to the Outlet ID.
    Wh_down  column:
    Wh_down coulmn by default 0


2. Edit Product — mode = 1

    Action: Post to the Item Edit Table, then update in Product Master.

    Description:
    When an existing product is edited (e.g., name, rate, stock unit, etc.), the updated details are:

    Posted to the item_edit table for review.

    After approval, reflected in the product_master table. 

    Tables Used:
    item_edit
    product_master 

    LocId:
    The location ID corresponds to the Outlet ID.
    Wh_down  column:
    Wh_down coulmn by default 0

3. Activate Product — mode = 0

    Action: Post to the Item Edit Table, then update in Product Master.

    Description:
    When an inactive product is reactivated:

    The activation details are posted to the item_edit table.

    After approval, the product status is updated in the product_master table. 

    Tables Used:
    item_edit
    product_master 

    LocId:
    The location ID corresponds to the Outlet ID.
    Wh_down  column:
    Wh_down coulmn by default 0

🏗️ Warehouse Product Flow

1. New Product

    Action: Direct posting in the Product Master and Item Edit tables.

    Description:
    When a new product is created for a warehouse, it is inserted directly into:

    product_master
    item_edit

    Tables Used:
    product_master
    item_edit

    LocId:
    The location ID (LocId) should be the negative value of the Warehouse ID.

    Example: If Warehouse ID = 3, then LocId = -3.

    This negative value differentiates warehouse products from outlet products.

2. Edit Product

    Action: Post to the Product Master and Item Edit tables.

    Description:

    When a warehouse product is edited:
    Updated details are posted to the item_edit table.
    After review, changes are reflected in the product_master.

    Tables Used:
    product_master
    item_edit

    LocId:
    Negative Warehouse ID

    Example: If Warehouse ID = 3, then LocId = -3.

3. Activate Product

    Action: Post to the Item Edit Table, then update in Product Master.

    Description:
    When a warehouse product is reactivated:
    The activation details are posted to the item_edit table.
    After approval, the main product record in product_master is updated.

    Tables Used:
    product_master
    item_edit
    
    LocId:
    Negative Warehouse ID

    Example: If Warehouse ID = 3, then LocId = -3.

🔸 Item Edit Status

When posting to the item_edit table, the status,Wh_down field should be set to 0. 

| **Product Type** | **Action** | **Mode** | **Table Used**                                  | **LocId Format**                 | **Remarks**                                |
| ---------------- | ---------- | -------- | ----------------------------------------------- | -------------------------------- | ------------------------------------------ |
| Outlet           | New        | 0        | `product_master`, `item_edit`, `outlet_product` | Outlet ID (e.g., 101)            | Direct insert                              |
| Outlet           | Edit       | 1        | `item_edit`, `product_master`  | Outlet ID (e.g., 101)            | Post to item_edit, then update master      |
| Outlet           | Activate   | 0        | `item_edit`, `product_master`,`outlet_product`  | Outlet ID (e.g., 101)            | Post to item_edit, then activate in master |
| Warehouse        | New        | 0        | `product_master`, `item_edit`                   | Negative Warehouse ID (e.g., -3) | Direct insert                              |
| Warehouse        | Edit       | 1        | `product_master`, `item_edit`                   | Negative Warehouse ID (e.g., -3) | Post to item_edit, then update master      |
| Warehouse        | Activate   | 0        | `product_master`, `item_edit`                   | Negative Warehouse ID (e.g., -3) | Post to item_edit, then activate in master |

# Api Needed
 1. Product creation
 2. uom
 3. category
 4. subcategory
 5. brand
 6. brandcompany
 7. Merchat category 
 8. Rate Entry APIs for outlet