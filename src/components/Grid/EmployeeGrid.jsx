import { useCallback, useEffect, useMemo, useRef } from 'react'
import BasicGrid from './BasicGrid.jsx'
import { employeeColDefs } from '../../data/employeeColDefs.js'
import { postSortSummaryLast } from '../../utils/postSortSummaryLast.js'

const STATUS_OPTIONS = ['승인대기', '승인완료', '반려']

/**
 * 경비(직원) 표 전용 그리드 — employeeColDefs·부서 정렬·합계 행·편집 등
 */
function EmployeeGrid({
    rowData,
    deptSort,
    secondaryField,
    secondarySort,
    onSortChange,
    isEditing = false,
    onCellEdit,
    defaultColDef,
}) {
    const gridRef = useRef(null)

    useEffect(() => {
        if (!isEditing) {
            gridRef.current?.api?.stopEditing()
        }
    }, [isEditing])

    const columnDefs = useMemo(
        () =>
            employeeColDefs.map((col) => {
                const def = {
                    ...col,
                    comparator: () => 0,
                    editable: false,
                }
                if (col.field === 'department') {
                    def.sort = deptSort
                } else if (col.field === secondaryField && secondarySort) {
                    def.sort = secondarySort
                } else {
                    def.sort = null
                }

                if (isEditing && col.field === 'status') {
                    def.cellRenderer = undefined
                    def.editable = (params) => !params.data?.isSummary
                    def.cellEditor = 'agSelectCellEditor'
                    def.cellEditorParams = { values: STATUS_OPTIONS }
                    def.singleClickEdit = true
                }

                if (isEditing && col.field === 'reason') {
                    def.editable = (params) =>
                        !params.data?.isSummary && params.data?.status === '반려'
                    def.cellEditor = 'agTextCellEditor'
                    def.singleClickEdit = true
                }

                return def
            }),
        [deptSort, secondaryField, secondarySort, isEditing],
    )

    const onSortChanged = useCallback(
        (event) => {
            const state = event.api.getColumnState()
            const deptCol = state.find((c) => c.colId === 'department')
            const secCol = state.find(
                (c) => c.colId !== 'department' && c.sort != null,
            )
            const updates = {}
            if (deptCol?.sort && deptCol.sort !== deptSort) {
                updates.deptSort = deptCol.sort
            }
            const nextField = secCol?.colId ?? null
            const nextSort = secCol?.sort ?? null
            if (
                nextField !== secondaryField ||
                nextSort !== secondarySort
            ) {
                updates.secondaryField = nextField
                updates.secondarySort = nextSort
            }
            if (Object.keys(updates).length > 0) {
                onSortChange(updates)
            }
        },
        [deptSort, secondaryField, secondarySort, onSortChange],
    )

    const onCellValueChanged = useCallback(
        (event) => {
            if (event.data?.isSummary || event.newValue === event.oldValue) return
            if (event.data?.id == null) return

            onCellEdit?.(event.data.id, event.colDef.field, event.newValue)
        },
        [onCellEdit],
    )

    const getRowId = useCallback((params) => {
        if (params.data?.isSummary) {
            return `summary-${params.data.department}`
        }
        return String(params.data.id)
    }, [])

    const getRowClass = useCallback(
        (params) => (params.data?.isSummary ? 'summary-row' : ''),
        [],
    )

    return (
        <BasicGrid
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            enableCellSpan={true}
            postSortRows={postSortSummaryLast}
            getRowClass={getRowClass}
            getRowId={getRowId}
            onSortChanged={onSortChanged}
            onCellValueChanged={onCellValueChanged}
        />
    )
}

export default EmployeeGrid
