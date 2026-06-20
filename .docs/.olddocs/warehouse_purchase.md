# Purchase Module Logics

## Tables

    1. purchasemaster
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
        - pono //multiple
        - podate
        - partydc //single
        - outstanding
        - partydcdate
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    2. purchasedetails
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
  "freight_charges": "number", // optional by default 0
  "other_charges": "number", // optional by default 0
  "partydcdate": "string", // date-time
  "partydc": "string",
  "outstanding": "number",
  "company_id": "integer",
  "po_details": [
    {
      "pono": "string",
      "podate": "string" // date-time,
    },
    {
      "pono": "string",
      "podate": "string" // date-time,
    }
  ],
  "purchase_details": [
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
   - company_id - `from contracts details`
   - created_by - `users id who are doing the operations`
   - created_at - `date time stamp from backend`
   - updated_by - `users id who are doing the operations`
   - updated_at - `date time stamp from backend`

5. `purchase_master_ponumbers` table below should affect
   - id
   - purmst_id - `from purchase master ids.`
   - docno
   - docdate
   - pono - `pono ids from po_details contracts`
   - podate - `podate ids from po_details contracts`
   - company_id - `from contracts details`
   - created_by - `users id who are doing the operations`
   - created_at - `date time stamp from backend`
   - updated_by - `users id who are doing the operations`
   - updated_at - `date time stamp from backend`
6. Item/products
   - Balance (Display) - `this to be exsisting balance` + `qty from the purchase details contracts`

