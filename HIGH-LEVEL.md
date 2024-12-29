# Multi-Study Analysis Platform - Documentation

## Overview

The **Multi-Study Analysis Platform** facilitates the selection, pooling, and mapping of studies to create metastudies. It includes functionality for metadata and cell type mapping, enabling seamless integration and visualization of multi-study data. The platform supports creating comparator variables, generating mapping variables, and reviewing all mappings before saving the metastudy.

---

## Workflow

### 1. **Landing Page**

- **Search Box**: Users can search for studies or diseases.
- **Explore Available Metastudies**: Redirects to a page with metastudies cards.

---

### 2. **Study Selection**

- After selecting a study or disease, users are redirected to a page listing all studies related to their selection.

---

### 3. **Pool Creation**

- **Adding Studies**: Each study card has a button to set the pipeline selection and add the study to the pool.
- **No Limit**: Users can add as many studies as desired.
- **Proceed**: After creating the pool, users proceed to a page displaying:
  - A list of selected studies.
  - A table where: studies with the metadata and values are shown.

---

### 4. **Metastudy Creation**

#### Decision: To Map or Not to Map

- **If "No"**: All metadata values are identical, so mapping is not needed.
- **If "Yes"**: Mapping is required due to discrepancies in metadata values across studies.

#### Mapping Process

1.  **Write Comparator Variables**:
    - Users define comparator variable names.
    - Switch between comparator variable values for mapping.
2.  **Create Mapping Variables**:
    - New mapping variables are named by the user.
    - These act as the metadata source for visualizations and tables.
3.  **Mapping Table**:
    - Columns:
      - Study name.
      - Original metadata.
      - Mapping variable names.
      - Unmapped values.
    - Users drag and drop unmapped values to complete the mapping.
    - Click "Save" to store mapping variables under the selected comparator variable.
4.  **Additional Mapping**:
    - Users can map new comparator variables while retaining previous mappings.

---

### 5. **Cell Type Mapping**

#### Selection and Generation

1.  **Cell Type Level Selection**:
    - Users select a cell type level and click "Generate."
2.  **Generated Table**:
    - Displays available cell types under the selected level for each study.

#### Mapping Process

- **Decision**:
  - **If "No"**: Proceed without mapping.
  - **If "Yes"**: Map cell types across studies.
- **Mapping Interface**:
  - Cell types from each study appear as draggable cards.
  - Drag and drop values to group cell types under unified names.
  - A color-coded legend differentiates studies and cell types.
  - Features:
    - Delete empty cards.
    - Rename cards containing values.

---

### 6. **Review and Save**

- **Review Mappings**:
  - Verify all metadata and cell type mappings.
- **Save Metastudy**:
  - Save the metastudy and view:
    - Study metadata in a tabular format (e.g., genes, cohorts, samples).
    - Comparator variables and their mappings.

---

## Key Components

### 1. **Metadata Mapping**

- Ensures consistency across studies.
- Comparator variables and mapping variables act as sources for visualization.

### 2. **Cell Type Mapping**

- Allows grouping and standardization of cell types across studies.
- Simplifies downstream analysis and visualization.

### 3. **Visualization and Data Representation**

- Tabular display of metadata.
- Clear representation of mappings.

---

## Future Sections

Details about the **Explore** and **Observation** sections will be provided later.





# Data Visualization Workflows

## 1. Cell Dot Plot

### Purpose

The Cell Dot Plot visualizes the proportions of cell types across a selected pool of studies, based on user-defined split criteria such as "before," "after," or "healthy."

### Workflow

#### Study Pool Creation

- User selects a pool of studies within a metastudy

#### Comparator and Filter Selection

1. Navigate to Explorer
2. Select comparator variable (e.g., Group, Compare)
3. Select cell type level (Fine or Broad)
4. Apply filters to fetch required data

#### Comparison Selection

- Select basis for comparison from predefined splits

#### Plot Rendering

- **Dot Size**: Scaled proportion of selected cell type
- **Dot Color**: Log-transformed ratio of cell proportions between disease and control samples

### Backend Requirements

**Endpoint**: `/api/cellproportion`

**Query Parameters**:

