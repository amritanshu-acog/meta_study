# Metastudy Creation Platform

## Project Overview

The Metastudy Creation Platform is a comprehensive web application designed to streamline the process of creating and managing meta-analyses across scientific studies. The platform provides an intuitive, step-by-step workflow for researchers to combine and harmonize data from multiple studies.

## Key Features

- Interactive landing page with study exploration
- Flexible study selection and pooling mechanism
- Detailed metadata mapping
- Cell type mapping and harmonization
- Comprehensive review and save functionality

## User Journey and Workflow

### 1. Landing Page

#### Components:
- Search Box
- Explore Available Metastudies Section

**Functionality:**
- Users can search for existing studies
- Browse available metastudies
- Navigate to study selection page

### 2. Study Selection and Pooling

#### Workflow:
1. Explore available studies
2. Select specific studies or diseases
3. View detailed study list
4. Add studies to pool via individual study cards

**Key Interaction:**
- Each study card has a "Add to Pool" button
- Multiple studies can be added flexibly
- Proceed to pool review page

### 3. Pool Review Page

#### Components:
- Selected Studies List
- Comprehensive Metadata Table
  - Rows: Individual studies
  - Columns: Detailed metadata and values

### 4. Metastudy Creation Process

#### 4.1 Metadata Mapping

**Mapping Options:**
1. Automatic Mapping
   - If all metadata names and values are identical
   - Option to skip manual mapping

2. Manual Mapping Workflow
   - Identify discrepancies in metadata
   - Define comparator variables
   - Create mapping variables

##### Mapping Interface:
- Table with columns:
  - Study Name
  - Original Metadata
  - Mapping Variable Names
  - Unmapped Values

**Interaction:**
- Drag and drop unmapped values
- Save mappings for each comparator variable

### 5. Cell Type Mapping

#### Workflow:
1. Select Cell Type Level
2. Generate Cell Type Table
3. Mapping Decision Point

**Mapping Interface:**
- Draggable cell type cards
- Color-coded legend differentiating studies
- Ability to:
  - Rename cards
  - Delete empty cards
  - Drag and drop cell types across studies

### 6. Metastudy Review and Save

#### Components:
- Mapping Review Page
- Summary Statistics
  - Number of genes
  - Number of cohorts
  - Sample information

**Save Functionality:**
- Save entire metastudy configuration
- Redirect to summary page
- Preserve comparator variables and mappings

## Technical Considerations

### Recommended Technologies
- Frontend: React.js
- State Management: Redux/Context API
- Drag and Drop: react-beautiful-dnd
- Styling: Tailwind CSS

### Key Technical Challenges
- Flexible metadata mapping
- Intuitive drag and drop interfaces
- Complex state management
- Scalable data handling

## Future Roadmap
- Advanced filtering mechanisms
- Enhanced visualization tools
- Integration with research databases
- Collaborative study creation features

## User Experience Principles
- Intuitive navigation
- Minimal cognitive load
- Flexible mapping processes
- Comprehensive data review

## Accessibility Considerations
- Keyboard navigable interfaces
- Color-blind friendly design
- Screen reader compatibility

## Performance Optimization
- Lazy loading of study data
- Efficient state updates
- Minimized re-renders

## Security Considerations
- Data anonymization
- Secure storage of research metadata
- Role-based access control

## Conclusion
The Metastudy Creation Platform aims to revolutionize meta-analysis by providing a user-friendly, flexible tool for researchers to harmonize and explore complex scientific datasets.