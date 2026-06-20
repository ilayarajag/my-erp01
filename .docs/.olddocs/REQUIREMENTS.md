# First Phase

- Theme system design (web and tab responsive)
- UI flow creation
- Masters creation
- Implementation after client confirmation

# Masters screen details

## Admins

    1. Company
        - CompanyId
        - Name
        - Short Name
        - Add1
        - Add2
        - Add3
        - Add4
        - City
        - Pincode
        - State
        - Phone
        - Mobile
        - Email
        - Website
        - GSTIN
        - Fssai
        - Bank A/cNo
        - Bank Name
        - Ac/Name
        - IFSC Code
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    2. Outles
        - Code
        - ShortName
        - FullName
        - Add1
        - Add2
        - Add3
        - Add4
        - City
        - Pincode
        - State
        - Phone
        - Mobile
        - Email
        - Website
        - GSTIN
        - Fssai
        - Outlet_Type (Own/Franchisee)
        - GST Applicable (Yes/No)
        - Bank A/cNo
        - Bank Name
        - Ac/Name
        - IFSC Code
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    3. Role
        - role_name
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    4. Users
        - Name
        - Email
        - Password
        - Mobile
        - UserType
        - is_active
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    5. Users role Mapping
        - users_id
        - role_id
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    6. Users Outlet Mapping
        - users_id
        - outlet_id
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    7. Menu
        - menu_name
        - menu_url
        - menu_icon
        - menu_order
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    8. Sub Menu
        - sub_menu_name
        - sub_menu_url
        - sub_menu_icon
        - menu_id
        - sub_menu_order
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    9. Menu Authorization
        - id
        - role_id
        - user_id
        - menu_id
        - submenu_id
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    10. Outlet Type
        - outlet type
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

## Masters

    1. Head
        - cateogory_name
        - is_active
        - company_id
        - created_at
        - updated_at
        - created_by
        - updated_by

    2. Main Category
        - cateogory_name
        - is_active
        - company_id
        - created_at
        - updated_at
        - created_by
        - updated_by

    3. Sub Category
        - sub_cateogory_name
        - cateogory_id
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    4. Consumer
        - consumer_name
        - is_active
        - company_id
        - created_at
        - updated_at
        - created_by
        - updated_by

    5. Type Design
        - type_id
        - type_name
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    6. units (UOM)
        - unit_short_name
        - unit_long_name
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    7. Customer/Supplier
        - CustId(Auto)
        - Name
        - Short Name
        - Add1
        - Add2
        - Add3
        - Add4
        - City
        - Pincode
        - State
        - Phone
        - Mobile
        - Email
        - Website
        - GSTIN
        - is_active
        - Op.Bal
        - Balance (Display)
        - CustType (Customer/Supplier)
        - Bank A/cNo
        - Bank Name
        - Ac/Name
        - IFSC Code
        - fssai
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    8. Item
        - Product ID (Auto)
        - Product_fullname
        - Product_shortname
        - Head
        - Main Category
        - Sub Category
        - TypeDesign
        - puchaseuom
        - contains
        - Uom
        - Barcode
        - Purchase Rate
        - Sale Rate
        - Wholesale Rate
        - MRP
        - GST
        - Cess
        - HSN
        - Op.Stk
        - Balance (Display)
        - MinStock
        - AllowNegStock
        - Wscale
        - Vendor (Supplier)
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    9. outlet_products
        - id
        - prodid
        - prodcode
        - outlet_id
        - opening_stock
        - balance_stock
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by


    10. Warehouse
        - WhID (Auto)
        - WHName
        - is_active
        - Add1
        - Add2
        - Add3
        - Add4
        - City
        - Pincode
        - State
        - Phone
        - Mobile
        - Email
        - company_id
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    11. Sales Man
        - SalesMenId (Auto)
        - SalesmenCode
        - Salesmen Name
        - is_active
        - company_id
        - code
        - name
        - mobile
        - fathername
        - mothername
        - dob
        - sex
        - address1
        - address2
        - address3
        - photo
        - is_active
        - created_at
        - updated_at
        - created_by
        - updated_by

    12. AccountMaster
        - Acid (Auto)
        - AcName
        - AcType (Income/Expenses)
        - is_active
        - company_id
        - created_at
        - updated_at
        - created_by
        - updated_by

    13. countries
        - id
        - shortname
        - name
        - phonecode

    14. cities
        - id
        - name
        - state_id

    15. states
        - id
        - name
        - country_id

