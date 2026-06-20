# Payment Module Logics

## Tables

    1. payment_master
        - id
        - date
        - supplierid
        - mode
        - amount
        - chequeno
        - chequedate
        - bank
        - discount
        - refno
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at



    2. payment_detail
        - id
        - pm_id //this is releationship with master table
        - date
        - invoice_no
        - amount
        - pending_amount
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

## API Contracts

### -id ,-created_by, - update_by, - created_at, - update_at. this to be maintained from backend apis

```json
{
  "date": "string",
  "supplierid": "integer",
  "mode": "integer",
  "amount": "number",
  "chequeno": "string",
  "chequedate": "string", // date-time
  "bank": "string",
  "discount": "number",
  "refno": "string",
  "company_id": "integer",
  "payment_details": [
    {
      "invoice_no": "string",
      "date": "string", // date-time
      "amount": "string",
      "pending_amount": "number",
      "company_id": "integer"
    },
    {
      "invoice_no": "string",
      "date": "string", // date-time
      "amount": "string",
      "pending_amount": "number",
      "company_id": "integer"
    }
  ]
}
```

## LOGICs

1. After inserting above into respective tables. need to update `customer/suppliers` table `balance` column
2. Formula:
   `new_balance = exsisting_balance - payment_master_total_amount`
3. `PartyLedger` table below should affect
   - `id` - `auto increment`
   - `Edate` - `date to be posted`
   - `PartyCode` - `this is supplier/party id or code`
   - `Debit` - `0`
   - `Credit` - column should be post - `payment_master_total_amount`
   - `Type` cloumn should be post - `Payment - bill of docs number`
   - `Mode` to be empty
4. purchase_master outstansdding to be added against invoice_no/doc_no in payment_details
