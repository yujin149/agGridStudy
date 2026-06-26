import { useCallback, useEffect, useMemo, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { colDefs as initialColDefs } from '../../data/colDefs.js'
import { postSortSummaryLast } from '../../utils/postSortSummaryLast.js'
import { themeQuartz } from 'ag-grid-community'
import styles from './BasicGrid.module.css'

const STATUS_OPTIONS = ['승인대기', '승인완료', '반려']

const gridTheme = themeQuartz.withParams({
    headerBackgroundColor: 'var(--primary-color-50)',
    headerTextColor: 'var(--gray-color-700)',
    backgroundColor: 'var(--card-background-color)',
    borderColor: 'var(--border-color)',
    foregroundColor: 'var(--text-primary-color)',
    rowBorder: true,
    headerRowBorder: {
        width: 3,
        style: 'solid',
        color: 'var(--border-color)',
    },
    columnBorder: true,
    pinnedColumnBorder: {
        width: 3,
        style: 'solid',
        color: 'var(--border-color)',
    },
    fontFamily: 'var(--font-family)',
    fontSize: 14,
    headerFontSize: 14,
    headerFontWeight: 600,
    spacing: 8,
    wrapperBorder: true,
    wrapperBorderRadius: 0,
})

function BasicGrid({
    rowData,
    deptSort,
    secondaryField,
    secondarySort,
    onSortChange,
    isEditing = false,
    onCellEdit,
    defaultColDef: defaultColDefProp,
}) {
    const gridRef = useRef(null)

    useEffect(() => {
        if (!isEditing) {
            gridRef.current?.api?.stopEditing()
        }
    }, [isEditing])

    const colDefs = useMemo(
        () =>
            initialColDefs.map((col) => {
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
        [deptSort, secondaryField, secondarySort, isEditing]
    )

    const onSortChanged = useCallback(
        (event) => {
            const state = event.api.getColumnState()
            const deptCol = state.find((c) => c.colId === 'department')
            const secCol = state.find(
                (c) => c.colId !== 'department' && c.sort != null
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
        [deptSort, secondaryField, secondarySort, onSortChange]
    )

    const onCellValueChanged = useCallback(
        (event) => {
            if (event.data?.isSummary || event.newValue === event.oldValue) return
            if (event.data?.id == null) return

            onCellEdit?.(event.data.id, event.colDef.field, event.newValue)
        },
        [onCellEdit]
    )

    const getRowId = useCallback((params) => {
        if (params.data?.isSummary) {
            return `summary-${params.data.department}`
        }
        return String(params.data.id)
    }, [])

    return (
        <div style={{ height: 400, width: '100%' }} className={styles.gridWrap}>
            <AgGridReact
                ref={gridRef}
                theme={gridTheme}
                rowData={rowData}
                getRowId={getRowId}
                defaultColDef={{
                    suppressMovable: true,
                    ...defaultColDefProp,
                }}
                columnDefs={colDefs}
                enableCellSpan={true}
                getRowClass={(params) =>
                    params.data?.isSummary ? 'summary-row' : ''
                }
                postSortRows={postSortSummaryLast}
                onSortChanged={onSortChanged}
                onCellValueChanged={onCellValueChanged}
            />
        </div>
    )
}

export default BasicGrid
