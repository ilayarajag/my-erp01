## Main Tables

```
  CREATE TABLE [dbo].[PurchaseMemoHdr](
  	[PM_ID] [int] NULL,
  	[PM_Year] [int] NULL,
  	[PM_Date] [datetime] NULL,
  	[PM_SuppId] [int] NULL,
  	[PM_GTot] [numeric](10, 3) NULL,
  	[PM_InvNo] [nvarchar](30) NULL,
  	[PM_UID] [int] NULL,
  	[PM_MUID] [int] NULL,
  	[PM_PayStat] [int] NULL,
  	[PM_ComId] [int] NULL,
  	[PM_InvDt] [datetime] NULL,
  	[PM_Remark] [varchar](200) NULL,
  	[PM_PO] [varchar](max) NULL,
  	[PM_ReturnAmt] [numeric](18, 2) NULL,
  	[PM_ReturnRemark] [varchar](200) NULL,
  	[PM_Tot] [numeric](10, 3) NULL,
  	[PM_Discount] [numeric](10, 3) NULL,
  	[PM_VatCstAmt] [numeric](10, 3) NULL,
  	[PM_RoundOff] [numeric](10, 3) NULL,
  	[PM_Others] [numeric](10, 3) NULL,
  	[PM_GSTorIGST] [numeric](10, 3) NULL,
  	[PM_Advance] [numeric](10, 3) NULL,
  	[PM_CessAmt] [numeric](10, 2) NULL,
  	[PM_LessAmt] [numeric](10, 2) NULL,
  	[PM_FVType] [int] NULL,
  	[PM_Tcs] [numeric](18, 3) NULL,
  	[PM_DCNo] [varchar](100) NULL
  ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
  GO
```

```
CREATE TABLE [dbo].[PurchaseMemoDtl](
	[PD_ID] [int] NULL,
	[PD_Year] [int] NULL,
	[PD_Date] [datetime] NULL,
	[PD_Slno] [int] NULL,
	[PD_Prdid] [int] NULL,
	[PD_batchno] [nvarchar](20) NULL,
	[PD_expdate] [nvarchar](20) NULL,
	[PD_Qty] [decimal](18, 3) NULL,
	[PD_Free] [decimal](18, 3) NULL,
	[PD_Dis] [decimal](18, 2) NULL,
	[PD_DisAmt] [numeric](10, 3) NULL,
	[PD_Vat] [decimal](18, 2) NULL,
	[PD_VatAmt] [numeric](10, 3) NULL,
	[PD_Rate] [numeric](10, 3) NULL,
	[PD_Amt] [numeric](10, 3) NULL,
	[PD_ComId] [int] NULL,
	[PD_SuppID] [int] NULL,
	[PD_PONO] [int] NULL,
	[pd_AMargin] [numeric](10, 2) NULL,
	[PD_SalRate] [numeric](10, 2) NULL,
	[PD_MRP] [numeric](10, 2) NULL,
	[PD_CGST] [numeric](10, 2) NULL,
	[PD_SGST] [numeric](10, 2) NULL,
	[PD_CSS] [numeric](10, 2) NULL,
	[PD_CessAmt] [numeric](10, 2) NULL,
	[PD_POQty] [numeric](18, 3) NULL,
	[PD_Packflag] [int] NULL,
	[PD_Packqty] [numeric](9, 3) NULL,
	[PD_SLEQty] [numeric](18, 3) NULL,
	[PD_RetQty] [numeric](18, 3) NULL
) ON [PRIMARY]
GO
```

```
CREATE TABLE [dbo].[PurchaseMemoDtl](
	[PD_ID] [int] NULL,
	[PD_Year] [int] NULL,
	[PD_Date] [datetime] NULL,
	[PD_Slno] [int] NULL,
	[PD_Prdid] [int] NULL,
	[PD_batchno] [nvarchar](20) NULL,
	[PD_expdate] [nvarchar](20) NULL,
	[PD_Qty] [decimal](18, 3) NULL,
	[PD_Free] [decimal](18, 3) NULL,
	[PD_Dis] [decimal](18, 2) NULL,
	[PD_DisAmt] [numeric](10, 3) NULL,
	[PD_Vat] [decimal](18, 2) NULL,
	[PD_VatAmt] [numeric](10, 3) NULL,
	[PD_Rate] [numeric](10, 3) NULL,
	[PD_Amt] [numeric](10, 3) NULL,
	[PD_ComId] [int] NULL,
	[PD_SuppID] [int] NULL,
	[PD_PONO] [int] NULL,
	[pd_AMargin] [numeric](10, 2) NULL,
	[PD_SalRate] [numeric](10, 2) NULL,
	[PD_MRP] [numeric](10, 2) NULL,
	[PD_CGST] [numeric](10, 2) NULL,
	[PD_SGST] [numeric](10, 2) NULL,
	[PD_CSS] [numeric](10, 2) NULL,
	[PD_CessAmt] [numeric](10, 2) NULL,
	[PD_POQty] [numeric](18, 3) NULL,
	[PD_Packflag] [int] NULL,
	[PD_Packqty] [numeric](9, 3) NULL,
	[PD_SLEQty] [numeric](18, 3) NULL,
	[PD_RetQty] [numeric](18, 3) NULL
) ON [PRIMARY]
GO
```

```
CREATE TABLE [dbo].[PurBatchMemoDtl](
	[PB_PurId] [int] NULL,
	[PB_Date] [datetime] NULL,
	[PB_Prdid] [int] NULL,
	[PB_batchno] [nvarchar](20) NULL,
	[PB_expdate] [nvarchar](20) NULL,
	[PB_Qty] [decimal](18, 3) NULL,
	[PD_Year] [int] NULL,
	[PD_ComId] [int] NULL,
	[PB_Mnfdate] [datetime] NULL,
	[PB_ExpMonth] [int] NULL,
	[PB_MnthDay] [int] NULL,
	[PB_SLEQty] [numeric](18, 3) NULL,
	[PB_RetQty] [numeric](18, 3) NULL
) ON [PRIMARY]
GO
```