# Transaction details

## Purchases

    1. Purchase Master
        - id
        - docno
        - docdate
        - partycode
        - amount
        - subtotal_amount
        - gst_per
        - gst_amt
        - cess_per
        - cess_amt
        - roff
        - freight_charges
        - other_charges
        - partydc
        - outstanding
        - partydcdate
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    2. Purchase Details
        - id
        - purmst_id
        - docno
        - docdate
        - prodid
        - dis_per
        - dis_amt
        - mrp
        - rate
        - qty
        - gst_per
        - gst_amt
        - cess_per
        - cess_amt
        - barcode
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    3. purchase_master_ponumbers
        - id
        - purmst_id
        - docno
        - docdate
        - pono
        - podate
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    4. Purchase Return Master
        - id
        - docno
        - docdate
        - partycode
        - amount
        - subtotal_amount
        - gst_per
        - gst_amt
        - cess_per
        - cess_amt
        - roff
        - billno
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    5. Purchase Return Detail
        - id
        - prmst_id
        - docno
        - docdate
        - prodid
        - dis_per
        - dis_amt
        - mrp
        - rate
        - qty
        - gst_per
        - gst_amt
        - cess_per
        - cess_amt
        - barcode
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

## Sales

    1. Sales Master
        - id
        - docno
        - docdate
        - partycode
        - amount
        - subtotal_amount
        - gst_per
        - gst_amt
        - cess_per
        - cess_amt
        - roff
        - mode
        - outstanding
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    2. Sales Detail
        - id
        - sales_mst_id  //this is releationship with master table
        - docno
        - docdate
        - prodid
        - dis_per
        - dis_amt
        - mrp
        - rate
        - qty
        - gst_per
        - gst_amt
        - cess_per
        - cess_amt
        - barcode
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    3. Sales Return Master
        - id
        - docno
        - docdate
        - partycode
        - amount
        - subtotal_amount
        - gst_per
        - gst_amt
        - cess_per
        - cess_amt
        - roff
        - billno
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    4. Sales Return Detail
        - id
        - sales_ret_mst_id //this is releationship with master table
        - docno
        - docdate
        - sno
        - prodid
        - dis_per
        - dis_amt
        - mrp
        - rate
        - qty
        - gst_per
        - gst_amt
        - cess_per
        - cess_amt
        - barcode
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    5. Receipts
        - id
        - docno
        - docdate
        - partycode
        - mode
        - chqno
        - chqdate
        - bank
        - refno
        - amount
        - company_id
        - created_by
        - created_at

    6. Payments
        - id
        - docno
        - docdate
        - partycode
        - mode
        - chqno
        - chqdate
        - bank
        - refno
        - amount
        - company_id
        - created_by
        - created_at

    7. PartyLedger
        - id
        - Edate
        - PartyCode
        - Type (Sale/Purchase,SR/PR, Receipt/Payment)
        - Mode
        - Debit
        - Credit
        - company_id
        - created_by
        - created_at

    8. StockLedger
        - id
        - date
        - prodid
        - purchase_qty
        - sale_qty
        - purchase_return_qty
        - wastage_qty
        - adjust_qty
        - free_qty
        - sales_in_qty
        - sales_return_qty
        - tr_in_qty
        - tr_out_qty
        - company_id
        - created_by
        - created_at

    8. OutletStockLedger
        - id
        - date
        - prodid
        - outletid
        - purchase_qty
        - sale_qty
        - purchase_return_qty
        - wastage_qty
        - adjust_qty
        - free_qty
        - sales_in_qty
        - sales_return_qty
        - tr_in_qty
        - tr_out_qty
        - company_id
        - created_by
        - created_at
