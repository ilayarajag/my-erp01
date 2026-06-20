# Sales Module Logics

## Tables

    1. SalesMaster
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

    2. SalesDetail
        - id
        - docno //this is releationship with master table
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

## API Contracts

### -id ,-created_by, - update_by, - created_at, - update_at. this to be maintained from backend apis

```json
{
  "docno": "string",
  "docdate": "string", // date-time
  "partycode": "integer",
  "amount": "number",
  "subtotal_amount": "number",
  "gst_per": "number",
  "gst_amt": "number",
  "cess_per": "number",
  "cess_amt": "number",
  "roff": "number",
  "mode": "string", // Select Sales/Transfer
  "company_id": "integer",
  "sales_details": [
    {
      "docno": "string",
      "docdate": "string", // date-time
      "prodid": "string",
      "dis_per": "number",
      "dis_amt": "number",
      "mrp": "number",
      "rate": "number",
      "qty": "number",
      "gst_per": "number",
      "gst_amt": "number",
      "cess_per": "number",
      "cess_amt": "number",
      "barcode": "string",
      "company_id": "integer"
    },
    {
      "docno": "string",
      "docdate": "string", // date-time
      "prodid": "string",
      "dis_per": "number",
      "dis_amt": "number",
      "mrp": "number",
      "rate": "number",
      "qty": "number",
      "gst_per": "number",
      "gst_amt": "number",
      "cess_per": "number",
      "cess_amt": "number",
      "barcode": "string",
      "company_id": "integer"
    },
    {
      "docno": "string",
      "docdate": "string", // date-time
      "prodid": "string",
      "dis_per": "number",
      "dis_amt": "number",
      "mrp": "number",
      "rate": "number",
      "qty": "number",
      "gst_per": "number",
      "gst_amt": "number",
      "cess_per": "number",
      "cess_amt": "number",
      "barcode": "string",
      "company_id": "integer"
    }
  ]
}
```

## LOGICs

1. After inserting above into respective tables. need to do below logics

2. if mode is `Transfer` no need to gst calculation . all gst related fields to be post as zero

3. `PartyLedger` table below should affect

   - `id` - `auto increment`
   - `Edate` - `date to be posted`
   - `PartyCode` - `outlet id  to be posted here`
   - `Debit` - column should be post - `sales_master_total_amount`
   - `Credit` - `0`
   - `Type` cloumn should be post - `Sales - bill of docs number`
   - `Mode` to be empty

4. `StockLedger` table below should affect

   - Note: if row does not exsists against `date and prodid` insert new row
   - For a date and prodid only one row should be there.
   - if row exsists update exsisting `sales_in_qty` with `qty` from the sales details contracts row against `date and prodid`

   - if mode is `Transfer`

     - no need to gst calculation . need to update `tr_out_qty` instead of that `sales_in_qty`
     - Note: if row does not exsists against `date and prodid` insert new row
     - For a date and prodid only one row should be there.
     - if row exsists update exsisting `tr_out_qty` with `qty` from the sales details contracts row against `date and prodid`

   - id - `auto increment`
   - date - `date to be posted`
   - prodid - `products ids from sales details`
   - purchase_qty - `0`
   - sale_qty - `0`
   - purchase_return_qty - `0`
   - wastage_qty - `0`
   - adjust_qty - `0`
   - free_qty - `0`
   - sales_in_qty - ` exsisting sales_in_qty` + `qty from the sales details contracts`
   - sales_return_qty - `0`
   - tr_in_qty - `0`
   - tr_out_qty - `0`
   - company_id - `from contracts details`
   - created_by - `users id who are doing the operations`
   - created_at - `date time stamp from backend`
   - updated_by - `users id who are doing the operations`
   - updated_at - `date time stamp from backend`

5. Item/products
   - Balance (Display) - `this to be exsisting balance` - `qty from the purchase details contracts`
6. outlet_products
   - balance_stock - `this to be exsisting balance` + `qty from the purchase details contracts` against outlet_id and prodid/prodcode
7. `OutletStockLedger` table below should affect

   - Note: if row does not exsists against `date and prodid` insert new row
   - For a date and prodid only one row should be there.
   - if row exsists update exsisting `tr_in_qty` with `qty` from the sales details contracts row against `date and prodid` and `outletid`

   - id - `auto increment`
   - date - `date to be posted`
   - prodid - `products ids from sales details`
   - outletid - `this is outlet id`
   - purchase_qty - `0`
   - sale_qty - `0`
   - purchase_return_qty - `0`
   - wastage_qty - `0`
   - adjust_qty - `0`
   - free_qty - `0`
   - sales_in_qty - `0`
   - sales_return_qty - `0`
   - tr_in_qty - ` exsisting tr_in_qty` + `qty from the sales details contracts`
   - tr_out_qty - `0`
   - company_id - `from contracts details`
   - created_by - `users id who are doing the operations`
   - created_at - `date time stamp from backend`
   - updated_by - `users id who are doing the operations`
   - updated_at - `date time stamp from backend`