## Affted Tables

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
CREATE TABLE [dbo].[Trayledger](
	[Tl_Date] [datetime] NULL,
	[TL_CustId] [int] NULL,
	[TL_RecQty] [int] NULL,
	[TL_IssQty] [int] NULL,
	[TL_TrayID] [int] NULL,
	[TL_WasteQty] [int] NULL,
	[TL_Opening] [int] NULL,
	[TL_Balance] [int] NULL,
	[TL_ComId] [int] NULL,
	[TL_Year] [int] NULL,
	[TL_Type] [int] NULL
) ON [PRIMARY]
GO
```

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

```
CREATE TABLE [dbo].[MobPurchse](
	[MP_CusId] [int] NULL,
	[MP_PurchseOrderNo] [varchar](100) NULL,
	[MP_Date] [varchar](100) NULL,
	[MP_ProdId] [varchar](100) NULL,
	[MP_BatchNo] [varchar](100) NULL,
	[MP_ExpDate] [varchar](100) NULL,
	[MP_Qty] [varchar](100) NULL,
	[MP_Mrp] [varchar](100) NULL,
	[MP_MrpCp] [varchar](100) NULL,
	[MP_ManufDate] [varchar](100) NULL,
	[MP_Uid] [varchar](100) NULL,
	[MP_Srno] [int] NULL,
	[MP_SLEQty] [numeric](18, 3) NULL,
	[MP_Status] [int] NOT NULL,
	[MP_StartDt] [datetime] NULL,
	[MP_EndDt] [datetime] NULL,
	[MP_ExpMonth] [varchar](255) NOT NULL,
	[MP_ExpDay] [varchar](255) NOT NULL,
	[MP_RetQty] [numeric](18, 3) NOT NULL
) ON [PRIMARY]
GO
```

```
CREATE TABLE [dbo].[MobPurchse1](
	[MP_CusId] [int] NULL,
	[MP_PurchseOrderNo] [varchar](100) NULL,
	[MP_Date] [varchar](100) NULL,
	[MP_ProdId] [varchar](100) NULL,
	[MP_BatchNo] [varchar](100) NULL,
	[MP_ExpDate] [varchar](100) NULL,
	[MP_Qty] [varchar](100) NULL,
	[MP_Mrp] [varchar](100) NULL,
	[MP_MrpCp] [varchar](100) NULL,
	[MP_ManufDate] [varchar](100) NULL,
	[MP_Uid] [varchar](100) NULL,
	[MP_Srno] [int] NULL,
	[MP_SLEQty] [numeric](18, 3) NULL,
	[MP_Status] [int] NOT NULL,
	[MP_StartDt] [datetime] NULL,
	[MP_EndDt] [datetime] NULL,
	[MP_ExpMonth] [varchar](255) NOT NULL,
	[MP_ExpDay] [varchar](255) NOT NULL,
	[MP_RetQty] [numeric](18, 3) NOT NULL
) ON [PRIMARY]
GO
```

```
ProductMaster
```

## REFERANCE SCREENS

**PO memo opening screen**
![PO memo](../ImagesFMCG/purchase%20memo.png)

**PO memo batch screen**
![PO memo](../ImagesFMCG/purchase%20memo%201.png)

**PO memo entry screen**
![PO Approval](../ImagesFMCG/purchase%20memo%202.png)

**PO memo save screen**
![PO memo ](../ImagesFMCG/purchase%20memo%203.png)

**PO memo save screen**
![PO memo](../ImagesFMCG/purchase%20memo%204.png)

## LOGICs

1. Select the supplier
2. List all the POs against supplier
3. Then select one of the Pos . list out the all po items in the grid
4. comapare first two of GST No of supplier and our company
5. if does not match then bill is IGST else GST
6. if supplier dont have GST No that is to be GST
7. When save BillNO/DC no column is must
8. when save Batch no to filled based on product has batch no setting is yes
9. based on expriy date configure in product master , expiery days/month to be calculate
10. this expiry days/month should be update againts products
11. return qty to be feed is some of the qty does not accepted/damage/self life days does not meets with expiry days.
12. self life days to be maintained. that is to be update against product master
13. data posted table-
    - PurchaseMemoHdr
    - PurchaseMemoDtl
    - PurBatchMemoDtl
    - PurchorderHdr
      - PO_Status `to be update as 2`
      - PO_GRN `Here memo no(PM_ID in PurchaseMemoHdr) to be update as GRN no`
    - PurchorderDtl
      - POD_RecQty `received Qty`
    - StockLedger
      - Rule: per day against one product row should be there in StockLedger
      - SL_PurQty `if no record, insert  against date. if there is record update the SL_PurQty against date`
      - SL_PurRetQty `if no record, insert  against date. if there is record update the SL_PurRetQty against date ` -`(if return qty is there)`
    - Trayledger
      - Rule: per day against one product row should be there in Trayledger
      - SL_PurQty `if no record, insert  against date. if there is record update the TL_RecQty against date`

## Ref Queries

- select \* from [dbo].[PurchaseMemoHdr]
- select \* from [dbo].[PurchaseMemoDtl]
- select \* from [dbo].[PurchaseTrayMemoDtl]
- select \* from [dbo].[PurBatchMemoDtl]
- select \* from [dbo].[StockLedger]
- select \* from [dbo].[Trayledger]
- select \* from [dbo].[MobPurchse]
