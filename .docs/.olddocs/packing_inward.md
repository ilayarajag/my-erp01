# Purchase Module Logics

## Tables

    1. packing_inward_master
        - id
        - docno
        - docdate
        - pack_issue_id
        - whid
        - total_items
        - total_qty
        - created_by
        - updated_by
        - created_at
        - updated_at



    2. packing_inward_details
        - id
        - inward_mst_id
        - pack_issue_id
        - docno
        - docdate
        - prodid
        - whid
        - total_qty
        - created_by
        - updated_by
        - created_at
        - updated_at

## LOGICs

1. After inserting above into respective tables. need to update `customer/suppliers` table `balance` column
2. Formula:
   `new_balance = exsisting_balance+purchase_master_total_amount`
3. `PartyLedger` table below should affect
   - `id` - `auto increment`
   - `Edate` - `date to be posted`
   - `PartyCode` - `this is supplier/party id or code`
   - `Debit` - column should be post - `purchase_master_total_amount`
   - `Credit` - `0`
   - `Type` cloumn should be post - `Purchase - bill of docs number`
   - `Mode` to be empty
4. `StockLedger` table below should affect

   - Note: if row does not exsists against `date and prodid` insert new row
   - For a date and prodid only one row should be there.
   - if row exsists update exsisting purchase_qty row against `date and prodid`

   - id - `auto increment`
   - date - `date to be posted`
   - prodid - `products ids from purchase details`
   - purchase_qty - ` exsisting purchase_qty` + `qty from the purchase details contracts`
   - sale_qty - `0`
   - purchase_return_qty - `0`
   - wastage_qty - `0`
   - adjust_qty - `0`
   - free_qty - `0`
   - sales_in_qty - `0`
   - sales_return_qty - `0`
   - tr_in_qty - `0`
   - tr_out_qty - `0`
   - warehouse_id
   - company_id - `from contracts details`
   - created_by - `users id who are doing the operations`
   - created_at - `date time stamp from backend`
   - updated_by - `users id who are doing the operations`
   - updated_at - `date time stamp from backend`

5. Item/products
   - Balance (Display) - `this to be exsisting balance` - `qty from the purchase details contracts against product is purchase_type`
6. warehosuse_stocks
   - prod_id
   - warehouse_id
   - stock - ` exsisting stock` + `qty from the inward details contracts`
   - created_by - `users id who are doing the operations`
   - created_at - `date time stamp from backend`
   - updated_by - `users id who are doing the operations`
   - updated_at - `date time stamp from backend`
