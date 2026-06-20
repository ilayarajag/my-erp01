## Main Table

<!-- CREATE TABLE [dbo].[ProductPlanMst](
[PMD_ID] [int] NULL,
[PMD_Srlno] [int] NULL,
[PMD_MatId] [int] NULL,
[PMD_Qty] [numeric](18, 5) NULL,
[PMD_UOM] [varchar](50) NULL,
[PMD_FullQty] [numeric](18, 5) NULL,
[PMD_PrdQty] [numeric](18, 5) NULL,
[PMD_ComId] [int] NULL,
[PMD_Temp] [numeric](10, 2) NULL
) ON [PRIMARY]
GO -->

```
CREATE TABLE ProductPlanMst(
    PMD_ID SERIAL PRIMARY KEY,
    PMD_ComId INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    updated_by INTEGER NOT NULL
);


CREATE TABLE ProductPlanMstDtl (
    ID SERIAL PRIMARY KEY,
    PMD_ID INT NOT NULL,
    PMD_Srlno INT NULL,
    PMD_MatId INT NULL,
    PMD_Qty NUMERIC(18, 5) NULL,
    PMD_UOM VARCHAR(50) NULL,
    PMD_FullQty NUMERIC(18, 5) NULL,
    PMD_PrdQty NUMERIC(18, 5) NULL,
    PMD_ComId INT NULL,
    PMD_Temp NUMERIC(10, 2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    updated_by INTEGER NOT NULL
);
```

## Affected Table

## LOGICS

- Select Product master list
- List the product master list with BATCH PLANNING column is 1
- Crud Operations
