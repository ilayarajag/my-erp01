# Wastage Module Logics

## Screen

| Doc no | ... |
| Doc Dt | ... |

| Sno | Code | Item | Unit | Qty | Rate  | Amount | Reason |
| --- | ---- | ---- | ---- | --- | ----- | ------ | ------ |
| 1   | xxx  |      |      |     |       |        |        |
| 2   |      |      |      |     |       |        |        |
| ... | ...  | ...  | ...  | ... | ...   | ...    | ...    |
|     |      |      |      |     | Total | xxx    |        |

## Tables

    1. wastage_master
        - id
        - date
        - amount
        - totalQty
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at
    2. wastage_detail
        - id
        - wm_id //this is releationship with master table
        - date
        - prodid
        - qty
        - rate
        - amount
        - reason
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

## API Contracts

### -id ,-created_by, - update_by, - created_at, - update_at. this to be maintained from backend apis

```json
{
  "date": "string", // date-time
  "amount": "number",
  "totalQty": "number",
  "company_id": "integer",
  "wastage_detail": [
    {
      "date": "string", // date-time
      "prodid": "integer",
      "qty": "number",
      "rate": "number",
      "amount": "number",
      "reason": "string"
    },
    {
      "date": "string", // date-time
      "prodid": "integer",
      "qty": "number",
      "rate": "number",
      "amount": "number",
      "reason": "string"
    }
  ]
}
```

## LOGICs

1. After inserting above into respective tables. need to do below logics
2. `StockLedger` table below should affect

   - Note: if row does not exsists against `date and prodid` insert new row
   - For a date and prodid only one row should be there.
   - if row exsists update exsisting wastage_qty row against `date and prodid`

   - id - `auto increment`
   - date - `date to be posted`
   - prodid - `products ids from purchase details`
   - purchase_qty - `0`
   - sale_qty - `0`
   - purchase_return_qty - `0`
   - wastage_qty - `exsisting wastage_qty` + `qty from the purchase details contracts`
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

3. Note : for calulation of amount purchase rate to be consider.
