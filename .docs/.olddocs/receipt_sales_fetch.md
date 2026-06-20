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

## API Contracts

### -id ,-created_by, - update_by, - created_at, - update_at. this to be maintained from backend apis

```json
[
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
    "company_id": "integer"
  },
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
    "company_id": "integer"
  }
]
```

## LOGICs

1. Fetch all the payment master against supplier_id or party_code
2. These to be fetched based on follwing condition
   - ammount > outstanding
3. To be paid amount = amount-outstanding
