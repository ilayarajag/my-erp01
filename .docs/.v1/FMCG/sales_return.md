## Main Tables

```
CREATE TABLE [dbo].[SalRetHdr](
	[SR_ID] [int] NULL,
	[SR_Year] [int] NULL,
	[SR_Date] [datetime] NULL,
	[SR_CustId] [int] NULL,
	[SR_Tot] [decimal](18, 2) NULL,
	[SR_Discount] [decimal](18, 2) NULL,
	[SR_VatCstAmt] [decimal](18, 2) NULL,
	[SR_GTot] [decimal](18, 2) NULL,
	[SR_InvNo] [nvarchar](20) NULL,
	[SR_SalesDocId] [int] NULL,
	[SR_UID] [int] NULL,
	[SR_MUID] [int] NULL,
	[SR_RoundOff] [decimal](18, 2) NULL,
	[SR_ComId] [int] NULL,
	[SR_Type] [int] NULL,
	[SR_AppFlag] [int] NULL,
	[SR_CessAmt] [numeric](10, 2) NULL,
	[SR_SalType] [int] NULL,
	[SR_GSTorIGST] [int] NULL,
	[SR_Remark] [varchar](100) NULL,
	[SR_Verifyid] [int] NULL,
	[Einvoice] [int] NULL,
	[Ackno] [varchar](200) NULL,
	[Ackdate] [datetime] NULL,
	[Irnno] [varchar](500) NULL
) ON [PRIMARY]
GO
```

```
CREATE TABLE [dbo].[SalRetDtl](
	[SRD_ID] [int] NULL,
	[SRD_Year] [int] NULL,
	[SRD_Date] [datetime] NULL,
	[SRD_Slno] [int] NULL,
	[SRD_Prdid] [int] NULL,
	[SRD_batchno] [nvarchar](20) NULL,
	[SRD_expdate] [nvarchar](20) NULL,
	[SRD_ActQty] [decimal](18, 3) NULL,
	[SRD_Qty] [decimal](18, 3) NULL,
	[SRD_ActFree] [decimal](18, 3) NULL,
	[SRD_Free] [decimal](18, 3) NULL,
	[SRD_Dis] [decimal](18, 2) NULL,
	[SRD_DisAmt] [decimal](18, 2) NULL,
	[SRD_Vat] [decimal](18, 2) NULL,
	[SRD_VatAmt] [decimal](18, 2) NULL,
	[SRD_Rate] [decimal](18, 2) NULL,
	[SRD_Amt] [decimal](18, 2) NULL,
	[SRD_ComId] [int] NULL,
	[SRD_SuppID] [int] NULL,
	[SRD_Reason] [int] NULL,
	[SRD_CGST] [numeric](10, 2) NULL,
	[SRD_SGST] [numeric](10, 2) NULL,
	[SRD_Cess] [numeric](10, 2) NULL,
	[SRD_CessAmt] [numeric](10, 2) NULL,
	[SRD_SalType] [int] NULL,
	[SRD_MRP] [numeric](18, 2) NULL,
	[SRD_WHStock] [numeric](12, 3) NULL,
	[SRD_DnE] [numeric](12, 3) NULL
) ON [PRIMARY]
GO
```

## Affected Table

```
CREATE TABLE [dbo].[Partyledger](
	[PL_id] [int] NULL,
	[PL_Did] [int] NULL,
	[PL_Date] [datetime] NULL,
	[PL_Type] [nvarchar](2) NULL,
	[PL_No] [int] NULL,
	[PL_Mode] [int] NULL,
	[PL_Chequeno] [nvarchar](15) NULL,
	[PL_Cdate] [datetime] NULL,
	[PL_Credit] [decimal](18, 2) NULL,
	[PL_Debit] [decimal](18, 2) NULL,
	[PL_Remarks] [nvarchar](max) NULL,
	[PL_PtTyp] [nvarchar](5) NULL,
	[PL_ComId] [int] NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
```

```
CREATE TABLE [dbo].[store_return](
	[outletId] [int] NULL,
	[docid] [int] NULL,
	[docdate] [datetime] NULL,
	[billtype] [int] NULL,
	[billno] [varchar](100) NULL,
	[billdate] [varchar](12) NULL,
	[srid] [int] NULL,
	[prod_code] [varchar](20) NULL,
	[send_qty] [numeric](12, 3) NULL,
	[recd_qty] [numeric](12, 3) NULL,
	[reason] [varchar](200) NULL,
	[reason1] [varchar](200) NULL,
	[flag] [int] NULL,
	[status] [int] NULL,
	[WHStock] [numeric](12, 3) NULL,
	[DnE] [numeric](12, 3) NULL,
	[verifydate] [datetime] NULL,
	[verifyUser] [int] NULL,
	[RejectQty] [numeric](12, 3) NULL,
	[Rjt_Reason] [varchar](100) NULL,
	[batchno] [nvarchar](40) NOT NULL,
	[expdate] [nvarchar](40) NOT NULL,
	[Wid] [int] NULL
) ON [PRIMARY]
GO
```

## REFERANCE SCREENS

**Sales return opening screen**

![Sales return Screen](../ImagesFMCG/Salereturn.png)

**Sales return opening screen**

![Sales return Screen](../ImagesFMCG/Salereturn1.png)

**Sales return opening screen**

![Sales return Screen](../ImagesFMCG/Salereturn2.png)

**Sales return entry screen**

![Sales return Screen](../ImagesFMCG/Salereturn3.png)

**Sales return entry screen**

![Sales return Screen](../ImagesFMCG/Salereturn4.png)

**Sales return save screen**

![Sales return Screen](../ImagesFMCG/Salereturn5.png)


1.  All Screen logics are to done . refer screens

## FEATURES REQUIRED

## LOGICS

- **Type selection** - Direct ,Billwise,Return Verify
- **Direct** return happens (return logic is there)
- **Billwise** - by slect the bills - whole bill is selected - individual item wise
- **Return verification** - return doc no to be listed need to list the accepted items in return verification (return logic is there) - store_retun table `status` is updated to 1

- Partyledger
- **Rule 1**: If any item is not present in the partyledger, then it will be added
- if PL_Credit exsists , then it will be added to PL_Credit .
  - `PL_Credit`
  - `PL_Type` to be `SR` for Sales return
  - `PL_No` - this Doc number (`SR_ID`)
  - `PL_Mode` - `0` to be posted
  - `PL_Chequeno` - `empty` to be posted
  - `PL_Cdate` - `doc date` to be posted
  - `PL_Credit` - `0` to be posted
  - `PL_Remarks` - `Sales Return no (SR_ID)` to be posted
  - `PL_PtTyp` - `C` to be posted
  - `PL_ComId` - `company_id` to be posted









