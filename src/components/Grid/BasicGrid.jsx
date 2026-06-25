import { useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { colDefs as initialColDefs } from '../../data/colDefs.js'
import { postSortSummaryLast } from '../../utils/postSortSummaryLast.js'

function BasicGrid({ rowData, deptSort, onDeptSortChange }) {
    const colDefs = useMemo(
        () =>
            initialColDefs.map((col) => {
                if (col.field !== 'department') return col
                return {
                    ...col,
                    sort: deptSort,
                    comparator: () => 0,
                }
            }),
        [deptSort]
    )

    const onSortChanged = useCallback(
        (event) => {
            const departmentCol = event.api
                .getColumnState()
                .find((c) => c.colId === 'department')
            const nextSort = departmentCol?.sort
            if (nextSort && nextSort !== deptSort) {
                onDeptSortChange(nextSort)
            }
        },
        [deptSort, onDeptSortChange]
    )

    return (
        <div style={{ height: 400, width: '100%' }}>
            <AgGridReact
                rowData={rowData}
                columnDefs={colDefs}
                enableCellSpan={true}
                getRowClass={(params) =>
                    params.data?.isSummary ? 'summary-row' : ''
                }
                postSortRows={postSortSummaryLast}
                onSortChanged={onSortChanged}
            />
        </div>
    )
}

export default BasicGrid
