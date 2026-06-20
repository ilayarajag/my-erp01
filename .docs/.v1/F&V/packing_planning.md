## Main Table

```
CREATE TABLE [dbo].[PlanningFVHdr](
[PL_id] [int] NOT NULL,
[PL_Year] [int] NULL,
[PL_ComId] [int] NULL,
[PL_date] [datetime] NULL,
[PL_UId] [int] NULL,
[PL_Batchno] [varchar](200) NULL,
[PL_Prodid] [int] NULL,
[PL_Qty] [numeric](9, 3) NULL,
[PL_GRNNo] [varchar](max) NULL,
[PL_Flag] [int] NULL,
[PL_GRNQty] [numeric](9, 3) NULL,
[PL_PreQty] [numeric](9, 3) NULL,
[PL_BalDtl] [varchar](100) NULL,
[PL_TotWeight] [numeric](18, 3) NULL,
[PL_PackType] [int] NULL,
[PL_PackedQty] [numeric](18, 3) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
```

```
CREATE TABLE [dbo].[PlanningFVDtl](
	[PD_id] [int] NOT NULL,
	[PD_Year] [int] NOT NULL,
	[PD_ComId] [int] NOT NULL,
	[PD_Slno] [int] NULL,
	[PL_ProdId] [int] NULL,
	[PL_Qty] [numeric](18, 2) NULL,
	[PD_Weight] [numeric](18, 3) NULL
) ON [PRIMARY]
GO
```

## Affected Table

## Referance screens

**Packing Planning opening screen**

![Packing Planning Screen](../ImagesF&V/PackingPlanning.png)

**Packing Planning save screen**

![Packing Planning Screen](../ImagesF&V/PackingPlanning1.png)


## Features

## Logics

1. List all bulk item in the product master table as drop down list . (parent product)
2. Load all child products in data grid.
3. then feed the Qty in the data grid table.
4. If the total weight of child product is matched with the total weight of parent product then the button will enable for saving
5. Direct posting to the table
6. In the GRN deatils (`PurchaseDtl`) `PD_Packqty` this to be updated
