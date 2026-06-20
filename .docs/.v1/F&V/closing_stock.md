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

## Affeccted table

```

CREATE TABLE [dbo].[StockLedger](
[SL_Date] [datetime] NULL,
[SL_items] [int] NULL,
[SL_batchno] [nvarchar](20) NULL,
[SL_expdate] [nvarchar](20) NULL,
[SL_PurQty] [decimal](18, 3) NULL,
[SL_SalQty] [decimal](18, 3) NULL,
[SL_WastQty] [decimal](18, 3) NULL,
[SL_SalRetQty] [decimal](18, 3) NULL,
[SL_PurRetQty] [decimal](18, 3) NULL,
[SL_UID] [int] NULL,
[SL_MUID] [int] NULL,
[SL_ComId] [int] NULL,
[SL_StkCorrQty] [numeric](10, 3) NULL,
[SL_StkcorrFlag] [int] NULL,
[SL_SCDate] [date] NULL,
[SL_SCUid] [int] NULL,
[SL_DCRetQty] [numeric](9, 3) NULL,
[SL_Closing] [numeric](18, 3) NULL,
[SL_MultiUnit] [int] NULL
) ON [PRIMARY]
GO
```

```
CREATE TABLE [dbo].[FVWastagehdr](
	[W_ID] [int] NULL,
	[W_Year] [int] NULL,
	[W_Date] [datetime] NULL,
	[W_Tot] [numeric](9, 2) NULL,
	[W_VatCstAmt] [numeric](9, 2) NULL,
	[W_GTot] [numeric](9, 2) NULL,
	[W_UID] [int] NULL,
	[W_MUID] [int] NULL,
	[W_RoundOff] [numeric](9, 2) NULL,
	[W_ComId] [int] NULL,
	[W_PGTot] [numeric](9, 2) NULL,
	[W_Others] [numeric](9, 2) NULL,
	[W_DelStat] [int] NULL,
	[W_Remark] [varchar](200) NULL
) ON [PRIMARY]
GO
```

```
CREATE TABLE [dbo].[FVWastagedtl](
	[WD_ID] [int] NULL,
	[WD_Year] [int] NULL,
	[WD_Date] [datetime] NULL,
	[WD_Slno] [int] NULL,
	[WD_Prdid] [int] NULL,
	[WD_batchno] [nvarchar](200) NULL,
	[WD_expdate] [nvarchar](100) NULL,
	[WD_Qty] [numeric](9, 2) NULL,
	[WD_Dis] [numeric](9, 2) NULL,
	[WD_DisAmt] [numeric](9, 2) NULL,
	[WD_Vat] [numeric](9, 2) NULL,
	[WD_VatAmt] [numeric](9, 2) NULL,
	[WD_Rate] [numeric](9, 2) NULL,
	[WD_Amt] [numeric](9, 2) NULL,
	[WD_ComId] [int] NULL,
	[WD_PRate] [numeric](9, 2) NULL,
	[WD_PAmt] [numeric](9, 2) NULL,
	[WD_SuppID] [int] NULL,
	[WD_Reason] [int] NULL,
	[WD_Tray] [int] NULL,
	[WD_Traycount] [int] NULL
) ON [PRIMARY]
GO
```

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

## Featured required

1. Excel import (prod_qty,prod_code)

## LOGICs

1. when inserting per date per prodid only one should be there
2. check given date exisits in table or not
3. if given date exsists in table , dont need to insert. need throw custom error.
4. if given date does not exsists, then need to check whether given date should be greater than exsisting table date.
5. if given date less than table date ,need throw custom error.
6. otherwise need insert.
7. **StockLedger** - Logic to be done (`SL_StkCorrQty`) `SL_StkCorrQty`=`physical_qty` ~ `computer_qty`
8. **StockLedger** - `SL_StkcorrFlag -1`,`SL_SCDate (datetime)`,`SL_SCUid (user id)`
9. Wastage header details post operation with stock ledger logic given in wastage module
