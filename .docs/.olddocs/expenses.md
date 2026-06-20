# Expenses Module Logics

## Tables

    1. expenses
        - id
        - docno
        - docdate
        - accid
        - amount
        - remarks
        - company_id
        - created_by
        - updated_by
        - created_at
        - updated_at

    2. expenses_ledger
        - id
        - edate
        - accid
        - amount
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
  "accid": "integer",
  "amount": "number",
  "remarks": "string",
  "company_id": "integer"
}
```

## LOGICs

1. when inserting need to consider below logic
   - in `expenses` table per date per accid has multiple rows.
   - in `expenses_ledger` - when inserting into ledger, need to group by `expenses`- table `amount` column by accid,date
     and then
     if rows does not exsists on `expenses_ledger` against per date per accid then need to insert
     otherwise
     need to update amount against date , accid