- `comparator_variable`: Chosen comparator variable
- `cell_type_level`: Selected cell type level

**Response Structure**:

```json
[
  {
    "study_id": "study1",
    "cell_type": "Memory B cells",
    "cell_prop_control": 0.15,
    "cell_prop_disease": 0.25
  }
]
```

### Data Transformation

- **Dot Size**: `(cell_prop_control / ranged) + 0.2`
- **Dot Color**: `log2(cell_prop_disease / cell_prop_control)`

## 2. Gene Expression Dot Plot

### Purpose

Visualizes the expression and significance of a user-selected gene across studies and cell types.

### Workflow

#### Study Pool Creation

- User selects studies within a metastudy

#### Comparator and Filter Selection

1. Navigate to Explorer
2. Select comparator variable
3. Select cell type level
4. Apply filters to fetch data

#### Gene Selection

- Select specific gene from dropdown of available genes

#### Plot Rendering

- **Dot Size**: Significance of gene (based on p-value)
- **Dot Color**: Log2 fold change of gene expression

### Data Structure

```json
{
  "Monocytes": {
    "gene": ["gene1", "gene2", "gene3"],
    "pvalue": [0.02, 0.21, 0.22],
    "log2FoldChange": [0.8, 0.7, 1.0]
  }
}
```

### Backend Requirements

**Endpoint**: `/api/geneexpression`

**Query Parameters**:

- `comparator_variable`: Chosen comparator variable
- `cell_type_level`: Selected cell type level

## 3. Differential Gene Expression (DGE) Analysis

### Purpose

Visualizes differential gene expression across studies and cell types.

### Workflow

#### Comparator and Filter Selection

1. Navigate to Explorer
2. Select comparator variable
3. Select cell type level
4. Apply filters to fetch data

#### Data Fetching

- Retrieve key parameters: log2FoldChange, pvalue, padj, gene

#### Plot Rendering

- Visualize differential expression (e.g., volcano plots)

### Data Structure

```json
{
  "baseMean": [10.5, 20.3, 50.1, 30.2],
  "log2FoldChange": [1.2, -0.5, 2.1, 0.8],
  "pvalue": [0.01, 0.05, 0.001, 0.2],
  "padj": [0.02, 0.1, 0.002, 0.3],
  "gene": ["Gene1", "Gene2", "Gene3", "Gene4"]
}
```

### Backend Requirements

**Endpoint**: `/api/dge-analysis`

**Query Parameters**:

- `comparator_variable`: Chosen comparator variable
- `cell_type_level`: Selected cell type level
- `cell_type`: Selected cell type (e.g., Bcells)


## DGE (Differential Gene Expression) Analysis API

### Overview

The DGE analysis involves two main API calls:

1. **Filters API**: Retrieves the available filter options and posts the selected filter values.
2. **Data API**: Retrieves the data based on the selected filters.

### 1. Filters API

#### Endpoint: `GET /api/filters`

- **Description**: Fetches the available filter options for DGE analysis.
- **Response**:
  - A list of available filter values for the following fields:
    - **Comparator**
    - **Comparison**
    - **Cell Type Level**
    - **Cell Type**

#### Endpoint: `POST /api/filters`

- **Description**: Submits the selected filter values.
- **Request Body**:
  ```json
  {
    "comparator": "example_comparator",
    "comparison": "example_comparison",
    "cellTypeLevel": "example_level",
    "cellType": "example_cell_type"
  }
2. Data API
Endpoint: GET /api/data
Description: Retrieves the DGE analysis data based on the selected filters.
Response: A list of study data with the following structure:
json
Copy code
[
  {
    "studyName": "JD-32-178",
    "data": {
      "log2FoldChange": [/* Array of log2 fold change values */],
      "pvalue": [/* Array of p-value values */],
      "negativeLog10Pvalue": [/* Array of -log10 p-value values */],
      "gene": [/* Array of gene names */]
    }
  },
  {
    "studyName": "KD-127",
    "data": {
      "log2FoldChange": [/* Array of log2 fold change values */],
      "pvalue": [/* Array of p-value values */],
      "negativeLog10Pvalue": [/* Array of -log10 p-value values */],
      "gene": [/* Array of gene names */]
    }
  }
]