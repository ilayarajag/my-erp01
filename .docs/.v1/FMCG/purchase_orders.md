# Purchase Orders

## Table used:

1. PurchorderHdr
   ```
   CREATE TABLE [dbo].[PurchorderHdr](
   	[PO_ID] [int] NULL,
   	[PO_Year] [int] NULL,
   	[PO_Date] [datetime] NULL,
   	[PO_SuppId] [int] NULL,
   	[PO_InvNo] [varchar](50) NULL, - not used
   	[PO_InvDt] [datetime] NULL, - not used
   	[PO_Expiry] [datetime] NULL,
   	[PO_Status] [int] NULL,
   	[PO_UID] [int] NULL, - created_by
   	[PO_MUID] [int] NULL, - updated_by
   	[PO_ComId] [int] NULL, - company_id
   	[PO_subTot] [numeric](10, 2) NULL,
   	[PO_GSTAmt] [numeric](10, 2) NULL,
   	[PO_Roff] [numeric](10, 2) NULL,
   	[PO_Gtot] [numeric](10, 2) NULL,
   	[PO_CessAmt] [numeric](10, 2) NULL,
   	[PO_MBQRefNo] [int] NULL,
   	[PO_GRN] [int] NULL,  - not used
   	[PO_MStatus] [int] NULL,  - not used
   	[PO_Auto] [int] NULL, - manual -0, auto-1
   	[PO_PORefno] [int] NULL,
   	[PO_time] [datetime] NULL,
   	[PO_Amendment] [int] NOT NULL
   ) ON [PRIMARY]
   GO
   ```
2. PurchorderDtl

```
CREATE TABLE [dbo].[PurchorderDtl](
	[POD_ID] [int] NULL,
	[POD_Year] [int] NULL,
	[POD_Date] [datetime] NULL,
	[POD_Slno] [int] NULL,
	[POD_Prdid] [int] NULL,
	[POD_Stkhold] [decimal](10, 2) NULL,
	[POD_Balance] [decimal](10, 2) NULL,
	[POD_MRP] [decimal](10, 2) NULL,
	[POD_PurRate] [decimal](18, 0) NULL,
	[POD_GST] [decimal](10, 2) NULL,
	[POD_Rate] [decimal](10, 2) NULL,
	[POD_Qty] [decimal](10, 2) NULL,
	[POD_Amt] [decimal](10, 2) NULL,
	[POD_ComId] [int] NULL,
	[POD_SuppID] [int] NULL,
	[POD_RecQty] [numeric](10, 2) NULL,
	[POD_GSTAmt] [numeric](10, 2) NULL,
	[POD_CGST] [numeric](10, 2) NULL,
	[POD_SGST] [numeric](10, 2) NULL,
	[POD_CSS] [numeric](10, 2) NULL,
	[POD_CessAmt] [numeric](10, 2) NULL,
	[POD_CaseQty] [int] NULL,
	[POD_orderQty] [decimal](10, 2) NULL,
	[POD_Cushion] [decimal](10, 2) NULL
) ON [PRIMARY]
GO
```

## REFERANCE SCREENS

**PO opening screen**
![PO Screen](../ImagesFMCG/purchase%20order.png)

**PO saving screen**
![PO Screen](../ImagesFMCG/purchase%20order%201.png)

## LOGICs

1. List out all the products againt supplier by sleecting supplier
2. Po expiry to be selected - date
3. Po date to be selected - date
4. Mrp , Rate can be editable
5. When Qty is entered, Loose qty to be calculated base on Case qty feed in product master
6. Excel Import option - prod_code, qty in excel column. that should be populated in screen. remaing proceed with exsting logic in screen
7. List out all the POs that is expired . by selecting this po they can generate new POs . referance PO to be expired
8. PO print out to be done -> Loose Qty is Original Qty when print out
