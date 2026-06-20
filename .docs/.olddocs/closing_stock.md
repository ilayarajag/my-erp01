# Closing Stock Module Logics

## Screen

| Date | ... |

| Sno | Code | Item | Qty |
| --- | ---- | ---- | --- |
| 1   | xxx  |      |     |
| 2   |      |      |     |
| ... | ...  | ...  | ... |
|     |      |      |     |

## Tables

    1. closing_stock
        - id
        - docdate
        - prodid
        - physical_qty
        - computer_qty
        - purchase_rate
        - sales_rate
        - mrp
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
    "docdate": "string", // date-time
    "prodid": "integer",
    "physical_qty": "number",
    "computer_qty": "number",
    "purchase_rate": "number",
    "sales_rate": "number",
    "mrp": "number",
    "company_id": "integer"
  },
  {
    "docdate": "string", // date-time
    "prodid": "integer",
    "physical_qty": "number",
    "computer_qty": "number",
    "purchase_rate": "number",
    "sales_rate": "number",
    "mrp": "number",
    "company_id": "integer"
  }
]
```

## LOGICs

1. when inserting per date per prodid only one should be there
2. check given date exisits in table or not
3. if given date exsists in table , dont need to insert. need throw custom error.
4. if given date does not exsists, then need to check whether given date should be greater than exsisting table date.
5. if given date less than table date ,need throw custom error.
6. otherwise need insert.
